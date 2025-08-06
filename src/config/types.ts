import {
	Action,
	PlaceholderView,
	RecipientType,
	ShareLinkView,
	ShareLinkViewText,
	SignType,
	SpecialType,
} from './enum';

export type Contract = {
	contractType?: number;
	controlLink?: string;
	shareLink?: string;
	createTime?: Date;
	contractValue?: string;
	statusId?: number;
	statusName?: string;
	changeTime?: Date;
	changed?: boolean;
	view?: ShareLinkView;
	owner?: boolean;
	audit?: boolean;
	userId?: string;
	result?: boolean;
	contractName?: string;
	isDone?: boolean;
	fullname?: string;
	email?: string;
	placeholders?: Placeholder[];
	visiblePageBranding?: boolean;
	isTest?: boolean;
};
export type ContractLinkCheck = {
	controlLink?: string;
	shareLink?: string;
	userId?: string;
	find?: boolean;
};
export type Feature = {
	id: number;
	name: string;
	price: number;
	active?: boolean;
	count?: number;
	description?: string;
	description_img?: string;
};
export type ContractFeature = {
	controlLink?: string;
	shareLink?: string;
	contractId?: number;
	featureId?: number;
	createTime?: Date;
	changeTime?: Date;
	count?: number;
	paid?: boolean;
	active?: boolean;
	description_img?: string;
	userId?: string;
};
export type ContractType = {
	id?: number;
	name?: string;
	active?: boolean;
	description?: string;
	icon?: boolean;
	categoryId?: number;
	categoryName?: string;
	color?: string;
	template?: string;
	imgUrl?: string;
};
export type TemplateText = {
	id?: number;
	templateText?: string;
};
export type LemonSqueezy = {
	data?: any;
	type?: string;
	attributes?: {
		custom_price?: number;
		product_options?: any;
		checkout_options?: any;
		checkout_data?: any;
	};
};
export type ContractApprove = {
	shareLink?: string;
	controlLink?: string;
	fullName?: string;
	email?: string;
	id?: number;
	createTime?: Date;
	userId?: string;
};
export type ContractSign = {
	shareLink?: string;
	controlLink?: string;
	fullName?: string;
	email?: string;
	id?: number;
	recipientId?: number;
	createTime?: Date;
	owner?: boolean;
	base64?: string;
	userId?: string;
	signTypeId?: SignType;
	ipInfo?: string;
	fromShareLink?: boolean;
	contractType?: number;
	contractValue?: string;
	statusId?: number;
	statusName?: string;
	changeTime?: Date;
	changed?: boolean;
	view?: ShareLinkView;
	audit?: boolean;
	result?: boolean;
	contractName?: string;
	isDone?: boolean;
	fullname?: string;
	placeholders?: Placeholder[];
	visiblePageBranding?: boolean;
	isTest?: boolean;
};
export type ContractSignAi = {
	fullName?: string;
	urls?: { url: string }[];
};
export type ContractEmail = {
	shareLink?: string;
	controlLink?: string;
	contractValue?: string;
	result?: boolean;
	userId?: string;
};
export type ContractValue = {
	contractValue?: string;
	changeTime?: Date;
};
export type PdfFormData = {
	shareLink?: string;
	controlLink?: string;
	userId?: string;
	data?: any;
};
export type ContractShareLink = {
	id?: number;
	shareLink?: string;
	controlLink?: string;
	createTime?: Date;
	changeTime?: Date;
	view?: ShareLinkView;
	userId?: string;
};
export type EventStatus = {
	id?: number;
	name?: string;
	color?: string;
};
export type ContractEvent = {
	controlLink?: string;
	id?: number;
	createTime?: Date;
	shareLink?: string;
	status?: string;
	email?: string;
	name?: string;
	userId?: string;
	priority?: number;
	ipInfo?: string;
};
export type PdfDownload = {
	fileName?: string;
};
export type UserInfo = {
	payload?: string;
	result?: boolean;
};
export type Template = {
	createTime?: Date;
	changeTime?: Date;
	templateKey?: string;
	value?: string;
	name?: string;
	isPdf?: boolean;
};
export type Recipient = {
	id?: number;
	createTime?: Date;
	changeTime?: Date;
	fullname?: string;
	email?: string;
	customMessage?: string;
	position?: number;
	action?: ShareLinkViewText;
	recipientKey?: string;
	isDone?: boolean;
	shareLink?: string;
	color?: string;
	type?: RecipientType;
};
export type Placeholder = {
	templateKey?: string;
	contractKey?: string;
	id?: number;
	createtime?: Date;
	name?: string;
	value?: string;
	isTable?: boolean;
	type?: string;
	placeholderKey?: string;
	fillingType?: number;
	externalRecipientKey?: string;
	view?: PlaceholderView;
	insertion?: Insertion[];
	color?: string;
	isSpecial?: boolean;
	specialType?: SpecialType | undefined;
};
export type Insertion = {
	pageId?: number;
	id?: number;
	width?: number;
	height?: number;
	positionX?: number;
	positionY?: number;
	action?: Action;
	color?: string;
};
export type PagePlaceholder = {
	pageId?: number;
	id?: number;
	placeholderKey?: string;
	value?: string;
	name?: string;
	positionX?: number;
	positionY?: number;
	width?: number;
	height?: number;
	view?: PlaceholderView;
	base64?: string;
	color?: string;
	isSpecial?: boolean;
	specialType?: SpecialType | undefined;
	externalRecipientKey?: string;
	owner?: boolean;
};
export type Row = {
	json?: any;
	email?: string;
	name?: string;
	createTime?: string;
	base64?: string;
};
export type Context = {
	name?: string;
	contextKey?: string;
	createTime?: Date;
	general?: boolean;
	documents?: ContextDocument[];
};
export type ContextDocument = {
	id?: number;
	createTime?: Date;
	name?: string;
	link?: string;
};
export interface DragItem {
	id: string;
	pagePlaceholder: PagePlaceholder;
}
export interface NewDrag {
	chosePlaceholder: Placeholder;
}
