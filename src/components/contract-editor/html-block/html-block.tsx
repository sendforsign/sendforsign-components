import React, { useEffect } from 'react';
import 'quill/dist/quill.bubble.css';
import QuillNamespace from 'quill';
import QuillBetterTable from 'quill-better-table';
import { useDebouncedCallback } from 'use-debounce';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useContractEditorContext } from '../contract-editor-context';
import { BASE_URL } from '../../../config/config';
import { Action, ApiEntity } from '../../../config/enum';
import { addBlotClass } from '../../../utils';

//env.config();
type Props = {
	value: string;
	quillRef: React.MutableRefObject<QuillNamespace | undefined>;
};
QuillNamespace.register(
	{
		'modules/better-table': QuillBetterTable,
	},
	true
);
for (let index = 1; index <= 40; index++) {
	addBlotClass(index);
}
export const HtmlBlock = ({ value, quillRef }: Props) => {
	dayjs.extend(utc);
	const {
		apiKey,
		contractKey,
		clientKey,
		userKey,
		sign,
		setSign,
		contractSign,
		setContractSign,
		setContinueLoad,
		setNotification,
		readonly,
		refreshSign,
		setReadonly,
		setSignCount,
		refreshPlaceholders,
		setRefreshPlaceholders,
	} = useContractEditorContext();
	const container = document.querySelector('#contract-editor-container');

	useEffect(() => {
		if (document.querySelector('#contract-editor-container')) {
			quillRef.current = new QuillNamespace('#contract-editor-container', {
				modules: {
					toolbar: {
						container: [
							['bold', 'italic', 'underline', 'strike'], // toggled buttons
							['blockquote'],

							[{ list: 'ordered' }, { list: 'bullet' }],
							[{ script: 'sub' }, { script: 'super' }], // superscript/subscript
							[{ indent: '-1' }, { indent: '+1' }], // outdent/indent
							[{ direction: 'rtl' }], // text direction

							[{ size: ['small', false, 'large', 'huge'] }], // custom dropdown

							[{ color: [] }, { background: [] }], // dropdown with defaults from theme
							[{ font: [] }],
							[{ align: [] }],

							['link', 'image', 'table'],

							['clean'],
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
						(e: {
							preventDefault: () => void;
							stopPropagation: () => void;
						}) => {
							e.preventDefault();
							e.stopPropagation();
						}
					);

				quillRef.current.on(
					'text-change',
					function (delta: any, oldDelta: any, source: any) {
						console.log('text-change', source, delta);
						// setCurrentValue(
						// 	quillRef?.current ? quillRef?.current?.root?.innerHTML : ''
						// );
						// console.log('source', source, quillRef?.current?.root?.innerHTML);
						if (source === 'user') {
							handleChangeText(
								quillRef?.current ? quillRef?.current?.root?.innerHTML : ''
							);
						}
					}
				);
				// quillRef.current.on(
				// 	'editor-change',
				// 	function (eventName: any, ...args: any) {
				// 		console.log('editor-change', eventName, args);
				// 		// setCurrentValue(
				// 		// 	quillRef?.current ? quillRef?.current?.root?.innerHTML : ''
				// 		// );
				// 		// console.log('source', source, quillRef?.current?.root?.innerHTML);
				// 		// if (source === 'user') {
				// 		// 	handleChangeText(
				// 		// 		quillRef?.current ? quillRef?.current?.root?.innerHTML : ''
				// 		// 	);
				// 		// }
				// 	}
				// );
			}
		}
	}, [container]);
	useEffect(() => {
		if (value && quillRef?.current) {
			quillRef?.current?.clipboard.dangerouslyPasteHTML(value);
			setRefreshPlaceholders(refreshPlaceholders + 1);
		}
	}, [value]);
	useEffect(() => {
		if (readonly) {
			quillRef?.current?.enable(!readonly);
		}
	}, [readonly]);
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

			handleChangeText(textTmp, false);
			quillRef?.current?.clipboard.dangerouslyPasteHTML(textTmp);
			debugger;
			setContinueLoad(false);
			setSign('');
			setContractSign({});
			quillRef?.current?.enable(false);
			sendEmail();
		}
	}, [sign, contractSign]);
	useEffect(() => {
		const getSigns = async () => {
			let url = `${BASE_URL}${ApiEntity.CONTRACT_SIGN}?contractKey=${contractKey}&clientKey=${clientKey}`;
			await axios
				.get(url, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': apiKey, //process.env.SENDFORSIGN_API_KEY,
					},
					responseType: 'json',
				})
				.then((payload) => {
					console.log('getSigns read', payload);
					setSignCount(payload.data.length);
					if (payload.data.length > 0) {
						setReadonly(true);
					}
				});
		};
		getSigns();
	}, [refreshSign]);

	const addTable = () => {
		(quillRef.current as QuillNamespace)
			.getModule('better-table')
			.insertTable(3, 3);
	};
	const handleChangeText = useDebouncedCallback(
		async (content: string, needCheck: boolean = true) => {
			let body = {};
			let changed = false;
			let contractValueTmp = '';
			if (needCheck) {
				body = {
					clientKey: clientKey,
					userKey: userKey,
					contractKey: contractKey,
				};
				await axios
					.post(BASE_URL + ApiEntity.CHECK_CONTRACT_VALUE, body, {
						headers: {
							Accept: 'application/vnd.api+json',
							'Content-Type': 'application/vnd.api+json',
							'x-sendforsign-key': apiKey, //process.env.SENDFORSIGN_API_KEY,
						},
						responseType: 'json',
					})
					.then((payload) => {
						console.log('CHECK_CONTRACT_VALUE read', payload);
						changed = payload.data.changed;
						contractValueTmp = payload.data.contractValue;
					});
			}
			if (!changed) {
				body = {
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
							'x-sendforsign-key': apiKey, //process.env.SENDFORSIGN_API_KEY,
						},
						responseType: 'json',
					})
					.then((payload) => {
						console.log('editor read', payload);
					});
			} else {
				setReadonly(true);
				if (contractValueTmp) {
					quillRef?.current?.clipboard.dangerouslyPasteHTML(contractValueTmp);
				}
				setNotification({
					text: 'Contract updated. Please, reload the page.',
				});
			}
		},
		5000,
		// The maximum time func is allowed to be delayed before it's invoked:
		{ maxWait: 5000 }
	);
	const sendEmail = async () => {
		let body = {
			clientKey: clientKey,
			contractKey: contractKey,
		};
		await axios
			.post(BASE_URL + ApiEntity.CONTRACT_EMAIL_SIGN, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': apiKey, //process.env.SENDFORSIGN_API_KEY,
				},
				responseType: 'json',
			})
			.then((payload) => {
				console.log('editor read', payload);
			});
	};
	return (
		<div id='scroll-container'>
			<div id='contract-editor-container' />
		</div>
	);
};
