import React, { useEffect, useRef, useState } from 'react';
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
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faCheck,
	faHouseUser,
	faLink,
	faLock,
	faPaperPlane,
	faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { useContractEditorContext } from '../contract-editor-context';
import {
	Action,
	ApiEntity,
	ContractAction,
	PlaceholderColor,
	ShareLinkViewText,
} from '../../../config/enum';
import axios from 'axios';
import { BASE_URL, SHARE_URL } from '../../../config/config';
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
		placeholder,
		isPdf,
		refreshEvent,
		setRefreshPlaceholders,
		refreshPlaceholders,
		refreshRecipients,
		setRefreshEvent,
		setResultModal,
		setNotification,
	} = useContractEditorContext();
	const [sendLoad, setSendLoad] = useState(false);
	const [dataLoad, setDataLoad] = useState(false);
	const [saveLoad, setSaveLoad] = useState(false);
	const [insertRecipient, setInsertRecipient] = useState<Recipient[]>([]);
	const [updateRecipient, setUpdateRecipient] = useState<Recipient[]>([]);
	const [deleteRecipient, setDeleteRecipient] = useState<Recipient[]>([]);
	const [recipients, setRecipients] = useState<Recipient[]>([]);
	const [id, setId] = useState(0);
	const [recipientInit, setRecipientInit] = useState(false);
	const [load, setLoad] = useState(false);
	const isSave = useRef(false);
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
					clientKey: !token ? clientKey : undefined,
					userKey: userKey,
					contractKey: contractKey,
					getShareLinks: true,
				},
			};
			setDataLoad(true);
			const getRecipients = async () => {
				setUpdateRecipient([]);
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
										shareLink: recipient.shareLink,
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
						setLoad(false);
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
			getRecipients();
		}
		return () => {
			isMounted = false;
		};
	}, [refreshRecipients]);

	useEffect(() => {
		if (sendModal) {
			setLoad(true);
		}
	}, [sendModal]);

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
					clientKey: !token ? clientKey : undefined,
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
						'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
						Authorization: token ? `Bearer ${token}` : undefined,
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					isSave.current = true;
					setSendLoad(false);
					handleCancel();
					if (payload.data.result) {
						setResultModal({ open: true, action: ContractAction.SEND });
						setRefreshEvent(refreshEvent + 1);
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
		}
	};
	const handleSendOne = async (index: number) => {
		let recipientsTmp: Recipient[] = [];
		recipientsTmp.push(recipients[index]);
		const body = {
			data: {
				action: Action.SEND,
				clientKey: !token ? clientKey : undefined,
				userKey: userKey,
				contractKey: contractKey,
				recipients: recipientsTmp,
			},
		};
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
				setSendLoad(false);
				handleCancel();
				if (payload.data.result) {
					setResultModal({ open: true, action: ContractAction.SEND });
					setRefreshEvent(refreshEvent + 1);
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
			!updateRecipient.find(
				(recipient) => recipient.id === recipientsTmp[index].id
			) &&
			recipientsTmp[index].recipientKey
		) {
			updateRecipient.push(recipientsTmp[index]);
			setUpdateRecipient(updateRecipient);
		}
	};
	const handleClick = (e: any, index: number) => {
		let recipientsTmp = [...recipients];
		recipientsTmp[index].action = e;
		setRecipients(recipientsTmp);
		if (recipientsTmp[index].recipientKey) {
			if (
				!updateRecipient.find(
					(recipient) => recipient.id === recipientsTmp[index].id
				) &&
				recipientsTmp[index].recipientKey
			) {
				updateRecipient.push(recipientsTmp[index]);
				setUpdateRecipient(updateRecipient);
			}
		} else {
		}
	};
	const handleChangePosition = (e: any, index: number) => {
		let recipientsTmp = [...recipients];
		recipientsTmp[index].position = e;
		setRecipients(recipientsTmp);
		if (
			!updateRecipient.find(
				(recipient) => recipient.id === recipientsTmp[index].id
			) &&
			recipientsTmp[index].recipientKey
		) {
			updateRecipient.push(recipientsTmp[index]);
			setUpdateRecipient(updateRecipient);
		}
	};
	const handleSaveAndClose = async () => {
		if (updateRecipient.length > 0) {
			for (let index = 0; index < updateRecipient.length; index++) {
				const recipientFind = recipients.find(
					(recipient) => recipient.id === updateRecipient[index].id
				);
				if (recipientFind) {
					setSaveLoad(true);
					const body = {
						data: {
							action: Action.UPDATE,
							clientKey: !token ? clientKey : undefined,
							userKey: userKey,
							contractKey: contractKey,
							recipient: {
								recipientKey: recipientFind.recipientKey,
								fullname: recipientFind.fullname,
								email: recipientFind.email,
								customMessage: recipientFind.customMessage,
								action: recipientFind.action,
								position: recipientFind.position,
							},
						},
					};
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
						.then((payload: any) => {})
						.catch((error) => {
							isSave.current = true;
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
		}
		if (deleteRecipient.length > 0) {
			setSaveLoad(true);
			for (let index = 0; index < deleteRecipient.length; index++) {
				const body = {
					data: {
						action: Action.DELETE,
						clientKey: !token ? clientKey : undefined,
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
							'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
							Authorization: token ? `Bearer ${token}` : undefined,
						},
						responseType: 'json',
					})
					.then((payload: any) => {
						isSave.current = true;
						if (!isPdf) {
							removeClasses(deleteRecipient[index].recipientKey as string);
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
			}
		}
		if (insertRecipient.length > 0) {
			let insertTmp: Recipient[] = [];
			if (recipients[0] && !recipients[0].recipientKey) {
				insertTmp.push({
					id: recipients[0].id,
					fullname: recipients[0].fullname,
					email: recipients[0].email,
					customMessage: recipients[0].customMessage,
					position: recipients[0].position,
					action: recipients[0].action,
					recipientKey: '',
				});
			}
			for (let index = 0; index < insertRecipient.length; index++) {
				const recipientFind = recipients.find(
					(recipient) => recipient.id === insertRecipient[index].id
				);
				if (recipientFind) {
					insertTmp.push(recipientFind);
				}
			}
			if (insertTmp.length > 0) {
				setSaveLoad(true);
				const body = {
					data: {
						action: Action.CREATE,
						clientKey: !token ? clientKey : undefined,
						userKey: userKey,
						contractKey: contractKey,
						recipients: insertTmp,
					},
				};
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
						isSave.current = true;
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
		if (
			recipients.length === 1 &&
			recipientInit &&
			updateRecipient.length === 0 &&
			deleteRecipient.length === 0 &&
			insertRecipient.length === 0
		) {
			setSaveLoad(true);
			const body = {
				data: {
					action: Action.CREATE,
					clientKey: !token ? clientKey : undefined,
					userKey: userKey,
					contractKey: contractKey,
					recipients: [
						{
							id: recipients[0].id,
							fullname: recipients[0].fullname,
							email: recipients[0].email,
							customMessage: recipients[0].customMessage,
							position: recipients[0].position,
							action: recipients[0].action,
							recipientKey: '',
						},
					],
				},
			};
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
					isSave.current = true;
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
		handleCancel();
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
		// debugger;
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
	const handleCopyShareLink = () => {
		setNotification({
			text: 'Sharing link copied.',
		});
	};
	const removeClasses = (recipientKey: string) => {
		const placeholderFilter = placeholder.filter(
			(holder) => holder.externalRecipientKey === recipientKey
		);
		if (placeholderFilter) {
			for (let i = 0; i < placeholderFilter.length; i++) {
				const elements = document.getElementsByTagName(
					`placeholder${placeholderFilter[i].id}`
				);
				for (let i = 0; i < elements.length; i++) {
					let element: any = elements[i];
					element.style.background = PlaceholderColor.OTHER;
				}
			}
		}
	};
	const handleCancel = () => {
		setSaveLoad(false);
		setRecipients([]);
		if (isSave.current) {
			setRefreshPlaceholders(refreshPlaceholders + 1);
			isSave.current = false;
		}
		setSendModal(false);
	};
	return (
		<Modal
			key={`SendModal${contractKey}`}
			title='Send this document'
			open={sendModal}
			centered
			onCancel={handleCancel}
			footer={
				<>
					<Button key='cancel' onClick={handleCancel}>
						Cancel
					</Button>
					<Button
						loading={saveLoad}
						key='saveAndClose'
						onClick={handleSaveAndClose}
					>
						Save & Close
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
			{load ? (
				<Space
					direction='vertical'
					size='large'
					style={{ display: 'flex', margin: '32px 0 32px 0' }}
				>
					<Card loading={load}>
						<Row wrap={false} align='middle' style={{ margin: '0 0 16px 0' }}>
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
											unCheckedChildren={<FontAwesomeIcon icon={faHouseUser} />}
										/>
									</div>
								</Tooltip>
							</Col>
						</Row>
						<Row wrap={false} style={{ margin: '16px 0' }}>
							<Col flex='auto'>
								<Input id={`FullName`} placeholder="Recipient's full name" />
							</Col>
							<Col flex='8px' />
							<Col flex='auto'>
								<Input id={`Email`} placeholder="Recipient's email" />
							</Col>
						</Row>
						<Row wrap={false} style={{ margin: '16px 0' }}>
							<Col flex='auto'>
								<Input
									id={`CustomMessage`}
									placeholder='Private note; leave empty for the default message'
									value={''}
								/>
							</Col>
							{/* <Col flex='8px' />
							<Col>
								<Tooltip title='Set signing order.'>
									<div>
										<InputNumber min={1} max={10} style={{ width: '56px' }} />
									</div>
								</Tooltip>
							</Col> */}
						</Row>
					</Card>
				</Space>
			) : (
				<Space
					direction='vertical'
					size='large'
					style={{ display: 'flex', margin: '32px 0 32px 0' }}
				>
					{recipients &&
						recipients.length > 0 &&
						recipients.map((recipient, index) => {
							return (
								<Card loading={dataLoad}>
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
										{/* <Col flex='8px' />
										<Col>
											<Tooltip title='Set signing order.'>
												<div>
													<InputNumber
														min={1}
														max={10}
														style={{ width: '56px' }}
														value={recipient.position}
														onChange={(e: any) =>
															handleChangePosition(e, index)
														}
													/>
												</div>
											</Tooltip>
										</Col> */}
									</Row>
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
										{recipient.shareLink && (
											<>
												<Col flex='32px'>
													<Tooltip title='Send personal request.'>
														<div>
															<Button
																type='text'
																icon={<FontAwesomeIcon icon={faPaperPlane} />}
																onClick={(e: any) => handleSendOne(index)}
															/>
														</div>
													</Tooltip>
												</Col>
												<Col flex='32px'>
													<CopyToClipboard
														text={`${SHARE_URL}/sharing/${recipient.shareLink}`}
														children={
															<Tooltip title='Copy sharing link.'>
																<div>
																	<Button
																		type='text'
																		icon={<FontAwesomeIcon icon={faLink} />}
																		onClick={handleCopyShareLink}
																	/>
																</div>
															</Tooltip>
														}
													/>
												</Col>
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
											</>
										)}
										{/* {index !== 0 && ( */}
										{/* )} */}
									</Row>
								</Card>
							);
						})}
					<Button loading={dataLoad} type='dashed' block onClick={handleInsert}>
						Add recipient
					</Button>
				</Space>
			)}
		</Modal>
	);
};
