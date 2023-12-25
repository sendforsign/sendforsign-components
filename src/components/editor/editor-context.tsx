import { createContext, useContext } from 'react';
import { ContractSign } from '../../config/types';

export type TEditorContextType = {
	signModal: boolean;
	setSignModal: (signModal: boolean) => void;
	approveModal: boolean;
	setApproveModal: (approveModal: boolean) => void;
	resultModal: { open: boolean; action: string };
	setResultModal: ({ open }: { open: boolean; action: string }) => void;
	notification: { text: string | React.ReactNode };
	setNotification: ({ text }: { text: string | React.ReactNode }) => void;
	contractKey: string;
	setContractKey: (contractKey: string) => void;
	clientKey: string | undefined;
	setClientKey: (clientKey: string) => void;
	userKey: string | undefined;
	setUserKey: (userKey: string) => void;
	sign: string;
	setSign: (sign: string) => void;
	contractSign: ContractSign;
	setContractSign: (contractSign: ContractSign) => void;
	pdfFileLoad: number;
	setPdfFileLoad: (pdfFileLoad: number) => void;
	refreshSign: number;
	setRefreshSign: (refreshSign: number) => void;
	contractValue: string;
	setContractValue: (contractValue: string) => void;
};
export const EditorContext = createContext<TEditorContextType | undefined>(
	undefined
);
export const useEditorContext = () => {
	const context = useContext(EditorContext);

	if (!context) {
		throw new Error('useEditorContext must be used inside the EditorProvider');
	}

	return context;
};
