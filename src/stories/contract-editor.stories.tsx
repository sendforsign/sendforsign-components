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
	apiKey: 're_api_key',
	clientKey: 'b817e635-ee26-40f9-ba82-f4612077a2f4',
	userKey: '',
	contractKey: '036dae26-c394-46d1-b277-e602622631f1',
};
