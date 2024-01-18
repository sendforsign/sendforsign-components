import React, { useEffect, useState } from 'react';
import { Card, Space, Typography } from 'antd';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import PDFMerger from 'pdf-merger-js/browser';
import { pdf } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { PdfSign } from '../pdf-sign/pdf-sign';
import { PdfViewer } from '../pdf-viewer/pdf-viewer';
import useSaveArrayBuffer from '../../../hooks/use-save-array-buffer';
import { useContractEditorContext } from '../contract-editor-context';
import axios from 'axios';
import { ApiEntity } from '../../../config/enum';
import { BASE_URL } from '../../../config/config';
import { ContractSign } from '../../../config/types';
import env from 'dotenv';
//env.config();

export const PdfBlock = () => {
	const {
		refreshSign,
		sign,
		setSign,
		contractKey,
		clientKey,
		pdfFileLoad,
		setPdfFileLoad,
		continueLoad,
		setContinueLoad,
		pdfDownload,
	} = useContractEditorContext();
	dayjs.extend(utc);
	const [signs, setSigns] = useState<ContractSign[]>([]);
	const { getArrayBuffer, setArrayBuffer } = useSaveArrayBuffer();
	const { Title } = Typography;
	console.log('PdfBlock');
	useEffect(() => {
		const getSigns = async () => {
			let url = `${BASE_URL}${ApiEntity.CONTRACT_SIGN}?contractKey=${contractKey}&clientKey=${clientKey}`;
			await axios
				.get(url, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': 're_api_key', //process.env.SENDFORSIGN_API_KEY,
					},
					responseType: 'json',
				})
				.then((payload) => {
					console.log('getSigns read', payload);
					setSigns(payload.data);
				});
		};
		getSigns();
	}, [refreshSign]);

	useEffect(() => {
		const render = async () => {
			const pdfFile = (await getArrayBuffer('pdfFileOriginal')) as ArrayBuffer;
			if (!pdfFile || pdfFile.byteLength === 0) {
				return;
			}
			const merger = new PDFMerger();
			let arrayBuffer = pdfFile;
			await merger.add(arrayBuffer);

			debugger;
			const blob = await pdf(<PdfSign signs={signs} />).toBlob();
			arrayBuffer = await blob.arrayBuffer();
			await merger.add(arrayBuffer);

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
							'x-sendforsign-key': 're_api_key', //process.env.SENDFORSIGN_API_KEY,
						},
						responseType: 'json',
					})
					.then((payload) => {
						console.log('sign read', payload);
						setSign('');
						debugger;
						setContinueLoad(false);
					});
			}
		};
		if (signs && signs.length > 0) {
			render();
		}
	}, [signs]);

	return (
		<Space direction='vertical' size={16} style={{ display: 'flex' }}>
			<Card>
				<Space direction='vertical' size={16} style={{ display: 'flex' }}>
					<Space direction='vertical' size={2} className='SharingDocHeader'>
						<Title level={4} style={{ margin: '0 0 0 0' }}>
							Review your document
						</Title>
					</Space>
					<PdfViewer />
				</Space>
			</Card>
		</Space>
	);
};
