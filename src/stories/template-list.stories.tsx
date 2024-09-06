import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { TemplateList } from '../components/template-list';
import { TemplateListProps } from '../components/template-list/template-list';

const meta: Meta<typeof TemplateList> = {
	component: TemplateList,
	title: 'Marbella/TemplateList',
	argTypes: {},
};
export default meta;

type Story = StoryObj<typeof TemplateList>;

export const Primary: Story = (args: React.JSX.IntrinsicAttributes & TemplateListProps) => (
	<TemplateList data-testId='InputField-id' {...args} />
);
Primary.args = {
	apiKey: '',
	clientKey: '',
	token: '',
	userKey: '',
	isModal: true,
};
