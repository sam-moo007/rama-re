import type { Meta, StoryObj } from '@storybook/react';
import TextReveal from './text-reveal';

const meta = {
  title: 'Pixel-Perfect/TextReveal',
  component: TextReveal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'The text content to reveal',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof TextReveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'WHAT IS IT?',
    className: 'text-4xl font-serif font-light tracking-widest',
  },
};
