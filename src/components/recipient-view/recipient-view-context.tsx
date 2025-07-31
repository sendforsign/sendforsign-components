import { createContext, useContext } from 'react';
import { Contract, ContractEvent, ContractSign, ContractValue, Placeholder } from '../../config/types';
import { ContractAction, ShareLinkView } from '../../config/enum';

export type TRecipientViewContextType = {
	contract: Contract;
	setContract: (contract: Contract) => void;
	shareLinkView: ShareLinkView;
	setShareLinkView: (shareLinkView: ShareLinkView) => void;
	signModal: boolean;
	setSignModal: (signModal: boolean) => void;
	approveModal: boolean;
	setApproveModal: (approveModal: boolean) => void;
	notification: { text?: any };
	setNotification: (text: any) => void;
	contractValue: ContractValue;
	setContractValue: (contractValue: ContractValue) => void;
	contractEvent: ContractEvent[];
	setContractEvent: (contractEvent: ContractEvent[]) => void;
	isDone: boolean;
	setIsDone: (isDone: boolean) => void;
	shareBlockReady: boolean;
	setShareBlockReady: (shareBlockReady: boolean) => void;
	fillPlaceholderBefore: boolean;
	setFillPlaceholderBefore: (fillPlaceholderBefore: boolean) => void;
	ipInfo: string;
	setIpInfo: (ipInfo: string) => void;
	placeholder: Placeholder[];
	setPlaceholder: (placeholders: Placeholder[]) => void;
	resultModal: { open: boolean, action: ContractAction | undefined };
	setResultModal: (resultModal: { open: boolean, action: ContractAction | undefined }) => void;
	pdfFileLoad: number;
	setPdfFileLoad: (pdfFileLoad: number) => void;
	sign: string;
	setSign: (sign: string) => void;
	signs: ContractSign[];
	setSigns: (signs: ContractSign[]) => void;
	contractSign: ContractSign;
	setContractSign: (contractSign: ContractSign) => void;
};
export const RecipientViewContext = createContext<
	TRecipientViewContextType | undefined
>(undefined);
export const useRecipientViewContext = () => {
	const context = useContext(RecipientViewContext);

	if (!context) {
		throw new Error(
			'useRecipientViewContext must be used inside the ListProvider'
		);
	}

	return context;
};
