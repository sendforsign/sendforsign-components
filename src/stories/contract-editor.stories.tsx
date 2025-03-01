import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { ContractEditor } from '../components/contract-editor';
import { ContractEditorProps } from '../components/contract-editor/contract-editor';

const meta: Meta<typeof ContractEditor> = {
	component: ContractEditor,
	title: 'Marbella/ContractEditor',
	argTypes: {},
};
export default meta;

type Story = StoryObj<typeof ContractEditor>;

export const Primary: Story = (
	args: React.JSX.IntrinsicAttributes & ContractEditorProps
) => <ContractEditor data-testId='InputField-id' {...args} />;
Primary.args = {
	apiKey: '',
	clientKey: '',
	token: '',
	userKey: '',
	contractKey: '',
	pdf: true,
	ai: false,
	canReDraft: false,
	showTimeline: true,
	showActionsBar: true,
	onStepChange: () => {},
	onDocumentSave: () => {},
};
