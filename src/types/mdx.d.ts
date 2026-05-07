/// <reference types="@types/mdx" />

declare module "*.mdx" {
  import type { ComponentType } from "react";
  // The named meta export every essay provides.
  // Falls back to unknown for non-essay MDX files (none currently).
  export const meta: import("@content/essays/_lib/types").EssayMeta;
  const Component: ComponentType;
  export default Component;
}
