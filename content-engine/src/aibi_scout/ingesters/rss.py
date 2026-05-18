"""RSS/Atom feed ingester using feedparser."""

import re
from dataclasses import dataclass
from datetime import datetime, timezone

import feedparser


@dataclass
class IngestedItem:
    external_id: str
    title: str
    url: str | None
    author: str | None
    published_at: datetime | None
    raw_content: str
    excerpt: str


def ingest_rss(feed_url: str, *, excerpt_chars: int = 1200) -> list[IngestedItem]:
    """Pull entries from an RSS/Atom feed. Returns normalized items."""
    parsed = feedparser.parse(feed_url)
    if parsed.bozo and not parsed.entries:
        # feedparser couldn't parse anything useful
        raise RuntimeError(f"Feed parse failed for {feed_url}: {parsed.bozo_exception}")

    items: list[IngestedItem] = []
    for entry in parsed.entries:
        external_id = entry.get("id") or entry.get("link")
        if not external_id:
            continue
        content = _entry_content(entry)
        excerpt = _strip_html(content)[:excerpt_chars]
        items.append(
            IngestedItem(
                external_id=external_id,
                title=(entry.get("title") or "").strip(),
                url=entry.get("link"),
                author=entry.get("author"),
                published_at=_parse_published(entry),
                raw_content=content,
                excerpt=excerpt,
            )
        )
    return items


def _entry_content(entry) -> str:
    """Prefer full content[].value over summary."""
    if "content" in entry and entry.content:
        for c in entry.content:
            if c.get("value"):
                return c.value
    if "summary" in entry:
        return entry.summary
    return ""


def _parse_published(entry) -> datetime | None:
    for key in ("published_parsed", "updated_parsed"):
        t = entry.get(key)
        if t:
            return datetime(*t[:6], tzinfo=timezone.utc)
    return None


_HTML_TAG = re.compile(r"<[^>]+>")
_WHITESPACE = re.compile(r"\s+")


def _strip_html(html: str) -> str:
    text = _HTML_TAG.sub(" ", html or "")
    return _WHITESPACE.sub(" ", text).strip()
