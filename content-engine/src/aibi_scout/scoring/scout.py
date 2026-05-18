"""Scout: scores raw content items for banking relevance using Claude Haiku."""

from typing import Any

from anthropic import Anthropic

from aibi_scout.scoring.prompts import SCOUT_SYSTEM_PROMPT, SCOUT_TOOL

SCOUT_MODEL = "claude-haiku-4-5-20251001"


def score_item(
    client: Anthropic,
    *,
    title: str,
    author: str | None,
    source_name: str,
    excerpt: str,
    url: str | None,
) -> dict[str, Any]:
    """Score a single content item. Returns the structured score dict."""
    user_message = _format_user_message(
        title=title,
        author=author,
        source_name=source_name,
        excerpt=excerpt,
        url=url,
    )
    resp = client.messages.create(
        model=SCOUT_MODEL,
        max_tokens=512,
        system=SCOUT_SYSTEM_PROMPT,
        tools=[SCOUT_TOOL],
        tool_choice={"type": "tool", "name": "score_content"},
        messages=[{"role": "user", "content": user_message}],
    )
    for block in resp.content:
        if block.type == "tool_use" and block.name == "score_content":
            return dict(block.input)
    raise RuntimeError(
        f"Scout did not return tool_use. Stop reason: {resp.stop_reason}"
    )


def _format_user_message(
    *,
    title: str,
    author: str | None,
    source_name: str,
    excerpt: str,
    url: str | None,
) -> str:
    return (
        f"SOURCE: {source_name}\n"
        f"AUTHOR: {author or 'unknown'}\n"
        f"TITLE: {title}\n"
        f"URL: {url or 'n/a'}\n\n"
        f"CONTENT EXCERPT:\n{excerpt}\n"
    )
