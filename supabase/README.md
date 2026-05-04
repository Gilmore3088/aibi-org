# Supabase Local Workflow

This project uses the Supabase CLI for migrations, type generation, and local
development. The CLI must be installed once on each developer machine; npm
scripts in `package.json` wrap the most common commands so workflows stay
consistent.

## One-time setup

```bash
# Install the CLI (macOS — Homebrew)
brew install supabase/tap/supabase

# Or via npm globally
npm install -g supabase

# Verify
supabase --version

# Link this repo to the remote Supabase project (project ref from the
# Supabase dashboard — Settings → General → Reference ID).
# This writes a project-ref to `supabase/.temp/` (gitignored).
supabase login
supabase link --project-ref <your-project-ref>
```

`supabase/config.toml` is checked in. `supabase/.temp/` is not.

## Daily workflow

### Run the local Supabase stack

```bash
npm run db:start    # boot Postgres + Auth + Storage + Studio at localhost:54321
npm run db:status   # show ports, anon key, service role key for .env.local
npm run db:stop     # shut it down
```

### Apply migrations to the local DB

```bash
npm run db:reset    # destroy the LOCAL DB volume and re-apply every migration
                    # in supabase/migrations/ from scratch. Local only — never
                    # touches staging or production.
```

### Author a new migration

Two paths:

1. **Hand-written.** Add a new file to `supabase/migrations/` named
   `NNNNN_short_description.sql` (zero-padded, monotonically increasing).
   Run `npm run db:reset` to verify it applies cleanly against an empty DB.
2. **Diff-generated.** Make schema changes through Supabase Studio against
   the local stack, then:
   ```bash
   npm run db:diff -- -f short_description
   ```
   This writes a new migration that mirrors the change.

Either way, commit the migration file before deploying.

### Generate TypeScript types from the local schema

```bash
npm run gen:types
```

Writes `src/types/supabase.ts`. Re-run after every schema change so client code
stays in sync with the actual columns.

## Pushing to remote

```bash
npm run db:push     # apply un-pushed local migrations to the LINKED remote
                    # project. Requires `supabase link` to have been run.
```

> ⚠️ **Production push gate.** `db:push` against a production project is
> destructive — it runs migrations against live data. Per CLAUDE.md, never
> push migrations to staging or production without explicit user approval.
> Verify which project you're linked to (`supabase status` or
> `supabase/.temp/project-ref`) before running this.

## Troubleshooting

- **`Cannot connect to Docker`** — `db:start` requires Docker Desktop running.
- **`port 54321 already in use`** — another local stack is up; `db:stop` or
  `lsof -i :54321` to find the offender.
- **`migration already applied`** — `db:reset` is the surest way to get a
  clean local state. It only affects the local volume.
- **Types out of sync with code** — re-run `npm run gen:types` after every
  schema change.

## Reference

- Supabase CLI: https://supabase.com/docs/guides/local-development/cli
- Migrations live in `supabase/migrations/` (15 files as of 2026-05-01).
- Local config: `supabase/config.toml` (project_id `TheAiBankingInstitute`,
  Postgres major 17, API on :54321, DB on :54322).
