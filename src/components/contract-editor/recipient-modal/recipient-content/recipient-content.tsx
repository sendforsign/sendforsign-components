import React, { useEffect, useRef, useState } from 'react';
import {
	Space,
	Card,
	Typography,
	Button,
	Input,
	Tooltip,
	Spin,
	Segmented,
	Row,
	Col,
	Switch,
	Tag,
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
import { useContractEditorContext } from '../../contract-editor-context';
import {
	Action,
	ApiEntity,
	ContractAction,
	RecipientType,
	ShareLinkViewText,
} from '../../../../config/enum';
import { BASE_URL, SHARE_URL } from '../../../../config/config';
import { Recipient } from '../../../../config/types';
import axios from 'axios';

type Props = {
	isModal: boolean;
	load: boolean;
	recipients: Recipient[];
	handleInsert: () => void;
	handleChange: (e: any, index: number) => void;
	handleClick: (e: any, index: number) => void;
	handleCancel?: () => void;
	handleDelete?: (index: number) => void;
	handleChangeLoad?: (type: 'send' | 'data') => void;
};

export const RecipientContent = ({
	isModal = true,
	load,
	recipients,
	handleCancel,
	handleChange,
	handleClick,
	handleInsert,
	handleDelete,
	handleChangeLoad,
}: Props) => {
	const {
		apiKey,
		token,
		contractKey,
		clientKey,
		userKey,
		eventStatus,
		setEventStatus,
		refreshEvent,
		fullySigned,
		setRefreshEvent,
		setResultModal,
		setNotification,
	} = useContractEditorContext();
	const [defaultData, setDefaultData] = useState<{
		fullname?: string;
		email?: string;
	}>({});
	const options = [
		{ label: 'Sign', value: ShareLinkViewText.SIGN },
		{ label: 'Approve', value: ShareLinkViewText.APPROVE },
		{ label: 'View', value: ShareLinkViewText.VIEW },
		{
			value: ShareLinkViewText.LOCK,
			icon: <FontAwesomeIcon icon={faLock} />,
		},
	];
	const { Title } = Typography;

	// console.log('contractKey 8');
	useEffect(() => {
		let isMounted = true;
		const getEventStatus = async () => {
			await axios
				.get(BASE_URL + ApiEntity.EVENT_STATUS, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
						Authorization: token ? `Bearer ${token}` : undefined,
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					setEventStatus(payload.data);
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
		const getClientInfo = async () => {
			let body = {
				data: {
					action: Action.READ,
					clientKey: !token ? clientKey : undefined,
					userKey: userKey,
					client: {
						clientKey: clientKey ? clientKey : undefined,
					},
				},
			};
			await axios
				.post(BASE_URL + ApiEntity.CLIENT, body, {
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
					setDefaultData({
						fullname: payload.data.client.fullname,
						email: payload.data.client.email,
					});

					if (handleChangeLoad) {
						handleChangeLoad('data');
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
		if (load) {
			if (eventStatus && eventStatus.length === 0) {
				getEventStatus();
			}
			if (!defaultData.email && !defaultData.fullname) {
				getClientInfo();
			} else {
				if (handleChangeLoad) {
					handleChangeLoad('data');
				}
			}
		}
		return () => {
			isMounted = false;
		};
	}, [load]);

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
				if (handleChangeLoad) {
					handleChangeLoad('send');
				}
				if (handleCancel) {
					handleCancel();
				}
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

	const handleCopyShareLink = () => {
		setNotification({
			text: 'Sharing link copied.',
		});
	};
	return (
		<>
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
							<Col flex='46px'>
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
								<Card loading={load}
								style={{backgroundColor: '#00000005'}}>
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
										{recipient.isDone && (
											<Col flex='300px'>
												{recipient.action === ShareLinkViewText.VIEW && (
													<Tag
														color={
															eventStatus.find((status) =>
																status.id?.toString().includes('3')
															)?.color
														}
													>
														{
															eventStatus.find((status) =>
																status.id?.toString().includes('3')
															)?.name
														}
													</Tag>
												)}
												{recipient.action === ShareLinkViewText.APPROVE && (
													<Tag
														color={
															eventStatus.find((status) =>
																status.id?.toString().includes('4')
															)?.color
														}
													>
														{
															eventStatus.find((status) =>
																status.id?.toString().includes('4')
															)?.name
														}
													</Tag>
												)}
												{recipient.action === ShareLinkViewText.SIGN && (
													<Tag
														color={
															eventStatus.find((status) =>
																status.id?.toString().includes('5')
															)?.color
														}
													>
														{
															eventStatus.find((status) =>
																status.id?.toString().includes('5')
															)?.name
														}
													</Tag>
												)}
											</Col>
										)}
										<Col flex='46px'>
											<Tooltip title='Internal recipient.'>
												<div>
													<Switch
														id={`TypeSwitch`}
														checked={
															recipient.type?.toString() ===
															RecipientType.INTERNAL.toString()
														}
														disabled={recipient.isDone}
														checkedChildren={<FontAwesomeIcon icon={faCheck} />}
														unCheckedChildren={
															<FontAwesomeIcon icon={faHouseUser} />
														}
														onChange={(e: any) => {
															handleChange(
																{ target: { id: 'TypeSwitch', value: e } },
																index
															);
															if (!recipient.fullname && defaultData) {
																handleChange(
																	{
																		target: {
																			id: 'FullName',
																			value: defaultData.fullname,
																		},
																	},
																	index
																);
															}
															if (!recipient.email && defaultData) {
																handleChange(
																	{
																		target: {
																			id: 'Email',
																			value: defaultData.email,
																		},
																	},
																	index
																);
															}
														}}
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
												disabled={recipient.isDone}
											/>
										</Col>
										<Col flex='8px' />
										<Col flex='auto'>
											<Input
												id={`Email`}
												placeholder="Recipient's email"
												value={recipient.email}
												onChange={(e: any) => handleChange(e, index)}
												disabled={recipient.isDone}
											/>
										</Col>
									</Row>
									{isModal && (
										<Row wrap={false} style={{ margin: '16px 0' }}>
											<Col flex='auto'>
												<Input
													id={`CustomMessage`}
													placeholder='Private note; leave empty for the default message'
													value={recipient.customMessage}
													onChange={(e: any) => handleChange(e, index)}
												/>
											</Col>
										</Row>
									)}
									<Row wrap={false} style={{ margin: '16px 0 0 0' }}>
										<Col>
											<Spin spinning={false}>
												<Tooltip title="Set what recipient needs to do with the document or lock so they can't open it.">
													<div>
														<Segmented
															id={`Segmented${index}`}
															value={recipient.action}
															options={options}
															disabled={recipient.isDone}
															onChange={(e: any) => handleClick(e, index)}
														/>
													</div>
												</Tooltip>
											</Spin>
										</Col>
										<Col flex='auto'></Col>
										{recipient.shareLink && (
											<>
												{recipient.type === RecipientType.INTERNAL && (
													<Col>
														<Button
															key='actionIntoModal'
															type='primary'
															onClick={() => {
																const url = `${SHARE_URL}/sharing/${recipient.shareLink}`; // Replace with your desired URL
																window.open(url, '_blank');
															}}
														>
															{`${
																recipient.action === ShareLinkViewText.SIGN
																	? 'Sign'
																	: recipient.action ===
																	  ShareLinkViewText.APPROVE
																	? 'Approve'
																	: 'View'
															}`}
														</Button>
													</Col>
												)}
												<Col flex='auto'></Col>
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
											</>
										)}
										{!recipient.isDone && handleDelete && (
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
					<Button
						loading={load}
						disabled={fullySigned}
						type='dashed'
						block
						onClick={handleInsert}
					>
						Add recipient
					</Button>
				</Space>
			)}
		</>
	);
};
