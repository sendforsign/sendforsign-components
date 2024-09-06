import type { StorybookConfig } from '@storybook/react-webpack5';

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
	addons: [
		'@storybook/addon-links',
		'@storybook/addon-essentials',
		'@storybook/addon-onboarding',
		'@storybook/addon-interactions',
	],
	webpackFinal: (config) => {
		let configTmp = config;
		configTmp.resolve = {
			extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
			alias: {
				'react/jsx-dev-runtime.js': 'react/jsx-dev-runtime',
				'react/jsx-runtime.js': 'react/jsx-runtime',
			},
		};
		return configTmp;
	},
	framework: {
		name: '@storybook/react-webpack5',
		options: {
			builder: {
				useSWC: true,
			},
		},
	},
	docs: {
		autodocs: 'tag',
	},
};
export default config;
