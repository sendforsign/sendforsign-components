import { SpecialType, Tags } from '../config/enum';
import { Placeholder } from '../config/types';

export const delColorFromHtml = (value: string) => {
	try {
		// Создаем DOM парсер для универсальной работы с HTML
		const parser = new DOMParser();
		const doc = parser.parseFromString(value, 'text/html');

		// Обрабатываем span элементы с style атрибутами
		// Вместо удаления span элемента, извлекаем его содержимое
		const spanElements = doc.querySelectorAll('span[style]');
		spanElements.forEach((span) => {
			// Проверяем, содержит ли span специфические теги
			const hasSpecialTags = Array.from(span.children).some((child) =>
				child.tagName.toLowerCase().includes('placeholder') ||
				child.tagName.toLowerCase().includes('date') ||
				child.tagName.toLowerCase().includes('fullname') ||
				child.tagName.toLowerCase().includes('email') ||
				child.tagName.toLowerCase().includes('sign') ||
				child.tagName.toLowerCase().includes('initials')
			);

			if (hasSpecialTags) {
				// Создаем DocumentFragment для временного хранения содержимого
				const fragment = document.createDocumentFragment();
				
				// Перемещаем все дочерние узлы span в fragment
				while (span.firstChild) {
					fragment.appendChild(span.firstChild);
				}
				
				// Заменяем span элемент его содержимым
				span.parentNode?.replaceChild(fragment, span);
			}
		});

		// Определяем теги и их максимальные ID для обработки
		const tagConfigs = [
			{ tag: 'placeholder', maxId: 40 },
			{ tag: 'date', maxId: 20 },
			{ tag: 'fullname', maxId: 20 },
			{ tag: 'email', maxId: 20 },
			{ tag: 'sign', maxId: 20 },
		];

		// Обрабатываем каждый тип тега
		tagConfigs.forEach((config) => {
			for (let id = 1; id <= config.maxId; id++) {
				const selector = `${config.tag}${id}`;
				const elements = doc.querySelectorAll(selector);

				elements.forEach((element) => {
					// Устанавливаем класс
					const className = `${config.tag}Class${id}`;
					element.className = className;

					// Устанавливаем contenteditable="false"
					element.setAttribute('contenteditable', 'false');

					// Удаляем style атрибут (убираем цвет)
					element.removeAttribute('style');
				});
			}
		});

		// Возвращаем обработанный HTML
		return doc.body.innerHTML;
	} catch (error) {
		// В случае ошибки возвращаем исходный текст
		console.error('Error in delColorFromHtml:', error);
		return value;
	}
};
export const addActualColors = (
	audit: boolean,
	shareLink: string,
	value: string,
	placeholders: Placeholder[]
) => {
	let textTmp = value;
	for (let i = 0; i < placeholders.length; i++) {
		if (placeholders[i].isSpecial) {
			if (placeholders[i].specialType) {
				let tag = '';
				switch (placeholders[i].specialType) {
					case SpecialType.DATE:
						tag = Tags.DATE;
						break;
					case SpecialType.FULLNAME:
						tag = Tags.FULLNAME;
						break;
					case SpecialType.EMAIL:
						tag = Tags.EMAIL;
						break;
					case SpecialType.SIGN:
						tag = Tags.SIGN;
						break;
					case SpecialType.INITIALS:
						tag = Tags.INITIALS;
						break;
				}
				textTmp = changeColorInTag(
					tag,
					placeholders[i].id ? (placeholders[i].id as number) : 0,
					textTmp,
					audit
						? '#ffffff'
						: placeholders[i].externalRecipientKey &&
						  placeholders[i].externalRecipientKey === shareLink
						? '#a3e8f6'
						: '#f0f0f0'
				);
			}
		} else {
			textTmp = changeColorInTag(
				Tags.PLACEHOLDER,
				placeholders[i].id ? (placeholders[i].id as number) : 0,
				textTmp,
				audit
					? '#ffffff'
					: placeholders[i].externalRecipientKey &&
					  placeholders[i].externalRecipientKey === shareLink
					? '#a3e8f6'
					: '#f0f0f0'
			);
		}
	}
	return textTmp;
};
export const changeValueInTag = (
	tagFind: string,
	id: number,
	value: string,
	text: string,
	color: string,
	placeholders: Placeholder[]
) => {
	try {
		// Создаем DOM парсер для универсальной работы с HTML
		const parser = new DOMParser();
		const doc = parser.parseFromString(text, 'text/html');

		// Определяем селектор для поиска элементов
		const selector = `${tagFind}${id}`;
		const elements = doc.querySelectorAll(selector);

		// Проверяем, нужно ли устанавливать contenteditable="false"
		let shouldSetContentEditable = false;
		if (tagFind.includes('placeholder')) {
			// Проверяем, есть ли среди placeholders элементы с contenteditable="false"
			shouldSetContentEditable = placeholders.some((placeholder) => {
				const classSelector = `${tagFind}Class${placeholder.id}`;
				const existingElements = doc.querySelectorAll(
					`[class*="${classSelector}"][contenteditable="false"]`
				);
				return existingElements.length > 0;
			});
		} else {
			shouldSetContentEditable = true;
		}

		// Обрабатываем найденные элементы
		elements.forEach((element) => {
			// Устанавливаем значение
			element.textContent = value;

			// Устанавливаем класс
			const className = `${tagFind}Class${id}`;
			element.className = className;

			// Устанавливаем contenteditable если нужно
			if (shouldSetContentEditable) {
				element.setAttribute('contenteditable', 'false');
			}

			// Устанавливаем стиль с цветом фона, если это элемент с поддержкой style
			if (element instanceof HTMLElement) {
				element.style.backgroundColor = color;
			}
		});

		// Возвращаем обработанный HTML
		return doc.body.innerHTML;
	} catch (error) {
		// В случае ошибки возвращаем исходный текст
		console.error('Error in changeValueInTag:', error);
		return text;
	}
};
export const changeColorInTag = (
	tagFind: string,
	id: number,
	text: string,
	color: string
) => {
	try {
		// Создаем DOM парсер для универсальной работы с HTML
		const parser = new DOMParser();
		const doc = parser.parseFromString(text, 'text/html');

		// Определяем селектор для поиска элементов
		const selector = `${tagFind}${id}`;
		const elements = doc.querySelectorAll(selector);

		// Обрабатываем найденные элементы
		elements.forEach((element) => {
			// Устанавливаем класс
			const className = `${tagFind}Class${id}`;
			element.className = className;

			// Устанавливаем contenteditable="false"
			element.setAttribute('contenteditable', 'false');

			// Устанавливаем стиль с цветом фона
			if (element instanceof HTMLElement) {
				element.style.backgroundColor = color;
			}
		});

		// Возвращаем обработанный HTML
		return doc.body.innerHTML;
	} catch (error) {
		// В случае ошибки возвращаем исходный текст
		console.error('Error in changeColorInTag:', error);
		return text;
	}
};

