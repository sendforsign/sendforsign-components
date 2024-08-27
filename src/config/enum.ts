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
	RECIPIENT = 'recipient',
	UPLOAD_PDF = 'upload_pdf',
	DOWNLOAD_PDF = 'download_pdf',
	CONTRACT_SHARE_LINK = 'contract_share_link',
	CONTRACT_SIGN = 'contract_sign',
	CONTRACT_APPROVE = 'contract_approve',
	CONTRACT_EMAIL_SIGN = 'contract_email_sign',
	CONTRACT_EMAIL_SIGN_PDF = 'contract_email_sign_pdf',
	CONTRACT_EMAIL_APPROVE = 'contract_email_approve',
	CONTRACT_EVENT = 'contract_event',
	EVENT_STATUS = 'event_status',
	CHECK_CONTRACT_VALUE = 'check_contract_value',
	UPDATE_CONTRACT_VALUE = 'update_contract_value',
	PLACEHOLDER = 'placeholder',
}
export const enum Action {
	READ = 'read',
	CREATE = 'create',
	UPDATE = 'update',
	DELETE = 'delete',
	LIST = 'list',
	SEND = 'send',
	ARCHIVE = 'archive',
	CONVERT = 'convert',
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
export const enum PlaceholderType {
	INTERNAL = '1',
	EXTERNAL = '2',
}
export const enum PlaceholderTypeText {
	INTERNAL = 'internal',
	EXTERNAL = 'external',
}
export const enum PlaceholderFill {
	NONE = 1,
	CREATOR = 2,
	ANY = 3,
	SPECIFIC = 4,
}
export const enum EventStatus {
	'SIGNED' = 5,
	'APPROVED' = 4,
	'SEEN' = 3,
	'SENT' = 2,
	'CREATED' = 1,
}
export const enum ContractSteps {
	TYPE_CHOOSE_STEP = 'TypeChooseStep',
	QN_A_STEP = 'QnAStep',
	CONTRACT_EDITOR_STEP = 'ContractEditorStep',
}
export const enum PlaceholderView {
	OTHER = 1,
	SIGNATURE = 2,
}
export const enum EventStatuses {
	SIGNED = '5',
	APPROVED = '4',
	SEEN = '3',
	SENT = '2',
	CREATED = '1',
}
export const ItemTypes = {
	PLACEHOLDER: 'placeholder',
};
