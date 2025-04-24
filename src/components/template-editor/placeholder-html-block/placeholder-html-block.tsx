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
// import QuillNamespace from 'quill';
import FluentEditor from '@opentiny/fluent-editor';
import { useTemplateEditorContext } from '../template-editor-context';
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
	faCopy,
	faGear,
	faLeftLong,
} from '@fortawesome/free-solid-svg-icons';

type Props = {
	quillRef: React.MutableRefObject<FluentEditor | undefined>;
};

export const PlaceholderHtmlBlock = ({ quillRef }: Props) => {
	const {
		apiKey,
		userKey,
		token,
		isPdf,
		templateKey,
		templateType,
		clientKey,
		placeholder,
		continueLoad,
		setPlaceholder,
		refreshPlaceholders,
		templatePlaceholderCount,
		setTemplatePlaceholderCount,
		setNotification,
	} = useTemplateEditorContext();
	const [currPlaceholder, setCurrPlaceholder] = useState(refreshPlaceholders);
	const [placeholderLoad, setPlaceholderLoad] = useState(false);
	const [placeholderRecipients, setPlaceholderRecipients] = useState<
		Recipient[]
	>([]);
	const [delLoad, setDelLoad] = useState(false);
	const readonlyCurrent = useRef(false);

	const { Title, Text } = Typography;

	const getPlaceholders = async (load = true) => {
		//console.log('PlaceholderBlock');
		if (load) {
			setPlaceholderLoad(true);
		}
		const body = {
			data: {
				action: Action.LIST,
				clientKey: !token ? clientKey : undefined,
				templateKey: templateKey,
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
						if (
							payload.data.placeholders[index].view.toString() !==
							PlaceholderView.SIGNATURE.toString()
						) {
							placeholderTmp.push(payload.data.placeholders[index]);
						}
					}

					setPlaceholder(placeholderTmp);
					setTemplatePlaceholderCount(placeholderTmp.length);
				} else {
					setTemplatePlaceholderCount(0);
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

	useEffect(() => {
		let isMounted = true;
		if (
			!isPdf &&
			templateKey &&
			(clientKey || token) &&
			currPlaceholder !== refreshPlaceholders
		) {
			setCurrPlaceholder(refreshPlaceholders);
			getPlaceholders();
		}
		return () => {
			isMounted = false;
		};
	}, [refreshPlaceholders]);
	const handleAddPlaceholder = async () => {
		let placeholdersTmp = [...placeholder];
		placeholdersTmp.push({
			name: `Name${templatePlaceholderCount + 1}`,
			value: '',
			type: PlaceholderTypeText.INTERNAL,
			fillingType: PlaceholderFill.NONE,
		});
		setPlaceholder(placeholdersTmp);

		let body = {
			data: {
				action: Action.CREATE,
				clientKey: !token ? clientKey : undefined,
				templateKey: templateKey,
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
		const position = quillRef?.current?.getSelection();
		//console.log('position', position, quillRef);

		const empty = placeholder[index].value
			? placeholder[index].value?.replace(/\s/g, '')
			: '';

		quillRef?.current?.clipboard.dangerouslyPasteHTML(
			position ? position?.index : 0,
			`<placeholder${placeholder[index].id} className={placeholderClass${
				placeholder[index].id
			}} contenteditable="false">${
				empty ? placeholder[index].value : `{{{${placeholder[index].name}}}}`
			}</placeholder${placeholder[index].id}>`,
			'user'
		);
		// handleChangeText(quillRef?.root.innerHTML);
		//console.log('handleInsertPlaceholder', quillRef?.current?.root.innerHTML);
	};
	const handleDeletePlaceholder = async (index: number) => {
		setDelLoad(true);
		let placeholdersTmp = [...placeholder];

		let body = {
			data: {
				action: Action.DELETE,
				clientKey: !token ? clientKey : undefined,
				templateKey: templateKey,
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
	const handleChange = (e: any, index: number) => {
		let placeholderTmp = [...placeholder];
		switch (e.target.id) {
			case 'PlaceholderName':
				placeholderTmp[index].name = e.target.value;

				break;

			case 'PlaceholderValue':
				placeholderTmp[index].value = e.target.value;

				break;
		}
		setPlaceholder(placeholderTmp);
	};
	const changeValueInTag = (id: number, value: string) => {
		let text = quillRef?.current?.root.innerHTML;
		let contenteditable = false;
		if (text?.includes('contenteditable')) {
			contenteditable = true;
		}
		let tag = `<placeholder${id} class=`;
		let array = text?.split(tag);
		let resultText = '';
		// debugger;
		if (array) {
			for (let i = 0; i < array.length; i++) {
				if (array.length > 1) {
					if (i === 0) {
						resultText += array[i];
					} else {
						resultText += `<placeholder${id} class=`;
						tag = `</placeholder${id}>`;
						const lineArr = array[i].split(tag);
						for (let j = 0; j < lineArr.length; j++) {
							if (j === 0) {
								tag = contenteditable
									? `"placeholderClass${id}" contenteditable="false">`
									: `"placeholderClass${id}">`;
								const elArray = lineArr[j].split(tag);
								for (let k = 0; k < elArray.length; k++) {
									if (k === 0) {
										resultText += contenteditable
											? `${elArray[k]}"placeholderClass${id}" contenteditable="false">`
											: `${elArray[k]}"placeholderClass${id}">`;
									} else {
										resultText += `${value}</placeholder${id}>`;
									}
								}
							} else {
								resultText += lineArr[j];
							}
						}
					}
				} else {
					resultText = array[i];
				}
			}
			quillRef?.current?.clipboard.dangerouslyPasteHTML(resultText, 'user');
			// handleChangeText(resultText, false);
			quillRef?.current?.blur();
		}
		//console.log('changeValueInTag', quillRef?.current?.root.innerHTML);
	};
	const handleBlur = async (e: any, index: number) => {
		switch (e.target.id) {
			case 'PlaceholderName':
				let placeholdersTmp = [...placeholder];
				let body = {
					data: {
						action: Action.UPDATE,
						clientKey: !token ? clientKey : undefined,
						templateKey: templateKey,
						placeholder: {
							placeholderKey: placeholdersTmp[index].placeholderKey,
							name: placeholdersTmp[index].name,
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
				changeValue(index);
				break;
		}
	};
	const changeValue = async (index: number) => {
		let placeholdersTmp = [...placeholder];
		if (placeholdersTmp[index].name) {
			changeValueInTag(
				placeholdersTmp[index].id ? (placeholdersTmp[index].id as number) : 0,
				placeholdersTmp[index].value
					? (placeholdersTmp[index].value as string)
					: `{{{${placeholdersTmp[index].name as string}}}}`
			);
		}

		let body = {
			data: {
				action: Action.UPDATE,
				clientKey: !token ? clientKey : undefined,
				templateKey: templateKey,
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
	const handleChangeFilling = async (e: any, index: number) => {
		// console.log('handleChangeFilling', e);

		let placeholderTmp = [...placeholder];
		placeholderTmp[index].fillingType = e.target.value;

		setPlaceholder(placeholderTmp);
		let body = {
			data: {
				action: Action.UPDATE,
				clientKey: !token ? clientKey : undefined,
				templateKey: templateKey,
				placeholder: {
					placeholderKey: placeholderTmp[index].placeholderKey,
					fillingType: e.target.value,
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
	return (
		<Card
			loading={placeholderLoad || continueLoad}
			key={`PlaceholderBlock${templateKey}`}
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
							<Space
								className='ph-style'
								draggable={!readonlyCurrent.current}
								direction='vertical'
								size={2}
								style={{ display: 'flex' }}
								key={holder.placeholderKey}
							>
								<Row wrap={false} align={'middle'}>
									<Col>
										<Tooltip title='Click to insert the placeholder at the current cursor position in the text.'>
											<div>
												<Button
													disabled={readonlyCurrent.current}
													size='small'
													type='text'
													icon={
														<FontAwesomeIcon
															icon={faLeftLong}
															size='sm'
															onClick={() => {
																handleInsertPlaceholder(index);
															}}
														/>
													}
												/>
											</div>
										</Tooltip>
									</Col>
									<Col>
										<Input
											readOnly={readonlyCurrent.current}
											id='PlaceholderName'
											placeholder='Enter placeholder name'
											variant='borderless'
											value={holder.name}
											onChange={(e: any) => handleChange(e, index)}
											onBlur={(e: any) => handleBlur(e, index)}
										/>
									</Col>
									<Col flex={'auto'}></Col>
									<Col flex='24px'>
										<Popover
											content={
												<Space direction='vertical' style={{ display: 'flex' }}>
													<Space>
														<Text type='secondary'>
															Who fills in this field:
														</Text>
														<Tooltip title='Set who fills in this field: a contract owner when creating a contract from this template or an external recipient when opening a contract.'>
															<div>
																<Button
																	disabled={readonlyCurrent.current}
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
															holder.fillingType &&
															holder.fillingType.toString() !==
																PlaceholderFill.SPECIFIC.toString()
																? holder.fillingType?.toString()
																: holder.fillingType &&
																  holder.fillingType.toString() ===
																		PlaceholderFill.SPECIFIC.toString() &&
																  holder.externalRecipientKey &&
																  placeholderRecipients &&
																  placeholderRecipients.length > 0
																? placeholderRecipients.find(
																		(placeholderRecipient) =>
																			placeholderRecipient.recipientKey?.includes(
																				holder.externalRecipientKey as string
																			)
																  )?.recipientKey
																: '1'
														}
														onChange={(e: any) => handleChangeFilling(e, index)}
													>
														<Space direction='vertical'>
															<Radio value={PlaceholderFill.NONE.toString()}>
																None
															</Radio>
															<Radio value={PlaceholderFill.CREATOR.toString()}>
																Contract owner
															</Radio>
															{placeholderRecipients &&
																placeholderRecipients.length > 0 &&
																placeholderRecipients.map(
																	(placeholderRecipient) => {
																		return (
																			<Radio
																				value={
																					placeholderRecipient.recipientKey
																				}
																			>
																				{placeholderRecipient.fullname}
																			</Radio>
																		);
																	}
																)}
														</Space>
													</Radio.Group>
													<Divider style={{ margin: 0 }} />
													<Button
														disabled={readonlyCurrent.current}
														loading={delLoad}
														block
														danger
														type='text'
														onClick={() => {
															handleDeletePlaceholder(index);
														}}
													>
														Delete
													</Button>
													<Divider style={{ margin: 0 }} />
													<Popover content={
														<Space direction='vertical'>
															<Text type='secondary'>Placeholder Key: {holder.placeholderKey}</Text>
															<Button size='small' icon={<FontAwesomeIcon icon={faCopy} size='sm' color='#5d5d5d'/>} onClick={() => navigator.clipboard.writeText(holder.placeholderKey || 'N/A')}>Copy</Button>
														</Space>
													} trigger="click">
														<Button size='small'>{holder.placeholderKey}</Button>
													</Popover>
												</Space>
											}
											trigger='click'
										>
											<div>
												<Button
													disabled={readonlyCurrent.current}
													size='small'
													type='text'
													icon={<FontAwesomeIcon icon={faGear} size='xs' />}
												/>
											</div>
										</Popover>
									</Col>
								</Row>
								<Input
									readOnly={readonlyCurrent.current}
									id='PlaceholderValue'
									placeholder='Enter value'
									value={holder.value}
									onChange={(e: any) => handleChange(e, index)}
									onBlur={(e: any) => handleBlur(e, index)}
									onPressEnter={() => handleEnter(index)}
								/>
							</Space>
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
