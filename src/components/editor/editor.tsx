import React, { FC, useEffect, useRef, useState } from 'react';
// import './editor.css';
import 'quill/dist/quill.bubble.css';
import QuillNamespace, { Quill } from 'quill';
import QuillBetterTable from 'quill-better-table';
import { Document, Page, pdfjs } from 'react-pdf';
import { useDispatch, useSelector } from 'react-redux';
// import { useDebouncedCallback } from 'use-debounce';
// import dayjs from 'dayjs';
// import utc from 'dayjs/plugin/utc';
// import {
// 	contractSelector,
// 	contractSignSelector,
// 	contractValueSelector,
// 	createContractSelector,
// 	setContractSign,
// 	setContractValue,
// 	setNotification,
// 	setSign,
// 	signSelector,
// } from 'slices/app-slice';
import { Space, Card, Typography, Button, Spin, Tag } from 'antd';
import { EditorProps } from './editor.types';
import axios from 'axios';
import { BASE_URL } from '../../config/config';
import { Action, ApiEntity, ContractType } from '../../config/enum';
import Segmented, { SegmentedLabeledOption } from 'antd/es/segmented';
import useSaveParams from '../../hooks/use-save-params';
import { useResizeDetector } from 'react-resize-detector';
import { docx2html } from '../../utils';
// import { docx2html } from '../../utils/utils';

// import { ContractValue, TimelineItems } from 'config/types';
// import {
// 	useCheckContractValueMutation,
// 	useSaveContractValueMutation,
// } from 'slices/contract-api-slice';
// import { useGetContractSignsByControlLinkQuery } from 'slices/contract-sign-api-slice';
// import { useSendEmailsSignByControlLinkMutation } from 'slices/contract-email-api-slice';
// import { useHistory } from 'react-router-dom';
// import { useAuth } from '@clerk/clerk-react';

