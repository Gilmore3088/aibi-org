# `Plans/_assets/` — Folder Rules

## Purpose

Binary attachments referenced by plans: PDFs, docx files, screenshots,
image dumps. Anything that is **not text** but supports a plan or
historical reference.

## What belongs here

- PDFs (competitor scans, reference materials, screenshots-as-PDF)
- `.docx` source files for PRDs that were rendered to HTML or MD
- Image dumps (`exam/` screenshots, photos of mockups)
- Zip bundles of design files (when not extracted to `docs/`)

## What does NOT belong here

- Markdown files (those go in `Plans/` or `Plans/_archive/`)
- Live design source (Figma exports → `docs/brand-refresh-*/`)
- Code (anything under `src/`, `public/`, etc.)

## Naming

Keep original filenames when they came from outside (PDFs from
research, etc.). Rename to kebab-case when authored internally.

## Lifecycle

Assets are sticky — they stay here as long as any plan references
them. If a plan is archived, leave the asset here unless nothing else
references it.
