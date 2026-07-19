import type { Meta, StoryObj } from "@storybook/nextjs";
import { Textarea } from "./textarea";

const meta: Meta<typeof Textarea> = {
  title: "UI/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: "Type your message here.",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "You cannot type here.",
    disabled: true,
  },
};
