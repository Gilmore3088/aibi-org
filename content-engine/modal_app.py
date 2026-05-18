"""Modal entry points: nightly Scout cron + weekly digest.

Deploy:
    modal deploy modal_app.py

One-off test run:
    modal run modal_app.py::nightly_scout
"""

import modal

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "anthropic>=0.40.0",
        "supabase>=2.0.0",
        "feedparser>=6.0.0",
        "pydantic-settings>=2.0.0",
    )
    .add_local_python_source("aibi_scout")
)

app = modal.App("aibi-scout", image=image)

# Modal secret expected with: SUPABASE_URL, SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY
SECRETS = [modal.Secret.from_name("aibi-scout-secrets")]


@app.function(
    schedule=modal.Cron("0 7 * * *"),  # 07:00 UTC nightly (~midnight PT)
    secrets=SECRETS,
    timeout=60 * 30,
)
def nightly_scout():
    """Pull from every active source, score new items, persist to Supabase."""
    import logging

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    from anthropic import Anthropic

    from aibi_scout.db import get_client
    from aibi_scout.pipeline import run_scout

    db = get_client()
    anthropic = Anthropic()
    stats = run_scout(db=db, anthropic=anthropic)
    print(f"Scout run complete: {stats}")
    return stats


@app.function(
    schedule=modal.Cron("0 14 * * 5"),  # Friday 14:00 UTC (~07:00 PT)
    secrets=SECRETS,
    timeout=60 * 5,
)
def weekly_digest():
    """Build (and eventually send) the Friday digest."""
    from aibi_scout.db import get_client
    from aibi_scout.digest.weekly import build_and_send_digest

    db = get_client()
    return build_and_send_digest(db)


@app.local_entrypoint()
def main():
    """Local trigger: run the scout once and print stats."""
    stats = nightly_scout.remote()
    print(stats)
