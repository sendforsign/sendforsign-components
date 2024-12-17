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
import { AiAssistantContext } from './ai-assistant-context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faArrowUp,
	faBook,
	faCommentDots,
	faContactBook,
	faFile,
	faFileCirclePlus,
	faFileContract,
	faLegal,
	faLightbulb,
	faPager,
	faPaperclip,
	faQuestion,
	faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { Notification } from './notification/notification';
import { ContextModal } from './context-modal';
import { ContextList } from './context-list';
import { useChat } from 'ai/react';
import { BASE_URL } from '../../config/config';
import { Action, ApiEntity } from '../../config/enum';
import { Context } from '../../config/types';
import axios from 'axios';
import useSaveArrayBuffer from '../../hooks/use-save-array-buffer';
import Upload, { RcFile, UploadFile, UploadProps } from 'antd/es/upload';
import ReactMarkdown from 'react-markdown';

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
export const AiAssistant: FC<AiAssistantProps> = ({
	apiKey,
	clientKey,
	token,
	userKey,
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
	const [refreshContext, setRefreshContext] = useState(0);
	const [spinLoad, setSpinLoad] = useState(false);
	const [spinContextLoad, setSpinContextLoad] = useState(false);
	const [selectData, setSelectData] = useState<SelectData[]>([]);
	const [spinFileLoad, setSpinFileLoad] = useState(false);
	const [contexts, setContexts] = useState<Context[]>([]);
	const [selectedContexts, setSelectedContexts] = useState<string[]>([]);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const fileListRef = useRef<UploadFile[]>([]);
	const contextFromFileRef = useRef<string[]>([]);
	const { setArrayBuffer, getArrayBuffer } = useSaveArrayBuffer();
	const headers = useRef<any>({});
	const body = useRef<any>({});
	const { messages, input, handleInputChange, handleSubmit } = useChat({
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
		chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const [tooltipFileVisible, setTooltipFileVisible] = useState(false);
	const [tooltipContextVisible, setTooltipContextVisible] = useState(false);
	useEffect(() => {
		setCurrToken(token);
		if (token) {
			headers.current = {
				Authorization: `Bearer ${currToken}`,
				Accept: 'application/vnd.api+json',
				'Content-Type': 'application/vnd.api+json',
			};
		}
	}, [token]);
	useEffect(() => {
		setCurrApiKey(apiKey);
	}, [apiKey]);
	useEffect(() => {
		setCurrClientKey(clientKey);
		if (clientKey) {
			body.current = { ...body.current, clientKey: clientKey };
		}
	}, [clientKey]);
	useEffect(() => {
		setCurrUserKey(userKey);
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
		const getContexts = async () => {
			setSpinContextLoad(true);
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
							value: context.contextKey as string,
						});
					});
					setSelectData(selectDataTmp);
				});
		};
		if (currApiKey || currToken) {
			getContexts();
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
		accept: 'application/pdf',
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
			setFileList(fileListRef.current); // Ensure fileList state is updated
		},
		beforeUpload: async (file) => {
			const newFileList = fileListRef.current.slice();
			fileListRef.current = [...newFileList, file];
			setFileList(fileListRef.current);
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
		setFileList(newFileList);
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
		for (let i = 0; i < fileList.length; i++) {
			const pdfFile: ArrayBuffer = (await getArrayBuffer(
				fileList[i].uid
			)) as ArrayBuffer;
			const pdfFileBlob = new Blob([pdfFile as BlobPart], {
				type: 'application/pdf',
			});
			formData.append(
				'files[]',
				pdfFileBlob,
				encodeURIComponent(fileList[i].name)
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
				if (payload.data.fileContents && payload.data.fileContents.length > 0) {
					contextFromFileRef.current = payload.data.fileContents.map(
						(fileContent: string) => {
							return fileContent;
						}
					);
					body.current = {
						...body.current,
						texts: payload.data.fileContents.map((fileContent: string) => {
							return fileContent;
						}),
					};
				}
			})
			.catch((error) => {
				setNotification({
					text:
						error.response && error.response.data && error.response.data.message
							? error.response.data.message
							: error.message,
				});
			});
	};

	const handleSelectContext = (e: any) => {
		let selectedContextsTmp = [...selectedContexts];
		selectedContextsTmp.push(e);
		setSelectedContexts(selectedContextsTmp);
		body.current = { ...body.current, contexts: selectedContextsTmp };
	};
	const handleDeselectContext = (e: any) => {
		let selectedContextsTmp = [...selectedContexts];
		const findIndex = selectedContextsTmp.findIndex((selectedContext) =>
			selectedContext.includes(e)
		);
		selectedContextsTmp.splice(findIndex, 1);
		setSelectedContexts(selectedContextsTmp);
		body.current = { ...body.current, contexts: selectedContextsTmp };
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
			setIsThinking(true);
			event.preventDefault(); // Prevents adding a new line
			handleSubmit(); // Calls the submit function
		}
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
							size='small'
							type='default'
							key={index}
							href={`https://components.sendforsign.com/?path=/story/marbella-contracteditor--primary&args=apiKey:re_api_ilia_Qws_qwe;clientKey:658599d9-bbbe-44ea-984e-0e5a766c2272;contractKey:${match[1]}`}
						>
							Open document
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
			}}
		>
			{spinLoad ? (
				<Spin spinning={spinLoad} fullscreen />
			) : (
				<Space direction='vertical' size={16} style={{ display: 'flex' }}>
					<Card>
						<Row style={{ margin: '0 0 16px 0' }}>
							<Col>
								<Title
									level={3}
									style={{
										margin: '0',
										display: 'flex',
										textAlign: 'center',
									}}
								>
									AI assistant
								</Title>
							</Col>
							<Col flex={'auto'} />
						</Row>
						<Row gutter={16} style={{ marginBottom: 32 }}>
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
															<Text className='text-primary'>{m.content}</Text>
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
																	{replaceTextWithElement(m.content)}{' '}
																	{/* Use the function here */}
																</Text>
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
												{fileList.map((file) => (
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
												))}
											</Space>
											<TextArea
												autoSize={{ minRows: 1 }}
												style={{ minWidth: 300, width: '100%' }}
												placeholder='Message assistant...'
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
												title='Attach files'
												placement='left'
												open={tooltipFileVisible}
											>
												<Upload {...props}>
													<Button
														type='text'
														loading={spinFileLoad}
														icon={
															<FontAwesomeIcon
																icon={faPaperclip}
																color='black'
															/>
														}
													/>
												</Upload>
											</Tooltip>
										</Col>
										<Col style={{ marginBottom: 8 }}>
											<Tooltip
												title='Select context'
												placement='right'
												open={tooltipContextVisible}
											>
												<Select
													mode='multiple'
													onSelect={handleSelectContext}
													onDeselect={handleDeselectContext}
													options={selectData}
													variant='borderless'
													popupMatchSelectWidth={false}
													suffixIcon={
														<FontAwesomeIcon
															icon={faBook}
															color='black'
															size='lg'
															style={{ paddingTop: '2px' }}
														/>
													}
												/>
											</Tooltip>
										</Col>
										<Col flex={'auto'}></Col>
										<Col style={{ marginBottom: 8 }}>
											<Button
												type='primary'
												icon={<FontAwesomeIcon icon={faArrowUp} />}
												htmlType='submit'
												onClick={() => {
													setTooltipFileVisible(false);
													setTooltipContextVisible(false);
													setIsThinking(true);
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
						<Row gutter={16} style={{ marginBottom: 16 }} wrap={false}>
							<Col flex={'auto'} />
							<Col
								flex={'auto'}
								style={{ display: 'flex', justifyContent: 'center' }}
							>
								<Space wrap align='center'>
									<Text type='secondary'>Get started with</Text>
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
								>
									<Button
										icon={<FontAwesomeIcon color='orange' icon={faBook} />}
										shape='round'
										id='Context1'
										onClick={() =>
											handleContextClick(
												'Ответь на вопрос на основе контекста: ',
												false,
												true
											)
										}
									>
										Ответь на основе контекста
									</Button>
									<Button
										icon={<FontAwesomeIcon color='orange' icon={faFile} />}
										shape='round'
										id='Context2'
										onClick={() =>
											handleContextClick(
												'Подготовь саммари документа',
												true,
												false
											)
										}
									>
										Подготовь саммари документа
									</Button>
									<Button
										icon={
											<FontAwesomeIcon color='orange' icon={faFileCirclePlus} />
										}
										shape='round'
										id='Context3'
										onClick={() =>
											handleContextClick(
												'Создай новый Договор о неразглашении',
												false,
												false
											)
										}
									>
										Создай новый документ
									</Button>
									<Button
										icon={
											<FontAwesomeIcon color='orange' icon={faFileContract} />
										}
										shape='round'
										id='Context3'
										onClick={() =>
											handleContextClick(
												'Создай новый Договор о неразглашении и отправь его Ивану Петрову ivan@ivan.com и Николаю Сидорову nick@nick.com',
												false,
												false
											)
										}
									>
										Создай и отправь новый документ
									</Button>
									<Button
										icon={<FontAwesomeIcon color='orange' icon={faLegal} />}
										shape='round'
										id='Context3'
										onClick={() =>
											handleContextClick(
												'Найди судебную практику для кейса: ',
												false,
												false
											)
										}
									>
										Найди судебную практику для кейса
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
									<Text type='secondary'>Add context</Text>
								</Space>
							</Col>
							<Col flex={'auto'} />
						</Row>
						<ContextList />
					</Card>
				</Space>
			)}

			<Notification />
			<ContextModal />
		</AiAssistantContext.Provider>
	);
};
