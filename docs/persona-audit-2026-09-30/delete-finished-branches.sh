#!/bin/sh
# 46 finished branches, re-verified 2026-10-01: 25 are fully contained in main;
# 21 had their PR merged (squash merges or pre-history-rewrite).
# Kept on purpose: codex/pending-persona-support-work (PR #516 closed unmerged),
# rescue/2026-08-15 (archived record), feature/home-refocus (separate review),
# claude/peaceful-franklin-it24od and the three branches unified into it (delete after it merges),
# dependabot/*. Run from any clone of Gilmore3088/aibi-org with push access.

git push origin --delete \
  claude/qa-synthetic-persona-testing-pqehv2 \
  codex/learn-page-foundation-cleanup \
  codex/live-resources-nav-update \
  codex/resources-copy-cleanup \
  claude/aibanking-ux-improvements-00cxtp \
  claude/consolidation-e1-legacy-chrome \
  claude/consolidation-e2-markdown \
  claude/consolidation-tier-a \
  claude/consolidation-tier-b \
  claude/consolidation-tier-c \
  claude/consolidation-tier-d \
  claude/consolidation-tier-d-rest \
  claude/consolidation-tier-d-splits \
  claude/consolidation-tier-d-splits2 \
  claude/consolidation-tier-e \
  claude/consolidation-tier-e-sweeps \
  claude/consolidation-tier-f \
  claude/d5-route-wrapper \
  claude/decisions-doc \
  claude/fix-mobile-header-overflow \
  claude/hero-tighten \
  claude/home-result-preview \
  claude/remove-peer-claims \
  claude/restore-full-wordmark \
  claude/status-next-steps-z3hi2e \
  claude/fix-resource-card-gate-overflow \
  claude/health-readiness-endpoint \
  claude/home-help-widget-trust \
  claude/simplify-resources-page \
  feature/funnel-scorecard \
  feature/admin-funnel \
  fix/mailerlite-index-stale-newsletter \
  docs/launch-finalization \
  fix/email-launch-blockers \
  feat/support-ops \
  claude/optimistic-ride-w4curm \
  codex/resource-review-after-persona \
  claude/gate-readable-resources \
  claude/security-playbook-download-bug-s952ty \
  claude/templates-react-pdf \
  claude/home-hero-pii-redaction \
  claude/executive-playbook-and-inventory \
  claude/hero-template-placeholders \
  claude/references-page \
  claude/practice-demo-resilience \
  claude/hero-realistic-before
