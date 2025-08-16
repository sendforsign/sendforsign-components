import React, { useEffect, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import FluentEditor from '@opentiny/fluent-editor';
// import QuillBetterTable from 'quill-better-table';
import ImageToolbarButtons from '@opentiny/fluent-editor';
import MarkdownShortcuts from 'quill-markdown-shortcuts';
import TableUp, { defaultCustomSelect, TableAlign, TableMenuSelect, TableMenuContextmenu, TableResizeBox, TableResizeScale, TableSelection, TableVirtualScrollbar } from 'quill-table-up';


import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
// import { useContractEditorContext } from '../contract-editor-context';
import { BASE_URL } from '../../../config/config';
import {
	Action,
	ApiEntity,
	ContractAction,
	ContractType,
	PlaceholderColor,
	PlaceholderView,
	SpecialType,
	Tags,
} from '../../../config/enum';
import { addBlotClass, removeAilineTags, wrapTextNodes } from '../../../utils';

import '@opentiny/fluent-editor/style.css';
import 'quill-table-up/index.css'
import 'quill-table-up/table-creator.css'
import { useRecipientViewContext } from '../recipient-view-context';
import { changeValueInTag } from '../../../utils/util-for-share';

type Props = {
	value: string;
}

for (let index = 1; index <= 40; index++) {
	addBlotClass(index);
}

FluentEditor.register({ 'modules/table-up': TableUp }, true);
FluentEditor.register({ 'modules/markdownShortcuts': MarkdownShortcuts }, true);

export const FluentEditorBlock = ({ value }: Props) => {
	// const TOOLBAR_CONFIG = [
	// 	['undo', 'redo', 'clean'], //'format-painter'
	// 	[
	// 		{ header: [1, 2, 3, 4, 5, 6, false] },
	// 		{ font: [] },
	// 		{ size: [false, '12px', '14px', '16px', '18px', '20px', '24px', '32px', '36px', '48px', '72px'] },
	// 		{ 'line-height': [false, '1.2', '1.5', '1.75', '2', '3', '4', '5'] },
	// 	],
	// 	['bold', 'italic', 'strike', 'underline', 'divider'],
	// 	[{ color: [] }, { background: [] }],
	// 	[{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
	// 	[{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
	// 	[{ script: 'sub' }, { script: 'super' }],
	// 	[{ indent: '-1' }, { indent: '+1' }],
	// 	[{ direction: 'rtl' }],
	// 	['link', 'blockquote', 'code'], //'code-block'
	// 	['image', 'formula'], //'file'
	// 	//'screenshot', 'fullscreen''emoji', 'video'
	// 	[{ 'table-up': [] }],
	// ];
	// (window as any).hljs = hljs;
	// (window as any).katex = katex;
	// (window as any).Html2Canvas = Html2Canvas;
	dayjs.extend(utc);
	const fluentRef = useRef<any>();

	const {
		sign,
		setSign,
		contractSign,
		setContractSign,
		contract,
		setResultModal,
		setNotification,
		setContractValue,
		contractValue,
		setIsDone,
		placeholder,
		setPlaceholder,
		placeholdersFilling,
		setPlaceholdersFilling
	} = useRecipientViewContext();
	const container = document.querySelector('#contract-editor-container');
	const placeholderClassFill = useRef(false);
	const focusElementRef = useRef('');

	useEffect(() => {
		if (document.querySelector('#contract-editor-container') && !fluentRef.current) {
			fluentRef.current = new FluentEditor('#contract-editor-container', {
				theme: 'snow',
				modules: {
					'toolbar': false,
					image: false,
					table: false,
					'table-up': false,
					// 'syntax': { hljs },
					// 'emoji-toolbar': true,
					// 'file': true,
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
				// trackChanges: 'user'
				readOnly: true
			});
			if (fluentRef.current) {
				// debugger;
				let processedValue = removeAilineTags(value);
				processedValue = wrapTextNodes(value); // Обрабатываем HTML 
				// let processedValue = value; // Обрабатываем HTML 
				if (processedValue.includes('quill-better-table-wrapper')) {
					processedValue = convertQuillTablesInHTML(processedValue);
				}
				fluentRef?.current?.clipboard.dangerouslyPasteHTML(processedValue);
			}
		}
	}, [container]);

	useEffect(() => {
		if (sign &&
			contractSign &&
			contract.contractType &&
			contract.contractType.toString() !== ContractType.PDF.toString()) {
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
			for (let i = 1; i < 5; i++) {
				let tag = '';
				let value = '';
				let color = '#a3e8f6';
				switch (i) {
					case SpecialType.DATE:
						tag = Tags.DATE;
						value = `${dayjs(contractSign.createTime)
							.utc()
							.format('YYYY-MM-DD HH:mm:ss')} GMT`;
						break;
					case SpecialType.FULLNAME:
						tag = Tags.FULLNAME;
						value = contractSign.fullName as string;
						break;
					case SpecialType.EMAIL:
						tag = Tags.EMAIL;
						value = contractSign.email as string;
						break;
					case SpecialType.SIGN:
						tag = Tags.SIGN;
						value = `<img src='${sign}' alt="signature" width="160" height="90"/>`;
						color = '#ffffff';
						break;
				}
				textTmp = changeValueInTag(
					tag,
					contractSign.recipientId as number,
					value,
					textTmp,
					color,
					[]
				);
			}
			handleChangeText(textTmp, false, true);
			fluentRef?.current?.clipboard.dangerouslyPasteHTML(textTmp);
			// debugger;
			// setContinueLoad(false);
			setSign('');
			setContractSign({});
			fluentRef?.current?.enable(false);
		}
	}, [sign, contractSign]);

	useEffect(() => {
		if (
			placeholdersFilling &&
			contract &&
			contract.contractType &&
			contract.contractType.toString() !== ContractType.PDF.toString()
		) {
			fluentRef?.current?.clipboard.dangerouslyPasteHTML(contractValue.contractValue);

			handleChangeText(contractValue.contractValue as string, false, false);
			setPlaceholdersFilling(false);
		}
	}, [placeholdersFilling]);

	const generateId = () => {
		return Math.random().toString(36).substr(2, 10);
	};

	const convertQuillTablesInHTML = (htmlString: string) => {
		// Создаем временный DOM-документ
		const parser = new DOMParser();
		const doc = parser.parseFromString(htmlString, 'text/html');

		// Находим все исходные таблицы
		const sourceTables = doc.querySelectorAll('.quill-better-table-wrapper');

		sourceTables.forEach(sourceWrapper => {
			const sourceTable = sourceWrapper.querySelector('.quill-better-table');
			if (!sourceTable) return;

			// Создаем новый контейнер таблицы
			const newWrapper = document.createElement('div');
			newWrapper.className = 'ql-table-wrapper';
			newWrapper.setAttribute('contenteditable', 'false');
			const tableId = generateId();
			newWrapper.setAttribute('data-table-id', tableId);

			// Создаем новую таблицу
			const newTable = document.createElement('table');
			newTable.className = 'ql-table';
			newTable.setAttribute('data-table-id', tableId);
			newTable.setAttribute('cellpadding', '0');
			newTable.setAttribute('cellspacing', '0');
			newTable.style.marginRight = 'auto';
			newTable.style.width = '100%';

			let colIds: string[] = [];
			// Копируем colgroup из исходной таблицы
			const sourceColgroup = sourceTable.querySelector('colgroup');
			if (sourceColgroup) {
				const colgroup = sourceColgroup.cloneNode(true) as HTMLTableColElement;
				colgroup.setAttribute('data-table-id', tableId);
				colgroup.setAttribute('contenteditable', 'false');
				const cols = colgroup.querySelectorAll('col');

				// Генерируем colIds для каждого столбца
				cols.forEach(col => {
					const colId = generateId();
					col.setAttribute('data-col-id', colId);
					colIds.push(colId);
				});
				newTable.appendChild(colgroup);
			}

			// Создаем тело таблицы
			const tbody = document.createElement('tbody');
			tbody.setAttribute('data-table-id', tableId);

			// Обрабатываем строки
			const sourceRows = sourceTable.querySelectorAll('tr');
			sourceRows.forEach(sourceRow => {
				const rowId = generateId();
				const newRow = document.createElement('tr');
				newRow.className = 'ql-table-row';
				newRow.setAttribute('data-table-id', tableId);
				newRow.setAttribute('data-row-id', rowId);

				// Обрабатываем ячейки
				const sourceCells = Array.from(sourceRow.querySelectorAll('td'));
				let index = 0;
				sourceCells.forEach(sourceCell => {
					const newCell = document.createElement('td');
					newCell.className = 'ql-table-cell';
					newCell.setAttribute('data-table-id', tableId);
					newCell.setAttribute('data-row-id', rowId);
					newCell.setAttribute('data-col-id', colIds[index]);

					// Копируем атрибуты объединения ячеек
					const rowspan = sourceCell.getAttribute('rowspan');
					const colspan = sourceCell.getAttribute('colspan');
					if (rowspan) newCell.setAttribute('rowspan', rowspan);
					if (colspan) newCell.setAttribute('colspan', colspan);

					// Копируем стили
					if (sourceCell.hasAttribute('style')) {
						newCell.setAttribute('style', sourceCell.getAttribute('style') || '');
					}
					if (sourceCell.hasAttribute('data-cell-bg')) {
						newCell.setAttribute('data-cell-bg', sourceCell.getAttribute('data-cell-bg') || '');
					}

					// Создаем внутренний контейнер
					const cellInner = document.createElement('div');
					cellInner.className = 'ql-table-cell-inner';
					cellInner.setAttribute('data-table-id', tableId);
					cellInner.setAttribute('data-row-id', rowId);
					cellInner.setAttribute('data-col-id', colIds[index]);
					cellInner.setAttribute('data-rowspan', rowspan || '1');
					cellInner.setAttribute('data-colspan', colspan || '1');
					cellInner.setAttribute('contenteditable', 'true');

					// Копируем содержимое как чистые элементы
					Array.from(sourceCell.children).forEach(child => {
						const cleanElement = document.createElement(child.tagName.toLowerCase());
						cleanElement.innerHTML = child.innerHTML;
						cellInner.appendChild(cleanElement);
					});
					// 2. Если ячейка была пустая, добавляем минимальную структуру
					if (cellInner.childNodes.length === 0) {
						const p = document.createElement('p');
						p.innerHTML = '<br>';
						cellInner.appendChild(p);
					}

					newCell.appendChild(cellInner);
					newRow.appendChild(newCell);
					index += parseInt(colspan || '1', 10);
				});

				tbody.appendChild(newRow);
			});

			newTable.appendChild(tbody);
			newWrapper.appendChild(newTable);

			// Заменяем старую таблицу новой
			if (sourceWrapper.parentNode) {
				sourceWrapper.parentNode.replaceChild(newWrapper, sourceWrapper);
			}
		});

		// Возвращаем преобразованный HTML
		return doc.documentElement.innerHTML;
	}

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
					shareLink: contract.shareLink,
				};
				await axios
					.post(BASE_URL + ApiEntity.CHECK_CONTRACT_CHANGED, body, {
						headers: {
							Accept: 'application/vnd.api+json',
							'Content-Type': 'application/vnd.api+json',
						},
						responseType: 'json',
					})
					.then((payload: any) => {
						//console.log('CHECK_CONTRACT_VALUE read', payload);
						if (payload.data.changed && payload.data.contractValue) {
							changed = payload.data.changed;
							setContractValue(payload.data.contractValue);
							contractValueTmp = payload.data.contractValue;
						}
					})
					.catch((error) => {
						setNotification({
							text:
								error.response && error.response.data && error.response.data.message
									? error.response.data.message
									: error.message,
						});
					});
			} else {
				contractValueTmp = contentTmp;
			}
			if (!changed) {
				body = {
					shareLink: contract.shareLink,
					contractValue: contentTmp,
				};
				await axios
					.post(BASE_URL + ApiEntity.RECIPIENT_CONTRACT, body, {
						headers: {
							Accept: 'application/vnd.api+json',
							// 'Content-Type': 'application/vnd.api+json',
						},
						responseType: 'json',
					})
					.then((payload: any) => {
						//console.log('editor read', payload);
						if (email) {
							sendEmail();
						}
						// setDocumentCurrentSaved(true); 
						// setIsDone(true);
						setContractValue({ contractValue: payload.data.contractValue, changeTime: payload.data.changeTime });
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
			shareLink: contract.shareLink,
		};
		await axios
			.post(BASE_URL + ApiEntity.RECIPIENT_SIGN_EMAIL, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
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
