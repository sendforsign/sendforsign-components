import React, { useEffect } from 'react';
// import './html-block.css';
// import QuillNamespace from 'quill';
// import QuillBetterTable from 'quill-better-table';
import FluentEditor from '@opentiny/fluent-editor';
import ImageToolbarButtons from '@opentiny/fluent-editor';
import QuillBetterTable from 'quill-better-table';
import MarkdownShortcuts from 'quill-markdown-shortcuts';
import TableUp, { defaultCustomSelect, TableAlign, TableMenuSelect, TableMenuContextmenu, TableResizeBox, TableResizeScale, TableSelection, TableVirtualScrollbar } from 'quill-table-up';

import { useDebouncedCallback } from 'use-debounce';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import hljs from 'highlight.js'
import { useTemplateEditorContext } from '../template-editor-context';
import { BASE_URL } from '../../../config/config';
import { Action, ApiEntity } from '../../../config/enum';
import { addBlotClass } from '../../../utils';
import '@opentiny/fluent-editor/style.css';
import 'highlight.js/styles/atom-one-dark.css'
import 'katex/dist/katex.min.css'
import 'quill-table-up/index.css'
import 'quill-table-up/table-creator.css'
type Props = {
	value: string;
	fluentRef: React.MutableRefObject<FluentEditor | undefined>;
};

// QuillNamespace.register(
// 	{
// 		'modules/better-table': QuillBetterTable,
// 	},
// 	true
// );
for (let index = 1; index <= 40; index++) {
	addBlotClass(index);
}
FluentEditor.register({ 'modules/table-up': TableUp }, true);
FluentEditor.register({ 'modules/markdownShortcuts': MarkdownShortcuts }, true);
FluentEditor.register(
	{
		'modules/better-table': QuillBetterTable,
	},
	true
);
export const FluentEditorBlock = ({ value, fluentRef }: Props) => {
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
	dayjs.extend(utc);
	const {
		apiKey,
		token,
		templateKey,
		clientKey,
		userKey,
		setRefreshPlaceholders,
		refreshPlaceholders,
	} = useTemplateEditorContext();
	const container = document.querySelector('#template-editor-container');

	useEffect(() => {
		if (document.querySelector('#template-editor-container') && !fluentRef.current) {
			fluentRef.current = new FluentEditor('#template-editor-container', {
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
					'file': true,
				},
				trackChanges: 'user'
			});

			if (fluentRef.current) {

				fluentRef.current.on(
					'text-change',
					function (delta: any, oldDelta: any, source: any) {
						handleChangeText(fluentRef?.current?.root?.innerHTML as string);
					}
				);
				fluentRef.current && (fluentRef.current.root.innerHTML = value);
				setRefreshPlaceholders(refreshPlaceholders + 1);

			}
		}
	}, [container]);
	const handleChangeText = useDebouncedCallback(
		async (content: string) => {
			let body = {
				data: {
					action: Action.UPDATE,
					clientKey: !token ? clientKey : undefined,
					userKey: userKey,
					template: { templateKey: templateKey, value: content },
				},
			};
			await axios
				.post(BASE_URL + ApiEntity.TEMPLATE, body, {
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
				});
		},
		5000,
		// The maximum time func is allowed to be delayed before it's invoked:
		{ maxWait: 5000 }
	);

	return (
		<div id='template-editor-container' />
	);
};
