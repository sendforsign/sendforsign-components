import { createContext, useContext } from 'react';

export type TContractListContextType = {
	contractModal: boolean;
	setContractModal: (contractModal: boolean) => void;
	notification: { text?: any };
	setNotification: (text: any) => void;
	contractKey: string;
	setContractKey: (contractKey: string) => void;
	clientKey: string | undefined;
	setClientKey: (clientKey: string) => void;
	userKey: string | undefined;
	setUserKey: (userKey: string) => void;
	token: string | undefined;
	setToken: (token: string) => void;
	refreshContracts: number;
	setRefreshContracts: (refreshContracts: number) => void;
	needUpdate: boolean;
	setNeedUpdate: (needUpdate: boolean) => void;
	aiShow: boolean;
	setAiShow: (aiHidden: boolean) => void;
	apiKey: string | undefined;
	setApiKey: (apiKey: string) => void;
};
export const ContractListContext = createContext<
	TContractListContextType | undefined
>(undefined);
export const useContractListContext = () => {
	const context = useContext(ContractListContext);

	if (!context) {
		throw new Error(
			'useContractListContext must be used inside the ListProvider'
		);
	}

	return context;
};
