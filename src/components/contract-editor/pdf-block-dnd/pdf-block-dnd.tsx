import React, { useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';
import './pdf-block-dnd.css';
import PDFMerger from 'pdf-merger-js/browser';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { pdf } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { PdfSign } from '../pdf-sign/pdf-sign';
import useSaveArrayBuffer from '../../../hooks/use-save-array-buffer';
import { useContractEditorContext } from '../contract-editor-context';
import axios from 'axios';
import {
	ApiEntity,
	EventStatuses,
	PlaceholderView,
} from '../../../config/enum';
import { BASE_URL } from '../../../config/config';
import {
	ContractSign,
	Insertion,
	PagePlaceholder,
	Row,
} from '../../../config/types';
import { Document, pdfjs } from 'react-pdf';
import { useResizeDetector } from 'react-resize-detector';
import { isArray } from 'lodash';
import { PdfPage } from './pdf-page/pdf-page';
import { PdfAuditTrail } from '../pdf-audit-trail/pdf-audit-trail';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const PdfBlockDnd = () => {
	const {
		apiKey,
		token,
		refreshSign,
		sign,
		setSign,
		setLoad,
		contractKey,
		clientKey,
		placeholder,
		pdfFileLoad,
		refreshEvent,
		setPdfFileLoad,
		continueLoad,
		setContinueLoad,
		setNotification,
		setSigns,
		contractEvents,
		contractName,
		pagePlaceholder,
		setPagePlaceholder,
	} = useContractEditorContext();
	dayjs.extend(utc);
	const [contractSigns, setContractSigns] = useState<ContractSign[]>([]);
	const [numPages, setNumPages] = useState(1);
	const readOnly = useRef(false);
	const [pdfData, setPdfData] = useState<ArrayBuffer>();
	const { getArrayBuffer, setArrayBuffer } = useSaveArrayBuffer();
	const contractEvent = useRef(contractEvents);
	const currentPagePl = useRef<PagePlaceholder[]>([]);

	const { width, ref, height } = useResizeDetector();

	useEffect(() => {
		let isMounted = true;
		const getContractEvents = async () => {
			const url = `${BASE_URL}${ApiEntity.CONTRACT_EVENT}?contractKey=${contractKey}&clientKey=${clientKey}`;

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
					//console.log('getEventStatus read', payload);
					contractEvent.current = payload.data;
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
		if (apiKey || token) {
			getContractEvents();
		}
		return () => {
			isMounted = false;
		};
	}, [refreshEvent]);
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
					setContractSigns(payload.data);
					if (payload.data.length > 0) {
						readOnly.current = true;
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
		let isMounted = true;
		const render = async () => {
			const pdfFile: any = await getArrayBuffer('pdfFileOriginal');
			const pdfFileAB: ArrayBuffer = pdfFile as ArrayBuffer;
			const byteLength = pdfFileAB.byteLength;
			if (!pdfFile || (pdfFile && byteLength === 0)) {
				return;
			}
			let merger = new PDFMerger();
			let arrayBuffer = pdfFile;
			await merger.add(pdfFile);

			// debugger;
			setSigns(contractSigns);
			const blob = await pdf(<PdfSign signs={contractSigns} />).toBlob();
			arrayBuffer = await blob.arrayBuffer();
			await merger.add(arrayBuffer as ArrayBuffer);

			let mergedPdfBlob = await merger.saveAsBlob();
			const mergedPdf = await mergedPdfBlob.arrayBuffer();
			await setArrayBuffer('pdfFile', mergedPdf);
			setPdfFileLoad(pdfFileLoad + 1);
			if (sign) {
				merger = new PDFMerger();
				const pdfDoc = await PDFDocument.load(mergedPdf);
				const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
				const pages = pdfDoc.getPages();
				const textSize = 10;
				for (let i = 0; i < pagePlaceholder.length; i++) {
					const scale =
						pages[pagePlaceholder[i].pageId as number].getWidth() / 1000;
					if (
						pagePlaceholder[i]?.view?.toString() ===
						PlaceholderView.SIGNATURE.toString()
					) {
						const pngImage = await pdfDoc.embedPng(
							pagePlaceholder[i].base64 as string
						);
						pages[pagePlaceholder[i].pageId as number].drawImage(pngImage, {
							x: (pagePlaceholder[i].positionX as number) * scale,
							y:
								(Math.abs(pagePlaceholder[i].positionY as number) -
									(pagePlaceholder[i].height as number)) *
								scale,
							width: (pagePlaceholder[i].width as number) * scale,
							height: (pagePlaceholder[i].height as number) * scale,
						});
					} else {
						pages[pagePlaceholder[i].pageId as number].drawText(
							(pagePlaceholder[i].value as string)
								? (pagePlaceholder[i].value as string)
								: (pagePlaceholder[i].name as string),
							{
								x: (pagePlaceholder[i]?.positionX as number) * scale,
								y:
									Math.abs(pagePlaceholder[i].positionY as number) * scale -
									textSize,
								font: helveticaFont,
								size: textSize,
								lineHeight: 12,
								color: rgb(0, 0, 0),
								opacity: 1,
								maxWidth: (pagePlaceholder[i].width as number) * scale,
							}
						);
					}
				}
				const pdfBytes = await pdfDoc.save();
				await merger.add(pdfBytes.buffer);
				// console.log(
				// 	'contractEventData',
				// 	contractEvent.current,
				// 	contractEvents,
				// 	contractSigns
				// );
				let rows: Row[] = contractEvent.current
					.filter(
						(contractEventData) =>
							contractEventData.status.toString() ===
							EventStatuses.SIGNED.toString()
					)
					?.map((contractEventData) => {
						let row: Row = {};
						if (contractEventData.ipInfo) {
							const json = JSON.parse(contractEventData.ipInfo);
							if (json) {
								row.json = json;
							}
						}
						const signFind = contractSigns.find(
							(signData) =>
								signData.email === contractEventData.email &&
								signData.fullName === contractEventData.name
						);
						if (signFind) {
							row.base64 = signFind.base64;
						}
						row.email = contractEventData.email;
						row.name = contractEventData.name;
						row.createTime = `${dayjs(contractEventData.createTime).format(
							'YYYY-MM-DD @ HH:mm:ss'
						)} GMT`;
						return row;
					});

				const auditTrail = await pdf(
					<PdfAuditTrail
						contract={{ controlLink: contractKey, contractName: contractName }}
						rows={rows}
					/>
				).toBlob();
				await merger.add(await auditTrail.arrayBuffer());

				const mergedPdfBlob = await merger.saveAsBlob();

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
						setSign('');
						// debugger;
						setContinueLoad(false);
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
			setPdfData(arrayBuffer);
			setContinueLoad(false);
			setLoad(false);
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
							placeholderFilter[j].color = placeholder[i].color;
						}
					}
				}
				for (let i = 0; i < pagePlaceholder.length; i++) {
					let findIndex = placeholder.findIndex(
						(pl) => pl.placeholderKey === pagePlaceholder[i]?.placeholderKey
					);
					if (findIndex >= 0) {
						let base64 = '';
						if (
							contractSigns &&
							contractSigns.length > 0 &&
							placeholder[findIndex].view?.toString() ===
								PlaceholderView.SIGNATURE.toString()
						) {
							const findSign = contractSigns.find(
								(contractSign) =>
									contractSign.shareLink ===
									placeholder[findIndex].externalRecipientKey
							);
							if (findSign) {
								base64 = findSign.base64 as string;
							}
						}
						pagePlaceholder[i].base64 = base64;
						pagePlaceholder[i].color = placeholder[findIndex].color;
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
						let base64 = '';
						if (
							contractSigns &&
							contractSigns.length > 0 &&
							placeholder[i].view?.toString() ===
								PlaceholderView.SIGNATURE.toString()
						) {
							const findSign = contractSigns.find(
								(contractSign) =>
									contractSign.shareLink === placeholder[i].externalRecipientKey
							);
							if (findSign) {
								base64 = findSign.base64 as string;
							}
						}
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
									base64: base64,
									color: placeholder[i].color,
								});
							}
						}
					}
				}
			}
			setPagePlaceholder(pagePlaceholderTmp);
			currentPagePl.current = pagePlaceholderTmp;
		}
	}, [placeholder, contractSigns]);

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
