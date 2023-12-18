import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { Editor } from '../components/editor';

const meta: Meta<typeof Editor> = {
	component: Editor,
	title: 'Marbella/Editor',
	argTypes: {},
};
export default meta;

type Story = StoryObj<typeof Editor>;

export const Primary: Story = (args) => (
	<Editor data-testId='InputField-id' {...args} />
);
Primary.args = {
	clientKey: 'b817e635-ee26-40f9-ba82-f4612077a2f4',
	userKey: '',
	contractKey: 'd0b60b2e-53b8-40df-aaff-7f11277c3b60',
	readonly: false,
	view: '',
};
