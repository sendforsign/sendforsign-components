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
	apiKey: '',
	clientKey: '',
	userKey: '',
	contractKey: '',
	pdf: false,
	сanReDraft: false,
};