const generateId = () => {
	return Math.random().toString(36).substr(2, 10);
};

export const convertQuillTablesInHTML = (htmlString: string) => {
	// Создаем временный DOM-документ
	const parser = new DOMParser();
	const doc = parser.parseFromString(htmlString, 'text/html');

	// Находим все исходные таблицы
	const sourceTables = doc.querySelectorAll('.quill-better-table-wrapper');

	sourceTables.forEach((sourceWrapper) => {
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
			cols.forEach((col) => {
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
		sourceRows.forEach((sourceRow) => {
			const rowId = generateId();
			const newRow = document.createElement('tr');
			newRow.className = 'ql-table-row';
			newRow.setAttribute('data-table-id', tableId);
			newRow.setAttribute('data-row-id', rowId);

			// Обрабатываем ячейки
			const sourceCells = Array.from(sourceRow.querySelectorAll('td'));
			let index = 0;
			sourceCells.forEach((sourceCell) => {
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
					newCell.setAttribute(
						'data-cell-bg',
						sourceCell.getAttribute('data-cell-bg') || ''
					);
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
				Array.from(sourceCell.children).forEach((child) => {
					const cleanElement = document.createElement(
						child.tagName.toLowerCase()
					);
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
};

export const removeParentSpan = (element: HTMLElement | null) => {
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