// type Props = {
// 	stage: TimelineItems;
// };
QuillNamespace.register(
	{
		'modules/better-table': QuillBetterTable,
	},
	true
);
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
	// // dayjs.extend(utc);
	// const dispatch = useDispatch();
	// const history = useHistory();
	// const contract = useSelector(contractSelector);
	// const contractValue = useSelector(contractValueSelector);
	// const sign = useSelector(signSelector);
	// const contractSign = useSelector(contractSignSelector);
	// const createContract = useSelector(createContractSelector);
	// const templateLoading = useSelector(loadingSelector);
	// const templateText = useSelector(templateTextSelector);
	// const textState = useSelector(textSelector);
	// const [spinLoad, setSpinLoad] = useState(true);
	const [pdfData, setPdfData] = useState<ArrayBuffer>();
	const [scale, setScale] = useState(1);
	const [numPages, setNumPages] = useState(1);
	const { setParam, getParam } = useSaveParams();
	const [value, setValue] = useState('');
	const [isPdf, setIsPdf] = useState(false);
	const [options, setOptions] = useState<SegmentedLabeledOption[]>([]);
	const [visibleEditor, setVisibleEditor] = useState(
		contractKey ? true : false
	);
	const [type, setType] = useState('');
	const [templateId, setTemplateId] = useState('');
	const [createDisable, setCreateDisable] = useState(true);
	const [btnName, setBtnName] = useState('Create contract');
	const { Title, Text } = Typography;
	const quillRef = useRef<Quill>();
	const templateRef = useRef(0);
	const contractKeyRef = useRef(contractKey || getParam('contractKey'));
	const { width, ref } = useResizeDetector();

	// const { isLoaded, userId, sessionId, getToken } = useAuth();

	// const [saveValue] = useSaveContractValueMutation();
	// const [checkContractValue] = useCheckContractValueMutation();
	// const [sendEmail] = useSendEmailsSignByControlLinkMutation();

	// const { data: contractSignsData } = useGetContractSignsByControlLinkQuery(
	// 	{ controlLink: contract.controlLink, userId: userId },
	// 	{ skip: contract.controlLink ? false : true }
	// );

	// console.log('EditorBlock');
	// const createEditor = useCallback(() => {}, []);
	useEffect(() => {
		quillRef.current = new QuillNamespace('#editor-container', {
			modules: {
				toolbar: {
					container: [
						['bold', 'italic', 'underline', 'strike', 'blockquote'],
						[{ color: [] }, { background: [] }],
						[
							{ list: 'ordered' },
							{ list: 'bullet' },
							{ indent: '-1' },
							{ indent: '+1' },
						],
						[{ align: [] }],
						['link', 'image', 'table'],
						['blockquote', 'code-block'],
						[{ direction: 'rtl' }],
					],
					handlers: {
						table: addTable,
					},
				},
				table: false, // disable table module
				'better-table': {
					operationMenu: {
						items: {
							unmergeCells: {
								text: 'Unmerge',
							},
						},
					},
				},
				keyboard: {
					bindings: QuillBetterTable.keyboardBindings,
				},
				history: {
					delay: 5000,
					maxStack: 5000,
					userOnly: true,
				},
			},
			scrollingContainer: 'body',
			theme: 'bubble',
		});

		quillRef.current
			.getModule('toolbar')
			.container.addEventListener(
				'mousedown',
				(e: { preventDefault: () => void; stopPropagation: () => void }) => {
					e.preventDefault();
					e.stopPropagation();
				}
			);

		quillRef.current.on(
			'text-change',
			function (delta: any, oldDelta: any, source: any) {
				if (source === 'user') {
					// handleChange(quillRef.current.root.innerHTML);
					setValue(
						quillRef.current && quillRef.current.root.innerHTML
							? quillRef.current.root.innerHTML
							: ''
					);
				}
			}
		);
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
						setValue(payload.data.contract.value);
						quillRef?.current?.clipboard.dangerouslyPasteHTML(
							payload.data.contract.value
						);
					});
			};
			getContract();
		}
		body = {
			data: {
				action: Action.LIST,
				clientKey: clientKey,
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
		debugger;
		if (contractKey || getParam('contractKey')) {
			contractKeyRef.current = contractKey as string; //|| getParam('contractKey');
		}
	}, [contractKey, getParam('contractKey')]);

	const addTable = () => {
		debugger;
		(quillRef.current as QuillNamespace)
			.getModule('better-table')
			.insertTable(3, 3);
	};
	// const handleChange = useDebouncedCallback(
	// 	async (content: string) => {
	// 		let changed = false;
	// 		let contactValueTmp: ContractValue = {};
	// 		await checkContractValue({
	// 			controlLink: contract.controlLink,
	// 			changeTime: contractValue.changeTime,
	// 		})
	// 			.unwrap()
	// 			.then((payload) => {
	// 				changed = payload && payload.changed ? payload.changed : false;
	// 				if (payload && payload.contractValue) {
	// 					contactValueTmp.changeTime = payload.changeTime;
	// 					contactValueTmp.contractValue = payload.contractValue;
	// 				}
	// 			});
	// 		if (!changed) {
	// 			await saveValue({
	// 				controlLink: contract.controlLink,
	// 				contractValue: content,
	// 			})
	// 				.unwrap()
	// 				.then((payload) => {
	// 					contactValueTmp.changeTime =
	// 						payload && payload.changeTime
	// 							? payload.changeTime
	// 							: (new Date() as Date);
	// 					contactValueTmp.contractValue =
	// 						payload && payload.contractValue ? payload.contractValue : '';
	// 				});
	// 			dispatch(
	// 				setContractValue({
	// 					contractValue: contactValueTmp.contractValue,
	// 					changeTime: contactValueTmp.changeTime,
	// 				})
	// 			);
	// 		} else {
	// 			quillRef.current.enable(false);
	// 			dispatch(
	// 				setContractValue({
	// 					contractValue: contactValueTmp.contractValue,
	// 					changeTime: contactValueTmp.changeTime,
	// 				})
	// 			);
	// 			dispatch(
	// 				setNotification({
	// 					text: 'Contract updated. You must reload your page',
	// 				})
	// 			);
	// 			quillRef.current.clipboard.dangerouslyPasteHTML(
	// 				contactValueTmp.contractValue
	// 			);
	// 		}
	// 	},
	// 	5000,
	// 	// The maximum time func is allowed to be delayed before it's invoked:
	// 	{ maxWait: 5000 }
	// );
	const handleCreate = async () => {
		// dispatch(setAppLoading(true));
		let body = {
			data: {
				action: Action.CREATE,
				clientKey: clientKey,
				contract: {},
			},
		};
		// await axios
		// 	.post(BASE_URL + ApiEntity.CONTRACT, body, {
		// 		headers: {
		// 			Accept: 'application/vnd.api+json',
		// 			'Content-Type': 'application/vnd.api+json',
		// 			'x-sendforsign-key': 're_api_key', //process.env.SENDFORSIGN_API_KEY,
		// 		},
		// 		responseType: 'json',
		// 	})
		// 	.then((payload) => {
		// 		console.log('editor read', payload);
		// 		setValue(payload.data.contract.value);
		// 		quillRef?.current?.clipboard.dangerouslyPasteHTML(
		// 			payload.data.contract.value
		// 		);
		// 	});
		setVisibleEditor(true);
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
										setValue(payload);
										quillRef?.current?.clipboard.dangerouslyPasteHTML(payload);
										setType(ContractType.DOCX.toString());
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
						// debugger;
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
							setType(ContractType.PDF.toString());
							setCreateDisable(false);
						};
					};

					input.click();
					break;
				case '8':
					setType(ContractType.EMPTY.toString());
					setCreateDisable(false);
					break;
				default:
					break;
			}
		} else {
		}
		// if (
		// 	e.toString() === ContractTypes.DOCX.toString() ||
		// 	e.toString() === ContractTypes.PDF.toString()
		// ) {
		// 	setBtnName('Upload file');
		// } else {
		// 	setBtnName('Create contract');
		// }
		templateRef.current = e;
	};
	return (
		<Space direction='vertical' size={16} style={{ display: 'flex' }}>
			{!contractKeyRef.current && (
				<Card bordered={true}>
					<Space direction='vertical' size={16} style={{ display: 'flex' }}>
						<Space direction='vertical' size={2}>
							<Title level={4} style={{ margin: '0' }}>
								Select a document type or upload your file
							</Title>
							<Text type='secondary'>
								This will speed up the drafting process.
							</Text>
						</Space>
						<Segmented
							// disabled={stage.disable}
							options={options}
							onChange={handleChoose}
						/>
						<Button
							type='primary'
							disabled={createDisable}
							// icon={<FontAwesomeIcon icon={faFileContract} />}
							onClick={handleCreate}
							// loading={
							// 	btnName.includes('Create document')
							// 		? false
							// 		: templateLoading
							// 		? true
							// 		: false
							// }
						>
							{btnName}
						</Button>
					</Space>
				</Card>
			)}
			<Card
				style={{ display: !visibleEditor ? 'none' : 'flex' }}
				bordered={true}
				id='part-2'
			>
				<Space direction='vertical' size={16} style={{ display: 'flex' }}>
					<Space direction='vertical' size={2}>
						<Title level={4} style={{ margin: '0 0 0 0' }}>
							Review your document, highlight text to see options
						</Title>
						<Text type='secondary'>
							The green text is where you may want to replace it with your own
							text.
						</Text>
					</Space>
					{isPdf ? (
						<div ref={ref}>
							<Document
								loading={<Spin spinning={true} />}
								file={pdfData}
								onLoadSuccess={({ numPages }) => {
									setNumPages(numPages);
								}}
								onSourceError={() => {
									console.log('PdfViewer onSourceError');
								}}
								onLoadError={() => {
									console.log('PdfViewer onLoadError');
								}}
								onError={() => {
									console.log('PdfViewer error');
								}}
							>
								{new Array(numPages).fill(0).map((_, i) => {
									return (
										<Page
											key={i}
											width={width}
											// height={1.4 * width}
											pageNumber={i + 1}
											scale={scale}
										/>
									);
								})}
							</Document>
						</div>
					) : (
						<div id='scroll-container'>
							<div id='editor-container' />
						</div>
					)}
				</Space>
			</Card>
		</Space>
	);
};
