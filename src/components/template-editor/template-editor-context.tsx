import { createContext, useContext } from 'react';
import {
	ContractSign,
	ContractType,
	PagePlaceholder,
	Placeholder,
} from '../../config/types';

export type TTemplateEditorContextType = {
	resultModal: { open: boolean; action: string };
	setResultModal: ({ open }: { open: boolean; action: string }) => void;
	clientKey: string | undefined;
	setClientKey: (clientKey: string) => void;
	userKey: string | undefined;
	setUserKey: (userKey: string) => void;
	templateKey: string | undefined;
	setTemplateKey: (templateKey: string) => void;
	notification: { text?: any };
	setNotification: (text: any) => void;
	templateName: string;
	setTemplateName: (templateName: string) => void;
	templateValue: string;
	setTemplateValue: (templateValue: string) => void;
	templateType: string;
	setTemplateType: (templateType: string) => void;
	editorVisible: boolean;
	setEditorVisible: (editorVisible: boolean) => void;
	pdfFileLoad: number;
	setPdfFileLoad: (pdfFileLoad: number) => void;
	isPdf: boolean;
	setIsPdf: (isPdf: boolean) => void;
	createTemplate: boolean;
	setCreateTemplate: (createTemplate: boolean) => void;
	continueLoad: boolean;
	setContinueLoad: (continueDisable: boolean) => void;
	refreshPlaceholders: number;
	setRefreshPlaceholders: (refreshPlaceholders: number) => void;
	placeholder: Placeholder[];
	setPlaceholder: (placeholder: Placeholder[]) => void;
	placeholderPdf: Placeholder;
	setPlaceholderPdf: (placeholder: Placeholder) => void;
	apiKey: string | undefined;
	setApiKey: (apiKey: string) => void;
	token: string | undefined;
	setToken: (token: string) => void;
	pagePlaceholderDrag: PagePlaceholder;
	setPagePlaceholderDrag: (pagePlaceholderDrag: PagePlaceholder) => void;
	pagePlaceholder: PagePlaceholder[];
	setPagePlaceholder: (pagePlaceholder: PagePlaceholder[]) => void;
	placeholderChange: Placeholder;
	setPlaceholderChange: (placeholderChange: Placeholder) => void;
	placeholderDelete: string;
	setPlaceholderDelete: (placeholderDelete: string) => void;
	templatePlaceholderCount: number;
	setTemplatePlaceholderCount: (templatePlaceholderCount: number) => void;
};
export const TemplateEditorContext = createContext<
	TTemplateEditorContextType | undefined
>(undefined);
export const useTemplateEditorContext = () => {
	const context = useContext(TemplateEditorContext);

	if (!context) {
		throw new Error(
			'useContractEditorContext must be used inside the EditorProvider'
		);
	}

	return context;
};
