import React, { useEffect, useState } from 'react';
import {
	Space,
	Card,
	Typography,
	Button,
	Input,
	Modal,
	Tabs,
	Spin,
	Row,
	Tooltip,
	Col,
	Popover,
	Segmented,
} from 'antd';
import QuillNamespace from 'quill';
import { useContractEditorContext } from '../contract-editor-context';
import { BASE_URL } from '../../../config/config';
import { Action, ApiEntity, PlaceholderTypeText } from '../../../config/enum';
import axios from 'axios';
import { Placeholder } from '../../../config/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faLeftLong, faUser } from '@fortawesome/free-solid-svg-icons';

type Props = {
	quillRef: React.MutableRefObject<QuillNamespace | undefined>;
};

export const PlaceholderBlock = ({ quillRef }: Props) => {
	const {
		contractKey,
		clientKey,
		placeholder,
		continueLoad,
		setPlaceholder,
		refreshPlaceholders,
		setRefreshPlaceholders,
	} = useContractEditorContext();
	const [currPlaceholder, setCurrPlaceholder] = useState(refreshPlaceholders);
	const [placeholderLoad, setPlaceholderLoad] = useState(false);

	const { Title, Text } = Typography;

	const getPlaceholders = async (load = true) => {
		console.log('PlaceholderBlock');
		if (load) {
			setPlaceholderLoad(true);
		}
		const body = {
			data: {
				action: Action.LIST,
				clientKey: clientKey,
				contractKey: contractKey,
			},
		};
		await axios
			.post(BASE_URL + ApiEntity.PLACEHOLDER, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': 're_api_key', //process.env.SENDFORSIGN_API_KEY,
				},
				responseType: 'json',
			})
			.then((payload) => {
				console.log('getPlaceholders read', payload);

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
				}
				if (load) {
					setPlaceholderLoad(false);
				}
			});
	};
	useEffect(() => {
		if (contractKey && clientKey && currPlaceholder !== refreshPlaceholders) {
			setCurrPlaceholder(refreshPlaceholders);
			getPlaceholders();
		}
	}, [refreshPlaceholders]);

	const handleAddPlaceholder = async () => {
		let placeholdersTmp = [...placeholder];
		placeholdersTmp.push({
			name: `Name${placeholdersTmp.length}`,
			value: '',
			type: PlaceholderTypeText.INTERNAL,
		});
		setPlaceholder(placeholdersTmp);

		let body = {
			data: {
				action: Action.CREATE,
				clientKey: clientKey,
				contractKey: contractKey,
				placeholder: {
					name: 'Name',
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
					'x-sendforsign-key': 're_api_key', //process.env.SENDFORSIGN_API_KEY,
				},
				responseType: 'json',
			})
			.then((payload) => {
				console.log('PLACEHOLDER read', payload);
				// setRefreshPlaceholders(refreshPlaceholders + 1);
				getPlaceholders(false);
			});
	};
	const handleInsertPlaceholder = (index: number) => {
		const position = quillRef?.current?.getSelection();
		console.log('position', position, quillRef);

		const empty = placeholder[index].value
			? placeholder[index].value?.replace(/\s/g, '')
			: '';

		quillRef?.current?.clipboard.dangerouslyPasteHTML(
			position ? position?.index : 0,
			`<placeholder${index + 1} className={placeholderClass${index + 1}}>${
				empty ? placeholder[index].value : `{{{${placeholder[index].name}}}}`
			}</placeholder${index + 1}>`,
			'user'
		);
		// handleChangeText(quillRef?.root.innerHTML);
		console.log('handleInsertPlaceholder', quillRef?.current?.root.innerHTML);
	};
	const handleDeletePlaceholder = async (index: number) => {
		let placeholdersTmp = [...placeholder];

		let body = {
			data: {
				action: Action.DELETE,
				clientKey: clientKey,
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
					'x-sendforsign-key': 're_api_key', //process.env.SENDFORSIGN_API_KEY,
				},
				responseType: 'json',
			})
			.then((payload) => {
				console.log('PLACEHOLDER read', payload);

				placeholdersTmp.splice(index, 1);
				setPlaceholder(placeholdersTmp);
				// setRefreshPlaceholders(refreshPlaceholders + 1);
				getPlaceholders(false);
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
		let tag = `<placeholder${id}`; 
		let array = text?.split(tag);
		let resultText = '';
		if (array) {
			for (let i = 0; i < array.length; i++) {
				if (array.length > 1) {
					if (i === 0) {
						resultText += array[i];
					} else {
						resultText += `<placeholder${id}`;
						tag = `</placeholder${id}>`;
						const lineArr = array[i].split(tag);
						for (let j = 0; j < lineArr.length; j++) {
							if (j === 0) {
								tag = `"placeholderClass${id}">`;
								const elArray = lineArr[j].split(tag);
								for (let k = 0; k < elArray.length; k++) {
									if (k === 0) {
										resultText += `${elArray[k]}"placeholderClass${id}">`;
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
		console.log('changeValueInTag', quillRef?.current?.root.innerHTML);
	};
	const handleBlur = async (e: any, index: number) => {
		let placeholdersTmp = [...placeholder];
		switch (e.target.id) {
			case 'PlaceholderName':
				let body = {
					data: {
						action: Action.UPDATE,
						clientKey: clientKey,
						contractKey: contractKey,
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
							'x-sendforsign-key': 're_api_key', //process.env.SENDFORSIGN_API_KEY,
						},
						responseType: 'json',
					})
					.then((payload) => {
						console.log('PLACEHOLDER read', payload);

						// setRefreshPlaceholders(refreshPlaceholders + 1);
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
				clientKey: clientKey,
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
					'x-sendforsign-key': 're_api_key', //process.env.SENDFORSIGN_API_KEY,
				},
				responseType: 'json',
			})
			.then((payload) => {
				console.log('PLACEHOLDER read', payload);

				// setRefreshPlaceholders(refreshPlaceholders + 1);
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
	return (
		<Card loading={placeholderLoad || continueLoad}>
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
							<div draggable id={holder.placeholderKey}>
								<Space
									id={holder.placeholderKey}
									direction='vertical'
									size={2}
									style={{ display: 'flex' }}
								>
									<Row>
										<Col>
											<Tooltip title='Click to insert this placeholder into the text.'>
												<Button
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
											</Tooltip>
										</Col>
										<Col>
											<Tooltip title='Click to see more options.'>
												<Popover
													content={
														<Space
															direction='vertical'
															style={{ display: 'flex' }}
														>
															<Button
																block
																type='text'
																onClick={() => {
																	handleInsertPlaceholder(index);
																}}
															>
																Insert into the text
															</Button>
															<Button
																block
																danger
																type='text'
																onClick={() => {
																	handleDeletePlaceholder(index);
																}}
															>
																Delete
															</Button>
														</Space>
													}
													trigger='click'
												>
													<Input
														id='PlaceholderName'
														placeholder='Enter placeholder name'
														bordered={false}
														value={holder.name}
														onChange={(e: any) => handleChange(e, index)}
														onBlur={(e: any) => handleBlur(e, index)}
													/>
												</Popover>
											</Tooltip>
										</Col>
										<Col flex={'auto'} />
										<Col>
											<Tooltip title='Set who fills in this field: the user when creating a draft or the external signer when signing.'>
												<Segmented
													size='small'
													options={[
														{
															value: PlaceholderTypeText.INTERNAL,
															icon: <FontAwesomeIcon icon={faUser} size='xs' />,
														},
														{
															value: PlaceholderTypeText.EXTERNAL,
															icon: (
																<FontAwesomeIcon icon={faGlobe} size='xs' />
															),
														},
													]}
													value={holder.type}
													onChange={(e: any) => handleClick(e, index)}
												/>
											</Tooltip>
										</Col>
									</Row>
									<Input
										id='PlaceholderValue'
										placeholder='Enter value'
										value={holder.value}
										onChange={(e: any) => handleChange(e, index)}
										onBlur={(e: any) => handleBlur(e, index)}
										onPressEnter={() => handleEnter(index)}
									/>
								</Space>
							</div>
						);
					})}

				<Space direction='vertical' size={2} style={{ display: 'flex' }}>
					<Button block type='dashed' onClick={handleAddPlaceholder}>
						Add placeholder
					</Button>
				</Space>
			</Space>
		</Card>
	);
};
