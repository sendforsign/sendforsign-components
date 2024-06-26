import React, { useEffect } from 'react';
import './html-block.css';
import QuillNamespace from 'quill';
import QuillBetterTable from 'quill-better-table';
import { useDebouncedCallback } from 'use-debounce';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useTemplateEditorContext } from '../template-editor-context';
import { BASE_URL } from '../../../config/config';
import { Action, ApiEntity } from '../../../config/enum';
import { addBlotClass } from '../../../utils';
//env.config();
type Props = {
	value: string;
	quillRef: React.MutableRefObject<any>;
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
		token,
		templateKey,
		clientKey,
		userKey,
		setRefreshPlaceholders,
		refreshPlaceholders,
	} = useTemplateEditorContext();
	const container = document.querySelector('#template-editor-container');
	// const quillRef = useRef<Quill>();
	useEffect(() => {
		if (document.querySelector('#template-editor-container')) {
			quillRef.current = new QuillNamespace('#template-editor-container', {
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
				// scrollingContainer: 'body',
				theme: 'bubble',
			});

			if (quillRef.current) {
				quillRef?.current
					?.getModule('toolbar')
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
						if (source === 'user') {
							handleChangeText(
								quillRef?.current ? quillRef?.current?.root?.innerHTML : ''
							);
						}
					}
				);
			}
		}
	}, [container]);
	useEffect(() => {
		if (value && quillRef?.current) {
			quillRef?.current?.clipboard.dangerouslyPasteHTML(value);
			setRefreshPlaceholders(refreshPlaceholders + 1);
		}
	}, [value]);

	const addTable = () => {
		quillRef?.current?.getModule('better-table').insertTable(3, 3);
	};
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
		<div id='scroll-container'>
			<div id='template-editor-container' />
		</div>
	);
};
