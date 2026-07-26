import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scaffold-app/**",
    ".tmp/**",
    "public/**",
    // Agent scratch workspaces (git worktrees / notes) — gitignored, not project source.
    ".claude/**",
    ".superpowers/**",
  ]),
]);

export default eslintConfig;
