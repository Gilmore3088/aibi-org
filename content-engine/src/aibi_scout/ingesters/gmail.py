"""Gmail label ingester. TODO: implement for day 11–12.

Use case: newsletters without RSS (American Banker, gated Substacks, etc.).

Recommended setup:
1. Subscribe to the newsletter with a dedicated address or use Gmail filters.
2. Gmail filter: `from:newsletters@americanbanker.com` → apply label `aibi-scout`.
3. Source row uses `ingestion_type='gmail'`, `source_url='label:aibi-scout-american-banker'`.

Recommended implementation:
1. `pip install google-api-python-client google-auth-oauthlib`
2. OAuth flow once locally → save token.json → mount as Modal secret.
3. List messages: `users().messages().list(userId='me', q='label:{label} is:unread')`
4. For each message:
       - Get message via users().messages().get(format='full')
       - Walk MIME parts, prefer text/html → strip HTML → text
       - external_id = message['id']
       - Mark read after successful ingest
5. Build IngestedItem; published_at from internalDate.

Simpler fallback: use IMAP with an app password instead of OAuth — less code,
fewer Google console steps. The trade-off is no fine-grained scopes.
"""

from aibi_scout.ingesters.rss import IngestedItem


def ingest_gmail(label_query: str) -> list[IngestedItem]:
    raise NotImplementedError("Gmail ingester planned for day 11–12.")
