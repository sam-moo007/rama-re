import type { Preview } from "@storybook/react";
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
