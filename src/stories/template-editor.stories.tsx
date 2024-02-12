import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { TemplateEditor } from '../components/template-editor';

const meta: Meta<typeof TemplateEditor> = {
	component: TemplateEditor,
	title: 'Marbella/TemplateEditor',
	argTypes: {},
};
export default meta;

type Story = StoryObj<typeof TemplateEditor>;

export const Primary: Story = (args) => (
	<TemplateEditor data-testId='InputField-id' {...args} />
);
Primary.args = {
	apiKey: 're_api_key',
	clientKey: 'b817e635-ee26-40f9-ba82-f4612077a2f4',
	userKey: '',
	templateKey: '',
};
