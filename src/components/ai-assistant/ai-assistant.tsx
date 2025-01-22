import React, { FC, useEffect, useRef, useState } from 'react';
import {
	Typography,
	Tag,
	Card,
	Space,
	Row,
	Col,
	Button,
	Spin,
	Input,
	Select,
	Tooltip,
} from 'antd';
import { v4 as uuid } from 'uuid';
import './ai-assistant.css'; // Import the CSS file
import { AiAssistantContext } from './ai-assistant-context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faArrowUp,
	faBook,
	faBookBookmark,
	faBookmark,
	faCommentDots,
	faContactBook,
	faFile,
	faFileArrowUp,
	faFileCirclePlus,
	faFileCircleQuestion,
	faFileContract,
	faFileInvoice,
	faGlobe,
	faLanguage,
	faLegal,
	faLightbulb,
	faPager,
	faPaperclip,
	faPlus,
	faQuestion,
	faQuestionCircle,
	faRectangleList,
	faSpellCheck,
	faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { Notification } from './notification/notification';
import { ContextModal } from './context-modal';
import { ContextList } from './context-list';
import { useChat } from 'ai/react';
import { BASE_URL } from '../../config/config';
import { Action, ApiEntity } from '../../config/enum';
import { Context, Contract } from '../../config/types';
import axios from 'axios';
import useSaveArrayBuffer from '../../hooks/use-save-array-buffer';
import Upload, { RcFile, UploadFile, UploadProps } from 'antd/es/upload';
import ReactMarkdown from 'react-markdown';
import { ModalView } from './modal-view';
import { AiAssistantLocalization } from '../../config/localization';

const { TextArea } = Input;

export interface AiAssistantProps {
	apiKey?: string;
	clientKey?: string;
	token?: string;
	userKey?: string;
}
type SelectData = {
	value: string;
	label: string;
};
type OptionsData = {
	label?: string;
	title?: string;
	options?: SelectData[];
};

type Language = 'rus' | 'eng' | 'esp' | 'deu' | 'fra';

