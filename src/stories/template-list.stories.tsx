import React from 'react';
import { Meta, StoryObj } from '@storybook/react-webpack5';

import { TemplateList } from '../components/template-list';

const meta: Meta<typeof TemplateList> = {
	component: TemplateList,
	title: 'Marbella/TemplateList',
	argTypes: {},
};
export default meta;

type Story = StoryObj<typeof TemplateList>;

export const Primary: Story = (args) => (
	<TemplateList data-testId='InputField-id' {...args} />
);
Primary.args = {
	apiKey: '',
	clientKey: '',
	token: '',
	userKey: '',
	isModal: true,
};
