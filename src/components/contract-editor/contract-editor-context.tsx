import { createContext, useContext } from 'react';
import { ContractSign, Placeholder } from '../../config/types';

export type TContractEditorContextType = {
	signModal: boolean;
	setSignModal: (signModal: boolean) => void;
	sendModal: boolean;
	setSendModal: (sendModal: boolean) => void;
	approveModal: boolean;
	setApproveModal: (approveModal: boolean) => void;
	resultModal: { open: boolean; action: string };
	setResultModal: ({ open, action }: { open: boolean; action: string }) => void;
	notification: { text?: any };
	setNotification: (text: any) => void;
	contractKey: string;
	setContractKey: (contractKey: string) => void;
	contractValue: string;
	setContractValue: (contractValue: string) => void;
	contractName: string;
	setContractName: (contractName: string) => void;
	contractType: string;
	setContractType: (contractType: string) => void;
	templateKey: string;
	setTemplateKey: (templateKey: string) => void;
	createContract: boolean;
	setCreateContract: (createContract: boolean) => void;
	clientKey: string | undefined;
	setClientKey: (clientKey: string) => void;
	userKey: string | undefined;
	setUserKey: (userKey: string) => void;
	sign: string;
	setSign: (sign: string) => void;
	signs: ContractSign[];
	setSigns: (signs: ContractSign[]) => void;
	contractSign: ContractSign;
	setContractSign: (contractSign: ContractSign) => void;
	pdfFileLoad: number;
	setPdfFileLoad: (pdfFileLoad: number) => void;
	refreshSign: number;
	setRefreshSign: (refreshSign: number) => void;
	refreshEvent: number;
	setRefreshEvent: (refreshEvent: number) => void;
	refreshShareLink: number;
	setRefreshShareLink: (refreshShareLink: number) => void;
	refreshRecipients: number;
	setRefreshRecipients: (refreshRecipients: number) => void;
	refreshPlaceholders: number;
	setRefreshPlaceholders: (refreshPlaceholders: number) => void;
	placeholder: Placeholder[];
	setPlaceholder: (placeholder: any[]) => void;
	placeholderVisible: boolean;
	setPlaceholderVisible: (placeholderVisible: boolean) => void;
	isPdf: boolean;
	setIsPdf: (isPdf: boolean) => void;
	continueDisable: boolean;
	setContinueDisable: (continueDisable: boolean) => void;
	continueLoad: boolean;
	setContinueLoad: (continueDisable: boolean) => void;
	editorVisible: boolean;
	setEditorVisible: (editorVisible: boolean) => void;
	readonly: boolean;
	setReadonly: (readonly: boolean) => void;
	signCount: number;
	setSignCount: (signCount: number) => void;
	pdfDownload: boolean;
	setPdfDownload: (pdfDownload: boolean) => void;
	apiKey: string | undefined;
	setApiKey: (apiKey: string) => void;
	beforeCreated: boolean;
	setBeforeCreated: (beforeCreated: boolean) => void;
};
export const ContractEditorContext = createContext<
	TContractEditorContextType | undefined
>(undefined);
export const useContractEditorContext = () => {
	const context = useContext(ContractEditorContext);

	if (!context) {
		throw new Error(
			'useContractEditorContext must be used inside the EditorProvider'
		);
	}

	return context;
};
