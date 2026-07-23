import type { Meta, StoryObj } from '@storybook/react';
import Border1 from './border1';

const meta = {
  title: 'Pixel-Perfect/Border1',
  component: Border1,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof Border1>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="relative w-64 h-64 bg-surface flex items-center justify-center border border-border">
        <Story />
        <span className="text-muted text-sm font-semibold tracking-widest uppercase">Content Area</span>
      </div>
    ),
  ],
  args: {
    className: '',
  },
};
