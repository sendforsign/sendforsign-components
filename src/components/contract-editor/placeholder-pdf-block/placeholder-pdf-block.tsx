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
import { useContractEditorContext } from '../contract-editor-context';
import { BASE_URL } from '../../../config/config';
import {
	Action,
	ApiEntity,
	ContractType,
	PlaceholderFill,
	PlaceholderTypeText,
	PlaceholderView,
} from '../../../config/enum';
import axios from 'axios';
import { Placeholder, Recipient } from '../../../config/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faCircleQuestion,
	faFont,
	faGear,
	faSignature,
} from '@fortawesome/free-solid-svg-icons';
import { useDrag } from 'react-dnd';
import { PlaceholderDrag } from './placeholder-drag';

type Props = {
	// quillRef: React.MutableRefObject<QuillNamespace | undefined>;
};

export const PlaceholderPdfBlock = () => {
	const {
		apiKey,
		userKey,
		token,
		readonly,
		contractType,
		contractKey,
		clientKey,
		placeholder,
		continueLoad,
		setPlaceholder,
		setPlaceholderPdf,
		refreshPlaceholders,
		placeholderVisible,
		refreshPlaceholderRecipients,
		setNotification,
		contractPlaceholderCount,
		setContractPlaceholderCount,
		signs,
	} = useContractEditorContext();
	const [currPlaceholder, setCurrPlaceholder] = useState(refreshPlaceholders);
	const [placeholderLoad, setPlaceholderLoad] = useState(false);
	const [placeholderRecipients, setPlaceholderRecipients] = useState<
		Recipient[]
	>([]);
	const [delLoad, setDelLoad] = useState(false);
	const readonlyCurrent = useRef(false);
	// const [chosePlaceholder, setChosePlaceholder] = useState<Placeholder>({});
	const chosePlaceholder = useRef<Placeholder>({});

	const { Title, Text } = Typography;
	const [, drag] = useDrag(
		() => ({
			type: `chosePlaceholder`,
			item: { chosePlaceholder: chosePlaceholder.current },
			collect: (monitor) => ({
				isDragging: !!monitor.isDragging(),
				canDrag: !readonly,
			}),
		}),
		[chosePlaceholder.current]
	);
	const getPlaceholders = async (load = true) => {
		//console.log('PlaceholderBlock');
		if (load) {
			setPlaceholderLoad(true);
		}
		const body = {
			data: {
				action: Action.LIST,
				clientKey: !token ? clientKey : undefined,
				contractKey: contractKey,
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
				//console.log('getPlaceholders read', payload);

				if (payload.data.placeholders && payload.data.placeholders.length > 0) {
					let placeholderTmp: Placeholder[] = [];
					for (
						let index = 0;
						index < payload.data.placeholders.length;
						index++
					) {
						placeholderTmp.push(payload.data.placeholders[index]);
					}
					setPlaceholder(placeholderTmp);
					setContractPlaceholderCount(placeholderTmp.length);
				} else {
					setContractPlaceholderCount(0);
				}
				if (load) {
					setPlaceholderLoad(false);
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
	const getRecipients = async () => {
		const body = {
			data: {
				action: Action.LIST,
				clientKey: !token ? clientKey : undefined,
				userKey: userKey,
				contractKey: contractKey,
				// getShareLinks: true,
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
				//console.log('getShareLinks read', payload);
				if (payload.data.recipients && payload.data.recipients.length > 0) {
					setPlaceholderRecipients(
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
		let isMounted = true;
		if (
			contractType.toString() === ContractType.PDF.toString() &&
			contractKey &&
			(clientKey || token)
		) {
			getRecipients();
		}
		return () => {
			isMounted = false;
		};
	}, [refreshPlaceholderRecipients]);

	useEffect(() => {
		let isMounted = true;
		if (
			contractType.toString() === ContractType.PDF.toString() &&
			contractKey &&
			(clientKey || token) &&
			placeholderVisible &&
			(currPlaceholder !== refreshPlaceholders ||
				!placeholder ||
				placeholder.length === 0)
		) {
			setCurrPlaceholder(refreshPlaceholders);
			getRecipients();
			getPlaceholders();
		}
		return () => {
			isMounted = false;
		};
	}, [refreshPlaceholders, placeholderVisible]);
	useEffect(() => {
		if (signs && signs.length > 0) {
			readonlyCurrent.current = true;
		}
	}, [signs]);

	const handleAddPlaceholder = async () => {
		let placeholdersTmp = [...placeholder];
		placeholdersTmp.push({
			name: `Name${contractPlaceholderCount + 1}`,
			value: '',
			type: PlaceholderTypeText.INTERNAL,
			fillingType: PlaceholderFill.NONE,
		});

		setPlaceholder(placeholdersTmp);

		let body = {
			data: {
				action: Action.CREATE,
				clientKey: !token ? clientKey : undefined,
				contractKey: contractKey,
				placeholder: {
					name: `Name${placeholdersTmp.length}`,
					value: '',
					type: PlaceholderTypeText.INTERNAL,
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
				getPlaceholders(false);
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
	const handleInsertPlaceholder = (index: number) => {
		setPlaceholderPdf(placeholder[index]);
	};
	const handleDeletePlaceholder = async (index: number) => {
		let placeholdersTmp = [...placeholder];

		let body = {
			data: {
				action: Action.DELETE,
				clientKey: !token ? clientKey : undefined,
				contractKey: contractKey,
				placeholder: {
					placeholderKey: placeholdersTmp[index].placeholderKey,
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

				placeholdersTmp.splice(index, 1);
				setPlaceholder(placeholdersTmp);
				// setRefreshPlaceholders(refreshPlaceholders + 1);
				getPlaceholders(false);
				setDelLoad(false);
			})
			.catch((error) => {
				setNotification({
					text:
						error.response && error.response.data && error.response.data.message
							? error.response.data.message
							: error.message,
				});
				setDelLoad(false);
			});
	};
	const handleChange = (placeholderChange: Placeholder, index: number) => {
		let placeholderTmp = [...placeholder];
		// switch (e.target.id) {
		// 	case 'PlaceholderName':
		// 		placeholderTmp[index].name = e.target.value;

		// 		break;

		// 	case 'PlaceholderValue':
		// 		placeholderTmp[index].value = e.target.value;

		// 		break;
		// }
		placeholderTmp[index] = placeholderChange;
		setPlaceholder(placeholderTmp);
	};
	const handleDelete = (placeholderDelete: Placeholder, index: number) => {
		let placeholderTmp = [...placeholder];
		placeholderTmp.splice(index, 1);
		setPlaceholder(placeholderTmp);
	};
	// const handleBlur = async (placeholder: Placeholder, index: number) => {
	// switch (e.target.id) {
	// 	case 'PlaceholderName':
	// 		let placeholdersTmp = [...placeholder];
	// 		let body = {
	// 			data: {
	// 				action: Action.UPDATE,
	// 				clientKey: !token ? clientKey : undefined,
	// 				contractKey: contractKey,
	// 				placeholder: {
	// 					placeholderKey: placeholdersTmp[index].placeholderKey,
	// 					name: placeholdersTmp[index].name,
	// 				},
	// 			},
	// 		};
	// 		await axios
	// 			.post(BASE_URL + ApiEntity.PLACEHOLDER, body, {
	// 				headers: {
	// 					Accept: 'application/vnd.api+json',
	// 					'Content-Type': 'application/vnd.api+json',
	// 					'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
	// 					Authorization: token ? `Bearer ${token}` : undefined,
	// 				},
	// 				responseType: 'json',
	// 			})
	// 			.then((payload: any) => {
	// 				//console.log('PLACEHOLDER read', payload);
	// 				// setRefreshPlaceholders(refreshPlaceholders + 1);
	// 			})
	// 			.catch((error) => {
	// 				setNotification({
	// 					text:
	// 						error.response &&
	// 						error.response.data &&
	// 						error.response.data.message
	// 							? error.response.data.message
	// 							: error.message,
	// 				});
	// 			});
	// 		break;
	// 	case 'PlaceholderValue':
	// 		changeValue(index);
	// 		break;
	// }
	// };
	const changeValue = async (index: number) => {
		let placeholdersTmp = [...placeholder];

		let body = {
			data: {
				action: Action.UPDATE,
				clientKey: !token ? clientKey : undefined,
				contractKey: contractKey,
				placeholder: {
					placeholderKey: placeholdersTmp[index].placeholderKey,
					value: placeholdersTmp[index].value,
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
	const handleClick = (e: any, index: number) => {
		let placeholderTmp = [...placeholder];
		placeholderTmp[index].type = e;
		setPlaceholder(placeholderTmp);
	};
	const handleEnter = (index: number) => {
		changeValue(index);
	};
	// const handleChangeFilling = async (e: any, index: number) => {
	// 	console.log('handleChangeFilling', e);

	// 	let placeholderTmp = [...placeholder];
	// 	let body = {
	// 		data: {
	// 			action: Action.UPDATE,
	// 			clientKey: !token ? clientKey : undefined,
	// 			contractKey: contractKey,
	// 			placeholder: {
	// 				placeholderKey: placeholderTmp[index].placeholderKey,
	// 				fillingType: 1,
	// 				externalRecipientKey: undefined,
	// 			},
	// 		},
	// 	};
	// 	if (
	// 		e.target.value.toString() === PlaceholderFill.NONE.toString() ||
	// 		e.target.value.toString() === PlaceholderFill.CREATOR.toString() ||
	// 		e.target.value.toString() === PlaceholderFill.ANY.toString()
	// 	) {
	// 		placeholderTmp[index].fillingType = e.target.value;
	// 		body.data.placeholder.fillingType = e.target.value;
	// 		placeholderTmp[index].externalRecipientKey = undefined;
	// 		body.data.placeholder.externalRecipientKey = undefined;
	// 	} else {
	// 		placeholderTmp[index].fillingType = PlaceholderFill.SPECIFIC;
	// 		placeholderTmp[index].externalRecipientKey = e.target.value;
	// 		body.data.placeholder.fillingType = PlaceholderFill.SPECIFIC;
	// 		body.data.placeholder.externalRecipientKey = e.target.value;
	// 	}

	// 	setPlaceholder(placeholderTmp);
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
	console.log('readonly', readonly, readonlyCurrent.current);
	return (
		<Card
			loading={placeholderLoad || continueLoad}
			key={`PlaceholderBlock${contractKey}`}
		>
			<Space direction='vertical' size={16} style={{ display: 'flex' }}>
				<Space direction='vertical' size={2}>
					<Title level={4} style={{ margin: '0 0 0 0' }}>
						Placeholders
					</Title>
					<Text type='secondary'>Add reusable text to the content.</Text>
				</Space>
				{placeholder &&
					placeholder.map((holder, index) => {
						return (
							// <div
							// 	id={`placeholder${holder?.placeholderKey?.replaceAll(
							// 		'-',
							// 		'_'
							// 	)}`}
							// 	ref={drag}
							// 	draggable={!readonlyCurrent.current}
							// 	onDragStart={(e) => {
							// 		e.dataTransfer.setData(
							// 			'placeholderKey',
							// 			holder.placeholderKey as string
							// 		);
							// 		setPlaceholderPdf(holder);
							// 	}}
							// 	role={'PlaceholderBlock'}
							// >
							// 	<Space
							// 		// id={`placeholder${holder?.placeholderKey?.replaceAll(
							// 		// 	'-',
							// 		// 	'_'
							// 		// )}`}
							// 		className='ph-style'
							// 		// ref={drag}
							// 		// onDragOver={(e) => {
							// 		// 	e.preventDefault();
							// 		// }}
							// 		// onDragStart={(e) => {
							// 		// 	e.dataTransfer.setData(
							// 		// 		'placeholderKey',
							// 		// 		holder.placeholderKey as string
							// 		// 	);
							// 		// 	setPlaceholderPdf(holder);
							// 		// }}
							// 		direction='vertical'
							// 		size={2}
							// 		style={{ display: 'flex' }}
							// 		// key={holder.placeholderKey}
							// 	>
							// 		<Row wrap={false} align={'middle'}>
							// 			<Col>
							// 				<Tooltip title='Drop onto the document.'>
							// 					<div>
							// 						<Button
							// 							size='small'
							// 							type='text'
							// 							style={{ cursor: 'grab' }}
							// 							disabled={readonlyCurrent.current}
							// 							onClick={() => {
							// 								chosePlaceholder.current = holder;
							// 							}}
							// 							icon={
							// 								<FontAwesomeIcon
							// 									icon={
							// 										holder.view?.toString() !==
							// 											PlaceholderView.SIGNATURE.toString() &&
							// 										!readonly
							// 											? faFont
							// 											: faSignature
							// 									}
							// 									size='sm'
							// 									onClick={() => {
							// 										handleInsertPlaceholder(index);
							// 									}}
							// 								/>
							// 							}
							// 						/>
							// 					</div>
							// 				</Tooltip>
							// 			</Col>
							// 			<Col>
							// 				<Input
							// 					id='PlaceholderName'
							// 					readOnly={
							// 						holder.view?.toString() !==
							// 							PlaceholderView.SIGNATURE.toString() &&
							// 						!readonlyCurrent.current
							// 							? false
							// 							: true
							// 					}
							// 					placeholder='Enter placeholder name'
							// 					value={holder.name}
							// 					variant='borderless'
							// 					onChange={(e: any) => handleChange(e, index)}
							// 					onBlur={(e: any) => handleBlur(e, index)}
							// 				/>
							// 			</Col>
							// 			<Col flex={'auto'}></Col>
							// 			{holder.view?.toString() !==
							// 				PlaceholderView.SIGNATURE.toString() && (
							// 				<Col flex='24px'>
							// 					<Popover
							// 						content={
							// 							<Space
							// 								direction='vertical'
							// 								style={{ display: 'flex' }}
							// 							>
							// 								<Space>
							// 									<Text type='secondary'>
							// 										Who fills in this field:
							// 									</Text>
							// 									<Tooltip title='Set who fills in this field: a contract owner when creating a contract from this template or an external recipient when opening a contract.'>
							// 										<div>
							// 											<Button
							// 												disabled={readonlyCurrent.current}
							// 												size='small'
							// 												icon={
							// 													<FontAwesomeIcon
							// 														icon={faCircleQuestion}
							// 														size='xs'
							// 													/>
							// 												}
							// 												type='text'
							// 											></Button>
							// 										</div>
							// 									</Tooltip>
							// 								</Space>
							// 								<Radio.Group
							// 									size='small'
							// 									value={
							// 										holder.fillingType &&
							// 										holder.fillingType.toString() !==
							// 											PlaceholderFill.SPECIFIC.toString()
							// 											? holder.fillingType?.toString()
							// 											: holder.fillingType &&
							// 											  holder.fillingType.toString() ===
							// 													PlaceholderFill.SPECIFIC.toString() &&
							// 											  holder.externalRecipientKey &&
							// 											  placeholderRecipients &&
							// 											  placeholderRecipients.length > 0
							// 											? placeholderRecipients.find(
							// 													(placeholderRecipient) =>
							// 														placeholderRecipient.recipientKey?.includes(
							// 															holder.externalRecipientKey as string
							// 														)
							// 											  )?.recipientKey
							// 											: '1'
							// 									}
							// 									onChange={(e: any) =>
							// 										handleChangeFilling(e, index)
							// 									}
							// 								>
							// 									<Space direction='vertical'>
							// 										<Radio
							// 											value={PlaceholderFill.NONE.toString()}
							// 										>
							// 											None
							// 										</Radio>
							// 										<Radio
							// 											value={PlaceholderFill.CREATOR.toString()}
							// 										>
							// 											Contract owner
							// 										</Radio>
							// 										{placeholderRecipients &&
							// 											placeholderRecipients.length > 0 &&
							// 											placeholderRecipients.map(
							// 												(placeholderRecipient) => {
							// 													return (
							// 														<Radio
							// 															value={
							// 																placeholderRecipient.recipientKey
							// 															}
							// 														>
							// 															{placeholderRecipient.fullname}
							// 														</Radio>
							// 													);
							// 												}
							// 											)}
							// 									</Space>
							// 								</Radio.Group>
							// 								<Divider style={{ margin: 0 }} />
							// 								<Button
							// 									disabled={readonlyCurrent.current}
							// 									loading={delLoad}
							// 									block
							// 									danger
							// 									type='text'
							// 									onClick={() => {
							// 										handleDeletePlaceholder(index);
							// 									}}
							// 								>
							// 									Delete
							// 								</Button>
							// 							</Space>
							// 						}
							// 						trigger='click'
							// 					>
							// 						<div>
							// 							<Button
							// 								disabled={readonlyCurrent.current}
							// 								size='small'
							// 								type='text'
							// 								icon={<FontAwesomeIcon icon={faGear} size='xs' />}
							// 							/>
							// 						</div>
							// 					</Popover>
							// 				</Col>
							// 			)}
							// 		</Row>
							// 		{holder.view?.toString() !==
							// 			PlaceholderView.SIGNATURE.toString() && (
							// 			<Input
							// 				id='PlaceholderValue'
							// 				placeholder='Enter value'
							// 				readOnly={readonlyCurrent.current}
							// 				value={holder.value}
							// 				onChange={(e: any) => handleChange(e, index)}
							// 				onBlur={(e: any) => handleBlur(e, index)}
							// 				onPressEnter={() => handleEnter(index)}
							// 			/>
							// 		)}
							// 	</Space>
							// </div>
							<PlaceholderDrag
								placeholder={holder}
								recipients={placeholderRecipients}
								readonly={readonlyCurrent.current}
								onChange={(e: any) => {
									handleChange(e.placeholder, index);
								}}
								onDelete={(e: any) => {
									handleDelete(e.placeholder, index);
								}}
							/>
						);
					})}

				<Space direction='vertical' size={2} style={{ display: 'flex' }}>
					<Button
						disabled={readonlyCurrent.current}
						block
						type='dashed'
						onClick={handleAddPlaceholder}
					>
						Add placeholder
					</Button>
				</Space>
			</Space>
		</Card>
	);
};
