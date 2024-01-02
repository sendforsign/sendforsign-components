import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

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
	clientKey: 'b817e635-ee26-40f9-ba82-f4612077a2f4',
	userKey: '',
	isModal: true,
};
 