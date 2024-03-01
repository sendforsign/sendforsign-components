import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { ContractList } from '../components/contract-list';

const meta: Meta<typeof ContractList> = {
	component: ContractList,
	title: 'Marbella/ContractList',
	argTypes: {},
};
export default meta;

type Story = StoryObj<typeof ContractList>;

export const Primary: Story = (args) => (
	<ContractList data-testId='InputField-id' {...args} />
);
Primary.args = {
	apiKey: '',
	clientKey: '',
	userKey: '',
	isModal: true,
};
