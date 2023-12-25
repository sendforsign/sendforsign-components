import React, { FC, useContext, useEffect, useRef, useState } from 'react';
// import './editor.css';
import 'quill/dist/quill.bubble.css';
import QuillNamespace, { Quill } from 'quill';
import QuillBetterTable from 'quill-better-table';
import { Document, Page, pdfjs } from 'react-pdf';
import { useDebouncedCallback } from 'use-debounce';
import {
	Space,
	Card,
	Typography,
	Button,
	Spin,
	Tag,
	Input,
	Tooltip,
	Row,
	Col,
	Modal,
} from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useEditorContext } from '../editor-context';
import { BASE_URL } from '../../../config/config';
import { Action, ApiEntity } from '../../../config/enum';

QuillNamespace.register(
	{
		'modules/better-table': QuillBetterTable,
	},
	true
);
export const HtmlBlock = () => {
	dayjs.extend(utc);
	const {
		contractKey,
		clientKey,
		userKey,
		contractValue,
		setContractValue,
		sign,
		setSign,
		contractSign,
		setContractSign,
	} = useEditorContext();
	const { Title, Text } = Typography;
	const quillRef = useRef<Quill>();
	useEffect(() => {
		quillRef.current = new QuillNamespace('#editor-container', {
			modules: {
				toolbar: {
					container: [
						['bold', 'italic', 'underline', 'strike', 'blockquote'],
						[{ color: [] }, { background: [] }],
						[
							{ list: 'ordered' },
							{ list: 'bullet' },
							{ indent: '-1' },
							{ indent: '+1' },
						],
						[{ align: [] }],
						['link', 'image', 'table'],
						['blockquote', 'code-block'],
						[{ direction: 'rtl' }],
					],
					handlers: {
						table: addTable,
					},
				},
				table: false, // disable table module
				'better-table': {
					operationMenu: {
						items: {
							unmergeCells: {
								text: 'Unmerge',
							},
						},
					},
				},
				keyboard: {
					bindings: QuillBetterTable.keyboardBindings,
				},
				history: {
					delay: 5000,
					maxStack: 5000,
					userOnly: true,
				},
			},
			scrollingContainer: 'body',
			theme: 'bubble',
		});

		if (quillRef.current) {
			quillRef.current
				.getModule('toolbar')
				.container.addEventListener(
					'mousedown',
					(e: { preventDefault: () => void; stopPropagation: () => void }) => {
						e.preventDefault();
						e.stopPropagation();
					}
				);

			quillRef.current.on(
				'text-change',
				function (delta: any, oldDelta: any, source: any) {
					if (source === 'user') {
						handleChangeText(
							quillRef?.current ? quillRef?.current?.root?.innerHTML : ''
						);
					}
				}
			);
		}
	}, []);
	useEffect(() => {
		if (contractValue) {
			quillRef?.current?.clipboard.dangerouslyPasteHTML(contractValue);
			setContractValue('');
		}
	}, [contractValue]);
	useEffect(() => {
		if (sign && contractSign) {
			let textTmp =
				quillRef?.current?.root.innerHTML +
				`<br></br><p><img src='${sign}' alt="signature" /></p>`;
			textTmp = textTmp + `<p>Name: ${contractSign.fullName}</p>`;
			textTmp = textTmp + `<p>Email: ${contractSign.email}</p>`;
			textTmp =
				textTmp +
				`<p>Timestamp: ${dayjs(contractSign.createTime).format(
					'YYYY-MM-DD HH:mm:ss'
				)} GMT</p>`;

			quillRef?.current?.clipboard.dangerouslyPasteHTML(textTmp);
			handleChangeText(textTmp);
			setSign('');
			setContractSign({});
			quillRef?.current?.enable(false);
		}
	}, [sign, contractSign]);
	const addTable = () => {
		debugger;
		(quillRef.current as QuillNamespace)
			.getModule('better-table')
			.insertTable(3, 3);
	};
	const handleChangeText = useDebouncedCallback(
		async (content: string) => {
			let body = {
				data: {
					action: Action.UPDATE,
					clientKey: clientKey,
					userKey: userKey,
					contract: { contractKey: contractKey, value: content },
				},
			};
			await axios
				.post(BASE_URL + ApiEntity.CONTRACT, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': 're_api_key', //process.env.SENDFORSIGN_API_KEY,
					},
					responseType: 'json',
				})
				.then((payload) => {
					console.log('editor read', payload);
				});
		},
		5000,
		// The maximum time func is allowed to be delayed before it's invoked:
		{ maxWait: 5000 }
	);
	return (
		<Card style={{ display: 'flex' }} bordered={true} id='part-2'>
			<Space direction='vertical' size={16} style={{ display: 'flex' }}>
				<Space direction='vertical' size={2}>
					<Title level={4} style={{ margin: '0 0 0 0' }}>
						Review your document, highlight text to see options
					</Title>
					<Text type='secondary'>
						The green text is where you may want to replace it with your own
						text.
					</Text>
				</Space>
				<div id='scroll-container'>
					<div id='editor-container' />
				</div>
			</Space>
		</Card>
	);
};
