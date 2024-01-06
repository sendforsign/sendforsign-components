import React, { useState } from 'react';
import {
	Space,
	Card,
	Typography,
	Button,
	Input,
	Modal,
	Tooltip,
	Spin,
	Segmented,
	InputNumber,
} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useContractEditorContext } from '../contract-editor-context';
import {
	Action,
	ApiEntity,
	ContractAction,
	ShareLinkViewText,
} from '../../../config/enum';
import axios from 'axios';
import { BASE_URL } from '../../../config/config';
type Recipient = {
	fullname?: string;
	email?: string;
	customMessage?: string;
	position?: number;
	action?: ShareLinkViewText;
};
export const SendModal = () => {
	const {
		sendModal,
		setSendModal,
		contractKey,
		clientKey,
		userKey,
		setResultModal,
	} = useContractEditorContext();
	const [sendLoad, setSendLoad] = useState(false);
	const [recipients, setRecipients] = useState<Recipient[]>([
		{
			fullname: '',
			email: '',
			customMessage: '',
			position: 1,
			action: ShareLinkViewText.SIGN,
		},
	]);
	const options = [
		{ label: 'Sign', value: ShareLinkViewText.SIGN },
		{ label: 'Approve', value: ShareLinkViewText.APPROVE },
		{ label: 'View', value: ShareLinkViewText.VIEW },
		{
			value: ShareLinkViewText.LOCK,
			icon: <FontAwesomeIcon icon={faLock} />,
		},
	];
	const { Title, Text } = Typography;

	const handleSend = async () => {
		if (
			recipients &&
			recipients.length > 0 &&
			recipients[0].fullname &&
			recipients[0].email
		) {
			setSendLoad(true);
			const body = {
				data: {
					action: Action.SEND,
					clientKey: clientKey,
					userKey: userKey,
					contractKey: contractKey,
					recipients: recipients,
				},
			};
			await axios
				.post(BASE_URL + ApiEntity.EMAIL, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': 're_api_key', //process.env.SENDFORSIGN_API_KEY,
					},
					responseType: 'json',
				})
				.then((payload) => {
					setSendLoad(false);
					handleCancel();
					if (payload.data.result) {
						setResultModal({ open: true, action: ContractAction.SEND });
					}
				});
		}
	};
	const handleChange = (e: any, index: number) => {
		let recipientsTmp = [...recipients];
		switch (e.target.id) {
			case 'FullName':
				recipientsTmp[index].fullname = e.target.value;
				break;
			case 'Email':
				recipientsTmp[index].email = e.target.value;
				break;
			case 'CustomMessage':
				recipientsTmp[index].customMessage = e.target.value;
				break;
		}
		setRecipients(recipientsTmp);
	};
	const handleClick = (e: any, index: number) => {
		let recipientsTmp = [...recipients];
		recipientsTmp[index].action = e;
		setRecipients(recipientsTmp);
	};
	const handleChangePosition = (e: any, index: number) => {
		let recipientsTmp = [...recipients];
		recipientsTmp[index].position = e;
		setRecipients(recipientsTmp);
	};
	const handleCancel = () => {
		setRecipients([
			{
				fullname: '',
				email: '',
				customMessage: '',
				position: 1,
				action: ShareLinkViewText.SIGN,
			},
		]);
		setSendModal(false);
	};
	const handleDelete = (index: number) => {
		let recipientsTmp = [...recipients];
		recipientsTmp.splice(index, 1);
		setRecipients(recipientsTmp);
	};
	const handleInsert = () => {
		let recipientsTmp = [...recipients];
		recipientsTmp.push({ position: 1, action: ShareLinkViewText.SIGN });
		setRecipients(recipientsTmp);
	};
	return (
		<Modal
			title='Send this document'
			open={sendModal}
			centered
			onOk={handleSend}
			onCancel={handleCancel}
			footer={
				<>
					<Button key='back' onClick={handleCancel}>
						Cancel
					</Button>
					<Button
						key='submit'
						type='primary'
						loading={sendLoad}
						onClick={handleSend}
					>
						{`Send to ${recipients.length} recipient${
							recipients.length === 1 ? '' : 's'
						}`}
					</Button>
				</>
			}
		>
			<Space
				direction='vertical'
				size='large'
				style={{ display: 'flex', margin: '32px 0 32px 0' }}
			>
				{recipients &&
					recipients.length > 0 &&
					recipients.map((recipient, index) => {
						return (
							<Card>
								<Space
									direction='vertical'
									size={16}
									style={{ display: 'flex' }}
								>
									<Space direction='vertical' size={2}>
										<Title level={5} style={{ margin: '0 0 0 0' }}>
											Enter the recipient's information.
										</Title>
										<Text type='secondary'>
											We will send the document to this recipient.
										</Text>
									</Space>
									<Input
										id={`FullName`}
										placeholder="Recipient's full name"
										value={recipient.fullname}
										onChange={(e: any) => handleChange(e, index)}
									/>
									<Input
										id={`Email`}
										placeholder="Recipient's email"
										value={recipient.email}
										onChange={(e: any) => handleChange(e, index)}
									/>
									<Input
										id={`CustomMessage`}
										placeholder='Private note; leave empty for the default message'
										value={recipient.customMessage}
										onChange={(e: any) => handleChange(e, index)}
									/>
									<Space>
										<Spin spinning={false}>
											<Tooltip title="Set what recipient needs to do with the document or lock so they can't open it.">
												<Segmented
													id={`Segmented${index}`}
													value={recipient.action}
													options={options}
													onChange={(e: any) => handleClick(e, index)}
												/>
											</Tooltip>
										</Spin>
										<Tooltip title='Set signing order.'>
											<InputNumber
												min={1}
												max={10}
												value={recipient.position}
												onChange={(e: any) => handleChangePosition(e, index)}
											/>
										</Tooltip>
										{index !== 0 && (
											<Tooltip title='Delete recipient.'>
												<Button
													type='text'
													icon={<FontAwesomeIcon icon={faTrash} />}
													onClick={() => handleDelete(index)}
												/>
											</Tooltip>
										)}
									</Space>
								</Space>
							</Card>
						);
					})}
				<Button type='dashed' block onClick={handleInsert}>
					Add recipient
				</Button>
			</Space>
		</Modal>
	);
};
