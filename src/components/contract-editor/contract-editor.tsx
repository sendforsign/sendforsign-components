import React, { FC, useEffect, useRef, useState } from 'react';
import './contract-editor.css';
import { Card, Col, Row, Space, Typography } from 'antd';
import { ContractEditorProps } from './contract-editor.types';
import axios from 'axios';
import { BASE_URL } from '../../config/config';
import {
	Action,
	ApiEntity,
	ContractType,
	ContractTypeText,
} from '../../config/enum';
import useSaveArrayBuffer from '../../hooks/use-save-array-buffer';
import { ContractSign, Placeholder } from '../../config/types';
import { ContractEditorContext } from './contract-editor-context';
import { ApproveModal } from './approve-modal/approve-modal';
import { SignModal } from './sign-modal/sign-modal';
import { SendModal } from './send-modal/send-modal';
import { ResultModal } from './result-modal/result-modal';
import { HtmlBlock } from './html-block/html-block';
import { PdfBlock } from './pdf-block/pdf-block';
import { Notification } from './notification/notification';
import { DocumentTimilineBlock } from './document-timeline-block/document-timeline-block';
import { ChooseContractType } from './choose-contract-type/choose-contract-type';
import { ShareLinkBlock } from './share-link-block/share-link-block';
import Quill from 'quill';
import { PlaceholderBlock } from './placeholder-block/placeholder-block';
//env.config();

