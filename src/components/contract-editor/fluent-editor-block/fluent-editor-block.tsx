import React, { useEffect, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import FluentEditor from '@opentiny/fluent-editor';
// import QuillBetterTable from 'quill-better-table';
import ImageToolbarButtons from '@opentiny/fluent-editor';
import MarkdownShortcuts from 'quill-markdown-shortcuts';
import TableUp, { defaultCustomSelect, TableAlign, TableMenuSelect, TableMenuContextmenu, TableResizeBox, TableResizeScale, TableSelection, TableVirtualScrollbar } from 'quill-table-up';
import hljs from 'highlight.js'
import Html2Canvas from 'html2canvas'
import katex from 'katex'

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
import { addBlotClass, wrapTextNodes, cleanEditorHTML, convertBlobImagesInHtml, convertQuillTablesInHTML, convertHTMLTablesToQuillFormat } from '../../../utils';

import '@opentiny/fluent-editor/style.css';
import 'highlight.js/styles/atom-one-dark.css'
import 'katex/dist/katex.min.css'
import 'quill-table-up/index.css'
import 'quill-table-up/table-creator.css'
import Inline from 'quill/blots/inline';

type Props = {
	fluentRef: React.MutableRefObject<FluentEditor | undefined>;
	value: string;
}
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

FluentEditor.register(AiLineBlot);

for (let index = 1; index <= 40; index++) {
	addBlotClass(index);
}

FluentEditor.register({ 'modules/table-up': TableUp }, true);
FluentEditor.register({ 'modules/markdownShortcuts': MarkdownShortcuts }, true); 

export const FluentEditorBlock = ({ fluentRef, value }: Props) => {
	const TOOLBAR_CONFIG = [
		['undo', 'redo', 'clean'], //'format-painter'
		[
			{ header: [1, 2, 3, 4, 5, 6, false] },
			{ font: [] },
			{ size: [false, '12px', '14px', '16px', '18px', '20px', '24px', '32px', '36px', '48px', '72px'] },
			{ 'line-height': [false, '1.2', '1.5', '1.75', '2', '3', '4', '5'] },
		],
		['bold', 'italic', 'strike', 'underline', 'divider'],
		[{ color: [] }, { background: [] }],
		[{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
		[{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
		[{ script: 'sub' }, { script: 'super' }],
		[{ indent: '-1' }, { indent: '+1' }],
		[{ direction: 'rtl' }],
		['link', 'blockquote', 'code'], //'code-block'
		['image', 'formula'], //'file'
		//'screenshot', 'fullscreen''emoji', 'video'
		[{ 'table-up': [] }],
	];
	(window as any).hljs = hljs;
	(window as any).katex = katex;
	(window as any).Html2Canvas = Html2Canvas;
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
		if (document.querySelector('#contract-editor-container') && !fluentRef.current) {
			fluentRef.current = new FluentEditor('#contract-editor-container', {
				theme: 'snow',
				modules: {
					'toolbar': TOOLBAR_CONFIG as any,
					image: {
						toolbar: {
							buttons: {
								copy: false,
								download: false,
								clean: {
									name: 'clean',
									icon: (FluentEditor.import('ui/icons') as Record<string, string>).clean,
									apply(el: HTMLImageElement, toolbarButtons: ImageToolbarButtons) {
										(toolbarButtons as any).clear(el);
										el.removeAttribute('width');
										el.removeAttribute('height');
									},
								},
							},
						},
					},
					table: false,
					'table-up': {
						scrollbar: TableVirtualScrollbar,
						align: TableAlign,
						resize: TableResizeBox,
						resizeScale: TableResizeScale,
						customSelect: defaultCustomSelect,
						selection: TableSelection,
						selectionOptions: {
							tableMenu: TableMenuSelect,
						}
					},
					'syntax': { hljs },
					// 'emoji-toolbar': true,
					'file': true,
					// 'mention': {
					// 	itemKey: 'cn',
					// 	searchKey,
					// 	search(term) {
					// 		return mentionList.filter((item) => {
					// 			return item[searchKey] && String(item[searchKey]).includes(term)
					// 		})
					// 	},
					// },
				},
				trackChanges: 'user'
			});
			if (fluentRef.current) {
				fluentRef.current.on('text-change', () => {
					setDocumentCurrentSaved(false);
					handleChangeText(fluentRef?.current?.root?.innerHTML as string);
				});
				const setValue = async () => {
					// debugger;
					// Применяем wrapTextNodes только если это необходимо
					let processedValue = value;

					// Логируем исходный HTML для отладки
					// console.log('Original HTML:', value);

					// Проверяем, нужно ли применять wrapTextNodes
					// Применяем только если в HTML есть элементы, которые нужно обработать
					const shouldWrapTextNodes = value.includes('<li>') || value.includes('<p>') || value.includes('<div>');

					if (shouldWrapTextNodes) {
						// processedValue = wrapTextNodes(value); // Обрабатываем HTML 
						// console.log('After wrapTextNodes:', processedValue);
					}

					if (processedValue.includes('quill-better-table-wrapper')) {
						processedValue = convertQuillTablesInHTML(processedValue);
					}
					// Преобразуем обычные HTML таблицы в формат ql-table
					if (processedValue.includes('<table>') && !processedValue.includes('ql-table-wrapper')) {
						processedValue = convertHTMLTablesToQuillFormat(processedValue);
					}

					// Очищаем HTML от лишних элементов редактора
					// processedValue = cleanEditorHTML(processedValue);
					// console.log('After cleanEditorHTML:', processedValue);

					// Используем setContents для правильной обработки HTML
					try {
						// Сначала очищаем содержимое
						fluentRef.current?.setContents([]);
						// Затем вставляем новый контент
						fluentRef?.current?.clipboard.dangerouslyPasteHTML(processedValue);
					} catch (error) {
						console.error('Error setting content:', error);
						// Fallback к прямому присваиванию
						if (fluentRef.current && fluentRef.current.root) {
							fluentRef.current.root.innerHTML = processedValue;
						}
					}
					setLoad(false);
					setRefreshPlaceholders(refreshPlaceholders + 1);
					if (!placeholderClassFill.current) {
						await getPlaceholders();
					}
				};
				if (value) {
					setValue();
				}
				if (readonly) {
					fluentRef?.current?.enable(!readonly);
				}
			}
		}
	}, [container]);

	useEffect(() => {
		if (sign && contractSign) {
			let textTmp =
				fluentRef?.current?.root.innerHTML +
				`<br></br><p><img src='${sign}' alt="signature" /></p>`;
			textTmp = textTmp + `<p>Name: ${contractSign.fullName}</p>`;
			textTmp = textTmp + `<p>Email: ${contractSign.email}</p>`;
			textTmp =
				textTmp +
				`<p>Timestamp: ${dayjs(contractSign.createTime)
					.utc()
					.format('YYYY-MM-DD HH:mm:ss')} GMT</p>`;

			handleChangeText(textTmp, false, true);
			fluentRef?.current?.clipboard.dangerouslyPasteHTML(textTmp);
			// debugger;
			setContinueLoad(false);
			setSign('');
			setContractSign({});
			fluentRef?.current?.enable(false);
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
						setDocumentCurrentSaved(true);
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

	useEffect(() => {
		if (readonly) {
			fluentRef?.current?.enable(!readonly);
		}
	}, [readonly]);

	const getPlaceholders = async () => {
		if (placeholder && placeholder.length > 0) {
			for (let index = 0; index < placeholder.length; index++) {
				if (
					placeholder[index].view?.toString() !==
					PlaceholderView.SIGNATURE.toString()
				) {
					let tagClass = `placeholderClass${placeholder[index].id}`;
					if (placeholder[index].specialType) {
						switch (placeholder[index].specialType) {
							case SpecialType.DATE:
								tagClass = `dateClass${placeholder[index].id}`;
								break;

							case SpecialType.FULLNAME:
								tagClass = `fullnameClass${placeholder[index].id}`;
								break;

							case SpecialType.EMAIL:
								tagClass = `emailClass${placeholder[index].id}`;
								break;

							case SpecialType.SIGN:
								tagClass = `signClass${placeholder[index].id}`;
								break;

							case SpecialType.INITIALS:
								tagClass = `initialsClass${placeholder[index].id}`;
								break;
						}
					}

					const styleSheet = document.styleSheets[0]; // Получаем первый стиль
					styleSheet.insertRule(
						`.${tagClass} { background-color: ${placeholder[index].color
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
											tagClass = `dateClass${payload.data.placeholders[index].id}`;
											break;

										case SpecialType.FULLNAME:
											tagClass = `fullnameClass${payload.data.placeholders[index].id}`;
											break;

										case SpecialType.EMAIL:
											tagClass = `emailClass${payload.data.placeholders[index].id}`;
											break;

										case SpecialType.SIGN:
											tagClass = `signClass${payload.data.placeholders[index].id}`;
											break;

										case SpecialType.INITIALS:
											tagClass = `initialsClass${payload.data.placeholders[index].id}`;
											break;
									}
								}
								const styleSheet = document.styleSheets[0]; // Получаем первый стиль
								styleSheet.insertRule(
									`.${tagClass} { background-color: ${payload.data.placeholders[index].color
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
			if (readonly) { return; }
			let contentTmp = content;

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

			// Очищаем HTML от лишних элементов редактора перед сохранением
			contentTmp = cleanEditorHTML(contentTmp);

			// Normalize blob: image src to base64 data URLs before saving
			try {
				contentTmp = await convertBlobImagesInHtml(contentTmp);
			} catch (e) {
				console.error('Failed to normalize blob images', e);
			}

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
				setDocumentCurrentSaved(true);
				if (contractValueTmp) {
					fluentRef?.current?.clipboard.dangerouslyPasteHTML(contractValueTmp);
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
		<div id='contract-editor-container'>
			{/* Тулбар будет автоматически вставлен FluentEditor внутрь этого контейнера, но мы хотим явно обернуть его */}
		</div>
	);
};
