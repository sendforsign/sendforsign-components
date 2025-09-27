import React from 'react';
import { Meta, StoryObj } from '@storybook/react-webpack5';

import { AiAssistant } from '../components/ai-assistant';
import { AiAssistantProps } from '../components/ai-assistant/ai-assistant';

const meta: Meta<typeof AiAssistant> = {
	component: AiAssistant,
	title: 'Marbella/AiAssistant',
	argTypes: {},
};
export default meta;

type Story = StoryObj<typeof AiAssistant>;

export const Primary: Story = (
	args: React.JSX.IntrinsicAttributes & AiAssistantProps
) => <AiAssistant data-testId='InputField-id' {...args} />;
Primary.args = {
	apiKey: '',
	clientKey: '',
	token: '',
	userKey: '',
	contract: {},
};
