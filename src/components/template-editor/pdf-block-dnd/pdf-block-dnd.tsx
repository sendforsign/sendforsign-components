import React, { useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';
import './pdf-block-dnd.css';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import useSaveArrayBuffer from '../../../hooks/use-save-array-buffer';
import { useTemplateEditorContext } from '../template-editor-context';
import { PlaceholderView } from '../../../config/enum';
import { Insertion, PagePlaceholder } from '../../../config/types';
import { Document, pdfjs } from 'react-pdf';
import { useResizeDetector } from 'react-resize-detector';
import { isArray } from 'lodash';
import { PdfPage } from './pdf-page/pdf-page';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const PdfBlockDnd = () => {
	const {
		placeholder,
		pdfFileLoad,
		continueLoad,
		setContinueLoad,
		pagePlaceholder,
		setPagePlaceholder,
	} = useTemplateEditorContext();
	dayjs.extend(utc);
	const [numPages, setNumPages] = useState(1);
	const readOnly = useRef(false);
	const [pdfData, setPdfData] = useState<ArrayBuffer>();
	const { getArrayBuffer } = useSaveArrayBuffer();
	const currentPagePl = useRef<PagePlaceholder[]>([]);

	const { width, ref, height } = useResizeDetector();
	useEffect(() => {
		let isMounted = true;
		const getValue = async () => {
			const arrayBuffer: ArrayBuffer = (await getArrayBuffer(
				'pdfFileTemplate'
			)) as ArrayBuffer;
			if (isMounted) {
				setPdfData(arrayBuffer);
				setContinueLoad(false);
			}
		};
		getValue();
		return () => {
			isMounted = false;
		};
	}, [pdfFileLoad]);
	useEffect(() => {
		if (placeholder && placeholder.length > 0) {
			// console.log('placeholder useEffect', placeholder);
			let pagePlaceholderTmp: PagePlaceholder[] = [];
			if (pagePlaceholder && pagePlaceholder.length > 0) {
				for (let i = 0; i < placeholder.length; i++) {
					let placeholderFilter = pagePlaceholder.filter(
						(pagePl) => pagePl.placeholderKey === placeholder[i].placeholderKey
					);
					if (placeholderFilter && placeholderFilter.length > 0) {
						for (let j = 0; j < placeholderFilter.length; j++) {
							placeholderFilter[j].value = placeholder[i].value as string;
							placeholderFilter[j].name = placeholder[i].name as string;
						}
					}
				}
				for (let i = 0; i < pagePlaceholder.length; i++) {
					let findIndex = placeholder.findIndex(
						(pl) => pl.placeholderKey === pagePlaceholder[i]?.placeholderKey
					);
					if (findIndex >= 0) {
						pagePlaceholderTmp.push(pagePlaceholder[i]);
					}
				}
			} else {
				for (let i = 0; i < placeholder.length; i++) {
					if (
						placeholder[i].insertion &&
						isArray(placeholder[i].insertion) &&
						(placeholder[i]?.insertion as Insertion[]).length > 0
					) {
						const insertion = placeholder[i]?.insertion;

						if (insertion) {
							for (let j = 0; j < insertion.length; j++) {
								pagePlaceholderTmp.push({
									pageId: insertion[j].pageId as number,
									id: insertion[j].id as number,
									placeholderKey: placeholder[i].placeholderKey as string,
									value: placeholder[i].value as string,
									name: placeholder[i].name as string,
									positionX: insertion[j].positionX as number,
									positionY: insertion[j].positionY as number,
									width: insertion[j].width as number,
									height: insertion[j].height as number,
									view: placeholder[i].view as PlaceholderView,
									base64: '',
								});
							}
						}
					}
				}
			}
			setPagePlaceholder(pagePlaceholderTmp);
			currentPagePl.current = pagePlaceholderTmp;
		}
	}, [placeholder]);

	// console.log('pagePlaceholder useEffect', pagePlaceholder);
	return (
		<div ref={ref} style={{ overflow: 'auto' }}>
			<Document
				loading={<Spin spinning={continueLoad} />}
				file={pdfData}
				onLoadSuccess={({ numPages }) => {
					setNumPages(numPages);
				}}
				onSourceError={() => {}}
				onLoadError={() => {}}
				onError={() => {}}
			>
				{new Array(numPages).fill(0).map((_, i) => {
					// let random = Math.random();
					return (
						<PdfPage
							id={`page_${i}`}
							idInsert={`page_insert_${i}`}
							width={1000}
							pageNumber={i}
							readonly={readOnly.current}
							pagePlaceholder={pagePlaceholder.filter(
								(pagePl) => pagePl.pageId?.toString() === i.toString()
							)}
						/>
					);
				})}
			</Document>
		</div>
	);
};
