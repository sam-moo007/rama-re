// This file has been automatically migrated to valid ESM format by Storybook.
import { createRequire } from "node:module";
import type { StorybookConfig } from '@storybook/nextjs-vite';

import { dirname } from "path"

const require = createRequire(import.meta.url);

/**
* This function is used to resolve the absolute path of a package.
* It is needed in projects that use Yarn PnP or are set up within a monorepo.
*/
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(`${value}/package.json`));
}
const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-vitest'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-mcp'),
    getAbsolutePath("@storybook/addon-docs")
  ],
  "framework": getAbsolutePath('@storybook/nextjs-vite'),
  "staticDirs": [
    "../public"
  ]
};
export default config;