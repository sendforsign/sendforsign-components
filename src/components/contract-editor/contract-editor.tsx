import React, { FC, useEffect, useRef, useState } from 'react';
// import './contract-editor.css';
import { Card, Col, Row, Space, Spin, Typography } from 'antd';
import axios from 'axios';
import { BASE_URL } from '../../config/config';
import {
	Action,
	ApiEntity,
	ContractType,
	ContractTypeText,
	ContractSteps,
} from '../../config/enum';
import useSaveArrayBuffer from '../../hooks/use-save-array-buffer';
import {
	ContractSign,
	PagePlaceholder,
	Placeholder,
	Recipient,
} from '../../config/types';
import { ContractEditorContext } from './contract-editor-context';
import { ApproveModal } from './approve-modal/approve-modal';
import { SignModal } from './sign-modal/sign-modal';
import { SendModal } from './send-modal/send-modal';
import { ResultModal } from './result-modal/result-modal';
import { HtmlBlock } from './html-block/html-block';
import { Notification } from './notification/notification';
import { DocumentTimilineBlock } from './document-timeline-block/document-timeline-block';
import { ChooseContractType } from './choose-contract-type/choose-contract-type';
import { ShareLinkBlock } from './share-link-block/share-link-block';
import { PlaceholderHtmlBlock } from './placeholder-html-block/placeholder-html-block';
import { PlaceholderPdfBlock } from './placeholder-pdf-block';
import { PdfBlockDnd } from './pdf-block-dnd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export interface StepChangeProps {
	currentStep?: ContractSteps;
}
export interface DocumentSaveProps {
	documentSaved?: boolean;
}
export interface ContractEditorProps {
	apiKey?: string;
	clientKey?: string;
	token?: string;
	userKey?: string;
	contractKey?: string;
	pdf?: boolean;
	canReDraft?: boolean;
	showTimeline?: boolean;
	showActionsBar?: boolean;
	onStepChange?: (data: StepChangeProps) => void;
	onDocumentSave?: (data: DocumentSaveProps) => void;
}

