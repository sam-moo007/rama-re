import type { Meta, StoryObj } from '@storybook/react';
import PremiumButton from './premium-button';

const meta = {
  title: 'Pixel-Perfect/PremiumButton',
  component: PremiumButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    premiumVariant: {
      control: 'select',
      options: ['neutral', 'dark', 'gold', 'mint', 'rose', 'sky', 'lavender', 'sand'],
      description: 'The visual variant of the premium button',
    },
    children: {
      control: 'text',
      description: 'The content of the button',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    }
  },
} satisfies Meta<typeof PremiumButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {
  args: {
    premiumVariant: 'neutral',
    children: 'Book a Viewing',
    className: 'px-8 py-3 text-sm tracking-widest uppercase',
  },
};

export const Dark: Story = {
  args: {
    premiumVariant: 'dark',
    children: 'Contact Advisor',
    className: 'px-8 py-3 text-sm tracking-widest uppercase',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  }
};
