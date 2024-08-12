import React, { useEffect, useState } from 'react';
import './pdf-viewer.css';
import { Document, Page, pdfjs } from 'react-pdf';
import { useResizeDetector } from 'react-resize-detector';
import { Spin } from 'antd';
import useSaveArrayBuffer from '../../../hooks/use-save-array-buffer';
import { useTemplateEditorContext } from '../template-editor-context';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
export const PdfViewer = () => {
	const { pdfFileLoad, setContinueLoad } = useTemplateEditorContext();
	const [pdfData, setPdfData] = useState<ArrayBuffer>();
	const [numPages, setNumPages] = useState(1);
	const [scale, setScale] = useState(1);
	const { getArrayBuffer } = useSaveArrayBuffer();

	const { width, ref } = useResizeDetector();

	useEffect(() => {
		let isMounted = true;
		const getValue = async () => {
			const arrayBuffer: ArrayBuffer = (await getArrayBuffer(
				'pdfFileTemplate'
			)) as ArrayBuffer;
			setPdfData(arrayBuffer);
		};
		getValue();
		return () => {
			isMounted = false;
		};
	}, [pdfFileLoad]);
	return (
		<div ref={ref}>
			<Document
				loading={<Spin spinning={true} />}
				file={pdfData}
				onLoadSuccess={({ numPages }) => {
					setNumPages(numPages);
				}}
				onSourceError={() => {
					//console.log('PdfViewer onSourceError');
				}}
				onLoadError={() => {
					//console.log('PdfViewer onLoadError');
				}}
				onError={() => {
					//console.log('PdfViewer error');
				}}
			>
				{new Array(numPages).fill(0).map((_, i) => {
					return (
						<Page
							key={i}
							width={width}
							height={width ? 1.4 * width : width}
							pageNumber={i + 1}
							scale={scale}
						/>
					);
				})}
			</Document>
		</div>
	);
};
