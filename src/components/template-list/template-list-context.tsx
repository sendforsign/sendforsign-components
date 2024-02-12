import { createContext, useContext } from 'react';
import { ContractSign } from '../../config/types';

export type TTemplateListContextType = {
	templateModal: boolean;
	setTemplateModal: (templateModal: boolean) => void;
	templateKey: string;
	setTemplateKey: (contractKey: string) => void;
	clientKey: string | undefined;
	setClientKey: (clientKey: string) => void;
	userKey: string | undefined;
	setUserKey: (userKey: string) => void;
	refreshTemplate: number;
	setRefreshTemplate: (refreshTemplate: number) => void;
	apiKey: string | undefined;
	setApiKey: (apiKey: string) => void;
};
export const TemplateListContext = createContext<
	TTemplateListContextType | undefined
>(undefined);
export const useTemplateListContext = () => {
	const context = useContext(TemplateListContext);

	if (!context) {
		throw new Error(
			'useTemplateListContext must be used inside the ListProvider'
		);
	}

	return context;
};
