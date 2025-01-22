import React, { useEffect, useRef, useState } from 'react';
import { Space, Card, Typography, Modal, Button, Input } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useAiAssistantContext } from '../ai-assistant-context';
import axios from 'axios';
import { BASE_URL } from '../../../config/config';
import { Action, ApiEntity, ContractSteps } from '../../../config/enum';
import type { UploadFile, UploadProps } from 'antd';
import { message, Upload } from 'antd';
import { RcFile } from 'antd/es/upload';
import useSaveArrayBuffer from '../../../hooks/use-save-array-buffer';
import { ContextDocument } from '../../../config/types';

export const ContextModal = () => {
	const {
		apiKey,
		token,
		clientKey,
		userKey,
		setNotification,
		contextModal,
		setContextModal,
		refreshContext,
		setRefreshContext,
	} = useAiAssistantContext();
	const { Title } = Typography;
	const [contextName, setContextName] = useState('');
	// const contextName = useRef<string>('');
	const [spinLoad, setSpinLoad] = useState(false);
	const [spinDeleteLoad, setSpinDeleteLoad] = useState(false);
	const [disableDeleteLoad, setDisableDeleteLoad] = useState(false);
	const [disableLoad, setDisableLoad] = useState(false);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [fileListInsert, setFileListInsert] = useState<UploadFile[]>([]);
	const [fileListDelete, setFileListDelete] = useState<UploadFile[]>([]);
	const [needSave, setNeedSave] = useState(false);
	const edit =
		contextModal.context && contextModal.context.contextKey ? true : false;
	const fileListRef = useRef<UploadFile[]>([]);
	const { Dragger } = Upload;
	const { setArrayBuffer, getArrayBuffer } = useSaveArrayBuffer();

	useEffect(() => {
		if (contextModal && contextModal.context && contextModal.context.name) {
			setContextName(contextModal.context.name);
			let fileListTmp = [...fileList];
			if (contextModal.context.documents) {
				const documents = contextModal.context.documents;
				for (let i = 0; i < documents.length; i++) {
					fileListTmp.push({
						name: documents[i]?.name as string,
						uid: documents[i]?.link as string,
					});
				}
				setFileList(fileListTmp);
				fileListRef.current = fileListTmp;
			}
		}
	}, [contextModal]);
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
	const props: UploadProps = {
		name: 'file',
		multiple: true,
		accept:
			'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		listType: 'text',
		disabled:
			contextModal.context && contextModal.context.general ? true : false,

		onChange(info) {
			const { status } = info.file;
			if (status !== 'uploading') {
				console.log(info.file, info.fileList);
			}
			if (status === 'done') {
				message.success(`${info.file.name} file uploaded successfully.`);
			} else if (status === 'error') {
				message.error(`${info.file.name} file upload failed.`);
			}
		},
		onRemove: (file) => {
			const index = fileListRef.current.indexOf(file);
			const newFileList = fileListRef.current.slice();
			newFileList.splice(index, 1);
			fileListRef.current = newFileList;
			setFileList(newFileList);
			if (edit) {
				let fileDelete = [...fileListDelete];
				fileDelete.push(file);
				setFileListDelete(fileDelete);
				setNeedSave(true);
			}
		},
		beforeUpload: async (file) => {
			const newFileList = fileListRef.current.slice();
			fileListRef.current = [...newFileList, file];
			setFileList(fileListRef.current);
			await saveArrayBuffer(file);
			if (edit) {
				let fileInsert = [...fileListInsert];
				fileInsert.push(file);
				setFileListInsert(fileInsert);
				setNeedSave(true);
			}

			return false;
		},
		fileList,
	};
	const handleDelete = async () => {
		setSpinDeleteLoad(true);
		setDisableDeleteLoad(true);
		let body = {
			data: {
				action: Action.DELETE,
				clientKey: !token ? clientKey : undefined,
				userKey: userKey ? userKey : '',
				context: {
					contextKey: contextModal.context?.contextKey as string,
				},
			},
		};
		await axios
			.post(BASE_URL + ApiEntity.CONTEXT, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
					Authorization: token ? `Bearer ${token}` : undefined,
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				setSpinDeleteLoad(false);
				setRefreshContext(refreshContext + 1);
				handleCancel();
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
	const handleOk = async () => {
		debugger;

		setSpinLoad(true);
		setDisableLoad(true);
		if (edit) {
			if (needSave) {
				if (fileListInsert && fileListInsert.length > 0) {
					const formData: FormData = new FormData();
					formData.append('contextName', contextName);
					formData.append(
						'contextKey',
						contextModal.context?.contextKey as string
					);
					formData.append('action', Action.UPDATE);
					if (fileListDelete && fileListDelete.length > 0) {
						for (let i = 0; i < fileListDelete.length; i++) {
							formData.append('delete[]', fileListDelete[i].uid);
						}
					}
					for (let i = 0; i < fileListInsert.length; i++) {
						const pdfFile: ArrayBuffer = (await getArrayBuffer(
							fileListInsert[i].uid
						)) as ArrayBuffer;
						const pdfFileBlob = new Blob([pdfFile as BlobPart], {
							type: fileListInsert[i].type,
						});
						formData.append(
							'files[]',
							pdfFileBlob,
							encodeURIComponent(fileListInsert[i].name)
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
							//console.log('getContract read', payload);
							setSpinLoad(false);
							setRefreshContext(refreshContext + 1);
							handleCancel();
							// sendEmail();
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
				} else {
					let body = {
						data: {
							action: Action.UPDATE,
							clientKey: !token ? clientKey : undefined,
							userKey: userKey ? userKey : '',
							context: {
								contextKey: contextModal.context?.contextKey as string,
								name: contextName,
								documents:
									fileListDelete && fileListDelete.length > 0
										? fileList
										: undefined,
							},
						},
					};
					await axios
						.post(BASE_URL + ApiEntity.CONTEXT, body, {
							headers: {
								Accept: 'application/vnd.api+json',
								'Content-Type': 'application/vnd.api+json',
								'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
								Authorization: token ? `Bearer ${token}` : undefined,
							},
							responseType: 'json',
						})
						.then((payload: any) => {
							setSpinLoad(false);
							setRefreshContext(refreshContext + 1);
							handleCancel();
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
				}
			}
		} else {
			const formData: FormData = new FormData();
			formData.append('contextName', contextName);
			formData.append('action', Action.CREATE);
			for (let i = 0; i < fileList.length; i++) {
				const pdfFile: ArrayBuffer = (await getArrayBuffer(
					fileList[i].uid
				)) as ArrayBuffer;
				const pdfFileBlob = new Blob([pdfFile as BlobPart], {
					type: fileList[i].type,
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
					//console.log('getContract read', payload);
					setSpinLoad(false);
					setRefreshContext(refreshContext + 1);
					handleCancel();
					// sendEmail();
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
		}
	};
	const handleCancel = () => {
		setSpinLoad(false);
		setFileList([]);
		setFileListDelete([]);
		setFileListInsert([]);
		fileListRef.current = [];
		setContextName('');
		setContextModal({ open: false, context: {} });
		setDisableDeleteLoad(false);
		setDisableLoad(false);
	};
	const handleChange = (e: any) => {
		setContextName(e.target.value);
		setNeedSave(true);
	};
	return (
		<Modal
			title={
				contextModal.context && contextModal.context.contextKey
					? 'Edit context'
					: 'Create context'
			}
			open={contextModal.open}
			centered
			onOk={handleOk}
			onCancel={handleCancel}
			footer={
				<>
					{contextModal.context &&
						!contextModal.context.general &&
						contextModal.context.contextKey && (
							<Button
								key='delete'
								onClick={handleDelete}
								style={{ float: 'left' }}
								loading={spinDeleteLoad}
								disabled={disableLoad}
							>
								Delete
							</Button>
						)}
					<Button
						key='back'
						onClick={handleCancel}
						disabled={disableLoad || disableDeleteLoad}
					>
						Cancel
					</Button>
					{contextModal.context && !contextModal.context.general && (
						<Button
							key='submit'
							type='primary'
							disabled={
								!contextName || fileList.length === 0 || disableDeleteLoad
									? true
									: false
							}
							onClick={handleOk}
							loading={spinLoad}
						>
							{contextModal.context && contextModal.context.contextKey
								? 'Save'
								: 'Create'}
						</Button>
					)}
				</>
			}
		>
			<Space
				direction='vertical'
				size='large'
				style={{ display: 'flex', margin: '32px 0 0 0' }}
			>
				<Card bordered={true} key={`ContextModal${new Date().toString()}`}>
					<Space direction='vertical' size={16} style={{ display: 'flex' }}>
						<Title level={5} style={{ margin: '0 0 0 0' }}>
							Enter context name
						</Title>
						<Input
							id='ContextName'
							placeholder='Enter context name'
							value={contextName}
							onChange={handleChange}
							disabled={
								contextModal.context && contextModal.context.general
									? true
									: false
							}
							autoFocus
						/>
						<Dragger {...props}>
							<p className='ant-upload-drag-icon'>
								<InboxOutlined />
							</p>
							<p className='ant-upload-text'>
								Click or drag file to this area to upload
							</p>
							<p className='ant-upload-hint'>
								Support for a single or bulk upload. Strictly prohibit from
								uploading company data or other band files
							</p>
						</Dragger>
					</Space>
				</Card>
			</Space>
		</Modal>
	);
};
