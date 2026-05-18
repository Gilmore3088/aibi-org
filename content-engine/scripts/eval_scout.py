"""Run Scout against a hand-labeled eval set; report precision/recall.

The eval file (JSONL, one item per line) looks like:

    {
      "source_name": "One Useful Thing",
      "title": "...",
      "author": "Ethan Mollick",
      "url": "https://...",
      "excerpt": "first ~1000 chars of the article",
      "label": {"banking_relevance_bucket": "keep" | "skip"}
    }

`keep` ≈ what you'd want surfaced in the Friday digest. `skip` ≈ noise.

Usage:
    python scripts/eval_scout.py evals/scout_eval_set.jsonl --threshold 5
"""

import argparse
import json
from collections import Counter

from anthropic import Anthropic

from aibi_scout.scoring.scout import score_item


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("eval_file")
    ap.add_argument(
        "--threshold",
        type=int,
        default=5,
        help="banking_relevance ≥ this AND skip=False → predicted 'keep'.",
    )
    args = ap.parse_args()

    client = Anthropic()
    with open(args.eval_file) as f:
        rows = [json.loads(line) for line in f if line.strip()]

    confusion: Counter = Counter()
    for r in rows:
        score = score_item(
            client,
            title=r["title"],
            author=r.get("author"),
            source_name=r["source_name"],
            excerpt=r["excerpt"],
            url=r.get("url"),
        )
        predicted = (
            "keep"
            if score["banking_relevance"] >= args.threshold and not score["skip"]
            else "skip"
        )
        actual = r["label"]["banking_relevance_bucket"]
        confusion[(actual, predicted)] += 1
        marker = "✓" if actual == predicted else "✗"
        print(
            f"{marker} actual={actual:<4} predicted={predicted:<4} "
            f"score={score['banking_relevance']:2}  pillar={score['proposed_pillar']:<13} "
            f"| {r['title'][:80]}"
        )

    print("\nConfusion matrix (actual, predicted) → count:")
    for k, v in sorted(confusion.items()):
        print(f"  {k}: {v}")

    tp = confusion[("keep", "keep")]
    fp = confusion[("skip", "keep")]
    fn = confusion[("keep", "skip")]
    tn = confusion[("skip", "skip")]
    n = tp + fp + fn + tn
    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    accuracy = (tp + tn) / n if n else 0.0
    print(
        f"\nN={n}  Precision={precision:.2f}  Recall={recall:.2f}  "
        f"Accuracy={accuracy:.2f}"
    )
    print(
        "Target: Precision > 0.80 (false positives pollute the digest). "
        "If below, sharpen the rubric in scoring/prompts.py."
    )


if __name__ == "__main__":
    main()
