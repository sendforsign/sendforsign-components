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
	Image,
} from 'antd';
import { AiAssistantContext } from './ai-assistant-context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faLightbulb,
	faPaperclip,
	faQuestion,
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
// import { CustomPDFLoader } from '../../utils/customPDFLoader';
// import { BufferLoader } from 'langchain/document_loaders/fs/buffer';

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
	const [currUserKey, setCurrUserKey] = useState(userKey);
	const [currApiKey, setCurrApiKey] = useState(apiKey);
	const [currToken, setCurrToken] = useState(token);
	const [notification, setNotification] = useState({});
	const [contextModal, setContextModal] = useState(false);
	const [refreshContext, setRefreshContext] = useState(0);
	const [spinLoad, setSpinLoad] = useState(false);
	const [contextFromFile, setContextFromFile] = useState<string[]>([]);
	const [spinContextLoad, setSpinContextLoad] = useState(false);
	const [spinFileLoad, setSpinFileLoad] = useState(false);
	const [selectData, setSelectData] = useState<SelectData[]>([]);
	const [contexts, setContexts] = useState<Context[]>([]);
	const [selectedContexts, setSelectedContexts] = useState<string[]>([]);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const fileListRef = useRef<UploadFile[]>([]);
	const { setArrayBuffer, getArrayBuffer } = useSaveArrayBuffer();
	const headers = useRef<any>({});
	const body = useRef<any>({});
	const { messages, input, handleInputChange, handleSubmit } = useChat({
		api: `${BASE_URL}${ApiEntity.CHAT}`,
		body: body.current,
		headers: headers.current,
		onError: (e) => {
			console.log(e);
		},
	});
	const { Title, Text } = Typography;
	const props: UploadProps = {
		name: 'file',
		multiple: true,
		accept: 'application/pdf',
		listType: 'text',
		showUploadList: true,

		onChange: async (info) => {
			if (!info.file.status) {
				const findIndex = fileListRef.current.findIndex(
					(fileList) => fileList.uid === info.file.uid
				);
				if (findIndex === fileListRef.current.length - 1) {
					await sendFiles();
				}
			}
		},
		onRemove: (file) => {
			const index = fileListRef.current.indexOf(file);
			const newFileList = fileListRef.current.slice();
			newFileList.splice(index, 1);
			fileListRef.current = newFileList;
			setFileList(newFileList);
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
		formData.append('returnText', 'true');
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
					setContextFromFile(
						payload.data.fileContents.map((fileContent: string) => {
							return fileContent;
						})
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
	useEffect(() => {
		setCurrToken(token);
		setRefreshContext(refreshContext + 1);
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
					<Card style={{ overflow: 'auto' }}>
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
							<Col flex='768px'>
								<ul style={{ width: '100%', paddingLeft: 0, paddingRight: 0 }}>
									{messages.map((m, index) => {
										console.log('m', m, index);
										return (
											<div style={{ width: '100%' }}>
												{m.role === 'user' ? (
													<li
														key={m.id}
														style={{
															display: 'flex',
															flexDirection: 'row-reverse',
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
															<Text className='text-primary'>{m.content}</Text>
														</Space>
													</li>
												)}
											</div>
										);
									})}
								</ul>
							</Col>
							<Col flex={'auto'}></Col>
						</Row>
						<Row gutter={16} style={{ marginBottom: 32 }}>
							<form style={{ width: '100%' }} onSubmit={handleSubmit}>
								<Row gutter={16} style={{ marginBottom: 32 }}>
									<Col flex={'auto'} style={{ marginBottom: 8 }}>
										<TextArea
											autoSize={{ minRows: 1 }}
											style={{ minWidth: 300, width: '100%' }}
											placeholder='Message assistant...'
											value={input}
											onChange={handleInputChange}
										/>
									</Col>
									<Col style={{ marginBottom: 8 }}>
										<Select
											placeholder='Add context'
											mode='multiple'
											allowClear
											style={{ minWidth: 120, maxWidth: 300 }}
											onSelect={handleSelectContext}
											onDeselect={handleDeselectContext}
											options={selectData}
										/>
									</Col>
									<Col>
										<Upload {...props}>
											<Button
												loading={spinFileLoad}
												icon={
													<FontAwesomeIcon color='green' icon={faPaperclip} />
												}
											>
												{contextFromFile.length > 0
													? `${contextFromFile.length} файлов`
													: 'Загрузить'}
											</Button>
										</Upload>
									</Col>
									<Col flex={'80px'} style={{ marginBottom: 8 }}>
										<Button
											type='primary'
											htmlType='submit'
											disabled={
												input &&
												(selectedContexts.length > 0 ||
													contextFromFile.length > 0)
													? false
													: true
											}
										>
											Submit
										</Button>
									</Col>
								</Row>
							</form>
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
										icon={<FontAwesomeIcon color='green' icon={faQuestion} />}
										shape='round'
									>
										Создай документ на основе существующих
									</Button>
									<Button
										icon={<FontAwesomeIcon color='orange' icon={faLightbulb} />}
										shape='round'
									>
										Ответь на основе контекста
									</Button>
									<Button
										icon={<FontAwesomeIcon color='orange' icon={faLightbulb} />}
										shape='round'
									>
										Подготовь саммари документа
									</Button>
									<Button
										icon={<FontAwesomeIcon color='orange' icon={faLightbulb} />}
										shape='round'
									>
										Найди документы по имени подписанта
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
