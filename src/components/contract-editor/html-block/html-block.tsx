import React, { useEffect, useRef } from 'react';
import './html-block.css';
import QuillNamespace from 'quill';
import Inline from 'quill/blots/inline';
import QuillBetterTable from 'quill-better-table';
import { useDebouncedCallback } from 'use-debounce';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useContractEditorContext } from '../contract-editor-context';
import { BASE_URL } from '../../../config/config';
import {
	Action,
	ApiEntity,
	PlaceholderColor,
	PlaceholderView,
	SpecialType,
} from '../../../config/enum';
import { addBlotClass, removeAilineTags, wrapTextNodes } from '../../../utils';

class AiLineBlot extends Inline {
	static create(value: string) {
		const node = super.create();
		node.setAttribute('value', value);
		node.style.whiteSpace = 'pre-wrap';
		return node;
	}
	static blotName = 'ailine';
	static tagName = 'ailine';

	static formats(node: HTMLElement) {
		return node.getAttribute('value');
	}

	format(name: string, value: string) {
		if (name === 'ailine' && value) {
			this.domNode.setAttribute('value', value);
			this.domNode.style.whiteSpace = 'pre-wrap';
		}
	}
}

QuillNamespace.register(AiLineBlot);

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
		token,
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
		placeholder,
		setPlaceholder,
		setLoad,
		setRefreshPlaceholders,
		setDocumentCurrentSaved,
		focusElement,
		setFocusElement,
		aiHidden,
	} = useContractEditorContext();
	const container = document.querySelector('#contract-editor-container');
	const placeholderClassFill = useRef(false);
	const focusElementRef = useRef('');

	useEffect(() => {
		if (focusElement) {
			focusElementRef.current = focusElement;
		}
	}, [focusElement]);

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
					clipboard: {
						matchVisual: false,
						allowed: {
							tags: [
								'p',
								'br',
								'strong',
								'em',
								'u',
								's',
								'blockquote',
								'ol',
								'ul',
								'li',
								'sub',
								'sup',
								'h1',
								'h2',
								'h3',
								'h4',
								'h5',
								'h6',
								'span',
							],
							attributes: ['style', 'class', 'href', 'rel', 'target', 'id'],
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
				// scrollingContainer: 'body',
				theme: 'bubble',
			});
			if (quillRef.current) {
				(quillRef.current as any)
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

				// Add focus tracking
				const editorContainer = document.querySelector(
					'#contract-editor-container'
				);
				if (editorContainer) {
					let hasChanges = false;

					// Track text changes
					quillRef.current.on(
						'text-change',
						function (delta: any, oldDelta: any, source: any) {
							if (source === 'user') {
								hasChanges = true;
								setDocumentCurrentSaved(false);
								handleChangeText(
									quillRef?.current ? quillRef?.current?.root?.innerHTML : ''
								);
							}
						}
					);

					// Handle clicks outside the editor
					document.addEventListener('click', (e) => {
						const target = e.target as HTMLElement;
						const editor = editorContainer.querySelector('.ql-editor');
						if (!editor?.contains(target) && hasChanges) {
							console.log('addEventListener');
							hasChanges = false;
							let contentTmp = removeAilineTags(
								quillRef?.current?.root?.innerHTML as string
							);
							contentTmp = wrapTextNodes(contentTmp);
							// quillRef?.current?.clipboard.dangerouslyPasteHTML(
							// 	contentTmp,
							// 	'silent'
							// );
							handleChangeText(contentTmp);
							// if (focusElementRef.current) {
							// 	const element = document.getElementById(
							// 		focusElementRef.current
							// 	);
							// 	element?.focus();
							// 	setFocusElement('');
							// } else if (!aiHidden) {
							// 	const element = document.getElementById(
							// 		'AiAssistantTextArea'
							// 	) as HTMLTextAreaElement;
							// 	element?.focus();
							// }
						}
					});
				}
			}
		}
	}, [container]);

	useEffect(() => {
		const setValue = async () => {
			const processedValue = wrapTextNodes(value); // Обрабатываем HTML
			quillRef?.current?.clipboard.dangerouslyPasteHTML(processedValue, 'user');
			// debugger;
			setLoad(false);
			setRefreshPlaceholders(refreshPlaceholders + 1);
			if (!placeholderClassFill.current) {
				await getPlaceholders();
			}
		};
		if (value && quillRef?.current) {
			setValue();
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
				`<p>Timestamp: ${dayjs(contractSign.createTime)
					.utc()
					.format('YYYY-MM-DD HH:mm:ss')} GMT</p>`;

			handleChangeText(textTmp, false, true);
			quillRef?.current?.clipboard.dangerouslyPasteHTML(textTmp);
			// debugger;
			setContinueLoad(false);
			setSign('');
			setContractSign({});
			quillRef?.current?.enable(false);
		}
	}, [sign, contractSign]);
	useEffect(() => {
		let isMounted = true;
		const getSigns = async () => {
			let url = `${BASE_URL}${ApiEntity.CONTRACT_SIGN}?contractKey=${contractKey}&clientKey=${clientKey}`;
			await axios
				.get(url, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
						Authorization: token ? `Bearer ${token}` : undefined,
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					//console.log('getSigns read', payload);
					setSignCount(payload.data.length);
					if (payload.data.length > 0) {
						setReadonly(true);
					}
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
		getSigns();
		return () => {
			isMounted = false;
		};
	}, [refreshSign]);

	const getPlaceholders = async () => {
		if (placeholder && placeholder.length > 0) {
			for (let index = 0; index < placeholder.length; index++) {
				if (
					placeholder[index].view?.toString() !==
					PlaceholderView.SIGNATURE.toString()
				) {
					// const elements = document.getElementsByTagName(
					// 	`placeholder${placeholder[index].id}`
					// );
					let tagClass = `placeholderClass${placeholder[index].id}`;
					if (placeholder[index].specialType) {
						switch (placeholder[index].specialType) {
							case SpecialType.DATE:
								// elements = document.getElementsByTagName(`date${id}`);
								tagClass = `dateClass${placeholder[index].id}`;
								break;

							case SpecialType.FULLNAME:
								// elements = document.getElementsByTagName(`fullname${id}`);
								tagClass = `fullnameClass${placeholder[index].id}`;
								break;

							case SpecialType.EMAIL:
								// elements = document.getElementsByTagName(`email${id}`);
								tagClass = `emailClass${placeholder[index].id}`;
								break;

							case SpecialType.SIGN:
								// elements = document.getElementsByTagName(`sign${id}`);
								tagClass = `signClass${placeholder[index].id}`;
								break;

							case SpecialType.INITIALS:
								// elements = document.getElementsByTagName(`initials${id}`);
								tagClass = `initialsClass${placeholder[index].id}`;
								break;
						}
					}

					const styleSheet = document.styleSheets[0]; // Получаем первый стиль
					styleSheet.insertRule(
						`.${tagClass} { background-color: ${
							placeholder[index].color
								? placeholder[index].color
								: PlaceholderColor.OTHER
						} }`,
						styleSheet.cssRules.length
					);
				}
			}
			placeholderClassFill.current = true;
		} else {
			const body = {
				data: {
					action: Action.LIST,
					clientKey: !token ? clientKey : undefined,
					contractKey: contractKey,
				},
			};
			await axios
				.post(BASE_URL + ApiEntity.PLACEHOLDER, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
						Authorization: token ? `Bearer ${token}` : undefined,
						'x-sendforsign-component': true,
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					//console.log('getPlaceholders read', payload);

					if (
						payload.data.placeholders &&
						payload.data.placeholders.length > 0
					) {
						setPlaceholder(payload.data.placeholders);
						for (
							let index = 0;
							index < payload.data.placeholders.length;
							index++
						) {
							if (
								payload.data.placeholders[index].view.toString() !==
								PlaceholderView.SIGNATURE.toString()
							) {
								let tagClass = `placeholderClass${payload.data.placeholders[index].id}`;
								if (payload.data.placeholders[index].specialType) {
									switch (payload.data.placeholders[index].specialType) {
										case SpecialType.DATE:
											// elements = document.getElementsByTagName(`date${id}`);
											tagClass = `dateClass${payload.data.placeholders[index].id}`;
											break;

										case SpecialType.FULLNAME:
											// elements = document.getElementsByTagName(`fullname${id}`);
											tagClass = `fullnameClass${payload.data.placeholders[index].id}`;
											break;

										case SpecialType.EMAIL:
											// elements = document.getElementsByTagName(`email${id}`);
											tagClass = `emailClass${payload.data.placeholders[index].id}`;
											break;

										case SpecialType.SIGN:
											// elements = document.getElementsByTagName(`sign${id}`);
											tagClass = `signClass${payload.data.placeholders[index].id}`;
											break;

										case SpecialType.INITIALS:
											// elements = document.getElementsByTagName(`initials${id}`);
											tagClass = `initialsClass${payload.data.placeholders[index].id}`;
											break;
									}
								}
								const styleSheet = document.styleSheets[0]; // Получаем первый стиль
								styleSheet.insertRule(
									`.${tagClass} { background-color: ${
										payload.data.placeholders[index].color
											? payload.data.placeholders[index].color
											: PlaceholderColor.OTHER
									} }`,
									styleSheet.cssRules.length
								);
							}
						}
						placeholderClassFill.current = true;
					}
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
		}
	};
	const addTable = () => {
		(quillRef?.current?.getModule('better-table') as any).insertTable(3, 3);
	};
	const removeParentSpan = (element: HTMLElement | null) => {
		// Проверяем, что элемент существует
		if (element) {
			// Получаем родительский элемент
			const parent = element.parentElement;
			// Проверяем, является ли родительский элемент тегом <span>
			if (parent && parent.tagName.toLowerCase() === 'span') {
				// Перемещаем текущий элемент перед родительским
				parent.parentNode?.insertBefore(element, parent);
				// Удаляем родительский элемент
				parent.remove();
			}
		}
	};
	const handleChangeText = useDebouncedCallback(
		async (
			content: string,
			needCheck: boolean = true,
			email: boolean = false
		) => {
			let contentTmp = content;
			// let contentTmp = removeAilineTags(content); // Удаляем теги перед сохранением
			// contentTmp = wrapTextNodes(contentTmp);

			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = contentTmp;
			for (let index = 0; index < placeholder.length; index++) {
				if (
					placeholder[index].view?.toString() !==
					PlaceholderView.SIGNATURE.toString()
				) {
					let tag = `placeholder${placeholder[index].id}`;
					if (placeholder[index].specialType) {
						switch (placeholder[index].specialType) {
							case SpecialType.DATE:
								tag = `date${placeholder[index].id}`;
								break;

							case SpecialType.FULLNAME:
								tag = `fullname${placeholder[index].id}`;
								break;

							case SpecialType.EMAIL:
								tag = `email${placeholder[index].id}`;
								break;

							case SpecialType.SIGN:
								tag = `sign${placeholder[index].id}`;
								break;

							case SpecialType.INITIALS:
								tag = `initials${placeholder[index].id}`;
								break;
						}
					}
					const elements = tempDiv.getElementsByTagName(tag);
					for (let i = 0; i < elements.length; i++) {
						let element: any = elements[i];
						removeParentSpan(element);
					}
				}
			}
			contentTmp = tempDiv.innerHTML;

			let body = {};
			let changed = false;
			let contractValueTmp = '';
			if (needCheck) {
				body = {
					clientKey: !token ? clientKey : undefined,
					userKey: userKey,
					contractKey: contractKey,
				};
				await axios
					.post(BASE_URL + ApiEntity.CHECK_CONTRACT_VALUE, body, {
						headers: {
							Accept: 'application/vnd.api+json',
							'Content-Type': 'application/vnd.api+json',
							'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
							Authorization: token ? `Bearer ${token}` : undefined,
						},
						responseType: 'json',
					})
					.then((payload: any) => {
						//console.log('CHECK_CONTRACT_VALUE read', payload);
						changed = payload.data.changed;
						contractValueTmp = payload.data.contractValue;
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
			}
			if (!changed) {
				body = {
					data: {
						action: Action.UPDATE,
						clientKey: !token ? clientKey : undefined,
						userKey: userKey,
						contract: { contractKey: contractKey, value: contentTmp },
					},
				};
				await axios
					.post(BASE_URL + ApiEntity.CONTRACT, body, {
						headers: {
							Accept: 'application/vnd.api+json',
							// 'Content-Type': 'application/vnd.api+json',
							'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
							Authorization: token ? `Bearer ${token}` : undefined,
						},
						responseType: 'json',
					})
					.then((payload: any) => {
						//console.log('editor read', payload);
						if (email) {
							sendEmail();
						}
						setDocumentCurrentSaved(true);
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
			clientKey: !token ? clientKey : undefined,
			contractKey: contractKey,
		};
		await axios
			.post(BASE_URL + ApiEntity.CONTRACT_EMAIL_SIGN, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
					Authorization: token ? `Bearer ${token}` : undefined,
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				//console.log('editor read', payload);
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
		<div id='scroll-container'>
			<div id='contract-editor-container' />
		</div>
	);
};
