import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { TemplateEditor } from '../components/template-editor';
import { TemplateEditorProps } from '../components/template-editor/template-editor';

const meta: Meta<typeof TemplateEditor> = {
	component: TemplateEditor,
	title: 'Marbella/TemplateEditor',
	argTypes: {},
};
export default meta;

type Story = StoryObj<typeof TemplateEditor>;

export const Primary: Story = (
	args: React.JSX.IntrinsicAttributes & TemplateEditorProps
) => <TemplateEditor data-testId='InputField-id' {...args} />;
Primary.args = {
	apiKey: '',
	clientKey: '',
	token: '',
	userKey: '',
	templateKey: '',
};
