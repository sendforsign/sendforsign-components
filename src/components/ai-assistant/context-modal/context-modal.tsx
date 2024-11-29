import React, { useRef, useState } from 'react';
import { Space, Card, Typography, Modal, Button, Input } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useAiAssistantContext } from '../ai-assistant-context';
import axios from 'axios';
import { BASE_URL } from '../../../config/config';
import { ApiEntity, ContractSteps } from '../../../config/enum';
import type { UploadFile, UploadProps } from 'antd';
import { message, Upload } from 'antd';
import { RcFile } from 'antd/es/upload';
import useSaveArrayBuffer from '../../../hooks/use-save-array-buffer';

export const ContextModal = () => {
	const {
		apiKey,
		token,
		clientKey,
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
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const fileListRef = useRef<UploadFile[]>([]);
	const { Dragger } = Upload;
	const { setArrayBuffer, getArrayBuffer } = useSaveArrayBuffer();

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
		accept: 'application/pdf',
		listType: 'text',

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
		},
		beforeUpload: async (file) => {
			const newFileList = fileListRef.current.slice();
			fileListRef.current = [...newFileList, file];
			setFileList(fileListRef.current);
			await saveArrayBuffer(file);

			return false;
		},
		fileList,
	};
	const handleOk = async () => {
		setSpinLoad(true);

		const formData: FormData = new FormData();
		formData.append('contextName', contextName);
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
				//console.log('getContract read', payload);
				setSpinLoad(false);
				setRefreshContext(refreshContext + 1);
				handleCancel();
				// sendEmail();
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
	const handleCancel = () => {
		setSpinLoad(false);
		setFileList([]);
		fileListRef.current = [];
		setContextName('');
		setContextModal(false);
	};
	const handleChange = (e: any) => {
		setContextName(e.target.value);
	};
	return (
		<Modal
			title='Create context'
			open={contextModal}
			centered
			onOk={handleOk}
			onCancel={handleCancel}
			footer={
				<>
					<Button key='back' onClick={handleCancel}>
						Cancel
					</Button>
					<Button
						key='submit'
						type='primary'
						disabled={!contextName || fileList.length === 0 ? true : false}
						onClick={handleOk}
						loading={spinLoad}
					>
						Create
					</Button>
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
