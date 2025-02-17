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
	PlaceholderColor,
	PlaceholderFill,
	PlaceholderView,
	SpecialType,
} from '../../../../config/enum';
import axios from 'axios';
import { Placeholder, Recipient } from '../../../../config/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faCircleQuestion,
	faCopy,
	faFont,
	faGear,
	faSignature,
} from '@fortawesome/free-solid-svg-icons';
import { useDrag } from 'react-dnd';
import { getIcon } from '../../../../utils';

type Props = {
	style?: any;
	readonly?: boolean;
	placeholder: Placeholder;
	recipients?: Recipient[];
	onChange?: (data: any) => void;
	onDelete?: (data: any) => void;
};

export const PlaceholderDrag = ({
	style,
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
		contractKey,
		clientKey,
		setPlaceholderPdf,
		setNotification,
		refreshOnlyPlaceholders,
		setRefreshOnlyPlaceholders,
	} = useContractEditorContext();

	const { Text } = Typography;
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
	const handleInsertPlaceholder = () => {
		setPlaceholderPdf(currPlaceholder.current);
	};
	const handleDeletePlaceholder = async () => {
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
	const handleChange = (e: any) => {
		if (currPlaceholder.current.isSpecial || readonly) {
			return;
		}
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
	};
	const handleBlur = async (e: any) => {
		if (currPlaceholder.current.isSpecial || readonly) {
			return;
		}
		switch (e.target.id) {
			case 'PlaceholderName':
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
					.then((payload: any) => {})
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
		if (currPlaceholder.current.isSpecial || readonly) {
			return;
		}
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
			.then((payload: any) => {})
			.catch((error) => {
				setNotification({
					text:
						error.response && error.response.data && error.response.data.message
							? error.response.data.message
							: error.message,
				});
			});
	};
	const handleEnter = () => {
		changeValue();
	};
	const handleChangeFilling = async (e: any) => {
		let body = {
			data: {
				action: Action.UPDATE,
				clientKey: !token ? clientKey : undefined,
				contractKey: contractKey,
				placeholder: {
					placeholderKey: currPlaceholder.current.placeholderKey,
					fillingType: 1,
					externalRecipientKey: '',
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
			currPlaceholder.current.externalRecipientKey = '';
			body.data.placeholder.externalRecipientKey = '';
			if (e.target.value.toString() === PlaceholderFill.CREATOR.toString()) {
				currPlaceholder.current.color = PlaceholderColor.OWNER;
			} else {
				currPlaceholder.current.color = PlaceholderColor.OTHER;
			}
		} else {
			currPlaceholder.current.fillingType = PlaceholderFill.SPECIFIC;
			currPlaceholder.current.externalRecipientKey = e.target.value;
			body.data.placeholder.fillingType = PlaceholderFill.SPECIFIC;
			body.data.placeholder.externalRecipientKey = e.target.value;
			const recipientFind = recipients?.find(
				(recipient) => recipient.recipientKey === e.target.value
			);
			if (recipientFind) {
				currPlaceholder.current.color = recipientFind.color;
			}
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
				setRefreshOnlyPlaceholders(refreshOnlyPlaceholders + 1);
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
			onDragStart={(e) => {
				e.dataTransfer.setData(
					'placeholderKey',
					currPlaceholder.current.placeholderKey as string
				);
				setPlaceholderPdf(currPlaceholder.current);
			}}
			style={style}
			role={'PlaceholderBlock'}
		>
			<Space
				className='ph-style'
				direction='vertical'
				size={2}
				style={style ? style : { display: 'flex', marginBottom: '16px' }}
			>
				<Row wrap={false} align={'middle'}>
					<Col>
						<Tooltip title='Drop onto the document.'>
							<div>
								<Button
									size='small'
									type='text'
									style={{
										background: `${currPlaceholder.current.color}`,
										cursor: 'grab',
									}}
									disabled={readonly}
									icon={
										<FontAwesomeIcon
											icon={getIcon(currPlaceholder.current)}
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
									PlaceholderView.SIGNATURE.toString() &&
								!currPlaceholder.current.isSpecial &&
								!readonly
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
						PlaceholderView.SIGNATURE.toString() &&
					!currPlaceholder.current.isSpecial ? (
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
										<Divider style={{ margin: 0 }} />
										<Popover content={
											<Space direction='vertical'>
												<Text type='secondary'>Placeholder Key: {currPlaceholder.current.placeholderKey}</Text>
												<Button size='small' icon={<FontAwesomeIcon icon={faCopy} size='sm' color='#5d5d5d'/>} onClick={() => navigator.clipboard.writeText(currPlaceholder.current.placeholderKey || 'N/A')}>Copy</Button>
											</Space>
										} trigger="click">
											<Button size='small'>{currPlaceholder.current.placeholderKey}</Button>
										</Popover>
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
					) : (
						<Col flex='24px'>
							<Popover
								content={
									<Space direction='vertical' style={{ display: 'flex' }}>
										<Popover content={
											<Space direction='vertical'>
												<Text type='secondary'>Placeholder Key: {currPlaceholder.current.placeholderKey}</Text>
												<Button size='small' icon={<FontAwesomeIcon icon={faCopy} size='sm' color='#5d5d5d'/>} onClick={() => navigator.clipboard.writeText(currPlaceholder.current.placeholderKey || 'N/A')}>Copy</Button>
											</Space>
										} trigger="click">
											<Button size='small'>{currPlaceholder.current.placeholderKey}</Button>
										</Popover>
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
					PlaceholderView.SIGNATURE.toString() &&
					!currPlaceholder.current.isSpecial && (
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
