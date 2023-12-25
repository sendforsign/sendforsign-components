import React, { FC, useContext, useEffect, useRef, useState } from 'react';
// import './editor.css';
import 'quill/dist/quill.bubble.css';
import QuillNamespace, { Quill } from 'quill';
import QuillBetterTable from 'quill-better-table';
import { Document, Page, pdfjs } from 'react-pdf';
import { useDebouncedCallback } from 'use-debounce';
import {
	Space,
	Card,
	Typography,
	Button,
	Spin,
	Tag,
	Input,
	Tooltip,
	Row,
	Col,
	Modal,
} from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { EditorProps } from './editor.types';
import axios from 'axios';
import { BASE_URL, SHARE_URL } from '../../config/config';
import {
	Action,
	ApiEntity,
	ContractType,
	ShareLinkView,
} from '../../config/enum';
import Segmented, { SegmentedLabeledOption } from 'antd/es/segmented';
import useSaveParams from '../../hooks/use-save-params';
import { useResizeDetector } from 'react-resize-detector';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faSignature,
	faSquarePlus,
	faStamp,
	faTrash,
	faCopy,
	faLock,
} from '@fortawesome/free-solid-svg-icons';
import { docx2html } from '../../utils';
import useSaveArrayBuffer from '../../hooks/use-save-array-buffer';
import { ContractShareLink, ContractSign } from '../../config/types';
// import { SignModal } from './sign-modal';
import { EditorContext, useEditorContext } from './editor-context';
import { ApproveModal } from './approve-modal/approve-modal';
import { SignModal } from './sign-modal/sign-modal';
import { ResultModal } from './result-modal/result-modal';
import { HtmlBlock } from './html-block/html-block';
import { PdfBlock } from './pdf-block/pdf-block';
import { Notification } from './notification/notification';
import { ShareLinkLine } from './share-link-line/share-link-line';