export const ContractEditor: FC<ContractEditorProps> = ({
	apiKey = '',
	clientKey = '',
	token = '',
	contractKey = '',
	userKey = '',
	pdf = true,
	canReDraft = false,
	showTimeline = true,
	showActionsBar = true,
	onStepChange,
	onDocumentSave,
}) => {
	if (!apiKey && !token && !window.location.href.includes('story')) {
		throw new Error('Missing authority data');
	}
	const { setArrayBuffer, getArrayBuffer, clearArrayBuffer } =
		useSaveArrayBuffer();
	const [beforeCreated, setBeforeCreated] = useState(canReDraft);
	const [signModal, setSignModal] = useState(false);
	const [sendModal, setSendModal] = useState(false);
	const [approveModal, setApproveModal] = useState(false);
	const [resultModal, setResultModal] = useState<{
		open: boolean;
		action: string;
	}>({ open: false, action: '' });
	const [contractName, setContractName] = useState('');
	const [contractValue, setContractValue] = useState('');
	const [contractSign, setContractSign] = useState<ContractSign>({});
	const [signs, setSigns] = useState<ContractSign[]>([]);
	const [isPdf, setIsPdf] = useState(false);
	const [isNew, setIsNew] = useState(false);
	const [continueDisable, setContinueDisable] = useState(true);
	const [editorVisible, setEditorVisible] = useState(false);
	const [fillPlaceholder, setFillPlaceholder] = useState(false);
	const [contractType, setContractType] = useState('');
	const [templateKey, setTemplateKey] = useState('');
	const [spinLoad, setSpinLoad] = useState(false);
	const [currContractKey, setCurrContractKey] = useState(contractKey);
	const [currClientKey, setCurrClientKey] = useState(clientKey);
	const [currUserKey, setCurrUserKey] = useState(userKey);
	const [currApiKey, setCurrApiKey] = useState(apiKey);
	const [currToken, setCurrToken] = useState(token);
	const [continueLoad, setContinueLoad] = useState(false);
	const [createContract, setCreateContract] = useState(false);
	const [readonly, setReadonly] = useState(false);
	const [pdfDownload, setPdfDownload] = useState(false);
	const [load, setLoad] = useState(false);
	const [fillType, setFillType] = useState(false);
	const [placeholderVisible, setPlaceholderVisible] = useState(true);
	const [sign, setSign] = useState('');
	const [pdfFileLoad, setPdfFileLoad] = useState(0);
	const [refreshSign, setRefreshSign] = useState(0);
	const [refreshEvent, setRefreshEvent] = useState(0);
	const [refreshShareLink, setRefreshShareLink] = useState(0);
	const [refreshRecipients, setRefreshRecipients] = useState(0);
	const [refreshPlaceholders, setRefreshPlaceholders] = useState(0);
	const [refreshPlaceholderRecipients, setRefreshPlaceholderRecipients] =
		useState(0);
	const [signCount, setSignCount] = useState(0);
	const [placeholder, setPlaceholder] = useState<Placeholder[]>([]);
	const [placeholderPdf, setPlaceholderPdf] = useState<Placeholder>({});
	const [pagePlaceholder, setPagePlaceholder] = useState<PagePlaceholder[]>([]);
	const [notification, setNotification] = useState({});
	const [ipInfo, setIpInfo] = useState('');
	const [currentData, setCurrentData] = useState<StepChangeProps>({
		currentStep: ContractSteps.TYPE_CHOOSE_STEP,
	});
	const [contractEvents, setContractEvents] = useState<Array<any>>([]);
	const [documentCurrentSaved, setDocumentCurrentSaved] = useState(true);
	const [currentStep, setCurrentStep] = useState('');
	const [contractPlaceholderCount, setContractPlaceholderCount] = useState(0);
	const [pagePlaceholderDrag, setPagePlaceholderDrag] =
		useState<PagePlaceholder>({});
	const quillRef = useRef<any>();
	const contractKeyRef = useRef(contractKey);
	const first = useRef(false);
	const { Title, Text } = Typography;
	// console.log('contractKey ContractEditor', contractKey, currClientKey);

	useEffect(() => { 
		setCurrToken(token);
		setRefreshEvent(refreshEvent + 1);
	}, [token]);
	useEffect(() => { 
		setCurrApiKey(apiKey);
	}, [apiKey]);
	useEffect(() => { 
		setCurrClientKey(clientKey);
	}, [clientKey]);
	useEffect(() => { 
		setCurrUserKey(userKey);
	}, [userKey]);
	useEffect(() => {
		let isMounted = true;
		async function getContract() {
			// console.log('contractKey 4', currContractKey);
			let contractTmp: {
				contractType?: number;
				value?: string;
				name?: string;
				// preCreated?: boolean;
			} = {
				contractType: 0,
				value: '',
				name: '',
				// preCreated: false,
			};
			let body = {
				data: {
					action: Action.READ,
					clientKey: !token ? currClientKey : undefined,
					userKey: currUserKey ? currUserKey : '',
					contract: {
						contractKey: contractKeyRef.current,
					},
				},
			};
			const url: string = BASE_URL + ApiEntity.CONTRACT || '';
			await axios
				.post(url, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key':
							!currToken && currApiKey ? currApiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
						Authorization: currToken ? `Bearer ${currToken}` : undefined,
					},
					responseType: 'json',
				})
				.then((result) => { 
					contractTmp = result.data.contract;
				})
				.catch((error) => {
					setNotification({
						text:
							error.response &&
							error.response.data &&
							error.response.data.message
								? error.response.data.message
								: error.message,
					});
				});
			setContractName(contractTmp.name ? contractTmp.name : '');
			if (beforeCreated) {
				setContractType(
					contractTmp.contractType ? contractTmp.contractType.toString() : ''
				);
				setReadonly(false);
				setContinueLoad(false);
				setCurrentData({ currentStep: ContractSteps.TYPE_CHOOSE_STEP });
			} else { 
				if (
					contractTmp &&
					contractTmp.contractType &&
					contractTmp.contractType.toString() === ContractType.PDF.toString()
				) { 
					const response = await axios.get(contractTmp.value as string, {
						responseType: 'arraybuffer',
					}); 
					setIsPdf(true);
					await setArrayBuffer('pdfFile', response.data);
					await setArrayBuffer('pdfFileOriginal', response.data);
					setPdfDownload(true);
					setPdfFileLoad(pdfFileLoad + 1);
					setContinueLoad(false);
				} else { 
					// debugger;
					setContractValue(
						contractTmp.value ? contractTmp.value : '<div></div>'
					);
					setContinueLoad(false);
				}
				setContractType(
					contractTmp.contractType ? contractTmp.contractType.toString() : ''
				);
				setCurrentData({ currentStep: ContractSteps.CONTRACT_EDITOR_STEP });
			}
			setFillType(true);
		}
		// debugger;
		if (!first.current) {
			if (currApiKey || currToken) { 
				// console.log('contractKey ContractEditor 1');
				first.current = true;
				setContractSign({});
				setSigns([]);
				setPlaceholder([]);
				setSpinLoad(false);
				clearArrayBuffer();
				setEditorVisible(false);
				setContinueLoad(true);
				contractKeyRef.current = contractKey;
				setCurrContractKey(contractKey);
				// console.log('contractKey ContractEditor 4', contractKeyRef.current);

				if (contractKeyRef.current) { 
					getContract().catch(console.error);
					if (beforeCreated) {
						setIsNew(false);
						setPdfDownload(false);
					} else { 
						setIsNew(false);
						setEditorVisible(true);
						setRefreshEvent(refreshEvent + 1);
						setRefreshShareLink(refreshShareLink + 1);
						setRefreshSign(refreshSign + 1);
					}
				} else { 
					setBeforeCreated(false);
					setIsNew(true);
					setPdfDownload(false);
					setContractName('');
					setContractType('');
					setContractValue('<div></div>');
					setReadonly(false);
					setContinueLoad(false);
					setFillType(true);
					// console.log('contractKey ContractEditor 3');
				}
			} else { 
				// console.log('contractKey ContractEditor 2');
				setSpinLoad(true);
			}
		}
		return () => {
			isMounted = false;
		};
	}, [contractKey]);

	useEffect(() => {
		// debugger;
		// console.log('contractKey handleContinue', currContractKey);
		let isMounted = true;
		const handleContinue = async () => {
			setContinueLoad(true);
			let body: any = {};
			if (contractKeyRef.current && beforeCreated) {
				body = {
					data: {
						action: Action.UPDATE,
						clientKey: currClientKey ? currClientKey : '',
						userKey: currUserKey ? currUserKey : '',
						contract: {
							contractKey: contractKeyRef.current,
							name: contractName,
							value: contractValue,
							templateKey: templateKey,
							contractType: templateKey ? '' : contractType,
							// preCreated: true,
						},
						placeholders: fillPlaceholder
							? placeholder
									.filter((holder) => holder.value)
									.map((holder) => {
										return {
											placeholderKey: holder.placeholderKey,
											value: holder.value,
										};
									})
							: undefined,
					},
				};
			} else {
				body = {
					data: {
						action: Action.CREATE,
						clientKey: !token ? currClientKey : undefined,
						userKey: currUserKey ? currUserKey : '',
						contract: {
							name: contractName,
							value: contractValue,
							templateKey: templateKey,
							contractType: contractType,
						},
						placeholders: fillPlaceholder
							? placeholder
									.filter((holder) => holder.value)
									.map((holder) => {
										return {
											placeholderKey: holder.placeholderKey,
											value: holder.value,
										};
									})
							: undefined,
						returnValue: fillPlaceholder ? true : undefined,
					},
				};
			}
			let contractKeyTmp: string = '';
			const url: string = BASE_URL + ApiEntity.CONTRACT || '';

			const response = await axios
				.post(url, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						// 'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key':
							!currToken && currApiKey ? currApiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
						Authorization: currToken ? `Bearer ${currToken}` : undefined,
					},
					responseType: 'json',
				})
				.catch((error) => {
					setNotification({
						text:
							error.response &&
							error.response.data &&
							error.response.data.message
								? error.response.data.message
								: error.message,
					});
				});
			if (response) {
				contractKeyTmp = response.data.contract.contractKey;
				if (!beforeCreated) {
					setCurrContractKey(response.data.contract.contractKey);
				}
				if (
					response.data &&
					response.data.contract &&
					response.data.contract.contractValue
				) {
					setContractValue(response.data.contract.contractValue);
				}
				setPlaceholder([]);
				setRefreshEvent(refreshEvent + 1);
			}
			if (contractType === ContractTypeText.PDF.toString() && !templateKey) {
				// debugger;
				setDocumentCurrentSaved(false);
				const formData: FormData = new FormData();
				const pdfFile: ArrayBuffer = (await getArrayBuffer(
					'pdfFile'
				)) as ArrayBuffer;
				const pdfFileBlob = new Blob([pdfFile as BlobPart], {
					type: 'application/pdf',
				});
				formData.append('pdf', pdfFileBlob);

				let url = `${BASE_URL}${ApiEntity.UPLOAD_PDF}?contractKey=${
					contractKeyTmp ? contractKeyTmp : ''
				}`;
				url =
					!currToken && currApiKey ? `${url}&clientKey=${currClientKey}` : url;

				const response = await axios
					.post(url, formData, {
						headers: {
							'x-sendforsign-key':
								!currToken && currApiKey ? currApiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
							Authorization: currToken ? `Bearer ${currToken}` : undefined,
						},
						responseType: 'json',
					})
					.catch((error) => {
						setNotification({
							text:
								error.response &&
								error.response.data &&
								error.response.data.message
									? error.response.data.message
									: error.message,
						});
					});

				setDocumentCurrentSaved(true);
			}
			setCurrentData({ currentStep: ContractSteps.CONTRACT_EDITOR_STEP });
			setEditorVisible(true);
			setContinueDisable(true);
			setIsNew(false);
			setBeforeCreated(false);
			setContinueLoad(false);
			return response;
		};
		if (createContract) {
			// console.log('contractKey handleContinue', currContractKey);
			handleContinue().catch(console.error);
			setCreateContract(false);
		}
		return () => {
			isMounted = false;
		};
	}, [createContract]);
	// console.log('contractKey currContractKey', currContractKey);
	useEffect(() => {
		if (onStepChange) {
			if (currentData.currentStep !== currentStep) {
				setCurrentStep(currentData.currentStep as string);
				onStepChange(currentData);
			}
		}
	}, [currentData]);
	useEffect(() => {
		if (onDocumentSave) {
			onDocumentSave({ documentSaved: documentCurrentSaved });
		}
	}, [documentCurrentSaved]);
	return (
		<ContractEditorContext.Provider
			value={{
				signModal,
				setSignModal,
				sendModal,
				setSendModal,
				approveModal,
				setApproveModal,
				resultModal,
				setResultModal,
				notification,
				setNotification,
				contractKey: currContractKey,
				setContractKey: setCurrContractKey,
				contractName,
				setContractName,
				contractType,
				setContractType,
				templateKey,
				setTemplateKey,
				clientKey: currClientKey,
				setClientKey: setCurrClientKey,
				userKey: currUserKey,
				setUserKey: setCurrUserKey,
				token: currToken,
				setToken: setCurrToken,
				sign,
				setSign,
				signs,
				setSigns,
				contractSign,
				setContractSign,
				pdfFileLoad,
				setPdfFileLoad,
				refreshSign,
				setRefreshSign,
				refreshEvent,
				setRefreshEvent,
				refreshShareLink,
				setRefreshShareLink,
				refreshRecipients,
				setRefreshRecipients,
				refreshPlaceholders,
				setRefreshPlaceholders,
				placeholder,
				setPlaceholder,
				placeholderPdf,
				setPlaceholderPdf,
				placeholderVisible,
				setPlaceholderVisible,
				contractValue,
				setContractValue,
				createContract,
				setCreateContract,
				isPdf,
				setIsPdf,
				continueDisable,
				setContinueDisable,
				continueLoad,
				setContinueLoad,
				editorVisible,
				setEditorVisible,
				readonly,
				setReadonly,
				signCount,
				setSignCount,
				pdfDownload,
				setPdfDownload,
				apiKey: currApiKey,
				setApiKey: setCurrApiKey,
				beforeCreated,
				setBeforeCreated,
				ipInfo,
				setIpInfo,
				contractEvents,
				setContractEvents,
				fillPlaceholder,
				setFillPlaceholder,
				refreshPlaceholderRecipients,
				setRefreshPlaceholderRecipients,
				currentData,
				setCurrentData,
				documentCurrentSaved,
				setDocumentCurrentSaved,
				load,
				setLoad,
				contractPlaceholderCount,
				setContractPlaceholderCount,
				pagePlaceholder,
				setPagePlaceholder,
				pagePlaceholderDrag,
				setPagePlaceholderDrag,
			}}
		>
			{spinLoad ? (
				<Spin spinning={spinLoad} fullscreen />
			) : (
				<Space direction='vertical' size={16} style={{ display: 'flex' }}>
					{isNew || beforeCreated ? (
						<ChooseContractType allowPdf={pdf} />
					) : (
						<>{showTimeline && <DocumentTimilineBlock />}</>
					)}
					{!isNew && !beforeCreated && (
						<>
							{editorVisible && (
								<Row gutter={{ xs: 8, sm: 8, md: 8, lg: 8 }} wrap={false}>
									<DndProvider backend={HTML5Backend}>
										<Col flex='auto'>
											<Space direction='vertical' style={{ display: 'flex' }}>
												<Card loading={continueLoad}>
													<Space
														direction='vertical'
														size={16}
														style={{ display: 'flex' }}
													>
														<Space
															direction='vertical'
															size={2}
															className='SharingDocHeader'
														>
															<Title level={4} style={{ margin: '0 0 0 0' }}>
																Review your document
															</Title>
															{!isPdf && (
																<Text type='secondary'>
																	Highlight text to see options.
																</Text>
															)}
														</Space>
														{!isPdf ? (
															<>
																{contractValue && (
																	<HtmlBlock
																		value={contractValue}
																		quillRef={quillRef}
																	/>
																)}
															</>
														) : (
															// <PdfBlock />
															<PdfBlockDnd />
														)}
													</Space>
												</Card>
											</Space>
										</Col>
										{fillType && !isPdf && placeholderVisible && (
											<Col flex='300px' style={{ display: 'block' }}>
												<Space
													direction='vertical'
													style={{
														display: 'flex',
														top: 10,
														position: 'sticky',
														maxHeight: '80vh',
														overflow: 'auto',
													}}
												>
													<PlaceholderHtmlBlock quillRef={quillRef} />
												</Space>
											</Col>
										)}
										{fillType && isPdf && placeholderVisible && (
											<Col flex='300px' style={{ display: 'block' }}>
												<Space
													direction='vertical'
													style={{
														display: 'flex',
														top: 10,
														position: 'sticky',
														maxHeight: '80vh',
														overflow: 'auto',
													}}
												>
													<PlaceholderPdfBlock />
												</Space>
											</Col>
										)}
									</DndProvider>
								</Row>
							)}
							<div id='contractActionsFooter'>
								{showActionsBar && <ShareLinkBlock />}
							</div>
						</>
					)}
				</Space>
			)}
			<SignModal />
			<SendModal />
			<ApproveModal />
			<ResultModal />
			<Notification />
		</ContractEditorContext.Provider>
	);
};
