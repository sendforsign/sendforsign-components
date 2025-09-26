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
			const hasSpecialTags = Array.from(span.children).some(
				(child) =>
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
			// Если значение содержит HTML (например, <img .../>), вставляем как HTML
			if (value.trim().startsWith('<') && element instanceof HTMLElement) {
				element.innerHTML = value;
			} else {
				element.textContent = value;
			}

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
