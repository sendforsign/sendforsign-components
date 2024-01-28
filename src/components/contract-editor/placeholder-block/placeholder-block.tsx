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
//env.config();
type Props = {
	quillRef: QuillNamespace | undefined;
	handleChangeText: any;
	valueText: string;
};
export const PlaceholderBlock = ({
	quillRef,
	handleChangeText,
	valueText,
}: Props) => {
	const {
		contractKey,
		clientKey,
		placeholder,
		setPlaceholder,
		refreshPlaceholders,
		setRefreshPlaceholders,
	} = useContractEditorContext();
	const [currPlaceholder, setCurrPlaceholder] = useState(refreshPlaceholders);
	const [placeholderLoad, setPlaceholderLoad] = useState(false);

	const { Title, Text } = Typography;
	useEffect(() => {
		const getPlaceholders = async () => {
			console.log('PlaceholderBlock');
			setPlaceholderLoad(true);
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
					// console.log('PlaceholderBlot', placeholder);
					// if (placeholder && placeholder.length > 0) {
					// 	let Inline = QuillNamespace.import('blots/inline');
					// 	class PlaceholderBlot extends Inline {}
					// 	for (let index = 0; index < placeholder.length; index++) {
					// 		console.log('PlaceholderBlot', index, placeholder);
					// 		PlaceholderBlot.className = `customclass1`;
					// 		PlaceholderBlot.blotName = `placeholder_${placeholder[index].placeholderKey}`;
					// 		PlaceholderBlot.tagName = `placeholder_${placeholder[index].placeholderKey}`;
					// 		QuillNamespace.register(PlaceholderBlot);
					// 	}
					// }
					if (
						payload.data.placeholders &&
						payload.data.placeholders.length > 0
					) {
						let Inline = QuillNamespace.import('blots/inline');
						let placeholderTmp: Placeholder[] = [];
						for (
							let index = 0;
							index < payload.data.placeholders.length;
							index++
						) {
							class PlaceholderBlot extends Inline {}
							placeholderTmp.push(payload.data.placeholders[index]);
							// const NewBlot = Blot(Inline);
							// const placeholderBlot = new NewBlot();
							PlaceholderBlot.className = `customclass1`;
							PlaceholderBlot.blotName = `placeholder_${payload.data.placeholders[index].placeholderKey}`;
							PlaceholderBlot.tagName = `placeholder_${payload.data.placeholders[index].placeholderKey}`;
							QuillNamespace.register(PlaceholderBlot);
						}

						setPlaceholder(placeholderTmp);
					}
					setPlaceholderLoad(false);
				});
		};
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
				setRefreshPlaceholders(refreshPlaceholders + 1);
			});
	};
	const handleInsertPlaceholder = (index: number) => {
		const position = quillRef?.getSelection();
		console.log('position', position);
		// quillRef.current?.insertText(
		// 	position ? position?.index : 0,
		// 	'<placeholder1 className={customclass1}>New text </placeholder1>',
		// 	'api'
		// );
		const empty = placeholder[index].value
			? placeholder[index].value?.replace(/\s/g, '')
			: '';
		quillRef?.clipboard.dangerouslyPasteHTML(
			position ? position?.index : 0,
			`<placeholder_${
				placeholder[index].placeholderKey
			} className={customclass1}>${
				empty ? placeholder[index].value : `{{{${placeholder[index].name}}}}`
			}</placeholder_${placeholder[index].placeholderKey}>`
		);
		handleChangeText(quillRef?.root.innerHTML);
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
				setRefreshPlaceholders(refreshPlaceholders + 1);
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
				if (placeholderTmp[index].name) {
					changeValueInTag(
						placeholderTmp[index].placeholderKey
							? (placeholderTmp[index].placeholderKey as string)
							: '',
						placeholderTmp[index].value
							? (placeholderTmp[index].value as string)
							: `{{{${placeholderTmp[index].name as string}}}}`
					);
				}
				break;
		}
		setPlaceholder(placeholderTmp);
	};
	const changeValueInTag = (placeholderKey: string, value: string) => {
		let text = valueText;
		let array = text?.split(`</placeholder_${placeholderKey}>`);
		let resultText = '';
		if (array) {
			for (let i = 0; i < array.length; i++) {
				let elArray = array[i].split(`<placeholder_${placeholderKey} class=`);
				if (elArray.length > 1) {
					for (let j = 0; j < elArray.length; j++) {
						switch (j) {
							case 0:
								resultText += `${elArray[j]}<placeholder_${placeholderKey} class=`;
								break;

							case 1:
								let elelArray = elArray[j].split('>');
								for (let k = 0; k < elelArray.length; k++) {
									switch (k) {
										case 0:
											resultText += `${elelArray[k]}>`;
											break;

										case 1:
											resultText += `${value}</placeholder_${placeholderKey}>`;
											break;
									}
								}
								break;
						}
					}
				} else {
					resultText += elArray;
				}
			}
			quillRef?.clipboard.dangerouslyPasteHTML(resultText);
			handleChangeText(resultText, false);
		}
	};
	const handleBlur = async (e: any, index: number) => {
		let placeholdersTmp = [...placeholder];
		let body = {};
		switch (e.target.id) {
			case 'PlaceholderName':
				body = {
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
				body = {
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
				break;
		}
	};
	const handleClick = (e: any, index: number) => {
		let placeholderTmp = [...placeholder];
		placeholderTmp[index].type = e;
		setPlaceholder(placeholderTmp);
	};
	return (
		<Card loading={placeholderLoad}>
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
