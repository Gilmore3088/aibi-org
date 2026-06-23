// Pure presentational body of the assessment PDF/print route. The page
// (../[id]/page.tsx) loads + version-detects the profile, then hands the
// resolved values here. Keeping this prop-driven and synchronous lets it be
// unit-tested (see PrintReport.test.tsx) without a database or headless
// browser, and lets the page own all data access.
//
// Version handling: `version` selects the v2 vs v3 content pack
// (../_content/print-pack). v2 and v3 share tier ids and the DimensionScore
// shape, so the only thing that differs per version is the content bundle and
// the dimension key space — both carried by the pack.

import type { Tier, DimensionScore } from '@content/assessments/v2/scoring';
import { getPrintPack, type PrintContentVersion } from '../_content/print-pack';
import { Cover } from './Cover';
import { ExecSummary } from './ExecSummary';
import { PracticePicturePage } from './PracticePicturePage';
import { LensedImplications } from './LensedImplications';
import { StrengthsAndGaps } from './StrengthsAndGaps';
import { GapDetail } from './GapDetail';
import { MaturityLadderPage } from './MaturityLadderPage';
import { FirstMove } from './FirstMove';
import { StarterPromptAndPlan } from './StarterPromptAndPlan';
import { FutureVisionPage } from './FutureVisionPage';
import { NextStepsTrio } from './NextStepsTrio';
import { GovernanceCitations } from './GovernanceCitations';
import { BackCover } from './BackCover';

interface PrintReportProps {
  readonly version: PrintContentVersion;
  readonly tier: Tier;
  readonly tierId: Tier['id'];
  readonly score: number;
  readonly maxScore: number;
  readonly breakdown: Record<string, DimensionScore>;
  readonly generatedAt: Date;
  readonly firstName: string | null;
  readonly institutionName: string | null;
}

interface RankedDim {
  readonly id: string;
  readonly score: number;
  readonly maxScore: number;
  readonly pct: number;
}

function rankWeakest(breakdown: Record<string, DimensionScore>): ReadonlyArray<RankedDim> {
  return Object.entries(breakdown)
    .filter(([, d]) => d.maxScore > 0)
    .map(([id, d]) => ({ id, score: d.score, maxScore: d.maxScore, pct: d.score / d.maxScore }))
    .sort((a, b) => a.pct - b.pct);
}

export function PrintReport({
  version,
  tier,
  tierId,
  score,
  maxScore,
  breakdown,
  generatedAt,
  firstName,
  institutionName,
}: PrintReportProps) {
  const pack = getPrintPack(version);
  const ranked = rankWeakest(breakdown);
  const topTwoCriticalGaps = ranked.slice(0, 2);
  const focusGapId = ranked[0]?.id;

  return (
    <main>
      <Cover
        pack={pack}
        tier={tier}
        tierId={tierId}
        score={score}
        maxScore={maxScore}
        firstName={firstName}
        institutionName={institutionName}
        generatedAt={generatedAt}
        dimensionBreakdown={breakdown}
      />
      <ExecSummary pack={pack} tier={tier} tierId={tierId} score={score} maxScore={maxScore} />
      <PracticePicturePage pack={pack} tierId={tierId} />
      <LensedImplications pack={pack} tierId={tierId} />
      <StrengthsAndGaps pack={pack} dimensionBreakdown={breakdown} />
      {topTwoCriticalGaps.map((dim, idx) => (
        <GapDetail
          key={dim.id}
          pack={pack}
          dimensionId={dim.id}
          score={dim.score}
          maxScore={dim.maxScore}
          pageNumber={6 + idx}
        />
      ))}
      <MaturityLadderPage pack={pack} tierId={tierId} />
      {focusGapId ? (
        <>
          <FirstMove pack={pack} focusGapId={focusGapId} />
          <StarterPromptAndPlan pack={pack} focusGapId={focusGapId} />
        </>
      ) : null}
      <FutureVisionPage />
      <NextStepsTrio tierId={tierId} />
      <GovernanceCitations />
      <BackCover />
    </main>
  );
}
