import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import './pdf-block.css';
import PDFMerger from 'pdf-merger-js/browser';
import { pdf } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { PdfSign } from '../pdf-sign/pdf-sign';
import useSaveArrayBuffer from '../../../hooks/use-save-array-buffer';
import { useContractEditorContext } from '../contract-editor-context';
import axios from 'axios';
import { ApiEntity } from '../../../config/enum';
import { BASE_URL } from '../../../config/config';
import { ContractSign } from '../../../config/types';
import { Document, Page, pdfjs } from 'react-pdf';
import { useResizeDetector } from 'react-resize-detector';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
export const PdfBlock = () => {
	const {
		apiKey,
		token,
		refreshSign,
		sign,
		setSign,
		setSigns,
		contractKey,
		clientKey,
		pdfFileLoad,
		setPdfFileLoad,
		continueLoad,
		setContinueLoad,
	} = useContractEditorContext();
	dayjs.extend(utc);
	const [contractSigns, setContractSigns] = useState<ContractSign[]>([]);
	const [numPages, setNumPages] = useState(1);
	const [scale, setScale] = useState(1);
	const [pdfData, setPdfData] = useState<ArrayBuffer>();
	const { getArrayBuffer, setArrayBuffer } = useSaveArrayBuffer();

	const { width, ref } = useResizeDetector();
	//console.log('PdfBlock');
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
					if (isMounted) {
						setContractSigns(payload.data);
					}
				});
		};
		getSigns();
		return () => {
			isMounted = false;
		};
	}, [refreshSign]);
	useEffect(() => {
		let isMounted = true;
		const render = async () => {
			const pdfFile: any = await getArrayBuffer('pdfFileOriginal');
			const pdfFileAB: ArrayBuffer = pdfFile as ArrayBuffer;
			const byteLength = pdfFileAB.byteLength;
			if (!pdfFile || (pdfFile && byteLength === 0)) {
				return;
			}
			const merger = new PDFMerger();
			let arrayBuffer = pdfFile;
			await merger.add(pdfFile);

			// debugger;
			// setSigns(contractSigns);
			const blob = await pdf(<PdfSign signs={contractSigns} />).toBlob();
			arrayBuffer = await blob.arrayBuffer();
			await merger.add(arrayBuffer as ArrayBuffer);

			const mergedPdfBlob = await merger.saveAsBlob();
			const mergedPdf = await mergedPdfBlob.arrayBuffer();
			await setArrayBuffer('pdfFile', mergedPdf);
			setPdfFileLoad(pdfFileLoad + 1);
			if (sign) {
				const formData = new FormData();
				formData.append('pdf', mergedPdfBlob);
				let url = `${BASE_URL}${ApiEntity.CONTRACT_EMAIL_SIGN_PDF}?contractKey=${contractKey}&clientKey=${clientKey}`;
				await axios
					.post(url, formData, {
						headers: {
							'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
							Authorization: token ? `Bearer ${token}` : undefined,
						},
						responseType: 'json',
					})
					.then((payload: any) => {
						if (isMounted) {
							setSign('');
							// debugger;
							setContinueLoad(false);
						}
					});
			}
		};
		if (contractSigns && contractSigns.length > 0) {
			render();
		}
		return () => {
			isMounted = false;
		};
	}, [contractSigns]);
	useEffect(() => {
		let isMounted = true;
		const getValue = async () => {
			const arrayBuffer: ArrayBuffer = (await getArrayBuffer(
				'pdfFile'
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

	return (
		<div ref={ref}>
			<Document
				loading={<Spin spinning={continueLoad} />}
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
