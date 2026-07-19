import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "text",
    },
    placeholder: {
      control: "text",
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Enter value here...",
    type: "text",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true,
  },
};

export const Email: Story = {
  args: {
    type: "email",
    placeholder: "user@example.com",
  },
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Secret Password",
  },
};
