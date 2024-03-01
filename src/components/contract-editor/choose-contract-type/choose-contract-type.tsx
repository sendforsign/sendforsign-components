import React, { useEffect, useState } from 'react';
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
import { Action, ApiEntity, ContractTypeText } from '../../../config/enum';
import { BASE_URL } from '../../../config/config';
import { docx2html } from '../../../utils';
import { Template } from '../../../config/types';
import TextArea from 'antd/es/input/TextArea';

export const ChooseContractType = () => {
	const {
		apiKey,
		continueDisable,
		setContinueDisable,
		clientKey,
		userKey,
		setIsPdf,
		setCreateContract,
		contractName,
		setContractValue,
		setContractName,
		setContractType,
		contractType,
		setTemplateKey,
		templateKey,
		continueLoad,
		setPdfDownload,
	} = useContractEditorContext();
	// if (!process.env.SENDFORSIGN_API_KEY) {
	// 	//console.log(
	// 		'process.env.SENDFORSIGN_API_KEY',
	// 		process.env.SENDFORSIGN_API_KEY
	// 	);
	// }

	// const [contractSign, setContractSign] = useState<ContractSign>({});
	const [options, setOptions] = useState<SegmentedLabeledOption[]>([]);

	const [createDisable, setCreateDisable] = useState(true);
	const [fieldBlockVisible, setFieldBlockVisible] = useState(false);
	const [loadSegmented, setLoadSegmented] = useState(false);
	const [segmentedValue, setSegmentedValue] = useState('');
	const [btnName, setBtnName] = useState('Create contract');
	const [pdfFileLoad, setPdfFileLoad] = useState(0);
	const { Title, Text } = Typography;
	const { setArrayBuffer } = useSaveArrayBuffer();
	useEffect(() => {
		// clearArrayBuffer();

		const getTemplates = async () => {
			setLoadSegmented(true);
			let body = {
				data: {
					action: Action.LIST,
					clientKey: clientKey,
					userKey: userKey,
				},
			};
			await axios
				.post(BASE_URL + ApiEntity.TEMPLATE, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': apiKey, //process.env.SENDFORSIGN_API_KEY,
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					//console.log('editor read', payload);
					let array: SegmentedLabeledOption[] = [];
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
									<Tag style={{ margin: '4px 0' }} color={'cyan'}>
										User
									</Tag>
									<div style={{ padding: '4px 0' }}>{template.name}</div>
								</div>
							),
							value: template.templateKey,
						});
					});
					setOptions(array);
					setLoadSegmented(false);
				});
		};
		getTemplates();
	}, []);

	const handleCreate = async () => {
		if (contractType) {
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
										debugger;
										setContractValue(payload);
										setFieldBlockVisible(true);
										setCreateDisable(true);
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
							setFieldBlockVisible(true);
							setCreateDisable(true);
						};
					};

					input.click();
					break;
				case ContractTypeText.EMPTY.toString():
					setFieldBlockVisible(true);
					setCreateDisable(true);
					debugger;
					setContractValue('<div></div>');
					break;
				default:
					break;
			}
		} else {
			let body = {
				data: {
					action: Action.READ,
					clientKey: clientKey,
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
						'x-sendforsign-key': apiKey, //process.env.SENDFORSIGN_API_KEY,
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					template = payload.data.template;
				});
			if (template.isPdf) {
				debugger;
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
			} else {
				debugger;
				setContractValue(template.value as string);
				setFieldBlockVisible(true);
				setCreateDisable(true);
			}
		}
	};
	const handleContinue = async () => {
		setCreateContract(true);
	};
	const handleChange = (e: any) => {
		switch (e.target.id) {
			case 'ContractName':
				setContractName(e.target.value);
				if (e.target.value) {
					setContinueDisable(false);
				} else {
					setContinueDisable(true);
				}
				break;
		}
	};
	const handleChoose = async (e: any) => {
		let contractTypeTmp = e.toString().split('_');
		if (
			contractTypeTmp[1] === ContractTypeText.DOCX.toString() ||
			contractTypeTmp[1] === ContractTypeText.PDF.toString()
		) {
			setBtnName('Upload file');
		} else {
			setBtnName('Create contract');
		}
		if (contractTypeTmp[1]) {
			setContractType(contractTypeTmp[1]);
		} else {
			setTemplateKey(e);
		}
		setSegmentedValue(e);
		setCreateDisable(false);
	};

	const steps = [
		{
			title: 'First',
			content: (
				<Card>
					<Space direction='vertical' style={{ display: 'flex' }}>
						<Title level={4} style={{ margin: '0' }}>
							Document name
						</Title>
						<Text type='secondary'>Enter the value in the field below.</Text>
						<Input placeholder='Enter the value' />
					</Space>
				</Card>
			),
		},
		{
			title: 'Second',
			content: (
				<Card>
					<Space direction='vertical' style={{ display: 'flex' }}>
						<Title level={4} style={{ margin: '0' }}>
							End date
						</Title>
						<Text type='secondary'>Enter the value in the field below.</Text>
						<Input placeholder='Enter the value' />
					</Space>
				</Card>
			),
		},
	];

	const { token } = theme.useToken();
	const [current, setCurrent] = useState(0);

	const next = () => {
		setCurrent(current + 1);
	};

	const prev = () => {
		setCurrent(current - 1);
	};

	const items = steps.map((item) => ({ key: item.title, title: item.title }));

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
						<Input
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
						</Button>
						<div style={{ display: 'none' }}>
							<Steps current={current} items={items} size='small' />
							<div style={contentStyle}>{steps[current].content}</div>
							<div style={{ marginTop: 24 }}>
								{current < steps.length - 1 && (
									<Button type='primary' onClick={() => next()}>
										Next
									</Button>
								)}
								{current === steps.length - 1 && (
									<Button type='primary'>Done</Button>
								)}
								{current > 0 && (
									<Button style={{ margin: '0 8px' }} onClick={() => prev()}>
										Previous
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
