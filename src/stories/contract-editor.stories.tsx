import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { ContractEditor } from '../components/contract-editor';

const meta: Meta<typeof ContractEditor> = {
	component: ContractEditor,
	title: 'Marbella/ContractEditor',
	argTypes: {},
};
export default meta;

type Story = StoryObj<typeof ContractEditor>;

export const Primary: Story = (args) => (
	<ContractEditor data-testId='InputField-id' {...args} />
);
Primary.args = {
	clientKey: 'b817e635-ee26-40f9-ba82-f4612077a2f4',
	userKey: '',
	contractKey: 'd0b60b2e-53b8-40df-aaff-7f11277c3b60',
	readonly: false,
	view: '',
};
