export const enum ShareLinkView {
	SIGN = '1',
	APPROVE = '2',
	LOCK = '3',
	VIEW = '4',
}
export const enum ShareLinkViewText {
	SIGN = 'sign',
	APPROVE = 'approve',
	LOCK = 'lock',
	VIEW = 'view',
}
export const enum ApiEntity {
	CONTRACT = 'contract',
	USER = 'user',
	CLIENT = 'client',
	TEMPLATE = 'template',
	EMAIL = 'email',
	UPLOAD_PDF = 'upload_pdf',
	CONTRACT_SHARE_LINK = 'contract_share_link',
	CONTRACT_SIGN = 'contract_sign',
	CONTRACT_APPROVE = 'contract_approve',
	CONTRACT_EMAIL_SIGN = 'contract_email_sign',
	CONTRACT_EMAIL_SIGN_PDF = 'contract_email_sign_pdf',
	CONTRACT_EMAIL_APPROVE = 'contract_email_approve',
	CONTRACT_EVENT = 'contract_event',
	EVENT_STATUS = 'event_status',
}
export const enum Action {
	READ = 'read',
	CREATE = 'create',
	UPDATE = 'update',
	LIST = 'list',
	SEND = 'send',
}
export const enum ContractType {
	DOCX = 6,
	PDF = 7,
	EMPTY = 8,
}
export const enum ContractTypeText {
	DOCX = 'docx',
	PDF = 'pdf',
	EMPTY = 'empty',
}

export const enum ContractAction {
	SIGN = 'sign',
	APPROVE = 'approve',
	SEND = 'send',
}
