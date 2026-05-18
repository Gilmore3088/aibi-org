"""One-time: load the SOURCES list into the `sources` table. Idempotent."""

from aibi_scout.db import get_client
from aibi_scout.sources import SOURCES


def main() -> None:
    db = get_client()
    existing = {
        s["name"]
        for s in db.table("sources").select("name").execute().data
    }
    to_insert = [s for s in SOURCES if s["name"] not in existing]
    if not to_insert:
        print(f"Nothing to insert. {len(existing)} sources already present.")
        return
    db.table("sources").insert(to_insert).execute()
    print(
        f"Inserted {len(to_insert)} sources. "
        f"Total in config: {len(SOURCES)}; in DB: {len(existing) + len(to_insert)}."
    )


if __name__ == "__main__":
    main()
