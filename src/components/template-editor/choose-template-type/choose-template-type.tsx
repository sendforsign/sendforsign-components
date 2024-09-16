import React, { useEffect, useState } from 'react';
import { Space, Card, Typography, Button, Tag, Input } from 'antd';
import { ContractType } from '../../../config/enum';
import Segmented, { SegmentedLabeledOption } from 'antd/es/segmented';
import { useTemplateEditorContext } from '../template-editor-context';
import useSaveArrayBuffer from '../../../hooks/use-save-array-buffer';
import { docx2html } from '../../../utils';

export const ChooseTemplateType = () => {
	const {
		setIsPdf,
		templateName,
		setTemplateName,
		setTemplateType,
		templateType,
		setTemplateValue,
		setCreateTemplate,
		pdfFileLoad,
		setPdfFileLoad,
		continueLoad,
		setContinueLoad,
	} = useTemplateEditorContext(); 
	const [options, setOptions] = useState<SegmentedLabeledOption[]>([]);
	const { setArrayBuffer } = useSaveArrayBuffer();
	const [createDisable, setCreateDisable] = useState(true);
	const [continueDisable, setContinueDisable] = useState(true);
	const [fieldBlockVisible, setFieldBlockVisible] = useState(false);
	const [loadSegmented, setLoadSegmented] = useState(false);
	const [btnName, setBtnName] = useState('Create template');
	const { Title, Text } = Typography;

	useEffect(() => {
		setOptions([
			{
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
				value: ContractType.DOCX,
			},
			{
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
				value: ContractType.PDF,
			},
			{
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
				value: ContractType.EMPTY,
			},
		]);
	}, []);

	const handleCreate = async () => {
		let input: HTMLInputElement;
		switch (templateType) {
			case ContractType.DOCX.toString():
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
									setTemplateValue(payload);
									setFieldBlockVisible(true);
									setCreateDisable(true);
								}
							);
						}
					};
				};

				input.click();
				break;
			case ContractType.PDF.toString():
				input = document.createElement('input');
				input.type = 'file';
				input.accept = 'application/pdf';

				input.onchange = (e: any) => {
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
						await setArrayBuffer('pdfFileTemplate', arrayBuffer);
						setFieldBlockVisible(true);
						setCreateDisable(true);
						setPdfFileLoad(pdfFileLoad + 1);
					};
				};

				input.click();
				break;
			case ContractType.EMPTY.toString():
				setFieldBlockVisible(true);
				setCreateDisable(true);
				break;
			default:
				break;
		}
	};

	const handleContinue = async () => {
		setContinueLoad(true);
		setCreateTemplate(true);
	};

	const handleChange = (e: any) => {
		switch (e.target.id) {
			case 'TemplateName':
				setTemplateName(e.target.value);
				if (e.target.value) {
					setContinueDisable(false);
				} else {
					setContinueDisable(true);
				}
				break;
		}
	};

	const handleChoose = (e: any) => {
		if (
			e.toString() === ContractType.DOCX.toString() ||
			e.toString() === ContractType.PDF.toString()
		) {
			setBtnName('Upload file');
		} else {
			setBtnName('Create template');
		}
		setTemplateType(e.toString());
		setCreateDisable(false);
	};

	return (
		<Space direction='vertical' size={16} style={{ display: 'flex' }}>
			<Card loading={loadSegmented}>
				<Space direction='vertical' size={16} style={{ display: 'flex' }}>
					<Space direction='vertical' size={2}>
						<Title level={4} style={{ margin: '0' }}>
							Create a template
						</Title>
						<Text type='secondary'>
							Draft from scratch or upload a file.
						</Text>
					</Space>
					<Segmented options={options} onChange={handleChoose} />
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
								Let's create your template
							</Title>
						</Space>
						<Input
							id='TemplateName'
							placeholder='Enter your template name'
							value={templateName}
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
					</Space>
				</Card>
			)}
		</Space>
	);
};
