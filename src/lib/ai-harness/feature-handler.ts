import { NextRequest, NextResponse } from 'next/server';
import type { CourseConfig, AIFeatureDef } from '../course-harness/types';
import type { ChatRequest, ChatResponse } from './types';
import { LLMError } from './types';
import { createLLMClient } from './client';

export interface FeatureHandlerConfig<TOut = unknown> {
  readonly config: CourseConfig;
  readonly featureId: string;
  readonly buildRequest: (req: NextRequest, featureDef: AIFeatureDef) => Promise<ChatRequest>;
  readonly shapeResponse: (resp: ChatResponse, req: NextRequest) => TOut;
}

export function createFeatureHandler<TOut>(cfg: FeatureHandlerConfig<TOut>) {
  async function POST(req: NextRequest): Promise<NextResponse<TOut | { error: string }>> {
    const featureDef = cfg.config.aiFeatures?.[cfg.featureId];
    if (!featureDef) {
      return NextResponse.json(
        { error: `Feature '${cfg.featureId}' not declared in course '${cfg.config.slug}'` },
        { status: 404 },
      );
    }

    let chatReq: ChatRequest;
    try {
      chatReq = await cfg.buildRequest(req, featureDef);
    } catch (err) {
      return NextResponse.json(
        { error: `Request build failed: ${(err as Error).message}` },
        { status: 400 },
      );
    }

    try {
      const client = createLLMClient(featureDef.provider);
      const resp = await client.chat(chatReq);
      const shaped = cfg.shapeResponse(resp, req);
      return NextResponse.json(shaped);
    } catch (err) {
      if (err instanceof LLMError) {
        const status =
          err.kind === 'auth' ? 502 :
          err.kind === 'rate-limit' ? 429 :
          err.kind === 'invalid-request' ? 400 :
          err.kind === 'server' ? 502 :
          err.kind === 'timeout' ? 504 : 500;
        return NextResponse.json(
          { error: `${err.provider} ${err.kind}: ${err.message}` },
          { status },
        );
      }
      return NextResponse.json(
        { error: `Internal error: ${(err as Error).message}` },
        { status: 500 },
      );
    }
  }

  return { POST };
}