export const Editor: FC<EditorProps> = ({
	contractKey,
	clientKey,
	userKey,
	readonly,
	view,
}) => {
	// if (!process.env.SENDFORSIGN_API_KEY) {
	//  TO DO
	// }
	// const { setSignModal } = useEditorContext();

	// const { setSignModal } = useContext(EditorContext) as TEditorContextType;
	const { setArrayBuffer, getArrayBuffer, clearArrayBuffer } =
		useSaveArrayBuffer();
	const [pdfData, setPdfData] = useState<ArrayBuffer>();
	const [scale, setScale] = useState(1);
	const [signModal, setSignModal] = useState(false);
	const [approveModal, setApproveModal] = useState(false);
	const [resultModal, setResultModal] = useState({ open: false, action: '' });
	const [numPages, setNumPages] = useState(1);
	const { setParam, getParam } = useSaveParams();
	const [contractName, setContractName] = useState('');
	const [contractValue, setContractValue] = useState('');
	const [contractSign, setContractSign] = useState<ContractSign>({});
	const [isPdf, setIsPdf] = useState(false);
	const [options, setOptions] = useState<SegmentedLabeledOption[]>([]);
	const [optionsShareLink, setOptionsShareLink] = useState<
		SegmentedLabeledOption[]
	>([]);
	const [currContractKey, setCurrContractKey] = useState(contractKey);
	const [createDisable, setCreateDisable] = useState(true);
	const [continueDisable, setContinueDisable] = useState(true);
	const [fieldBlockVisible, setFieldBlockVisible] = useState(false);
	const [editorVisible, setEditorVisible] = useState(
		contractKey ? true : false
	);
	const [contractType, setContractType] = useState('');
	const [templateKey, setTemplateKey] = useState('');
	const [currClientKey, setCurrClientKey] = useState(clientKey);
	const [currUserKey, setCurrUserKey] = useState(userKey);
	const [loadSegmented, setLoadSegmented] = useState(false);
	const [loadEditor, setLoadEditor] = useState(false);
	const [btnName, setBtnName] = useState('Create contract');
	const [shareLinks, setShareLinks] = useState([]);
	const [refreshShareLink, setRefreshShareLink] = useState(0);
	const [changeSpin, setChangeSpin] = useState(false);
	const [deleteSpin, setDeleteSpin] = useState(false);
	const [addBtnSpin, setAddBtnSpin] = useState(false);
	const [sign, setSign] = useState('');
	const [pdfFileLoad, setPdfFileLoad] = useState(0);
	const [refreshSign, setRefreshSign] = useState(0);
	const [notification, setNotification] = useState<{
		text: string | React.ReactNode;
	}>({ text: '' });
	const { Title, Text } = Typography;
	const contractKeyRef = useRef(contractKey);

	useEffect(() => {
		clearArrayBuffer();
		let body = {};
		if (contractKeyRef.current) {
			body = {
				data: {
					action: Action.READ,
					clientKey: clientKey,
					userKey: userKey,
					contract: {
						contractKey: contractKeyRef.current,
					},
				},
			};

			const getContract = async () => {
				let contractTmp: { contractType?: any; value?: string } = {};
				await axios
					.post(BASE_URL + ApiEntity.CONTRACT, body, {
						headers: {
							Accept: 'application/vnd.api+json',
							'Content-Type': 'application/vnd.api+json',
							'x-sendforsign-key': 're_api_key', //process.env.SENDFORSIGN_API_KEY,
						},
						responseType: 'json',
					})
					.then((payload) => {
						console.log('getContract read', payload);
						contractTmp = payload.data.contract;
					});
				if (contractTmp?.contractType === ContractType.PDF.toString()) {
					await axios
						.get(contractTmp.value as string, {
							responseType: 'arraybuffer',
						})
						.then(async function (response) {
							setIsPdf(true);
							await setArrayBuffer('pdfFile', response.data);
							await setArrayBuffer('pdfFileOriginal', response.data);
							setPdfData(response.data);
							setPdfFileLoad(pdfFileLoad + 1);
						});
				} else {
					setContractValue(contractTmp.value as string);
				}
			};
			getContract();
		}
		body = {
			data: {
				action: Action.LIST,
				clientKey: clientKey,
				userKey: userKey,
			},
		};

		const getTemplates = async () => {
			await axios
				.post(BASE_URL + ApiEntity.TEMPLATE, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': 're_api_key', //process.env.SENDFORSIGN_API_KEY,
					},
					responseType: 'json',
				})
				.then((payload) => {
					console.log('editor read', payload);
					let array: SegmentedLabeledOption[] = [];
					array.push({
						label: (
							<div
								style={{
									paddingTop: '8px',
									width: 100,
									whiteSpace: 'normal',
									lineHeight: '20px',
								}}
							>
								<Tag style={{ margin: '4px 0' }} color={'magenta'}>
									File
								</Tag>
								<div style={{ padding: '4px 0' }}>DOCX</div>
							</div>
						),
						value: `template_${ContractType.DOCX}`,
					});
					array.push({
						label: (
							<div
								style={{
									paddingTop: '8px',
									width: 100,
									whiteSpace: 'normal',
									lineHeight: '20px',
								}}
							>
								<Tag style={{ margin: '4px 0' }} color={'magenta'}>
									File
								</Tag>
								<div style={{ padding: '4px 0' }}>PDF</div>
							</div>
						),
						value: `template_${ContractType.PDF}`,
					});
					array.push({
						label: (
							<div
								style={{
									paddingTop: '8px',
									width: 100,
									whiteSpace: 'normal',
									lineHeight: '20px',
								}}
							>
								<Tag style={{ margin: '4px 0' }} color={'cyan'}>
									Empty
								</Tag>
								<div style={{ padding: '4px 0' }}>EMPTY</div>
							</div>
						),
						value: `template_${ContractType.EMPTY}`,
					});
					payload.data.templates.forEach((template: any) => {
						array.push({
							label: (
								<div
									style={{
										paddingTop: '8px',
										width: 100,
										whiteSpace: 'normal',
										lineHeight: '20px',
									}}
								>
									<Tag style={{ margin: '4px 0' }} color={'cyan'}>
										User
									</Tag>
									<div style={{ padding: '4px 0' }}>{template.name}</div>
								</div>
							),
							value: template.templateKey,
						});
					});
					setOptions(array);
				});
		};
		getTemplates();
	}, []);
	useEffect(() => {
		// debugger;
		if (currContractKey) {
			contractKeyRef.current = currContractKey as string; //|| getParam('contractKey');
			const getShareLinks = async () => {
				let url = `${BASE_URL}${ApiEntity.CONTRACT_SHARE_LINK}?contractKey=${currContractKey}&clientKey=${clientKey}`;
				await axios
					.get(url, {
						headers: {
							Accept: 'application/vnd.api+json',
							'Content-Type': 'application/vnd.api+json',
							'x-sendforsign-key': 're_api_key', //process.env.SENDFORSIGN_API_KEY,
						},
						responseType: 'json',
					})
					.then((payload) => {
						console.log('getShareLinks read', payload);
						setShareLinks(payload.data);
					});
			};
			getShareLinks();
		}
	}, [currContractKey, refreshShareLink]);

	const handleCreate = () => {
		setFieldBlockVisible(true);
		setCreateDisable(true);
	};
	const handleContinue = async () => {
		setLoadEditor(true);
		let body = {
			data: {
				action: Action.CREATE,
				clientKey: clientKey,
				userKey: userKey,
				contract: {
					name: contractName,
					value: contractValue,
					templateKey: templateKey,
					contractType: contractType,
				},
			},
		};
		let contractKeyTmp = '';
		await axios
			.post(BASE_URL + ApiEntity.CONTRACT, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': 're_api_key', //process.env.SENDFORSIGN_API_KEY,
				},
				responseType: 'json',
			})
			.then((payload) => {
				console.log('editor read', payload);
				setCurrContractKey(payload.data.contract.contractKey);
				contractKeyTmp = payload.data.contract.contractKey;
			});
		let url = '';
		if (contractType === ContractType.PDF.toString()) {
			const formData = new FormData();
			const pdfFile = (await getArrayBuffer('pdfFile')) as ArrayBuffer;
			const pdfFileBlob = new Blob([pdfFile], { type: 'application/pdf' });
			formData.append('pdf', pdfFileBlob);
			url = `${BASE_URL}${ApiEntity.UPLOAD_PDF}?contractKey=${contractKeyTmp}&clientKey=${clientKey}`;
			await axios
				.post(url, formData, {
					headers: {
						'x-sendforsign-key': 're_api_key', //process.env.SENDFORSIGN_API_KEY,
					},
					responseType: 'json',
				})
				.then((payload) => {
					console.log('editor read', payload);
				});
		}
		setEditorVisible(true);
		setLoadEditor(false);
		setContinueDisable(true);
	};
	const handleChange = (e: any) => {
		switch (e.target.id) {
			case 'ContractName':
				setContractName(e.target.value);
				if (e.target.value) {
					setContinueDisable(false);
				} else {
					setContinueDisable(true);
				}
				break;
		}
	};
	const handleChoose = async (e: any) => {
		let contractType = e.toString().split('_');
		if (contractType[1]) {
			let input = null;
			switch (contractType[1]) {
				case ContractType.DOCX.toString():
					input = document.createElement('input');
					input.type = 'file';
					input.accept =
						'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

					input.onchange = (e: any) => {
						// debugger;
						let file = e.target.files[0];
						let reader = new FileReader();
						reader.readAsArrayBuffer(file);
						reader.onload = (readerEvent) => {
							if (readerEvent) {
								docx2html(
									readerEvent?.target?.result as ArrayBuffer,
									(payload: any) => {
										debugger;
										setContractValue(payload);
										// quillRef?.current?.clipboard.dangerouslyPasteHTML(payload);
										setContractType(ContractType.DOCX.toString());
										setCreateDisable(false);
									}
								);
							}
						};
					};

					input.click();
					break;
				case ContractType.PDF.toString():
					input = document.createElement('input');
					input.type = 'file';
					input.accept = 'application/pdf';

					input.onchange = (e: any) => {
						debugger;
						let file = e.target.files[0];
						const fileSize = Math.round(file.size / 1048576);
						if (fileSize > 15) {
							alert('File too big, please select a file less than 15mb');
							return;
						}
						let reader = new FileReader();
						reader.readAsArrayBuffer(file);
						reader.onload = async (readerEvent) => {
							// debugger;
							setIsPdf(true);
							const arrayBuffer = readerEvent?.target?.result as ArrayBuffer;
							setPdfData(arrayBuffer);
							await setArrayBuffer('pdfFile', arrayBuffer);
							await setArrayBuffer('pdfFileOriginal', arrayBuffer);
							setContractType(ContractType.PDF.toString());
							setCreateDisable(false);
							setPdfFileLoad(pdfFileLoad + 1);
						};
					};

					input.click();
					break;
				case '8':
					setContractType(ContractType.EMPTY.toString());
					setCreateDisable(false);
					break;
				default:
					break;
			}
		} else {
			setTemplateKey(e);
		}
	};

	const handleAddShareLink = async () => {
		setAddBtnSpin(true);
		const body = {
			clientKey: clientKey,
			contractKey: contractKey,
		};
		await axios
			.post(BASE_URL + ApiEntity.CONTRACT_SHARE_LINK, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': 're_api_key', //process.env.SENDFORSIGN_API_KEY,
				},
				responseType: 'json',
			})
			.then((payload) => {
				console.log('handleAddShareLink read', payload);
				setRefreshShareLink(refreshShareLink + 1);
				setAddBtnSpin(false);
			});
	};
	return (
		<EditorContext.Provider
			value={{
				signModal,
				setSignModal,
				approveModal,
				setApproveModal,
				resultModal,
				setResultModal,
				notification,
				setNotification,
				contractKey: currContractKey as string,
				setContractKey: setCurrContractKey,
				clientKey: currClientKey,
				setClientKey: setCurrClientKey,
				userKey: currUserKey,
				setUserKey: setCurrUserKey,
				sign,
				setSign,
				contractSign,
				setContractSign,
				pdfFileLoad,
				setPdfFileLoad,
				refreshSign,
				setRefreshSign,
				refreshShareLink,
				setRefreshShareLink,
				contractValue,
				setContractValue,
			}}
		>
			<Space direction='vertical' size={16} style={{ display: 'flex' }}>
				{(!contractKeyRef.current || !contractKey) && (
					<Space direction='vertical' size={16} style={{ display: 'flex' }}>
						<Card bordered={true} loading={loadSegmented}>
							<Space direction='vertical' size={16} style={{ display: 'flex' }}>
								<Space direction='vertical' size={2}>
									<Title level={4} style={{ margin: '0' }}>
										Select a document type or upload your file
									</Title>
									<Text type='secondary'>
										This will speed up the drafting process.
									</Text>
								</Space>
								<Segmented options={options} onChange={handleChoose} />
								<Button
									type='primary'
									disabled={createDisable}
									onClick={handleCreate}
								>
									{btnName}
								</Button>
							</Space>
						</Card>
						{fieldBlockVisible && (
							<Card bordered={true}>
								<Space
									direction='vertical'
									size={16}
									style={{ display: 'flex' }}
								>
									<Space direction='vertical' size={2}>
										<Title level={4} style={{ margin: '0' }}>
											Fill additional information on the contract
										</Title>
									</Space>
									<Input
										id='ContractName'
										placeholder='Enter your contract name'
										value={contractName}
										onChange={handleChange}
										// readOnly={!continueDisable}
									/>
									<Button
										type='primary'
										disabled={continueDisable}
										onClick={handleContinue}
										loading={loadEditor}
									>
										{btnName}
									</Button>
								</Space>
							</Card>
						)}
					</Space>
				)}
				{editorVisible && (
					<>
						{!isPdf ? <HtmlBlock /> : <PdfBlock />}
						<Card id='part-3' bordered={true} style={{ maxWidth: '1200px' }}>
							<Space direction='vertical' size={16} style={{ display: 'flex' }}>
								<Space
									direction='vertical'
									size={2}
									style={{ maxWidth: '600px' }}
								>
									<Title level={4} style={{ margin: '0 0 0 0' }}>
										Share, sign, approve, and more
									</Title>
									<Text type='secondary'>
										See what's possible to do with your document.
									</Text>
								</Space>
								{shareLinks &&
									shareLinks.map((shareLine: ContractShareLink) => {
										return (
											<ShareLinkLine
												controlLink={contractKey ? contractKey : ''}
												shareLink={
													shareLine.shareLink ? shareLine.shareLink : ''
												}
												id={shareLine.id ? shareLine.id : 0}
												view={
													shareLine.view ? shareLine.view : ShareLinkView.SIGN
												}
											/>
										);
									})}

								<Space style={{ marginBottom: '24px' }}>
									<Tooltip title='Sign the document from your side.'>
										<Button
											id='signContract'
											type='default'
											icon={<FontAwesomeIcon icon={faSignature} />}
											onClick={() => {
												setSignModal(true);
											}}
											// disabled={signDisable}
											// loading={signSpin}
										>
											Sign
										</Button>
									</Tooltip>
									<Tooltip title='Approve the document from your side.'>
										<Button
											id='ApproveContract'
											type='default'
											icon={<FontAwesomeIcon icon={faStamp} />}
											onClick={() => {
												setApproveModal(true);
											}}
											// disabled={approveDisable}
											// loading={approveSpin}
											// disabled={disableSign}
										>
											Approve
										</Button>
									</Tooltip>
									<Tooltip title='Add another link to this contract.'>
										<Button
											icon={<FontAwesomeIcon icon={faSquarePlus} />}
											onClick={handleAddShareLink}
											loading={addBtnSpin}
										></Button>
									</Tooltip>
								</Space>
							</Space>
						</Card>
					</>
				)}
			</Space>
			<SignModal />
			<ApproveModal />
			<ResultModal />
			<Notification />
		</EditorContext.Provider>
	);
};
