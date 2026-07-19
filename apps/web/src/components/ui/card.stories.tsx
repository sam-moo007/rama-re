import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./card";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content area of the card.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <button className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Submit</button>
      </CardFooter>
    </Card>
  ),
};
