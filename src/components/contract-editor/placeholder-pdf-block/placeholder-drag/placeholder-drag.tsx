import React, { useEffect, useRef, useState } from 'react';
import {
	Space,
	Card,
	Typography,
	Button,
	Input,
	Radio,
	Row,
	Tooltip,
	Col,
	Popover,
	Divider,
} from 'antd';
import { useContractEditorContext } from '../../contract-editor-context';
import { BASE_URL } from '../../../../config/config';
import {
	Action,
	ApiEntity,
	ContractType,
	PlaceholderFill,
	PlaceholderTypeText,
	PlaceholderView,
} from '../../../../config/enum';
import axios from 'axios';
import { Placeholder, Recipient } from '../../../../config/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faCircleQuestion,
	faFont,
	faGear,
	faSignature,
} from '@fortawesome/free-solid-svg-icons';
import { useDrag } from 'react-dnd';

type Props = {
	readonly?: boolean;
	placeholder: Placeholder;
	recipients?: Recipient[];
	onChange?: (data: any) => void;
	onDelete?: (data: any) => void;
};

export const PlaceholderDrag = ({
	readonly,
	placeholder,
	recipients,
	onChange,
	onDelete,
}: Props) => {
	const currPlaceholder = useRef<Placeholder>(placeholder);
	const {
		apiKey,
		userKey,
		token,
		// 	readonly,
		// 	contractType,
		contractKey,
		clientKey,
		// 	placeholder,
		// 	continueLoad,
		// 	setPlaceholder,
		setPlaceholderPdf,
		// 	refreshPlaceholders,
		// 	placeholderVisible,
		// 	refreshPlaceholderRecipients,
		setNotification,
		// 	contractPlaceholderCount,
		// 	setContractPlaceholderCount,
		// 	signs,
	} = useContractEditorContext();
	// const [currPlaceholder, setCurrPlaceholder] = useState(refreshPlaceholders);
	// const [placeholderLoad, setPlaceholderLoad] = useState(false);
	// const [placeholderRecipients, setPlaceholderRecipients] = useState<
	// 	Recipient[]
	// >([]);
	// const [delLoad, setDelLoad] = useState(false);
	// const readonlyCurrent = useRef(false);
	// // const [chosePlaceholder, setChosePlaceholder] = useState<Placeholder>({});
	// const chosePlaceholder = useRef<Placeholder>({});

	const { Title, Text } = Typography;
	const [, drag] = useDrag(
		() => ({
			type: `chosePlaceholder`,
			item: { chosePlaceholder: currPlaceholder.current },
			collect: (monitor) => ({
				isDragging: !!monitor.isDragging(),
				canDrag: !readonly,
			}),
		}),
		[currPlaceholder.current]
	);
	// const getPlaceholders = async (load = true) => {
	// 	//console.log('PlaceholderBlock');
	// 	if (load) {
	// 		setPlaceholderLoad(true);
	// 	}
	// 	const body = {
	// 		data: {
	// 			action: Action.LIST,
	// 			clientKey: !token ? clientKey : undefined,
	// 			contractKey: contractKey,
	// 		},
	// 	};
	// 	await axios
	// 		.post(BASE_URL + ApiEntity.PLACEHOLDER, body, {
	// 			headers: {
	// 				Accept: 'application/vnd.api+json',
	// 				'Content-Type': 'application/vnd.api+json',
	// 				'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
	// 				Authorization: token ? `Bearer ${token}` : undefined,
	// 			},
	// 			responseType: 'json',
	// 		})
	// 		.then((payload: any) => {
	// 			//console.log('getPlaceholders read', payload);

	// 			if (payload.data.placeholders && payload.data.placeholders.length > 0) {
	// 				let placeholderTmp: Placeholder[] = [];
	// 				for (
	// 					let index = 0;
	// 					index < payload.data.placeholders.length;
	// 					index++
	// 				) {
	// 					placeholderTmp.push(payload.data.placeholders[index]);
	// 				}
	// 				setPlaceholder(placeholderTmp);
	// 				setContractPlaceholderCount(placeholderTmp.length);
	// 			} else {
	// 				setContractPlaceholderCount(0);
	// 			}
	// 			if (load) {
	// 				setPlaceholderLoad(false);
	// 			}
	// 		})
	// 		.catch((error) => {
	// 			setNotification({
	// 				text:
	// 					error.response && error.response.data && error.response.data.message
	// 						? error.response.data.message
	// 						: error.message,
	// 			});
	// 		});
	// };
	// const getRecipients = async () => {
	// 	const body = {
	// 		data: {
	// 			action: Action.LIST,
	// 			clientKey: !token ? clientKey : undefined,
	// 			userKey: userKey,
	// 			contractKey: contractKey,
	// 			// getShareLinks: true,
	// 		},
	// 	};
	// 	await axios
	// 		.post(BASE_URL + ApiEntity.RECIPIENT, body, {
	// 			headers: {
	// 				Accept: 'application/vnd.api+json',
	// 				'Content-Type': 'application/vnd.api+json',
	// 				'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
	// 				Authorization: token ? `Bearer ${token}` : undefined,
	// 			},
	// 			responseType: 'json',
	// 		})
	// 		.then((payload: any) => {
	// 			//console.log('getShareLinks read', payload);
	// 			if (payload.data.recipients && payload.data.recipients.length > 0) {
	// 				setPlaceholderRecipients(
	// 					payload.data.recipients.map((recipient: Recipient) => {
	// 						return {
	// 							id: recipient.id,
	// 							fullname: recipient.fullname,
	// 							email: recipient.email,
	// 							customMessage: recipient.customMessage,
	// 							position: recipient.position,
	// 							action: recipient.action,
	// 							recipientKey: recipient.recipientKey,
	// 						};
	// 					})
	// 				);
	// 			}
	// 		})
	// 		.catch((error) => {
	// 			setNotification({
	// 				text:
	// 					error.response && error.response.data && error.response.data.message
	// 						? error.response.data.message
	// 						: error.message,
	// 			});
	// 		});
	// };
	// useEffect(() => {
	// 	let isMounted = true;
	// 	if (
	// 		contractType.toString() === ContractType.PDF.toString() &&
	// 		contractKey &&
	// 		(clientKey || token)
	// 	) {
	// 		getRecipients();
	// 	}
	// 	return () => {
	// 		isMounted = false;
	// 	};
	// }, [refreshPlaceholderRecipients]);

	// useEffect(() => {
	// 	let isMounted = true;
	// 	if (
	// 		contractType.toString() === ContractType.PDF.toString() &&
	// 		contractKey &&
	// 		(clientKey || token) &&
	// 		placeholderVisible &&
	// 		(currPlaceholder !== refreshPlaceholders ||
	// 			!placeholder ||
	// 			placeholder.length === 0)
	// 	) {
	// 		setCurrPlaceholder(refreshPlaceholders);
	// 		getRecipients();
	// 		getPlaceholders();
	// 	}
	// 	return () => {
	// 		isMounted = false;
	// 	};
	// }, [refreshPlaceholders, placeholderVisible]);
	// useEffect(() => {
	// 	if (signs && signs.length > 0) {
	// 		readonlyCurrent.current = true;
	// 	}
	// }, [signs]);

	// const handleAddPlaceholder = async () => {
	// 	let placeholdersTmp = [...placeholder];
	// 	placeholdersTmp.push({
	// 		name: `Name${contractPlaceholderCount + 1}`,
	// 		value: '',
	// 		type: PlaceholderTypeText.INTERNAL,
	// 		fillingType: PlaceholderFill.NONE,
	// 	});

	// 	setPlaceholder(placeholdersTmp);

	// 	let body = {
	// 		data: {
	// 			action: Action.CREATE,
	// 			clientKey: !token ? clientKey : undefined,
	// 			contractKey: contractKey,
	// 			placeholder: {
	// 				name: `Name${placeholdersTmp.length}`,
	// 				value: '',
	// 				type: PlaceholderTypeText.INTERNAL,
	// 			},
	// 		},
	// 	};
	// 	await axios
	// 		.post(BASE_URL + ApiEntity.PLACEHOLDER, body, {
	// 			headers: {
	// 				Accept: 'application/vnd.api+json',
	// 				'Content-Type': 'application/vnd.api+json',
	// 				'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
	// 				Authorization: token ? `Bearer ${token}` : undefined,
	// 			},
	// 			responseType: 'json',
	// 		})
	// 		.then((payload: any) => {
	// 			//console.log('PLACEHOLDER read', payload);
	// 			// setRefreshPlaceholders(refreshPlaceholders + 1);
	// 			getPlaceholders(false);
	// 		})
	// 		.catch((error) => {
	// 			setNotification({
	// 				text:
	// 					error.response && error.response.data && error.response.data.message
	// 						? error.response.data.message
	// 						: error.message,
	// 			});
	// 		});
	// };
	const handleInsertPlaceholder = () => {
		setPlaceholderPdf(currPlaceholder.current);
	};
	const handleDeletePlaceholder = async () => {
		// let placeholdersTmp = [...placeholder];

		let body = {
			data: {
				action: Action.DELETE,
				clientKey: !token ? clientKey : undefined,
				contractKey: contractKey,
				placeholder: {
					placeholderKey: currPlaceholder.current.placeholderKey,
				},
			},
		};
		await axios
			.post(BASE_URL + ApiEntity.PLACEHOLDER, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
					Authorization: token ? `Bearer ${token}` : undefined,
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				if (onDelete) {
					onDelete({ placeholder: currPlaceholder.current });
				}
				//console.log('PLACEHOLDER read', payload);
				// placeholdersTmp.splice(index, 1);
				// setPlaceholder(placeholdersTmp);
				// // setRefreshPlaceholders(refreshPlaceholders + 1);
				// getPlaceholders(false);
				// setDelLoad(false);
			})
			.catch((error) => {
				setNotification({
					text:
						error.response && error.response.data && error.response.data.message
							? error.response.data.message
							: error.message,
				});
				// setDelLoad(false);
			});
	};
	const handleChange = (e: any) => {
		// let placeholderTmp = [...placeholder];
		switch (e.target.id) {
			case 'PlaceholderName':
				currPlaceholder.current.name = e.target.value;

				break;

			case 'PlaceholderValue':
				currPlaceholder.current.value = e.target.value;

				break;
		}
		if (onChange) {
			onChange({ placeholder: currPlaceholder.current });
		}
		// 	setPlaceholder(placeholderTmp);
	};
	const handleBlur = async (e: any) => {
		switch (e.target.id) {
			case 'PlaceholderName':
				// let placeholdersTmp = [...placeholder];
				let body = {
					data: {
						action: Action.UPDATE,
						clientKey: !token ? clientKey : undefined,
						contractKey: contractKey,
						placeholder: {
							placeholderKey: currPlaceholder.current.placeholderKey,
							name: currPlaceholder.current.name,
						},
					},
				};
				await axios
					.post(BASE_URL + ApiEntity.PLACEHOLDER, body, {
						headers: {
							Accept: 'application/vnd.api+json',
							'Content-Type': 'application/vnd.api+json',
							'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
							Authorization: token ? `Bearer ${token}` : undefined,
						},
						responseType: 'json',
					})
					.then((payload: any) => {
						//console.log('PLACEHOLDER read', payload);
						// setRefreshPlaceholders(refreshPlaceholders + 1);
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
				break;
			case 'PlaceholderValue':
				changeValue();
				break;
		}
	};
	const changeValue = async () => {
		// let placeholdersTmp = [...placeholder];

		let body = {
			data: {
				action: Action.UPDATE,
				clientKey: !token ? clientKey : undefined,
				contractKey: contractKey,
				placeholder: {
					placeholderKey: currPlaceholder.current.placeholderKey,
					value: currPlaceholder.current.value,
				},
			},
		};
		await axios
			.post(BASE_URL + ApiEntity.PLACEHOLDER, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
					Authorization: token ? `Bearer ${token}` : undefined,
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				//console.log('PLACEHOLDER read', payload);
				// setRefreshPlaceholders(refreshPlaceholders + 1);
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
	// const handleClick = (e: any, index: number) => {
	// 	let placeholderTmp = [...placeholder];
	// 	placeholderTmp[index].type = e;
	// 	setPlaceholder(placeholderTmp);
	// };
	const handleEnter = () => {
		changeValue();
	};
	const handleChangeFilling = async (e: any) => {
		// console.log('handleChangeFilling', e);

		// let placeholderTmp = [...placeholder];
		let body = {
			data: {
				action: Action.UPDATE,
				clientKey: !token ? clientKey : undefined,
				contractKey: contractKey,
				placeholder: {
					placeholderKey: currPlaceholder.current.placeholderKey,
					fillingType: 1,
					externalRecipientKey: undefined,
				},
			},
		};
		if (
			e.target.value.toString() === PlaceholderFill.NONE.toString() ||
			e.target.value.toString() === PlaceholderFill.CREATOR.toString() ||
			e.target.value.toString() === PlaceholderFill.ANY.toString()
		) {
			currPlaceholder.current.fillingType = e.target.value;
			body.data.placeholder.fillingType = e.target.value;
			currPlaceholder.current.externalRecipientKey = undefined;
			body.data.placeholder.externalRecipientKey = undefined;
		} else {
			currPlaceholder.current.fillingType = PlaceholderFill.SPECIFIC;
			currPlaceholder.current.externalRecipientKey = e.target.value;
			body.data.placeholder.fillingType = PlaceholderFill.SPECIFIC;
			body.data.placeholder.externalRecipientKey = e.target.value;
		}
		if (onChange) {
			onChange({ placeholder: currPlaceholder.current });
		}
		// setPlaceholder(placeholderTmp);
		await axios
			.post(BASE_URL + ApiEntity.PLACEHOLDER, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
					Authorization: token ? `Bearer ${token}` : undefined,
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				//console.log('PLACEHOLDER read', payload);
				// setRefreshPlaceholders(refreshPlaceholders + 1);
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
	// console.log('readonly', readonly);
	return (
		<div
			id={`placeholder${currPlaceholder.current.placeholderKey?.replaceAll(
				'-',
				'_'
			)}`}
			ref={!readonly ? drag : undefined}
			// draggable={!readonlyCurrent.current}
			onDragStart={(e) => {
				e.dataTransfer.setData(
					'placeholderKey',
					currPlaceholder.current.placeholderKey as string
				);
				setPlaceholderPdf(currPlaceholder.current);
			}}
			role={'PlaceholderBlock'}
		>
			<Space
				// id={`placeholder${holder?.placeholderKey?.replaceAll(
				// 	'-',
				// 	'_'
				// )}`}
				className='ph-style'
				// ref={drag}
				// onDragOver={(e) => {
				// 	e.preventDefault();
				// }}
				// onDragStart={(e) => {
				// 	e.dataTransfer.setData(
				// 		'placeholderKey',
				// 		holder.placeholderKey as string
				// 	);
				// 	setPlaceholderPdf(holder);
				// }}
				direction='vertical'
				size={2}
				style={{ display: 'flex' }}
				// key={holder.placeholderKey}
			>
				<Row wrap={false} align={'middle'}>
					<Col>
						<Tooltip title='Drop onto the document.'>
							<div>
								<Button
									size='small'
									type='text'
									style={{ cursor: 'grab' }}
									disabled={readonly}
									// onClick={() => {
									// 	chosePlaceholder.current = holder;
									// }}
									icon={
										<FontAwesomeIcon
											icon={
												currPlaceholder.current.view?.toString() !==
													PlaceholderView.SIGNATURE.toString()
													? faFont
													: faSignature
											}
											size='sm'
											onClick={() => {
												handleInsertPlaceholder();
											}}
										/>
									}
								/>
							</div>
						</Tooltip>
					</Col>
					<Col>
						<Input
							id='PlaceholderName'
							readOnly={
								currPlaceholder.current.view?.toString() !==
									PlaceholderView.SIGNATURE.toString() && !readonly
									? false
									: true
							}
							placeholder='Enter placeholder name'
							value={currPlaceholder.current.name}
							variant='borderless'
							onChange={(e: any) => handleChange(e)}
							onBlur={(e: any) => handleBlur(e)}
						/>
					</Col>
					<Col flex={'auto'}></Col>
					{currPlaceholder.current.view?.toString() !==
						PlaceholderView.SIGNATURE.toString() && (
						<Col flex='24px'>
							<Popover
								content={
									<Space direction='vertical' style={{ display: 'flex' }}>
										<Space>
											<Text type='secondary'>Who fills in this field:</Text>
											<Tooltip title='Set who fills in this field: a contract owner when creating a contract from this template or an external recipient when opening a contract.'>
												<div>
													<Button
														disabled={readonly}
														size='small'
														icon={
															<FontAwesomeIcon
																icon={faCircleQuestion}
																size='xs'
															/>
														}
														type='text'
													></Button>
												</div>
											</Tooltip>
										</Space>
										<Radio.Group
											size='small'
											value={
												currPlaceholder.current.fillingType &&
												currPlaceholder.current.fillingType.toString() !==
													PlaceholderFill.SPECIFIC.toString()
													? currPlaceholder.current.fillingType?.toString()
													: currPlaceholder.current.fillingType &&
													  currPlaceholder.current.fillingType.toString() ===
															PlaceholderFill.SPECIFIC.toString() &&
													  currPlaceholder.current.externalRecipientKey &&
													  recipients &&
													  recipients.length > 0
													? recipients.find((placeholderRecipient) =>
															placeholderRecipient.recipientKey?.includes(
																currPlaceholder.current
																	.externalRecipientKey as string
															)
													  )?.recipientKey
													: '1'
											}
											onChange={(e: any) => handleChangeFilling(e)}
										>
											<Space direction='vertical'>
												<Radio value={PlaceholderFill.NONE.toString()}>
													None
												</Radio>
												<Radio value={PlaceholderFill.CREATOR.toString()}>
													Contract owner
												</Radio>
												{recipients &&
													recipients.length > 0 &&
													recipients.map((placeholderRecipient) => {
														return (
															<Radio value={placeholderRecipient.recipientKey}>
																{placeholderRecipient.fullname}
															</Radio>
														);
													})}
											</Space>
										</Radio.Group>
										<Divider style={{ margin: 0 }} />
										<Button
											disabled={readonly}
											// loading={delLoad}
											block
											danger
											type='text'
											onClick={() => {
												handleDeletePlaceholder();
											}}
										>
											Delete
										</Button>
									</Space>
								}
								trigger='click'
							>
								<div>
									<Button
										disabled={readonly}
										size='small'
										type='text'
										icon={<FontAwesomeIcon icon={faGear} size='xs' />}
									/>
								</div>
							</Popover>
						</Col>
					)}
				</Row>
				{currPlaceholder.current.view?.toString() !==
					PlaceholderView.SIGNATURE.toString() && (
					<Input
						id='PlaceholderValue'
						placeholder='Enter value'
						readOnly={readonly}
						value={currPlaceholder.current.value}
						onChange={(e: any) => handleChange(e)}
						onBlur={(e: any) => handleBlur(e)}
						onPressEnter={() => handleEnter()}
					/>
				)}
			</Space>
		</div>
	);
};
