"use client";

import dynamic from "next/dynamic";

/**
 * Client wrapper that lazy-loads <ROIDossier> below the fold.
 *
 * The homepage (server component) imports this wrapper instead of the
 * full component so the calculator's client bundle (useState, useMemo,
 * input handlers, formatting helpers) is split out of the initial HTML
 * shell and fetched only when the user scrolls into range.
 *
 * `ssr: false` is required: Next 14.2 disallows that flag in server
 * components, so the import is colocated here.
 */
const ROIDossier = dynamic(
  () => import("./ROIDossier").then((mod) => mod.ROIDossier),
  { ssr: false },
);

export function ROIDossierLazy() {
  return <ROIDossier />;
}
