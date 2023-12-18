import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { List } from '../components/list';

const meta: Meta<typeof List> = {
	component: List,
	title: 'Marbella/List',
	argTypes: {},
};
export default meta;

type Story = StoryObj<typeof List>;

export const Primary: Story = (args) => (
	<List data-testId='InputField-id' {...args} />
);
Primary.args = {
	clientKey: 'b817e635-ee26-40f9-ba82-f4612077a2f4',
	userKey: '',
	isModal: true,
};
