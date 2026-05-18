"""Scout pipeline: ingest → score → persist."""

import logging
from typing import Any

from anthropic import Anthropic
from supabase import Client

from aibi_scout.db import (
    get_active_sources,
    insert_score,
    update_source_fetched,
    upsert_content_item,
)
from aibi_scout.ingesters.rss import ingest_rss
from aibi_scout.scoring.scout import SCOUT_MODEL, score_item

log = logging.getLogger("aibi_scout")


def run_scout(
    *,
    db: Client,
    anthropic: Anthropic,
    max_items_per_source: int = 25,
) -> dict[str, int]:
    """Run one full pass: pull from every active source, score the new items."""
    sources = get_active_sources(db)
    stats = {"sources": 0, "new_items": 0, "scored": 0, "score_errors": 0, "ingest_errors": 0}

    for src in sources:
        stats["sources"] += 1
        try:
            items = _fetch_for_source(src)[:max_items_per_source]
        except NotImplementedError as e:
            log.warning("Skipping %s: %s", src["name"], e)
            continue
        except Exception:
            log.exception("Ingest failed for %s", src["name"])
            stats["ingest_errors"] += 1
            continue

        for item in items:
            inserted = upsert_content_item(db, source_id=src["id"], item=item)
            if not inserted:
                continue  # duplicate
            stats["new_items"] += 1
            try:
                score = score_item(
                    anthropic,
                    title=item.title,
                    author=item.author,
                    source_name=src["name"],
                    excerpt=item.excerpt,
                    url=item.url,
                )
                insert_score(
                    db,
                    content_item_id=inserted["id"],
                    score=score,
                    model=SCOUT_MODEL,
                )
                stats["scored"] += 1
            except Exception:
                log.exception("Score failed for %r", item.title)
                stats["score_errors"] += 1

        update_source_fetched(db, src["id"])

    log.info("Scout run complete: %s", stats)
    return stats


def _fetch_for_source(src: dict[str, Any]):
    kind = src["ingestion_type"]
    url = src["source_url"]
    if kind == "rss":
        return ingest_rss(url)
    if kind == "youtube":
        from aibi_scout.ingesters.youtube import ingest_youtube
        return ingest_youtube(url)
    if kind == "gmail":
        from aibi_scout.ingesters.gmail import ingest_gmail
        return ingest_gmail(url)
    if kind == "manual":
        return []
    raise ValueError(f"Unknown ingestion_type: {kind}")
