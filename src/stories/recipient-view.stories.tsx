import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { RecipientView } from '../components/recipient-view';

const meta: Meta<typeof RecipientView> = {
    component: RecipientView,
    title: 'Marbella/RecipientView',
    argTypes: {},
};
export default meta;

type Story = StoryObj<typeof RecipientView>;

export const Primary: Story = (args) => (
    <RecipientView data-testId='InputField-id' {...args} />
);
Primary.args = {
    recipientKey: '',
};
