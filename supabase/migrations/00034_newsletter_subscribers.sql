-- 00034 — newsletter_subscribers: owned-data backup for The AI Banking Brief.
--
-- The newsletter subscription flow already writes to MailerLite via
-- src/lib/mailerlite (the marketing-email provider). This table is a
-- redundant, owned-data record so the subscriber list survives a vendor
-- swap, an outage, or a billing dispute. See #190.
--
-- The route at /api/subscribe-newsletter writes here FIRST (own the data),
-- then fans out to MailerLite. Failure to write to MailerLite still
-- preserves the subscriber locally; a future job can reconcile.
--
-- RLS: service-role only. The newsletter API route uses the service-role
-- client to insert; nothing reads from this table via the public API yet.

create table public.newsletter_subscribers (
    id                uuid primary key default gen_random_uuid(),
    email             text not null,
    source            text not null default 'unknown',
    institution_name  text,
    subscribed_at     timestamptz not null default now(),
    unsubscribed_at   timestamptz,
    created_at        timestamptz not null default now(),

    -- Lowercase + trim before storing so "Foo@Bar.com" and "foo@bar.com "
    -- collapse to the same row on conflict.
    constraint newsletter_subscribers_email_normalized
        check (email = lower(trim(email)))
);

create unique index idx_newsletter_subscribers_email
    on public.newsletter_subscribers(email);

create index idx_newsletter_subscribers_source
    on public.newsletter_subscribers(source);

create index idx_newsletter_subscribers_subscribed_at
    on public.newsletter_subscribers(subscribed_at desc);

alter table public.newsletter_subscribers enable row level security;

-- Service role gets full access for inserts/updates from the API route.
-- No public read/write — this is a backend list, not a public surface.
create policy "service_role_full_access" on public.newsletter_subscribers
    for all
    to service_role
    using (true)
    with check (true);

comment on table public.newsletter_subscribers is
    'Owned-data backup of AI Banking Brief subscribers. Primary list lives in MailerLite; this table survives vendor swaps. See #190.';
