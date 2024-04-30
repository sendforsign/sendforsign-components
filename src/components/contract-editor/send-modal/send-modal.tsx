import React, { useEffect, useState } from 'react';
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
	Row,
	Col,
	Switch,
} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faCheck,
	faHouseUser,
	faLink,
	faLock,
	faPaperPlane,
	faSign,
	faSignature,
	faStamp,
	faTrash,
	faUser,
} from '@fortawesome/free-solid-svg-icons';
import { useContractEditorContext } from '../contract-editor-context';
import {
	Action,
	ApiEntity,
	ContractAction,
	ShareLinkViewText,
} from '../../../config/enum';
import axios from 'axios';
import { BASE_URL } from '../../../config/config';
import { Recipient } from '../../../config/types';

export const SendModal = () => {
	const {
		apiKey,
		token,
		sendModal,
		setSendModal,
		contractKey,
		clientKey,
		userKey,
		refreshEvent,
		refreshRecipients,
		setRefreshEvent,
		setResultModal,
	} = useContractEditorContext();
	const [sendLoad, setSendLoad] = useState(false);
	const [dataLoad, setDataLoad] = useState(false);
	const [changeRecipient, setChangeRecipient] = useState<Recipient[]>([]);
	const [insertRecipient, setInsertRecipient] = useState<Recipient[]>([]);
	const [deleteRecipient, setDeleteRecipient] = useState<Recipient[]>([]);
	const [id, setId] = useState(0);
	const [newRecipients, setNewRecipients] = useState(true);
	const [recipientInit, setRecipientInit] = useState(false);
	const [recipients, setRecipients] = useState<Recipient[]>([
		{
			id: 0,
			fullname: '',
			email: '',
			customMessage: '',
			position: 1,
			action: ShareLinkViewText.SIGN,
			recipientKey: '',
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

	// console.log('contractKey 8');
	useEffect(() => {
		let isMounted = true;
		if (contractKey) {
			const body = {
				data: {
					action: Action.LIST,
					clientKey: clientKey,
					userKey: userKey,
					contractKey: contractKey,
				},
			};
			setDataLoad(true);
			const getRecipients = async () => {
				setChangeRecipient([]);
				setDeleteRecipient([]);
				setInsertRecipient([]);
				await axios
					.post(BASE_URL + ApiEntity.RECIPIENT, body, {
						headers: {
							Accept: 'application/vnd.api+json',
							'Content-Type': 'application/vnd.api+json',
							'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
							Authorization: token ? `Bearer ${token}` : undefined,
						},
						responseType: 'json',
					})
					.then((payload: any) => {
						//console.log('getShareLinks read', payload);
						if (payload.data.recipients && payload.data.recipients.length > 0) {
							setNewRecipients(false);
							setRecipientInit(false);
							setRecipients(
								payload.data.recipients.map((recipient: Recipient) => {
									return {
										id: recipient.id,
										fullname: recipient.fullname,
										email: recipient.email,
										customMessage: recipient.customMessage,
										position: recipient.position,
										action: recipient.action,
										recipientKey: recipient.recipientKey,
									};
								})
							);
							let idArr = payload.data.recipients.map(
								(recipient: Recipient) => {
									return parseInt(
										recipient.id ? recipient.id?.toString() : '0',
										10
									);
								}
							);
							let idTmp = Math.max(...idArr);
							setId(idTmp);
							setDataLoad(false);
						} else {
							setRecipientInit(true);
							setId(0);
							setRecipients([
								{
									id: 0,
									fullname: '',
									email: '',
									customMessage: '',
									position: 1,
									action: ShareLinkViewText.SIGN,
									recipientKey: '',
								},
							]);
							setDataLoad(false);
						}
					});
			};
			getRecipients();
		}
		return () => {
			isMounted = false;
		};
	}, [refreshRecipients]);
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
				.post(BASE_URL + ApiEntity.RECIPIENT, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': apiKey, //process.env.SENDFORSIGN_API_KEY,
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					setSendLoad(false);
					setNewRecipients(false);
					handleCancel();
					if (payload.data.result) {
						setResultModal({ open: true, action: ContractAction.SEND });
						setRefreshEvent(refreshEvent + 1);
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
		if (
			!changeRecipient.find(
				(recipient) => recipient.id === recipientsTmp[index].id
			) &&
			recipientsTmp[index].recipientKey
		) {
			changeRecipient.push(recipientsTmp[index]);
			setChangeRecipient(changeRecipient);
		}
	};
	const handleClick = (e: any, index: number) => {
		let recipientsTmp = [...recipients];
		recipientsTmp[index].action = e;
		setRecipients(recipientsTmp);
		if (recipientsTmp[index].recipientKey) {
			if (
				!changeRecipient.find(
					(recipient) => recipient.id === recipientsTmp[index].id
				) &&
				recipientsTmp[index].recipientKey
			) {
				changeRecipient.push(recipientsTmp[index]);
				setChangeRecipient(changeRecipient);
			}
		} else {
		}
	};
	const handleChangePosition = (e: any, index: number) => {
		let recipientsTmp = [...recipients];
		recipientsTmp[index].position = e;
		setRecipients(recipientsTmp);
		if (
			!changeRecipient.find(
				(recipient) => recipient.id === recipientsTmp[index].id
			) &&
			recipientsTmp[index].recipientKey
		) {
			changeRecipient.push(recipientsTmp[index]);
			setChangeRecipient(changeRecipient);
		}
	};
	const saveRecipient = async () => {
		if (changeRecipient.length > 0) {
			for (let index = 0; index < changeRecipient.length; index++) {
				const recipientFind = recipients.find(
					(recipient) => recipient.id === changeRecipient[index].id
				);
				if (recipientFind) {
					const body = {
						data: {
							action: Action.UPDATE,
							clientKey: clientKey,
							userKey: userKey,
							contractKey: contractKey,
							recipient: {
								recipientKey: recipientFind.recipientKey,
								fullname: recipientFind.fullname,
								email: recipientFind.email,
							},
						},
					};
					await axios
						.post(BASE_URL + ApiEntity.RECIPIENT, body, {
							headers: {
								Accept: 'application/vnd.api+json',
								'Content-Type': 'application/vnd.api+json',
								'x-sendforsign-key': apiKey, //process.env.SENDFORSIGN_API_KEY,
							},
							responseType: 'json',
						})
						.then((payload: any) => {});
				}
			}
		}
		if (deleteRecipient.length > 0) {
			for (let index = 0; index < deleteRecipient.length; index++) {
				const body = {
					data: {
						action: Action.DELETE,
						clientKey: clientKey,
						userKey: userKey,
						contractKey: contractKey,
						recipient: {
							recipientKey: deleteRecipient[index].recipientKey,
						},
					},
				};
				await axios
					.post(BASE_URL + ApiEntity.RECIPIENT, body, {
						headers: {
							Accept: 'application/vnd.api+json',
							'Content-Type': 'application/vnd.api+json',
							'x-sendforsign-key': apiKey, //process.env.SENDFORSIGN_API_KEY,
						},
						responseType: 'json',
					})
					.then((payload: any) => {});
			}
		}
		if (insertRecipient.length > 0) {
			for (let index = 0; index < insertRecipient.length; index++) {
				const recipientFind = recipients.find(
					(recipient) => recipient.id === insertRecipient[index].id
				);
				if (recipientFind) {
					const body = {
						data: {
							action: Action.CREATE,
							clientKey: clientKey,
							userKey: userKey,
							contractKey: contractKey,
							recipient: {
								id: recipientFind.id,
								fullname: recipientFind.fullname,
								email: recipientFind.email,
								customMessage: recipientFind.customMessage,
								position: recipientFind.position,
								action: recipientFind.action,
								recipientKey: '',
							},
						},
					};
					await axios
						.post(BASE_URL + ApiEntity.RECIPIENT, body, {
							headers: {
								Accept: 'application/vnd.api+json',
								'Content-Type': 'application/vnd.api+json',
								'x-sendforsign-key': apiKey, //process.env.SENDFORSIGN_API_KEY,
							},
							responseType: 'json',
						})
						.then((payload: any) => {});
				}
			}
		}
	};
	const handleCancel = () => {
		setRecipients([
			{
				id: 0,
				fullname: '',
				email: '',
				customMessage: '',
				position: 1,
				action: ShareLinkViewText.SIGN,
				recipientKey: '',
			},
		]);
		if (newRecipients) {
			saveRecipient();
		}
		setSendModal(false);
	};
	const handleDelete = (index: number) => {
		let recipientsTmp = [...recipients];
		if (recipientsTmp[index].recipientKey) {
			deleteRecipient.push(recipients[index]);
			setDeleteRecipient(deleteRecipient);
		}

		recipientsTmp.splice(index, 1);
		setRecipients(recipientsTmp);
	};
	const handleInsert = () => {
		debugger;
		let recipientsTmp = [...recipients];
		let idTmp = id + 1;
		setId(idTmp);
		recipientsTmp.push({
			id: idTmp,
			position: 1,
			action: ShareLinkViewText.SIGN,
			recipientKey: '',
			fullname: '',
			email: '',
			customMessage: '',
		});
		setRecipients(recipientsTmp);
		insertRecipient.push({
			id: idTmp,
			position: 1,
			action: ShareLinkViewText.SIGN,
			recipientKey: '',
			fullname: '',
			email: '',
			customMessage: '',
		});
		setInsertRecipient(insertRecipient);
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
					{recipientInit && (
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
					)}
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
							<Card loading={dataLoad} key={`SendModal${contractKey}`}>
								<Row
									wrap={false}
									align='middle'
									style={{ margin: '0 0 16px 0' }}
								>
									<Col flex='auto'>
										<Space direction='vertical' size={2}>
											<Title level={5} style={{ margin: '0 0 0 0' }}>
												Recipient
											</Title>
										</Space>
									</Col>
									<Col flex='46px' hidden>
										<Tooltip title='Internal recipient.'>
											<div>
												<Switch
													checkedChildren={<FontAwesomeIcon icon={faCheck} />}
													unCheckedChildren={
														<FontAwesomeIcon icon={faHouseUser} />
													}
												/>
											</div>
										</Tooltip>
									</Col>
								</Row>
								<Row wrap={false} style={{ margin: '16px 0' }}>
									<Col flex='auto'>
										<Input
											id={`FullName`}
											placeholder="Recipient's full name"
											value={recipient.fullname}
											onChange={(e: any) => handleChange(e, index)}
										/>
									</Col>
									<Col flex='8px' />
									<Col flex='auto'>
										<Input
											id={`Email`}
											placeholder="Recipient's email"
											value={recipient.email}
											onChange={(e: any) => handleChange(e, index)}
										/>
									</Col>
								</Row>
								<Row wrap={false} style={{ margin: '16px 0' }}>
									<Col flex='auto'>
										<Input
											id={`CustomMessage`}
											placeholder='Private note; leave empty for the default message'
											value={recipient.customMessage}
											onChange={(e: any) => handleChange(e, index)}
										/>
									</Col>
									<Col flex='8px' />
									<Col>
										<Tooltip title='Set signing order.'>
											<div>
												<InputNumber
													min={1}
													max={10}
													style={{ width: '56px' }}
													value={recipient.position}
													onChange={(e: any) => handleChangePosition(e, index)}
												/>
											</div>
										</Tooltip>
									</Col>
								</Row>
								{/* <Row wrap={false} align="middle" style={{ margin: "32px 0" }}>
                  <Col flex="auto">
                    <Button block icon={<FontAwesomeIcon icon={faSignature} />}>
                      Sign
                    </Button>
                  </Col>
                  <Col flex="8px" />
                  <Col flex="auto">
                    <Button block icon={<FontAwesomeIcon icon={faStamp} />}>
                      Approve
                    </Button>
                  </Col>
                </Row> */}
								<Row wrap={false} style={{ margin: '16px 0 0 0' }}>
									<Col>
										<Spin spinning={false}>
											<Tooltip title="Set what recipient needs to do with the document or lock so they can't open it.">
												<div>
													<Segmented
														id={`Segmented${index}`}
														value={recipient.action}
														options={options}
														onChange={(e: any) => handleClick(e, index)}
													/>
												</div>
											</Tooltip>
										</Spin>
									</Col>
									<Col flex='auto'></Col>
									<Col flex='32px' hidden>
										<Tooltip title='Send personal request.'>
											<div>
												<Button
													type='text'
													icon={<FontAwesomeIcon icon={faPaperPlane} />}
												/>
											</div>
										</Tooltip>
									</Col>
									<Col flex='32px' hidden>
										<Tooltip title='Copy sharing link.'>
											<div>
												<Button
													type='text'
													icon={<FontAwesomeIcon icon={faLink} />}
												/>
											</div>
										</Tooltip>
									</Col>
									{index !== 0 && (
										<Col flex='32px'>
											<Tooltip title='Delete recipient.'>
												<div>
													<Button
														type='text'
														icon={<FontAwesomeIcon icon={faTrash} />}
														onClick={() => handleDelete(index)}
													/>
												</div>
											</Tooltip>
										</Col>
									)}
								</Row>
							</Card>
						);
					})}
				<Button loading={dataLoad} type='dashed' block onClick={handleInsert}>
					Add recipient
				</Button>
			</Space>
		</Modal>
	);
};
