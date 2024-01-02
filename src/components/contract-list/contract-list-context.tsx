import { createContext, useContext } from 'react';
import { ContractSign } from '../../config/types';

export type TContractListContextType = {
	contractModal: boolean;
	setContractModal: (contractModal: boolean) => void;
	// approveModal: boolean;
	// setApproveModal: (approveModal: boolean) => void;
	// resultModal: { open: boolean; action: string };
	// setResultModal: ({ open }: { open: boolean; action: string }) => void;
	// notification: { text: string | React.ReactNode };
	// setNotification: ({ text }: { text: string | React.ReactNode }) => void;
	contractKey: string;
	setContractKey: (contractKey: string) => void;
	clientKey: string | undefined;
	setClientKey: (clientKey: string) => void;
	userKey: string | undefined;
	setUserKey: (userKey: string) => void;
	// sign: string;
	// setSign: (sign: string) => void;
	// contractSign: ContractSign;
	// setContractSign: (contractSign: ContractSign) => void;
	// pdfFileLoad: number;
	// setPdfFileLoad: (pdfFileLoad: number) => void;
	// refreshSign: number;
	// setRefreshSign: (refreshSign: number) => void;
	// refreshEvent: number;
	// setRefreshEvent: (refreshEvent: number) => void;
	// refreshShareLink: number;
	// setRefreshShareLink: (refreshShareLink: number) => void;
	// contractValue: string;
	// setContractValue: (contractValue: string) => void;
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
