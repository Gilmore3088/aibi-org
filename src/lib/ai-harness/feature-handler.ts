import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import type { CourseConfig, AIFeatureDef } from '../course-harness/types';
import type { ChatRequest, ChatResponse } from './types';
import { LLMError } from './types';
import { createLLMClient } from './client';
import { checkRateLimit, logUsage } from './rate-limit';
import { estimateCostCents } from './pricing';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export interface FeatureHandlerConfig<TOut = unknown> {
  readonly config: CourseConfig;
  readonly featureId: string;
  readonly buildRequest: (req: NextRequest, featureDef: AIFeatureDef) => Promise<ChatRequest>;
  readonly shapeResponse: (resp: ChatResponse, req: NextRequest) => TOut;
}

async function getAuthenticatedUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const cookieStore = cookies();
  const supabase = ssrCreateServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export function createFeatureHandler<TOut>(cfg: FeatureHandlerConfig<TOut>) {
  async function POST(req: NextRequest): Promise<NextResponse<TOut | { error: string; retryAfterSeconds?: number }>> {
    const featureDef = cfg.config.aiFeatures?.[cfg.featureId];
    if (!featureDef) {
      return NextResponse.json(
        { error: `Feature '${cfg.featureId}' not declared in course '${cfg.config.slug}'` },
        { status: 404 },
      );
    }

    // Authenticate caller
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    // Rate-limit check before building or sending LLM request
    const limits = {
      perLearnerDaily: featureDef.rateLimit?.perLearnerDaily,
      perCourseDailyCents: cfg.config.aiBudget?.perCourseDailyCents,
    };

    const decision = await checkRateLimit({
      userId,
      courseSlug: cfg.config.slug,
      featureId: cfg.featureId,
      limits,
    });

    if (!decision.allowed) {
      await logUsage({
        userId,
        courseSlug: cfg.config.slug,
        featureId: cfg.featureId,
        provider: featureDef.provider,
        model: featureDef.model,
        status: 'rate-limited',
      });

      const response = NextResponse.json(
        {
          error: decision.reason === 'per-course-budget-exceeded'
            ? 'Daily course budget exceeded. Try again tomorrow.'
            : 'Daily usage limit reached for this feature. Try again tomorrow.',
          retryAfterSeconds: decision.retryAfterSeconds,
        },
        { status: 429 },
      );
      if (decision.retryAfterSeconds !== undefined) {
        response.headers.set('Retry-After', String(decision.retryAfterSeconds));
      }
      return response;
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

      const costCents = estimateCostCents({
        provider: featureDef.provider,
        model: featureDef.model,
        inputTokens: resp.usage.inputTokens,
        outputTokens: resp.usage.outputTokens,
      });

      await logUsage({
        userId,
        courseSlug: cfg.config.slug,
        featureId: cfg.featureId,
        provider: featureDef.provider,
        model: featureDef.model,
        inputTokens: resp.usage.inputTokens,
        outputTokens: resp.usage.outputTokens,
        costCents,
        status: 'succeeded',
      });

      const shaped = cfg.shapeResponse(resp, req);
      return NextResponse.json(shaped);
    } catch (err) {
      if (err instanceof LLMError) {
        await logUsage({
          userId,
          courseSlug: cfg.config.slug,
          featureId: cfg.featureId,
          provider: featureDef.provider,
          model: featureDef.model,
          status: 'errored',
          errorKind: err.kind,
        });

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
