import { createContext, useContext } from 'react';
import { Context } from '../../config/types';

export type TAiAssistantContextType = {
	contextModal: boolean;
	setContextModal: (contextModal: boolean) => void;
	notification: { text?: any };
	setNotification: (text: any) => void;
	clientKey: string | undefined;
	setClientKey: (clientKey: string) => void;
	userKey: string | undefined;
	setUserKey: (userKey: string) => void;
	token: string | undefined;
	setToken: (token: string) => void;
	apiKey: string | undefined;
	setApiKey: (apiKey: string) => void;
	contexts: Context[];
	setContexts: (contexts: Context[]) => void;
	refreshContext: number;
	setRefreshContext: (refreshContext: number) => void;
	spinContextLoad: boolean;
	setSpinContextLoad: (spinContextLoad: boolean) => void;
};
export const AiAssistantContext = createContext<
	TAiAssistantContextType | undefined
>(undefined);
export const useAiAssistantContext = () => {
	const context = useContext(AiAssistantContext);

	if (!context) {
		throw new Error(
			'useAiAssistantContext must be used inside the ListProvider'
		);
	}

	return context;
};
