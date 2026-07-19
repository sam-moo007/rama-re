import type { StorybookConfig } from '@storybook/nextjs';

import { join, dirname } from "path"

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
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-mcp')
  ],
  "framework": getAbsolutePath('@storybook/nextjs-vite'),
  "staticDirs": [
    "..\\public"
  ]
};
export default config;