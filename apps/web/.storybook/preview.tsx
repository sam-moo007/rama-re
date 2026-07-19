import type { Preview } from "@storybook/nextjs";
import React from "react";
import { Inter, Public_Sans } from "next/font/google";

import "../src/app/globals.css";

const publicSansHeading = Public_Sans({ subsets: ["latin"], variable: "--font-heading" });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo"
    }
  },
  globalTypes: {
    direction: {
      name: "Direction",
      description: "Direction for layout",
      defaultValue: "ltr",
      toolbar: {
        icon: "globe",
        items: ["ltr", "rtl"],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const dir = context.globals.direction || "ltr";
      return (
        <div
          dir={dir}
          className={`${inter.variable} ${publicSansHeading.variable} font-sans min-h-screen`}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
