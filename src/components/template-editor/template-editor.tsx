import React, { FC, useEffect, useRef, useState } from 'react';
import './template-editor.css';
import { Card, Col, Row, Space, Spin, Typography } from 'antd';
import axios from 'axios';
import { BASE_URL } from '../../config/config';
import { Action, ApiEntity } from '../../config/enum';
import useSaveArrayBuffer from '../../hooks/use-save-array-buffer';
import { TemplateEditorContext } from './template-editor-context';
import { HtmlBlock } from './html-block/html-block';
import { ChooseTemplateType } from './choose-template-type/choose-template-type';
import { Placeholder, Template } from '../../config/types';
import { PdfViewer } from './pdf-viewer/pdf-viewer';
import { PlaceholderBlock } from './placeholder-block/placeholder-block';
export interface TemplateEditorProps {
	apiKey?: string;
	clientKey?: string;
	token?: string;
	userKey?: string;
	templateKey?: string;
}
export const TemplateEditor: FC<TemplateEditorProps> = ({
	apiKey,
	templateKey,
	token,
	clientKey,
	userKey,
}) => {
	if (!apiKey && !token && !window.location.href.includes('story')) {
		throw new Error('Missing authority data');
	}
	const { getArrayBuffer, setArrayBuffer, clearArrayBuffer } =
		useSaveArrayBuffer();

	const [resultModal, setResultModal] = useState({ open: false, action: '' });
	const [templateName, setTemplateName] = useState('');
	const [templateValue, setTemplateValue] = useState('');
	const [isPdf, setIsPdf] = useState(false);
	const [isNew, setIsNew] = useState(false);
	const [createTemplate, setCreateTemplate] = useState(false);
	const [continueLoad, setContinueLoad] = useState(false);
	const [editorVisible, setEditorVisible] = useState(
		templateKey ? true : false
	);
	const [placeholderVisible, setPlaceholderVisible] = useState(true);
	const [templateType, setTemplateType] = useState('');
	const [currTemplateKey, setCurrTemplateKey] = useState(templateKey);
	const [currClientKey, setCurrClientKey] = useState(clientKey);
	const [currUserKey, setCurrUserKey] = useState(userKey);
	const [currApiKey, setCurrApiKey] = useState(apiKey);
	const [currToken, setCurrToken] = useState(token);
	const [pdfFileLoad, setPdfFileLoad] = useState(0);
	const [refreshPlaceholders, setRefreshPlaceholders] = useState(0);
	const [placeholder, setPlaceholder] = useState<Placeholder[]>([]);
	const [spinLoad, setSpinLoad] = useState(false);
	const templateKeyRef = useRef(templateKey);
	const { Title, Text } = Typography;
	const quillRef = useRef<any>();

	useEffect(() => {
		setCurrToken(token);
	}, [token]);
	useEffect(() => {
		setCurrApiKey(apiKey);
	}, [apiKey]);
	useEffect(() => {
		setCurrClientKey(clientKey);
	}, [clientKey]);
	useEffect(() => {
		setCurrUserKey(userKey);
	}, [userKey]);
	useEffect(() => {
		let isMounted = true;
		clearArrayBuffer();
		setPlaceholder([]);

		if (currApiKey || currToken) {
			setSpinLoad(false);
			templateKeyRef.current = templateKey;
			let body = {};
			if (templateKeyRef.current) {
				setIsNew(false);
				setIsPdf(false);
				setContinueLoad(true);
				setEditorVisible(true);
				const getTemplate = async () => {
					body = {
						data: {
							action: Action.READ,
							clientKey: clientKey,
							userKey: userKey,
							template: {
								templateKey: templateKeyRef.current,
							},
						},
					};
					let templateTmp: Template = {
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
							if (isMounted) {
								templateTmp = payload.data.template;
							}
						});
					if (templateTmp.isPdf) {
						await axios
							.get(templateTmp.value as string, {
								responseType: 'arraybuffer',
							})
							.then(async function (response) {
								setIsPdf(true);
								await setArrayBuffer('pdfFileTemplate', response.data);
								setPdfFileLoad(pdfFileLoad + 1);
								setContinueLoad(false);
							});
					} else {
						setTemplateValue(
							templateTmp.value ? (templateTmp.value as string) : '<div></div>'
						);
						setContinueLoad(false);
					}
				};
				getTemplate();
			} else {
				setIsNew(true);
				setEditorVisible(false);
				setIsPdf(false);
				setTemplateName('');
				setTemplateType('');
				setTemplateValue('<div></div>');
				setContinueLoad(false);
			}
		} else {
			setSpinLoad(true);
		}
		return () => {
			isMounted = false;
		};
	}, [templateKey]);
	useEffect(() => {
		let isMounted = true;
		const handleContinue = async () => {
			// setLoadEditor(true);
			let body = {
				data: {
					action: Action.CREATE,
					clientKey: clientKey,
					userKey: userKey,
					template: {
						name: templateName,
						value: templateValue,
						isPdf: isPdf,
					},
				},
			};
			let templateTmp: Template = {
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
					if (isMounted) {
						console.log('TEMPLATE', isMounted, payload);
					}
					setCurrTemplateKey(payload.data.template.templateKey);
					templateTmp = payload.data.template;
					setIsNew(false);
					setEditorVisible(true);
				});
			if (isPdf) {
				const formData = new FormData();
				const pdfFile = (await getArrayBuffer(
					'pdfFileTemplate'
				)) as ArrayBuffer;
				const pdfFileBlob = new Blob([pdfFile], { type: 'application/pdf' });
				formData.append('pdf', pdfFileBlob);
				let url = `${BASE_URL}${ApiEntity.UPLOAD_PDF}?templateKey=${templateTmp.templateKey}&clientKey=${clientKey}`;
				await axios
					.post(url, formData, {
						headers: {
							'x-sendforsign-key': !currToken && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
							Authorization: currToken ? `Bearer ${currToken}` : undefined,
						},
						responseType: 'json',
					})
					.then((payload: any) => {
						//console.log('editor read', payload);
					});
			}
			setContinueLoad(false);
		};
		if (createTemplate) {
			setCreateTemplate(false);
			handleContinue();
		}
		return () => {
			isMounted = false;
		};
	}, [createTemplate]);

	return (
		<TemplateEditorContext.Provider
			value={{
				resultModal,
				setResultModal,
				clientKey: currClientKey,
				setClientKey: setCurrClientKey,
				userKey: currUserKey,
				setUserKey: setCurrUserKey,
				templateKey: currTemplateKey,
				setTemplateKey: setCurrTemplateKey,
				pdfFileLoad,
				setPdfFileLoad,
				templateName,
				setTemplateName,
				templateValue,
				setTemplateValue,
				templateType,
				setTemplateType,
				editorVisible,
				setEditorVisible,
				isPdf,
				setIsPdf,
				createTemplate,
				setCreateTemplate,
				continueLoad,
				setContinueLoad,
				refreshPlaceholders,
				setRefreshPlaceholders,
				placeholder,
				setPlaceholder,
				placeholderVisible,
				setPlaceholderVisible,
				apiKey: currApiKey,
				setApiKey: setCurrApiKey,
				token: currToken,
				setToken: setCurrToken,
			}}
		>
			{spinLoad ? (
				<Spin spinning={spinLoad} fullscreen />
			) : (
				<Space direction='vertical' size={16} style={{ display: 'flex' }}>
					{isNew && <ChooseTemplateType />}
					{editorVisible && (
						<Row gutter={{ xs: 8, sm: 8, md: 8, lg: 8 }} wrap={false}>
							<Col flex='auto'>
								<Space
									direction='vertical'
									size={16}
									style={{ display: 'flex' }}
								>
									<Card loading={continueLoad}>
										<Space
											direction='vertical'
											size={16}
											style={{ display: 'flex' }}
										>
											<Space direction='vertical' size={2}>
												<Title level={4} style={{ margin: '0 0 0 0' }}>
													Review your template
												</Title>
												<Text type='secondary'>
													Highlight text to see options.
												</Text>
											</Space>
											{!isPdf ? (
												<>
													{templateValue && (
														<HtmlBlock
															value={templateValue}
															quillRef={quillRef}
														/>
													)}
												</>
											) : (
												<PdfViewer />
											)}
										</Space>
									</Card>
								</Space>
							</Col>
							{!isPdf && (
								<Col flex='300px' style={{ display: 'block' }}>
									<Space
										direction='vertical'
										style={{
											display: 'flex',
											top: 10,
											position: 'sticky',
											maxHeight: '90vh',
											overflow: 'auto',
										}}
									>
										<PlaceholderBlock quillRef={quillRef} />
									</Space>
								</Col>
							)}
						</Row>
					)}
				</Space>
			)}
		</TemplateEditorContext.Provider>
	);
};