export const ContractEditor: FC<ContractEditorProps> = ({
	apiKey = '',
	contractKey = '',
	clientKey = '',
	userKey = '',
	id,
}) => {
	if (!apiKey && !process.env.REACT_APP_SENDFORSIGN_KEY) {
		throw new Error('Missing Publishable Key');
	}
	const { setArrayBuffer, getArrayBuffer, clearArrayBuffer } =
		useSaveArrayBuffer();
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
	const [contractType, setContractType] = useState('');
	const [templateKey, setTemplateKey] = useState('');
	const [currContractKey, setCurrContractKey] = useState(contractKey);
	const [currClientKey, setCurrClientKey] = useState(clientKey);
	const [currUserKey, setCurrUserKey] = useState(userKey);
	const [currApiKey, setCurrApiKey] = useState(
		apiKey ? apiKey : process.env.REACT_APP_SENDFORSIGN_KEY
	);
	const [continueLoad, setContinueLoad] = useState(false);
	const [createContract, setCreateContract] = useState(false);
	const [readonly, setReadonly] = useState(false);
	const [pdfDownload, setPdfDownload] = useState(false);
	const [placeholderVisible, setPlaceholderVisible] = useState(false);
	const [sign, setSign] = useState('');
	const [pdfFileLoad, setPdfFileLoad] = useState(0);
	const [refreshSign, setRefreshSign] = useState(0);
	const [refreshEvent, setRefreshEvent] = useState(0);
	const [refreshShareLink, setRefreshShareLink] = useState(0);
	const [refreshRecipients, setRefreshRecipients] = useState(0);
	const [refreshPlaceholders, setRefreshPlaceholders] = useState(0);
	const [signCount, setSignCount] = useState(0);
	const [placeholder, setPlaceholder] = useState<Placeholder[]>([{}]);
	const [notification, setNotification] = useState({});
	const quillRef = useRef<Quill>();
	const contractKeyRef = useRef(contractKey);
	const { Title, Text } = Typography;
	console.log('contractKey', contractKey, currClientKey);

	useEffect(() => {
		setCurrApiKey(apiKey ? apiKey : process.env.REACT_APP_SENDFORSIGN_KEY);
	}, [apiKey]);
	useEffect(() => {
		setCurrClientKey(clientKey);
	}, [clientKey]);
	useEffect(() => {
		setCurrUserKey(userKey);
	}, [userKey]);
	useEffect(() => {
		async function getContract() {
			let contractTmp: { contractType?: number; value?: string } = {
				contractType: 0,
				value: '',
			};
			let body = {
				data: {
					action: Action.READ,
					clientKey: currClientKey ? currClientKey : '',
					userKey: currUserKey ? currUserKey : '',
					contract: {
						contractKey: contractKeyRef.current,
					},
				},
			};
			const url: string = BASE_URL + ApiEntity.CONTRACT || '';

			const result = await axios.post(url, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': currApiKey ? currApiKey : '', //process.env.SENDFORSIGN_API_KEY,
				},
				responseType: 'json',
			});
			contractTmp = result.data.contract;
			if (
				contractTmp &&
				contractTmp.contractType &&
				contractTmp.contractType.toString() === ContractType.PDF.toString()
			) {
				const response = await axios.get(contractTmp.value as string, {
					responseType: 'arraybuffer',
				});
				// .then(async function (response) {
				setIsPdf(true);
				await setArrayBuffer('pdfFile', response.data);
				await setArrayBuffer('pdfFileOriginal', response.data);
				setPdfDownload(true);
				// setPdfData(response.data);
				setPdfFileLoad(pdfFileLoad + 1);
				setContinueLoad(false);
				// });
			} else {
				// debugger;
				setContractValue(contractTmp.value ? contractTmp.value : '<div></div>');
				setContinueLoad(false);
			}
		}

		clearArrayBuffer();
		setEditorVisible(false);
		setContinueLoad(true);
		contractKeyRef.current = contractKey;
		setCurrContractKey(contractKey);
		if (contractKeyRef.current) {
			setIsNew(false);
			setEditorVisible(true);
			setRefreshEvent(refreshEvent + 1);
			setRefreshShareLink(refreshShareLink + 1);
			setRefreshSign(refreshSign + 1);

			getContract().catch(console.error);
		} else {
			setIsNew(true);
			setPdfDownload(false);
			setContractName('');
			setContractType('');
			setContractValue('<div></div>');
			setReadonly(false);
			setContinueLoad(false);
		}
	}, [contractKey]);

	useEffect(() => {
		const handleContinue = async () => {
			setContinueLoad(true);
			let body: any = {
				data: {
					action: Action.CREATE,
					clientKey: currClientKey ? currClientKey : '',
					userKey: currUserKey ? currUserKey : '',
					contract: {
						name: contractName,
						value: contractValue,
						templateKey: templateKey,
						contractType: contractType,
					},
				},
			};
			let contractKeyTmp: string = '';
			const url: string = BASE_URL + ApiEntity.CONTRACT || '';

			const response = await axios.post(url, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': currApiKey ? currApiKey : '', //process.env.SENDFORSIGN_API_KEY,
				},
				responseType: 'json',
			});
			console.log('editor read', response);
			if (response) {
				setCurrContractKey(response.data.contract.contractKey);
				contractKeyTmp = response.data.contract.contractKey;
				setRefreshEvent(refreshEvent + 1);
			}
			if (contractType === ContractTypeText.PDF.toString() && !templateKey) {
				const formData: FormData = new FormData();
				const pdfFile: ArrayBuffer = await getArrayBuffer('pdfFile');
				const pdfFileBlob = new Blob([pdfFile as BlobPart], {
					type: 'application/pdf',
				});
				formData.append('pdf', pdfFileBlob);

				const url = `${BASE_URL}${ApiEntity.UPLOAD_PDF}?contractKey=${
					contractKeyTmp ? contractKeyTmp : ''
				}&clientKey=${currClientKey ? currClientKey : ''}`;

				const response = await axios.post(url, formData, {
					headers: {
						'x-sendforsign-key': currApiKey ? currApiKey : '',
					},
					responseType: 'json',
				});
			}
			setEditorVisible(true);
			setContinueDisable(true);
			setIsNew(false);
			setContinueLoad(false);
			return response;
		};
		if (createContract) {
			handleContinue().catch(console.error);
			setCreateContract(false);
		}
	}, [createContract]);

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
			}}
		>
			<Space id={id} direction='vertical' size={16} style={{ display: 'flex' }}>
				{isNew ? <ChooseContractType /> : <DocumentTimilineBlock />}
				{!isNew && (
					<>
						{editorVisible && (
							<Row gutter={{ xs: 8, sm: 8, md: 8, lg: 8 }} wrap={false}>
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
													<PdfBlock />
												)}
											</Space>
										</Card>
									</Space>
								</Col>
								{!isPdf && placeholderVisible && (
									<Col flex='300px' style={{ display: 'block' }}>
										<Space
											direction='vertical'
											style={{ display: 'flex', top: 10, position: 'sticky' }}
										>
											<PlaceholderBlock quillRef={quillRef} />
										</Space>
									</Col>
								)}
							</Row>
						)}
						<ShareLinkBlock />
					</>
				)}
			</Space>
			<SignModal />
			<SendModal />
			<ApproveModal />
			<ResultModal />
			<Notification />
		</ContractEditorContext.Provider>
	);
};
