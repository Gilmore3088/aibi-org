"""Weekly Friday digest builder.

Pulls top items from the past 7 days by banking_relevance, groups by pillar,
returns markdown. Email send is left as a TODO (Resend recommended).
"""

from datetime import datetime, timedelta, timezone

from supabase import Client


PILLAR_ORDER = ["application", "creation", "understanding", "awareness", "unassigned"]


def build_digest_markdown(
    db: Client,
    *,
    days: int = 7,
    min_score: int = 6,
    limit: int = 20,
) -> str:
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    res = (
        db.table("content_with_latest_score")
        .select("*")
        .gte("banking_relevance", min_score)
        .eq("skip", False)
        .gte("scored_at", since)
        .order("banking_relevance", desc=True)
        .limit(limit)
        .execute()
    )
    rows = res.data
    if not rows:
        return (
            "# AiBI Scout Weekly Digest\n\n"
            f"_No items above score {min_score} this week._\n"
        )

    by_pillar: dict[str, list] = {}
    for r in rows:
        by_pillar.setdefault(r.get("proposed_pillar") or "unassigned", []).append(r)

    lines = [
        "# AiBI Scout Weekly Digest",
        f"_{len(rows)} items, past {days} days, min score {min_score}_",
        "",
    ]
    for pillar in PILLAR_ORDER:
        items = by_pillar.get(pillar)
        if not items:
            continue
        lines.append(f"## {pillar.title()}")
        lines.append("")
        for r in items:
            consequence = r.get("consequence_level") or "—"
            themes = ", ".join(r.get("key_themes") or []) or "—"
            lines.append(
                f"- **[{r['banking_relevance']}]** {r['title']} — _{r['source_name']}_  "
            )
            lines.append(f"  {r['one_line_summary']}  ")
            lines.append(
                f"  Consequence: **{consequence}** · Themes: {themes} · "
                f"[link]({r.get('url') or '#'})"
            )
            lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def build_and_send_digest(db: Client) -> dict:
    md = build_digest_markdown(db)
    # TODO (day 13): send via Resend. Skeleton:
    #
    # from aibi_scout.config import settings
    # import resend
    # resend.api_key = settings.resend_api_key
    # resend.Emails.send({
    #     "from": "AiBI Scout <scout@aibi.io>",
    #     "to": [settings.digest_to_email],
    #     "subject": f"AiBI Scout Digest — {datetime.now().date()}",
    #     "html": markdown_to_html(md),
    # })
    print(md)
    return {"chars": len(md), "sent": False}
