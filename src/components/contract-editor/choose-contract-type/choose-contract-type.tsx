import React, { useEffect, useRef, useState } from 'react';
import {
	Space,
	Card,
	Typography,
	Button,
	Tag,
	Input,
	Steps,
	theme,
} from 'antd';
import axios from 'axios';
import Segmented, { SegmentedLabeledOption } from 'antd/es/segmented';
import { useContractEditorContext } from '../contract-editor-context';
import useSaveArrayBuffer from '../../../hooks/use-save-array-buffer';
import {
	Action,
	ApiEntity,
	ContractTypeText,
	PlaceholderFill,
} from '../../../config/enum';
import { BASE_URL } from '../../../config/config';
import { docx2html } from '../../../utils';
import { Placeholder, Template } from '../../../config/types';
import { forEach } from 'lodash';

type Props = {
	allowPdf: boolean;
};

export const ChooseContractType = ({ allowPdf }: Props) => {
	const {
		apiKey,
		continueDisable,
		setContinueDisable,
		clientKey,
		userKey,
		placeholder,
		token: currToken,
		setIsPdf,
		setCreateContract,
		contractName,
		setContractValue,
		setContractName,
		setContractType,
		setPlaceholder,
		contractType,
		setTemplateKey,
		templateKey,
		continueLoad,
		setPdfDownload,
		beforeCreated,
		setFillPlaceholder,
	} = useContractEditorContext();
	const { Title, Text } = Typography;
	const [options, setOptions] = useState<SegmentedLabeledOption[]>([]);
	const currPlaceholder = useRef(placeholder);
	const [createDisable, setCreateDisable] = useState(true);
	const [load, setLoad] = useState(true);
	const [fieldBlockVisible, setFieldBlockVisible] = useState(false);
	const [loadSegmented, setLoadSegmented] = useState(false);
	const [chooseTemplate, setChooseTemplate] = useState(false);
	const [segmentedValue, setSegmentedValue] = useState('');
	const [btnName, setBtnName] = useState('Create document');
	const [pdfFileLoad, setPdfFileLoad] = useState(0);
	const steps = useRef<
		{ key: string; title: string; content: React.JSX.Element }[]
	>([]);
	const [items, setItems] = useState<
		{
			key: string;
			title: string;
		}[]
	>([]);
	const { setArrayBuffer } = useSaveArrayBuffer();
	useEffect(() => {
		let isMounted = true;
		const getTemplates = async () => {
			setLoadSegmented(true);
			let body = {
				data: {
					action: Action.LIST,
					clientKey: !currToken ? clientKey : undefined,
					userKey: userKey,
				},
			};
			await axios
				.post(BASE_URL + ApiEntity.TEMPLATE, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': !currToken && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
						Authorization: currToken ? `Bearer ${currToken}` : undefined,
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					//console.log('editor read', payload);
					let array: SegmentedLabeledOption[] = [];
					if (isMounted) {
						array.push({
							label: (
								<div
									style={{
										paddingTop: '8px',
										width: 100,
										whiteSpace: 'normal',
										lineHeight: '20px',
									}}
								>
									<Tag style={{ margin: '4px 0' }} color={'magenta'}>
										File
									</Tag>
									<div style={{ padding: '4px 0' }}>Upload your DOCX file</div>
								</div>
							),
							value: `template_${ContractTypeText.DOCX}`,
						});
						if (allowPdf) {
							array.push({
								label: (
									<div
										style={{
											paddingTop: '8px',
											width: 100,
											whiteSpace: 'normal',
											lineHeight: '20px',
										}}
									>
										<Tag style={{ margin: '4px 0' }} color={'magenta'}>
											File
										</Tag>
										<div style={{ padding: '4px 0' }}>Upload your PDF file</div>
									</div>
								),
								value: `template_${ContractTypeText.PDF}`,
							});
						}
						array.push({
							label: (
								<div
									style={{
										paddingTop: '8px',
										width: 100,
										whiteSpace: 'normal',
										lineHeight: '20px',
									}}
								>
									<Tag style={{ margin: '4px 0' }} color={'cyan'}>
										Empty
									</Tag>
									<div style={{ padding: '4px 0' }}>Draft from scratch</div>
								</div>
							),
							value: `template_${ContractTypeText.EMPTY}`,
						});
						payload.data.templates.forEach((template: any) => {
							array.push({
								label: (
									<div
										style={{
											paddingTop: '8px',
											width: 100,
											whiteSpace: 'normal',
											lineHeight: '20px',
										}}
									>
										<Tag style={{ margin: '4px 0' }} color={'geekblue'}>
											Template
										</Tag>
										<div style={{ padding: '4px 0' }}>{template.name}</div>
									</div>
								),
								value: template.templateKey,
							});
						});
						setOptions(array);
						setLoadSegmented(false);
					}
				});
		};
		// console.log('contractKey 6');
		getTemplates();
		return () => {
			isMounted = false;
		};
	}, []);

	const handleCreate = async () => {
		// debugger;
		if (contractType && !templateKey) {
			let input = null;
			switch (contractType) {
				case ContractTypeText.DOCX.toString():
					input = document.createElement('input');
					input.type = 'file';
					input.accept =
						'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

					input.onchange = (e: any) => {
						// debugger;
						let file = e.target.files[0];
						let reader = new FileReader();
						reader.readAsArrayBuffer(file);
						reader.onload = (readerEvent) => {
							if (readerEvent) {
								docx2html(
									readerEvent?.target?.result as ArrayBuffer,
									(payload: any) => {
										// debugger;
										setContractValue(payload);
										if (beforeCreated && contractName) {
											setCreateContract(true);
										} else {
											setFieldBlockVisible(true);
											setCreateDisable(true);
										}
									}
								);
							}
						};
					};

					input.click();
					break;
				case ContractTypeText.PDF.toString():
					input = document.createElement('input');
					input.type = 'file';
					input.accept = 'application/pdf';

					input.onchange = (e: any) => {
						// 	debugger;
						let file = e.target.files[0];
						const fileSize = Math.round(file.size / 1048576);
						if (fileSize > 15) {
							alert('File too big, please select a file less than 15mb');
							return;
						}
						let reader = new FileReader();
						reader.readAsArrayBuffer(file);
						reader.onload = async (readerEvent) => {
							// debugger;
							setIsPdf(true);
							const arrayBuffer = readerEvent?.target?.result as ArrayBuffer;
							await setArrayBuffer('pdfFile', arrayBuffer);
							await setArrayBuffer('pdfFileOriginal', arrayBuffer);
							setPdfDownload(true);
							setPdfFileLoad(pdfFileLoad + 1);
							if (beforeCreated && contractName) {
								setCreateContract(true);
							} else {
								setFieldBlockVisible(true);
								setCreateDisable(true);
							}
						};
					};

					input.click();
					break;
				case ContractTypeText.EMPTY.toString():
					setContractValue('<div></div>');
					if (beforeCreated && contractName) {
						setCreateContract(true);
					} else {
						setFieldBlockVisible(true);
						setCreateDisable(true);
					}
					// debugger;
					break;
				default:
					break;
			}
		} else {
			setLoad(true);
			let body = {
				data: {
					action: Action.READ,
					clientKey: !currToken ? clientKey : undefined,
					userKey: userKey,
					template: { templateKey },
				},
			};
			let template: Template = {
				createTime: new Date(),
				changeTime: new Date(),
				templateKey: '',
				value: '',
				name: '',
				isPdf: false,
			};
			await axios
				.post(BASE_URL + ApiEntity.TEMPLATE, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': !currToken && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
						Authorization: currToken ? `Bearer ${currToken}` : undefined,
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					template = payload.data.template;
				});
			if (template.isPdf) {
				// debugger;
				await axios
					.get(template.value as string, {
						responseType: 'arraybuffer',
					})
					.then(async function (response) {
						setIsPdf(true);
						setContractType(ContractTypeText.PDF.toString());
						await setArrayBuffer('pdfFile', response.data);
						await setArrayBuffer('pdfFileOriginal', response.data);
						// setPdfData(response.data);
						setPdfFileLoad(pdfFileLoad + 1);
						setContractValue(template.value as string);
						setFieldBlockVisible(true);
						setCreateDisable(true);
					});
				setLoad(false);
			} else {
				// debugger;
				setContractValue(template.value as string);
				if (beforeCreated && contractName) {
					setCreateContract(true);
				} else {
					setChooseTemplate(true);
				}
			}
		}
		// if (beforeCreated && contractName) {
		// 	setContinueDisable(false);
		// }
	};

	const handleContinue = async () => {
		if (currPlaceholder.current.length > 0) {
			setFillPlaceholder(true);
		}
		setCreateContract(true);
	};
	const handleChange = (e: any, placeholderKey: string) => {
		// debugger;
		if (!placeholderKey) {
			switch (e.target.id) {
				case 'ContractName':
					setContractName(e.target.value);
					steps.current[0].content = (
						<Card>
							<Space direction='vertical' style={{ display: 'flex' }}>
								<Title level={4} style={{ margin: '0' }}>
									Document name
								</Title>
								<Text type='secondary'>
									Enter the value in the field below.
								</Text>
								<Input
									id='ContractName'
									placeholder='Enter your document name'
									value={e.target.value}
									onChange={(e) => handleChange(e, '')}
								/>
							</Space>
						</Card>
					);
					if (e.target.value) {
						setContinueDisable(false);
					} else {
						setContinueDisable(true);
					}
					break;
			}
		} else {
			const index = currPlaceholder.current.findIndex(
				(holder) => holder.placeholderKey === placeholderKey
			);
			currPlaceholder.current[index].value = e.target.value;
			const stepIndex = steps.current.findIndex(
				(step) => step.key === placeholderKey
			);
			steps.current[stepIndex].content = (
				<Card>
					<Space direction='vertical' style={{ display: 'flex' }}>
						<Title level={4} style={{ margin: '0' }}>
							{currPlaceholder.current[index].name}
						</Title>
						<Text type='secondary'>Enter the value in the field below.</Text>
						<Input
							id={currPlaceholder.current[index].placeholderKey}
							placeholder={`Enter your ${currPlaceholder.current[index].name}`}
							value={currPlaceholder.current[index].value}
							onChange={(e) =>
								handleChange(
									e,
									currPlaceholder.current[index].placeholderKey as string
								)
							}
						/>
					</Space>
				</Card>
			);
			setPlaceholder(currPlaceholder.current);
		}
	};
	const handleChoose = async (e: any) => {
		// debugger;
		let contractTypeTmp = e.toString().split('_');
		if (
			contractTypeTmp[1] === ContractTypeText.DOCX.toString() ||
			contractTypeTmp[1] === ContractTypeText.PDF.toString()
		) {
			setBtnName('Upload file');
		} else {
			setBtnName('Create document');
		}
		if (contractTypeTmp[1]) {
			setContractType(contractTypeTmp[1]);
			setTemplateKey('');
		} else {
			setTemplateKey(e);
			setContractType('');
		}
		setLoad(false);
		setSegmentedValue(e);
		setCreateDisable(false);
	};

	useEffect(() => {
		const getPlaceholder = async () => {
			// debugger;
			const body = {
				data: {
					action: Action.LIST,
					clientKey: !currToken ? clientKey : undefined,
					templateKey: templateKey,
				},
			};
			await axios
				.post(BASE_URL + ApiEntity.PLACEHOLDER, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': !currToken && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
						Authorization: currToken ? `Bearer ${currToken}` : undefined,
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					//console.log('getPlaceholders read', payload);
					steps.current.push({
						key: 'ContractName',
						title: '',
						content: (
							<Card>
								<Space direction='vertical' style={{ display: 'flex' }}>
									<Title level={4} style={{ margin: '0' }}>
										Document name
									</Title>
									<Text type='secondary'>
										Enter the value in the field below.
									</Text>
									<Input
										id='ContractName'
										placeholder='Enter your document name'
										value={contractName}
										onChange={(e) => handleChange(e, '')}
									/>
								</Space>
							</Card>
						),
					});
					if (
						payload.data.placeholders &&
						payload.data.placeholders.length > 0
					) {
						let placeholderTmp: Placeholder[] = [];
						for (
							let index = 0;
							index < payload.data.placeholders.length;
							index++
						) {
							placeholderTmp.push(payload.data.placeholders[index]);
						}

						setPlaceholder(placeholderTmp);
						currPlaceholder.current = placeholderTmp;
						// debugger;

						placeholderTmp
							?.filter(
								(holder) =>
									holder.fillingType?.toString() ===
									PlaceholderFill.CREATOR.toString()
							)
							.forEach((holder) => {
								steps.current.push({
									key: holder.placeholderKey as string,
									title: '',
									content: (
										<Card>
											<Space direction='vertical' style={{ display: 'flex' }}>
												<Title level={4} style={{ margin: '0' }}>
													{holder.name}
												</Title>
												<Text type='secondary'>
													Enter the value in the field below.
												</Text>
												<Input
													id={holder.placeholderKey}
													placeholder={`Enter your ${holder.name}`}
													value={holder.value}
													onChange={(e) =>
														handleChange(e, holder.placeholderKey as string)
													}
												/>
											</Space>
										</Card>
									),
								});
							});
						setLoad(false);
					}
					setFieldBlockVisible(true);
					setCreateDisable(true);
				});
		};
		if (chooseTemplate) {
			getPlaceholder();
		}
	}, [chooseTemplate]);

	useEffect(() => {
		// debugger;
		if (steps.current.length > 0) {
			setItems(
				steps.current.map((step) => {
					return { key: step.key, title: step.title };
				})
			);
		}
	}, [steps.current, load]);

	const { token } = theme.useToken();
	const [current, setCurrent] = useState(0);

	const next = () => {
		setCurrent(current + 1);
	};

	const prev = () => {
		setCurrent(current - 1);
	};

	const contentStyle: React.CSSProperties = {
		lineHeight: '260px',
		textAlign: 'center',
		color: token.colorTextTertiary,
		backgroundColor: token.colorFillAlter,
		borderRadius: token.borderRadiusLG,
		marginTop: 16,
	};
	return (
		<Space direction='vertical' size={16} style={{ display: 'flex' }}>
			<Card loading={loadSegmented}>
				<Space direction='vertical' size={16} style={{ display: 'flex' }}>
					<Space direction='vertical' size={2}>
						<Title level={4} style={{ margin: '0' }}>
							Select a document type or upload a file
						</Title>
						<Text type='secondary'>
							This will speed up the drafting process.
						</Text>
					</Space>
					<Segmented
						options={options}
						onChange={handleChoose}
						value={segmentedValue}
					/>
					<Button
						type='primary'
						disabled={createDisable}
						loading={load}
						onClick={handleCreate}
					>
						{btnName}
					</Button>
				</Space>
			</Card>
			{fieldBlockVisible && (
				<Card bordered={true}>
					<Space direction='vertical' size={16} style={{ display: 'flex' }}>
						<Space direction='vertical' size={2}>
							<Title level={4} style={{ margin: '0' }}>
								Let's create your document
							</Title>
						</Space>
						{/* <Input
							id='ContractName'
							placeholder='Enter your document name'
							value={contractName}
							onChange={handleChange}
							// readOnly={!continueDisable}
						/>
						<Button
							type='primary'
							disabled={continueDisable}
							onClick={handleContinue}
							loading={continueLoad}
						>
							Continue
						</Button> */}
						<div>
							<Steps current={current} items={items} size='small' />
							<div style={contentStyle}>{steps.current[current].content}</div>
							<div style={{ marginTop: 24 }}>
								{current > 0 && (
									<Button style={{ margin: '0 8px' }} onClick={() => prev()}>
										Previous
									</Button>
								)}
								{current < steps.current.length - 1 && (
									<Button
										type='primary'
										disabled={continueDisable}
										onClick={() => next()}
									>
										Next
									</Button>
								)}
								{current === steps.current.length - 1 && (
									<Button
										type='primary'
										onClick={handleContinue}
										loading={continueLoad}
									>
										Done
									</Button>
								)}
							</div>
						</div>
					</Space>
				</Card>
			)}
		</Space>
	);
};
