"""Supabase client wrapper for AiBI Scout."""

from datetime import datetime, timezone
from typing import Any

from supabase import Client, create_client

from aibi_scout.config import settings


def get_client() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_key)


def get_active_sources(client: Client) -> list[dict[str, Any]]:
    res = client.table("sources").select("*").eq("active", True).execute()
    return res.data


def upsert_content_item(client: Client, *, source_id: str, item) -> dict[str, Any] | None:
    """Insert a content item. Returns the inserted row, or None if it was a duplicate."""
    payload = {
        "source_id": source_id,
        "external_id": item.external_id,
        "title": item.title,
        "url": item.url,
        "author": item.author,
        "published_at": item.published_at.isoformat() if item.published_at else None,
        "raw_content": item.raw_content,
        "excerpt": item.excerpt,
    }
    try:
        res = client.table("content_items").insert(payload).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        msg = str(e).lower()
        # Postgres unique_violation = 23505
        if "duplicate" in msg or "23505" in msg or "unique" in msg:
            return None
        raise


def insert_score(
    client: Client, *, content_item_id: str, score: dict[str, Any], model: str
) -> None:
    payload = {
        "content_item_id": content_item_id,
        "banking_relevance": score["banking_relevance"],
        "content_type": score["content_type"],
        "key_themes": score["key_themes"],
        "one_line_summary": score["one_line_summary"],
        "proposed_pillar": score["proposed_pillar"],
        "consequence_level": score["consequence_level"],
        "skip": score["skip"],
        "skip_reason": score.get("skip_reason"),
        "raw_score_json": score,
        "model": model,
    }
    client.table("content_scores").insert(payload).execute()


def update_source_fetched(client: Client, source_id: str) -> None:
    client.table("sources").update(
        {"last_fetched_at": datetime.now(timezone.utc).isoformat()}
    ).eq("id", source_id).execute()