export const AiAssistant: FC<AiAssistantProps> = ({
	apiKey = '',
	clientKey = '',
	token = '',
	userKey = '',
}) => {
	const [currClientKey, setCurrClientKey] = useState(clientKey);
	const [isThinking, setIsThinking] = useState(false);
	const [currUserKey, setCurrUserKey] = useState(userKey);
	const [currApiKey, setCurrApiKey] = useState(apiKey);
	const [currToken, setCurrToken] = useState(token);
	const [notification, setNotification] = useState({});
	const [contextModal, setContextModal] = useState<{
		open: boolean;
		context?: Context;
	}>({ open: false, context: {} });
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [refreshContext, setRefreshContext] = useState(0);
	const [spinLoad, setSpinLoad] = useState(false);
	const [spinContextLoad, setSpinContextLoad] = useState(false);
	const [contractModal, setContractModal] = useState(false);
	const [optionsData, setOptionsData] = useState<OptionsData[]>([]);
	const [spinFileLoad, setSpinFileLoad] = useState(false);
	const [contexts, setContexts] = useState<Context[]>([]);
	const [selectedContexts, setSelectedContexts] = useState<string[]>([]);
	const [selectedContracts, setSelectedContracts] = useState<string[]>([]);
	const [selectedValues, setSelectedValues] = useState<string[]>([]);
	const [contractKey, setContractKey] = useState('');
	const [tooltipFileVisible, setTooltipFileVisible] = useState(false);
	const [tooltipContextVisible, setTooltipContextVisible] = useState(false);
	const fileListRef = useRef<UploadFile[]>([]);
	const contextFromFileRef = useRef<{ filename: string; text: string }[]>([]);
	const buttonRef = useRef<React.ReactNode[]>([]);
	const [button, setButton] = useState<React.ReactNode[]>([]);
	const { setArrayBuffer, getArrayBuffer } = useSaveArrayBuffer();
	const headers = useRef<any>({});
	const chatKey = useRef<string>(uuid());
	const body = useRef<any>({ chatKey: chatKey.current });
	const [selectedLanguage, setSelectedLanguage] = useState('eng');

	const { messages, input, handleInputChange, handleSubmit, setMessages } =
		useChat({
			api: `${BASE_URL}${ApiEntity.CHAT}`,
			body: body.current,
			headers: headers.current,
			onError: (e) => {
				console.log(e);
				setIsThinking(false);
			},
			onResponse: (response) => {
				console.log('response', response);
				setIsThinking(false); // Stop thinking when request completes
			},
		});
	const { Title, Text } = Typography;

	const chatEndRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		// Check if the last message is being added
		if (messages.length > 0) {
			chatEndRef.current?.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
			});
		}
	}, [messages]);
	useEffect(() => {
		setCurrToken(token || '');
		if (token) {
			headers.current = {
				Authorization: `Bearer ${currToken}`,
				Accept: 'application/vnd.api+json',
				'Content-Type': 'application/vnd.api+json',
			};
		}
	}, [token]);
	useEffect(() => {
		setCurrApiKey(apiKey || '');
	}, [apiKey]);
	useEffect(() => {
		setCurrClientKey(clientKey || '');
		if (clientKey) {
			body.current = { ...body.current, clientKey: clientKey };
		}
	}, [clientKey]);
	useEffect(() => {
		setCurrUserKey(userKey || '');
		if (userKey) {
			body.current = { ...body.current, userKey: userKey };
		}
	}, [userKey]);
	useEffect(() => {
		if (!token && apiKey) {
			headers.current = {
				'x-sendforsign-key': apiKey,
				Accept: 'application/vnd.api+json',
				'Content-Type': 'application/vnd.api+json',
			};
		}
	}, [apiKey, token]);
	useEffect(() => {
		let isMounted = true;
		let body = {
			data: {
				action: Action.LIST,
				clientKey: !currToken ? currClientKey : undefined,
				userKey: currUserKey,
			},
		};
		let optionsDataContractsTmp: OptionsData = {};
		let optionsDataContextsTmp: OptionsData = {};
		let optionsDataTmp: OptionsData[] = [];
		const getContracts = async () => {
			await axios
				.post(BASE_URL + ApiEntity.CONTRACT, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': !currToken && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
						Authorization: currToken ? `Bearer ${currToken}` : undefined,
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					if (payload.data.contracts && payload.data.contracts.length > 0) {
						let selectDataTmp: SelectData[] = [];
						payload.data.contracts.forEach((contract: any) => {
							selectDataTmp.push({
								label: contract.name as string,
								value: `contract_${contract.contractKey as string}`,
							});
						});
						optionsDataContractsTmp = {
							label: 'Contracts',
							title: 'Contracts',
							options: selectDataTmp,
						};
					}
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
		};
		const getContexts = async () => {
			await axios
				.post(BASE_URL + ApiEntity.CONTEXT, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key':
							!currToken && currApiKey ? currApiKey : undefined,
						Authorization: currToken ? `Bearer ${currToken}` : undefined,
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					setContexts(payload.data.contexts);
					let selectDataTmp: SelectData[] = [];
					let contextsTmp: Context[] = payload.data.contexts;
					contextsTmp.forEach((context) => {
						selectDataTmp.push({
							label: context.name as string,
							value: `context_${context.contextKey as string}`,
						});
					});
					optionsDataContextsTmp = {
						label: 'Contexts',
						title: 'Contexts',
						options: selectDataTmp,
					};
				});
		};
		const getData = async () => {
			await getContexts().then(() => {
				if (
					optionsDataContextsTmp &&
					optionsDataContextsTmp.options &&
					optionsDataContextsTmp.options.length > 0
				) {
					optionsDataTmp.push(optionsDataContextsTmp);
				}
			});
			await getContracts().then(() => {
				if (
					optionsDataContractsTmp &&
					optionsDataContractsTmp.options &&
					optionsDataContractsTmp.options.length > 0
				) {
					optionsDataTmp.push(optionsDataContractsTmp);
				}
			});
		};
		if (currApiKey || currToken) {
			setSpinLoad(false);
			setSpinContextLoad(true);
			getData().then(() => {
				// debugger;
				setOptionsData(optionsDataTmp);
			});
		} else {
			setSpinLoad(true);
		}
		return () => {
			isMounted = false;
		};
	}, [refreshContext]);
	const props: UploadProps = {
		name: 'file',
		multiple: true,
		accept:
			'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		listType: 'text',
		showUploadList: false,

		onChange: async (info) => {
			if (!info.file.status) {
				const findIndex = fileListRef.current.findIndex(
					(fileList) => fileList.uid === info.file.uid
				);
				if (findIndex === fileListRef.current.length - 1) {
					await sendFiles();
				}
			}
			// setFileList(fileListRef.current); // Ensure fileList state is updated
		},
		beforeUpload: async (file) => {
			const newFileList = fileListRef.current.slice();
			fileListRef.current = [...newFileList, file];
			buttonRef.current = fileListRef.current.map((file) => {
				return (
					<Button key={file.uid} size='small'>
						<span>{file.name}</span>
						<Button
							type='text'
							size='small'
							onClick={() => handleRemoveFile(file)}
							icon={<FontAwesomeIcon icon={faTrash} size='sm' />}
						></Button>
					</Button>
				);
			});
			setButton(buttonRef.current);
			await saveArrayBuffer(file);

			return false;
		},
		progress: {
			strokeColor: {
				'0%': '#108ee9',
				'100%': '#87d068',
			},
			strokeWidth: 3,
			format: (percent) => percent && `${parseFloat(percent.toFixed(2))}%`,
		},
	};

	const handleRemoveFile = (file: UploadFile) => {
		const index = fileListRef.current.indexOf(file);
		const newFileList = fileListRef.current.slice();
		newFileList.splice(index, 1);
		fileListRef.current = newFileList;
		buttonRef.current = fileListRef.current.map((file) => {
			return (
				<Button key={file.uid} size='small'>
					<span>{file.name}</span>
					<Button
						type='text'
						size='small'
						onClick={() => handleRemoveFile(file)}
						icon={<FontAwesomeIcon icon={faTrash} size='sm' />}
					></Button>
				</Button>
			);
		});
		setButton(buttonRef.current);
		// setFileList(newFileList);
		const newTextFromFiles = contextFromFileRef.current.slice();
		newTextFromFiles.splice(index, 1);
		contextFromFileRef.current = newTextFromFiles;
		body.current = {
			...body.current,
			texts: contextFromFileRef.current,
		};
	};

	const saveArrayBuffer = (file: RcFile): Promise<boolean> =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsArrayBuffer(file as Blob);
			reader.onload = async (readerEvent) => {
				const arrayBuffer = readerEvent?.target?.result as ArrayBuffer;
				await setArrayBuffer(`${file.uid}`, arrayBuffer);
				resolve(true);
			};
			reader.onerror = (error) => reject(error);
		});
	const sendFiles = async () => {
		setSpinFileLoad(true);

		const formData: FormData = new FormData();
		// formData.append('returnText', 'true');
		formData.append('action', Action.READ);
		// debugger;
		for (let i = 0; i < fileListRef.current.length; i++) {
			const pdfFile: ArrayBuffer = (await getArrayBuffer(
				fileListRef.current[i].uid
			)) as ArrayBuffer;
			const pdfFileBlob = new Blob([pdfFile as BlobPart], {
				type: fileListRef.current[i].type,
			});
			formData.append(
				'files[]',
				pdfFileBlob,
				encodeURIComponent(fileListRef.current[i].name)
			);
		}
		let url = `${BASE_URL}${ApiEntity.CONTEXT_FILES}`;
		url = !token && apiKey ? `${url}?clientKey=${clientKey}` : url;

		await axios
			.post(url, formData, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
					Authorization: token ? `Bearer ${token}` : undefined,
					'x-sendforsign-component': true,
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				setSpinFileLoad(false);
				// console.log('payload CONTEXT_FILES', payload);
				if (payload.data.fileContents && payload.data.fileContents.length > 0) {
					contextFromFileRef.current = payload.data.fileContents.map(
						(fileContent: string, index: number) => {
							const filename = fileListRef.current[index]?.name;
							return { filename: `File: ${filename}`, text: fileContent };
						}
					);
					body.current = {
						...body.current,
						texts: payload.data.fileContents.map(
							(fileContent: string, index: number) => {
								const filename = fileListRef.current[index]?.name;
								return { filename: `File: ${filename}`, text: fileContent };
							}
						),
					};
				}
				// console.log('payload body.current', body.current);
			})
			.catch((error) => {
				setSpinFileLoad(false);
				contextFromFileRef.current = [];
				setNotification({
					text:
						error.response && error.response.data && error.response.data.message
							? error.response.data.message
							: error.message,
				});
			});
	};

	const handleSelectContext = (e: any) => {
		let selectedValuesTmp = [...selectedValues];
		selectedValuesTmp.push(e);
		setSelectedValues(selectedValuesTmp);
		const arr = (e as string).split('_');
		switch (arr[0]) {
			case 'context':
				let selectedContextsTmp = [...selectedContexts];
				selectedContextsTmp.push(arr[1]);
				setSelectedContexts(selectedContextsTmp);
				body.current = { ...body.current, contexts: selectedContextsTmp };
				break;

			case 'contract':
				let selectedContractsTmp = [...selectedContracts];
				selectedContractsTmp.push(arr[1]);
				setSelectedContracts(selectedContractsTmp);
				body.current = { ...body.current, contracts: selectedContractsTmp };
				// console.log('contract +', e, arr, selectedContractsTmp, body.current);
				break;
		}
	};
	const handleDeselectContext = (e: any) => {
		let selectedValuesTmp: string[] = [];
		for (let i = 0; i < selectedValues.length; i++) {
			if (!selectedValues[i].includes(e)) {
				selectedValuesTmp.push(selectedValues[i]);
			}
		}
		setSelectedValues(selectedValuesTmp);
		const arr = (e as string).split('_');
		switch (arr[0]) {
			case 'context':
				let selectedContextsTmp: string[] = [];
				for (let i = 0; i < selectedContexts.length; i++) {
					if (!selectedContexts[i].includes(arr[1])) {
						selectedContextsTmp.push(selectedContexts[i]);
					}
				}
				setSelectedContexts(selectedContextsTmp);
				body.current = { ...body.current, contexts: selectedContextsTmp };
				break;

			case 'contract':
				let selectedContractsTmp: string[] = [];
				for (let i = 0; i < selectedContracts.length; i++) {
					if (!selectedContracts[i].includes(arr[1])) {
						selectedContractsTmp.push(selectedContracts[i]);
					}
				}
				setSelectedContracts(selectedContractsTmp);
				body.current = { ...body.current, contracts: selectedContractsTmp };
				break;
		}
	};

	const handleContextClick = (
		message: string,
		showFileTooltip: boolean,
		showContextTooltip: boolean
	) => {
		setTooltipFileVisible(showFileTooltip);
		setTooltipContextVisible(showContextTooltip);
		handleInputChange({
			target: { value: message },
		} as React.ChangeEvent<HTMLTextAreaElement>);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			setTooltipFileVisible(false);
			setTooltipContextVisible(false);
			setIsSubmitted(true);
			setIsThinking(true);
			event.preventDefault(); // Prevents adding a new line
			handleSubmit(); // Calls the submit function
		}
	};

	const handleCreateDocument = () => {
		// Set the input value to the desired phrase
		handleInputChange({
			target: {
				value: AiAssistantLocalization.uiText[contextMessageKey].basedOnText,
			},
		} as React.ChangeEvent<HTMLTextAreaElement>);
	};

	// Add a useEffect to handle the submission after the input is set
	useEffect(() => {
		if (
			input === AiAssistantLocalization.uiText[contextMessageKey].basedOnText
		) {
			setIsThinking(true);
			setIsSubmitted(true);
			handleSubmit();
		}
	}, [input]);

	const handleOpenDocument = (key: string) => {
		setContractKey(key);
		setContractModal(true);
	};

	const handleOpenContractsList = () => {
		setContractModal(true);
		setContractKey('contracts');
	};

	const handleOpenTemplatesList = () => {
		setContractModal(true);
		setContractKey('templates');
	};

	const handleLangChange = (value: Language) => {
		setSelectedLanguage(value);
	};

	const replaceTextWithElement = (text: string) => {
		const parts = text.split(
			/{ContractKey: ([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})}/g
		);
		return parts.map((part, index) => {
			const match = part.match(
				/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/
			);
			return (
				<>
					{match ? (
						<Button
							target='_blank'
							rel='noopener noreferrer'
							type='default'
							key={index}
							onClick={() => handleOpenDocument(match[1])}
						>
							{AiAssistantLocalization.uiText[contextMessageKey].openDoc}
						</Button>
					) : (
						<ReactMarkdown
							key={index}
							components={{
								a: ({ node, ...props }) => (
									<a {...props} target='_blank' rel='noopener noreferrer'>
										{props.children}
									</a>
								),
							}}
						>
							{part}
						</ReactMarkdown>
					)}
				</>
			);
		});
	};

	const handleNewChat = () => {
		chatKey.current = uuid();
		setSelectedValues([]);
		setSelectedContexts([]);
		setSelectedContracts([]);
		contextFromFileRef.current = [];
		setMessages([]);
		body.current = {
			...body.current,
			chatKey: chatKey.current,
			contracts: [],
			contexts: [],
			texts: [],
		};
		setIsSubmitted(false);
	};

	const contextMessageKey =
		selectedLanguage as keyof typeof AiAssistantLocalization.contextMessages;

	const languageOptions = [
		{ value: 'eng', label: 'English' },
		{ value: 'esp', label: 'Español' },
		{ value: 'deu', label: 'Deutsch' },
		{ value: 'fra', label: 'Français' },
		{ value: 'rus', label: 'Русский' },
	];

	useEffect(() => {
		const selectedLanguageLabel = languageOptions.find(option => option.value === selectedLanguage)?.label;
		body.current = { ...body.current, language: selectedLanguageLabel }; // Update with the label
		console.log('body.current', body.current);
	}, [selectedLanguage]);

	return (
		<AiAssistantContext.Provider
			value={{
				clientKey: currClientKey,
				setClientKey: setCurrClientKey,
				userKey: currUserKey,
				setUserKey: setCurrUserKey,
				token: currToken,
				setToken: setCurrToken,
				apiKey: currApiKey,
				setApiKey: setCurrApiKey,
				notification,
				setNotification,
				contextModal,
				setContextModal,
				contexts,
				setContexts,
				refreshContext,
				setRefreshContext,
				spinContextLoad,
				setSpinContextLoad,
				contractModal,
				setContractModal,
				contractKey,
				setContractKey,
			}}
		>
			{spinLoad ? (
				<Spin spinning={spinLoad} fullscreen />
			) : (
				<Space direction='vertical' size={16} style={{ display: 'flex' }}>
					<Card style={{ maxHeight: '95vh', overflow: 'auto' }}>
						<Row style={{ margin: '0 0 16px 0' }}>
							<Col flex={'auto'}>
								<Space
									style={{ width: '100%', justifyContent: 'space-between' }}
									wrap
									size={16}
								>
									<Space direction='vertical' size={2}>
										<Title
											level={4}
											style={{
												margin: '0',
												display: 'flex',
												textAlign: 'center',
											}}
										>
											{AiAssistantLocalization.uiText[contextMessageKey].title}
										</Title>
										<Text type='secondary'>
											{
												AiAssistantLocalization.uiText[contextMessageKey]
													.subtitle
											}
										</Text>
									</Space>
									<Tooltip
										title={
											AiAssistantLocalization.uiText[contextMessageKey].language
										}
										placement='left'
									>
										<Select
											defaultValue='eng'
											id='Lang'
											onChange={handleLangChange}
											options={[
												{ value: 'eng', label: 'English' },
												{ value: 'esp', label: 'Español' },
												{ value: 'deu', label: 'Deutsch' },
												{ value: 'fra', label: 'Français' },
												{ value: 'rus', label: 'Русский' },
											]}
										/>
									</Tooltip>
								</Space>
							</Col>
						</Row>
						<Row gutter={16}>
							<Col flex={'auto'}></Col>
							<Col
								flex='768px'
								style={{ maxHeight: '60vh', overflow: 'auto' }}
								id='chat'
							>
								<ul style={{ width: '100%', paddingLeft: 0, paddingRight: 0 }}>
									{messages.map((m, index) => {
										return (
											<div style={{ width: '100%' }}>
												{m.role === 'user' ? (
													<li
														key={m.id}
														style={{
															display: 'flex',
															flexDirection: 'row-reverse',
															margin: '8px 0',
														}}
													>
														<div
															style={{
																display: 'flex',
																padding: '8px',
																borderRadius: '0.75rem',
																background: '#f5f5f5',
															}}
														>
															<ReactMarkdown className='text-primary'>
																{m.content}
															</ReactMarkdown>
														</div>
													</li>
												) : (
													<li
														key={m.id}
														style={{
															display: 'flex',
															flexDirection: 'row',
															margin: '8px 0',
														}}
													>
														<Space
															align='start'
															style={{
																display: 'flex',
																padding: '8px',
																borderRadius: '0.75rem',
																width: '75%',
															}}
														>
															<svg
																width='20'
																height='20'
																viewBox='0 0 20 20'
																fill='none'
																xmlns='http://www.w3.org/2000/svg'
															>
																<g clip-path='url(#clip0_4254_39676)'>
																	<path
																		d='M20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10Z'
																		fill='black'
																	/>
																	<path
																		d='M7.65914 11.859L10.4748 4.21477C10.5103 4.11845 10.6354 4.09438 10.7041 4.17065L15.7851 9.81373C15.8538 9.89 15.8168 10.012 15.7173 10.0372L7.82064 12.0383C7.71428 12.0653 7.62123 11.962 7.65914 11.859Z'
																		fill='white'
																	/>
																	<path
																		fill-rule='evenodd'
																		clip-rule='evenodd'
																		d='M10.6873 4.18589C10.63 4.12233 10.5257 4.14238 10.4962 4.22266L7.68053 11.8669C7.68053 11.8669 7.68053 11.8669 7.68053 11.8669C7.64894 11.9527 7.72648 12.0388 7.81512 12.0163L15.7118 10.0152C15.7947 9.99416 15.8255 9.89253 15.7683 9.82896L15.7852 9.81376L15.7683 9.82896L10.6873 4.18589ZM10.721 4.15547L10.7042 4.17064L10.721 4.15547L15.8021 9.79855C15.8822 9.88753 15.8391 10.0298 15.723 10.0592L7.82628 12.0604C7.7022 12.0918 7.59364 11.9713 7.63787 11.8512L7.63787 11.8512L10.4535 4.20694L10.4535 4.20694C10.4949 4.09458 10.6409 4.06648 10.721 4.15547Z'
																		fill='black'
																	/>
																	<path
																		d='M12.4339 7.72221C13.8953 9.34526 15.443 10.3342 15.8907 9.93105C16.3384 9.5279 15.5167 7.88534 14.0553 6.26229C12.5939 4.63923 11.0462 3.6503 10.5985 4.05345C10.1507 4.45659 10.9725 6.09915 12.4339 7.72221Z'
																		fill='#EEEEEE'
																	/>
																</g>
																<defs>
																	<clipPath id='clip0_4254_39676'>
																		<rect width='20' height='20' fill='white' />
																	</clipPath>
																</defs>
															</svg>
															<div style={{ marginTop: '-1em' }}>
																<Text className='text-primary'>
																	{replaceTextWithElement(m.content)}
																</Text>
																{!m.content.includes('{ContractKey') && (
																	<Tooltip
																		title={
																			AiAssistantLocalization.uiText[
																				contextMessageKey
																			].basedOnText
																		}
																	>
																		<Button
																			type='text'
																			size='small'
																			onClick={() => handleCreateDocument()}
																			icon={
																				<FontAwesomeIcon
																					icon={faFileCirclePlus}
																					size='sm'
																					color='#5d5d5d'
																				/>
																			}
																		></Button>
																	</Tooltip>
																)}
															</div>
														</Space>
													</li>
												)}
											</div>
										);
									})}
									{isThinking && (
										<li
											style={{
												display: 'flex',
												flexDirection: 'row',
												margin: '8px 0',
											}}
										>
											<Space
												align='start'
												style={{
													display: 'flex',
													flexDirection: 'row',
												}}
											>
												<Space
													align='start'
													style={{
														display: 'flex',
														padding: '8px',
														borderRadius: '0.75rem',
														width: '75%',
													}}
												>
													<svg
														width='20'
														height='20'
														viewBox='0 0 20 20'
														fill='none'
														xmlns='http://www.w3.org/2000/svg'
													>
														<g clip-path='url(#clip0_4254_39676)'>
															<path
																d='M20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10Z'
																fill='black'
															/>
															<path
																d='M7.65914 11.859L10.4748 4.21477C10.5103 4.11845 10.6354 4.09438 10.7041 4.17065L15.7851 9.81373C15.8538 9.89 15.8168 10.012 15.7173 10.0372L7.82064 12.0383C7.71428 12.0653 7.62123 11.962 7.65914 11.859Z'
																fill='white'
															/>
															<path
																fill-rule='evenodd'
																clip-rule='evenodd'
																d='M10.6873 4.18589C10.63 4.12233 10.5257 4.14238 10.4962 4.22266L7.68053 11.8669C7.68053 11.8669 7.68053 11.8669 7.68053 11.8669C7.64894 11.9527 7.72648 12.0388 7.81512 12.0163L15.7118 10.0152C15.7947 9.99416 15.8255 9.89253 15.7683 9.82896L15.7852 9.81376L15.7683 9.82896L10.6873 4.18589ZM10.721 4.15547L10.7042 4.17064L10.721 4.15547L15.8021 9.79855C15.8822 9.88753 15.8391 10.0298 15.723 10.0592L7.82628 12.0604C7.7022 12.0918 7.59364 11.9713 7.63787 11.8512L7.63787 11.8512L10.4535 4.20694L10.4535 4.20694C10.4949 4.09458 10.6409 4.06648 10.721 4.15547Z'
																fill='black'
															/>
															<path
																d='M12.4339 7.72221C13.8953 9.34526 15.443 10.3342 15.8907 9.93105C16.3384 9.5279 15.5167 7.88534 14.0553 6.26229C12.5939 4.63923 11.0462 3.6503 10.5985 4.05345C10.1507 4.45659 10.9725 6.09915 12.4339 7.72221Z'
																fill='#EEEEEE'
															/>
														</g>
														<defs>
															<clipPath id='clip0_4254_39676'>
																<rect width='20' height='20' fill='white' />
															</clipPath>
														</defs>
													</svg>
													<FontAwesomeIcon
														icon={faCommentDots}
														size='sm'
														className='fa-beat'
													/>
												</Space>
											</Space>
										</li>
									)}
									<div ref={chatEndRef} />
								</ul>
							</Col>
							<Col flex={'auto'}></Col>
						</Row>
						<Row gutter={16} style={{ marginBottom: 16 }}>
							<Col flex={'auto'}></Col>
							<Col flex='768px'>
								<form
									onSubmit={handleSubmit}
									style={{
										width: '100%',
										borderRadius: '0.75rem',
										background: '#f5f5f5',
									}}
								>
									<Row style={{ padding: '8px' }}>
										<Col flex={'auto'}>
											<Space wrap style={{ marginBottom: '8px' }}>
												{button}
												{/* {fileListRef.current.map((file) => (
													<Button key={file.uid} size='small'>
														<span>{file.name}</span>
														<Button
															type='text'
															size='small'
															onClick={() => handleRemoveFile(file)}
															icon={
																<FontAwesomeIcon icon={faTrash} size='sm' />
															}
														></Button>
													</Button>
												))} */}
											</Space>
											<TextArea
												autoSize={{ minRows: 1 }}
												style={{ width: '100%' }}
												placeholder={
													AiAssistantLocalization.uiText[contextMessageKey]
														.messageAI
												}
												value={input}
												onChange={handleInputChange}
												variant='borderless'
												onKeyDown={handleKeyDown} // Add this line
											/>
										</Col>
									</Row>
									<Row gutter={4} style={{ padding: '0px 8px' }}>
										<Col style={{ marginBottom: 8 }}>
											<Tooltip
												title={
													AiAssistantLocalization.uiText[contextMessageKey]
														.context
												}
												open={tooltipContextVisible}
												placement='bottom'
												onOpenChange={(visible) =>
													setTooltipContextVisible(visible)
												}
											>
												<Select
													mode='multiple'
													onSelect={handleSelectContext}
													onDeselect={handleDeselectContext}
													options={optionsData}
													value={selectedValues}
													variant='borderless'
													popupMatchSelectWidth={false}
													suffixIcon={
														<FontAwesomeIcon
															icon={faBookBookmark}
															color='black'
															size='lg'
															style={{ paddingTop: '2px' }}
														/>
													}
												/>
											</Tooltip>
										</Col>
										<Col style={{ marginBottom: 8 }}>
											<Tooltip
												title={
													AiAssistantLocalization.uiText[contextMessageKey]
														.attach
												}
												open={tooltipFileVisible}
												placement='bottom'
												onOpenChange={(visible) =>
													setTooltipFileVisible(visible)
												}
											>
												<Upload {...props}>
													<Button
														type='text'
														loading={spinFileLoad}
														icon={
															<FontAwesomeIcon
																icon={faFileArrowUp}
																color='black'
															/>
														}
													/>
												</Upload>
											</Tooltip>
										</Col>
										<Col style={{ marginBottom: 8 }}>
											<Tooltip
												title={
													AiAssistantLocalization.uiText[contextMessageKey]
														.contracts
												}
												placement='bottom'
											>
												<Button
													id='Contracts'
													icon={
														<FontAwesomeIcon
															icon={faFileContract}
															color='black'
														/>
													}
													type='text'
													onClick={handleOpenContractsList}
												></Button>
											</Tooltip>
										</Col>
										<Col style={{ marginBottom: 8 }}>
											<Tooltip
												title={
													AiAssistantLocalization.uiText[contextMessageKey]
														.templates
												}
												placement='bottom'
											>
												<Button
													id='Templates'
													icon={
														<FontAwesomeIcon
															icon={faFileInvoice}
															color='black'
														/>
													}
													type='text'
													onClick={handleOpenTemplatesList}
												></Button>
											</Tooltip>
										</Col>
										<Col flex={'auto'}></Col>
										<Col style={{ marginBottom: 8 }}>
											<Tooltip
												title={
													AiAssistantLocalization.uiText[contextMessageKey]
														.newChat
												}
												placement='left'
											>
												<Button
													id='newChat'
													icon={<FontAwesomeIcon icon={faPlus} color='black' />}
													type='text'
													className={
														isSubmitted ? 'showOnSubmit' : 'hideOnSubmit'
													}
													onClick={handleNewChat}
												/>
											</Tooltip>
										</Col>
										<Col style={{ marginBottom: 8 }}>
											<Button
												type='primary'
												icon={<FontAwesomeIcon icon={faArrowUp} />}
												htmlType='submit'
												onClick={() => {
													setTooltipFileVisible(false);
													setTooltipContextVisible(false);
													setIsThinking(true);
													setIsSubmitted(true);
												}}
												disabled={
													input
														? // && (selectedContexts.length > 0 || contextFromFile !== '')
														  false
														: true
												}
											></Button>
										</Col>
									</Row>
								</form>
							</Col>
							<Col flex={'auto'}></Col>
						</Row>
						<div className={isSubmitted ? 'hideOnSubmit' : ''}>
							<Row gutter={16} style={{ marginBottom: 16 }} wrap={false}>
								<Col flex={'auto'} />
								<Col
									flex={'auto'}
									style={{ display: 'flex', justifyContent: 'center' }}
								>
									<Space wrap align='center'>
										<Text type='secondary'>
											{
												AiAssistantLocalization.uiText[contextMessageKey]
													.infoStartWith
											}
										</Text>
									</Space>
								</Col>
								<Col flex={'auto'} />
							</Row>
							<Row gutter={16} style={{ marginBottom: 32 }} wrap={false}>
								<Col flex={'auto'} />
								<Col
									flex={'auto'}
									style={{ display: 'flex', justifyContent: 'center' }}
								>
									<Space
										style={{
											minWidth: 100,
											maxWidth: 800,
											justifyContent: 'center',
										}}
										wrap
										align='center'
										id='cases'
									>
										<Button
											icon={<FontAwesomeIcon icon={faBook} />}
											shape='round'
											id='Context1'
											onClick={() =>
												handleContextClick(
													AiAssistantLocalization.contextMessages[
														contextMessageKey
													].context1,
													false,
													true
												)
											}
										>
											{
												AiAssistantLocalization.buttonTexts[contextMessageKey]
													.context1
											}{' '}
											{/* Dynamic button text */}
										</Button>
										<Button
											icon={<FontAwesomeIcon icon={faRectangleList} />}
											shape='round'
											id='Context2'
											onClick={() =>
												handleContextClick(
													AiAssistantLocalization.contextMessages[
														contextMessageKey
													].context2,
													true,
													false
												)
											}
										>
											{
												AiAssistantLocalization.buttonTexts[contextMessageKey]
													.context2
											}{' '}
											{/* Dynamic button text */}
										</Button>
										<Button
											icon={<FontAwesomeIcon icon={faFileCirclePlus} />}
											shape='round'
											id='Context3'
											onClick={() =>
												handleContextClick(
													AiAssistantLocalization.contextMessages[
														contextMessageKey
													].context3,
													false,
													false
												)
											}
										>
											{
												AiAssistantLocalization.buttonTexts[contextMessageKey]
													.context3
											}{' '}
											{/* Dynamic button text */}
										</Button>
										<Button
											icon={<FontAwesomeIcon icon={faFileCircleQuestion} />}
											shape='round'
											id='Context4'
											onClick={() =>
												handleContextClick(
													AiAssistantLocalization.contextMessages[
														contextMessageKey
													].context4,
													false,
													false
												)
											}
										>
											{
												AiAssistantLocalization.buttonTexts[contextMessageKey]
													.context4
											}{' '}
											{/* Dynamic button text */}
										</Button>
										<Button
											icon={<FontAwesomeIcon icon={faLegal} />}
											shape='round'
											id='Context5'
											onClick={() =>
												handleContextClick(
													AiAssistantLocalization.contextMessages[
														contextMessageKey
													].context5,
													false,
													false
												)
											}
										>
											{
												AiAssistantLocalization.buttonTexts[contextMessageKey]
													.context5
											}{' '}
											{/* Dynamic button text */}
										</Button>
										<Button
											icon={<FontAwesomeIcon icon={faGlobe} />}
											shape='round'
											id='Context6'
											onClick={() =>
												handleContextClick(
													AiAssistantLocalization.contextMessages[
														contextMessageKey
													].context6,
													false,
													false
												)
											}
										>
											{
												AiAssistantLocalization.buttonTexts[contextMessageKey]
													.context6
											}{' '}
											{/* Dynamic button text */}
										</Button>
										<Button
											icon={<FontAwesomeIcon icon={faLanguage} />}
											shape='round'
											id='Context7'
											onClick={() =>
												handleContextClick(
													AiAssistantLocalization.contextMessages[
														contextMessageKey
													].context7,
													true,
													false
												)
											}
										>
											{
												AiAssistantLocalization.buttonTexts[contextMessageKey]
													.context7
											}{' '}
											{/* Dynamic button text */}
										</Button>
										<Button
											icon={<FontAwesomeIcon icon={faSpellCheck} />}
											shape='round'
											id='Context8'
											onClick={() =>
												handleContextClick(
													AiAssistantLocalization.contextMessages[
														contextMessageKey
													].context8,
													true,
													false
												)
											}
										>
											{
												AiAssistantLocalization.buttonTexts[contextMessageKey]
													.context8
											}{' '}
											{/* Dynamic button text */}
										</Button>
									</Space>
								</Col>
								<Col flex={'auto'} />
							</Row>

							<Row gutter={16} style={{ marginBottom: 16 }} wrap={false}>
								<Col flex={'auto'} />
								<Col
									flex={'auto'}
									style={{ display: 'flex', justifyContent: 'center' }}
								>
									<Space wrap align='center'>
										<Text type='secondary'>
											{
												AiAssistantLocalization.uiText[contextMessageKey]
													.infoContext
											}
										</Text>
										<Tooltip
											title={
												AiAssistantLocalization.uiText[contextMessageKey]
													.infoContextHelp
											}
										>
											<FontAwesomeIcon icon={faQuestionCircle} size='sm' />
										</Tooltip>
									</Space>
								</Col>
								<Col flex={'auto'} />
							</Row>
							<ContextList />
						</div>
					</Card>
				</Space>
			)}

			<Notification />
			<ContextModal />
			<ModalView />
		</AiAssistantContext.Provider>
	);
};
