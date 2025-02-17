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
	Tooltip,
} from 'antd';
import axios from 'axios';
import Segmented, { SegmentedLabeledOption } from 'antd/es/segmented';
import { useContractEditorContext } from '../contract-editor-context';
import useSaveArrayBuffer from '../../../hooks/use-save-array-buffer';
import { AiAssistant } from '../../ai-assistant';
import {
	Action,
	AiTypes,
	ApiEntity,
	ContractSteps,
	ContractTypeText,
	PlaceholderFill,
} from '../../../config/enum';
import { BASE_URL } from '../../../config/config';
import { docx2html } from '../../../utils';
import { Placeholder, Template } from '../../../config/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHatWizard } from '@fortawesome/free-solid-svg-icons';

type Props = {
	allowPdf: boolean;
	allowAi: boolean;
};

export const ChooseContractType = ({ allowPdf, allowAi }: Props) => {
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
		setCurrentData,
		setNotification,
		load,
		setLoad,
	} = useContractEditorContext();
	const { Title, Text } = Typography;
	const [options, setOptions] = useState<SegmentedLabeledOption[]>([]);
	const currPlaceholder = useRef(placeholder);
	const [createDisable, setCreateDisable] = useState(true);
	const [fieldBlockVisible, setFieldBlockVisible] = useState(false);
	const [aiBlockVisible, setAiBlockVisible] = useState(false);
	const [loadSegmented, setLoadSegmented] = useState(false);
	const [chooseTemplate, setChooseTemplate] = useState(0);
	const [segmentedValue, setSegmentedValue] = useState('');
	const [btnName, setBtnName] = useState('Create document');
	const [pdfFileLoad, setPdfFileLoad] = useState(0);
	const [steps, setSteps] = useState<
		{ key: string; name: string; value: string }[]
	>([]);
	const { token } = theme.useToken();
	const [current, setCurrent] = useState(0);
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
					setCurrentData({ currentStep: ContractSteps.TYPE_CHOOSE_STEP });
					if (allowAi) {
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
									<Tag style={{ margin: '4px 0' }} color={'orange'}>
										AI
									</Tag>
									<div style={{ padding: '4px 0' }}>
										Generate<br></br>with AI
									</div>
								</div>
							),
							value: ContractTypeText.AI,
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
		// console.log('contractKey 6');
		getTemplates();
		return () => {
			isMounted = false;
		};
	}, []);

	const handleCreate = async () => {
		if (contractType && !templateKey) {
			let input = null;
			console.log('contractType', contractType);
			switch (contractType) {
				case ContractTypeText.DOCX.toString():
					setLoad(true);
					input = document.createElement('input');
					input.type = 'file';
					input.accept =
						'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

					input.onchange = (e: any) => {
						// debugger;
						let file = e.target.files[0];
						const fileSize = Math.round(file.size / 1048576);
						if (fileSize > 15) {
							setNotification({
								text: 'File too big, please select a file less than 15mb',
							});
							setLoad(false);
							return;
						}
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
											setCurrentData({ currentStep: ContractSteps.QN_A_STEP });
											setCreateDisable(true);
											setLoad(false);
										}
									}
								);
							}
						};
					};

					input.click();
					break;
				case ContractTypeText.PDF.toString():
					setLoad(true);
					input = document.createElement('input');
					input.type = 'file';
					input.accept = 'application/pdf';

					input.onchange = (e: any) => {
						// 	debugger;
						let file = e.target.files[0];
						const fileSize = Math.round(file.size / 1048576);
						if (fileSize > 15) {
							setNotification({
								text: 'File too big, please select a file less than 15mb',
							});
							// alert('File too big, please select a file less than 15mb');
							setLoad(false);
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
								setCurrentData({ currentStep: ContractSteps.QN_A_STEP });
								setCreateDisable(true);
								setLoad(false);
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
						setCurrentData({ currentStep: ContractSteps.QN_A_STEP });
						setCreateDisable(true);
					}
					// debugger;
					break;
				case ContractTypeText.AI.toString():
					setAiBlockVisible(true);
					setCurrentData({ currentStep: ContractSteps.AI_STEP });
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
						if (beforeCreated && contractName) {
							// setCreateContract(true);
						} else {
							setChooseTemplate(chooseTemplate + 1);
						}
						setFieldBlockVisible(true);
						setCurrentData({ currentStep: ContractSteps.QN_A_STEP });
						setCreateDisable(true);
					});
				setLoad(false);
			} else {
				// debugger;
				setContractValue(template.value as string);
				if (beforeCreated && contractName) {
					setCreateContract(true);
				} else {
					setChooseTemplate(chooseTemplate + 1);
				}
			}
		}
	};

	const handleContinue = async () => {
		setCreateContract(true);
	};
	const handleChange = (e: any, placeholderKey: string) => {
		let stepsTmp: { key: string; name: string; value: string }[] = [...steps];
		switch (e.target.id) {
			case 'ContractName':
				setContractName(e.target.value);
				if (stepsTmp.length > 0 && stepsTmp[0]) {
					stepsTmp[0].value = e.target.value;
				}
				if (e.target.value) {
					setContinueDisable(false);
				} else {
					setContinueDisable(true);
				}
				break;
			default:
				const index = currPlaceholder.current.findIndex(
					(holder) => holder.placeholderKey === placeholderKey
				);
				currPlaceholder.current[index].value = e.target.value;
				const stepIndex = stepsTmp.findIndex(
					(step) => step.key === placeholderKey
				);
				stepsTmp[stepIndex].value = currPlaceholder.current[index]
					.value as string;
				setPlaceholder(currPlaceholder.current);
				break;
		}
		setSteps(stepsTmp);
	};
	const handleChoose = async (e: any) => {
		// debugger;
		let contractTypeTmp = e.toString().split('_');
		console.log('e', e);
		console.log('contractTypeTmp', contractTypeTmp[1]);
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
		} else if (e === ContractTypeText.AI.toString()) {
			setContractType(e);
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
					let stepsTmp: { key: string; name: string; value: string }[] = [];
					stepsTmp.push({
						key: 'ContractName',
						name: 'What is the name of your document?',
						value: contractName,
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
								setFillPlaceholder(true);
								stepsTmp.push({
									key: holder.placeholderKey as string,
									name: holder.name as string,
									value: holder.value as string,
								});
							});
					}
					setItems(
						stepsTmp.map((step) => {
							return { key: step.key, title: '' };
						})
					);
					setSteps(stepsTmp);
					setLoad(false);
					setFieldBlockVisible(true);
					setCurrentData({ currentStep: ContractSteps.QN_A_STEP });
					setCreateDisable(true);
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
		if (chooseTemplate) {
			getPlaceholder();
		}
	}, [chooseTemplate]);

	const next = () => {
		setCurrent(current + 1);
	};

	const prev = () => {
		setCurrent(current - 1);
	};

	return (
		<Space direction='vertical' size={16} style={{ display: 'flex' }}>
			{!fieldBlockVisible && !aiBlockVisible && (
				<Card loading={loadSegmented}>
					<Space direction='vertical' size={16} style={{ display: 'flex' }}>
						<Space direction='vertical' size={2}>
							<Title level={4} style={{ margin: '0' }}>
								Select a document to be signed
							</Title>
							<Text type='secondary'>
								Draft from scratch, use a template, or upload a file.
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
			)}
			{aiBlockVisible && (
				<Space direction='vertical' size={16} style={{ display: 'flex' }}>
					<Space direction='vertical' size={2}>
						<Title level={4} style={{ margin: '0' }}>
							Generate agreement with AI
						</Title>
						<Text type='secondary'>
							Generate from a simple prompt, attach a Word or PDF for reference,
							or add context.
						</Text>
					</Space>
					<AiAssistant
						apiKey={apiKey ? apiKey : ''}
						clientKey={clientKey ? clientKey : ''}
						token={currToken ? currToken : ''}
						userKey={userKey ? userKey : ''}
						aitype={AiTypes.CONTRACT_CHOOSE}
					/>
				</Space>
			)}
			{fieldBlockVisible && (
				<Card bordered={true}>
					<Space direction='vertical' size={16} style={{ display: 'flex' }}>
						<Space direction='vertical' size={2}>
							<Title level={4} style={{ margin: '0' }}>
								Answer the questions below to create your document
							</Title>
						</Space>
						{steps.length > 1 ? (
							<>
								<Steps current={current} items={items} size='small' />
								<Card
									style={{
										marginTop: 16,
										textAlign: 'center',
										color: token.colorTextTertiary,
										backgroundColor: token.colorFillAlter,
										borderRadius: token.borderRadiusLG,
									}}
								>
									<Space direction='vertical' style={{ display: 'flex' }}>
										<Title level={5} style={{ margin: '0' }}>
											{steps[current].name}
										</Title>
										<Text type='secondary'>
											Enter the value in the field below.
										</Text>
										<Input
											id={steps[current].key}
											placeholder={`Type here`}
											value={steps[current].value}
											onChange={(e) => handleChange(e, steps[current].key)}
										/>
									</Space>
								</Card>
								<div style={{ marginTop: 24 }}>
									{current > 0 && (
										<Button style={{ margin: '0 8px' }} onClick={() => prev()}>
											Previous
										</Button>
									)}
									{current < steps.length - 1 && (
										<Button
											type='primary'
											disabled={continueDisable}
											onClick={() => next()}
										>
											Next
										</Button>
									)}
									{current === steps.length - 1 && (
										<Button
											type='primary'
											onClick={handleContinue}
											loading={continueLoad}
										>
											Done
										</Button>
									)}
								</div>
							</>
						) : (
							<>
								<Card
									style={{
										marginTop: 16,
										textAlign: 'center',
										color: token.colorTextTertiary,
										backgroundColor: token.colorFillAlter,
										borderRadius: token.borderRadiusLG,
									}}
								>
									<Space direction='vertical' style={{ display: 'flex' }}>
										<Title level={5} style={{ margin: '0' }}>
											What is the name of your document?
										</Title>
										<Text type='secondary'>
											Enter the value in the field below.
										</Text>
										<Input
											id={'ContractName'}
											placeholder='Type here'
											value={contractName}
											onChange={(e) => handleChange(e, 'ContractName')}
										/>
									</Space>
								</Card>
								<Button
									type='primary'
									onClick={handleContinue}
									loading={continueLoad}
								>
									Done
								</Button>
							</>
						)}
					</Space>
				</Card>
			)}
		</Space>
	);
};
