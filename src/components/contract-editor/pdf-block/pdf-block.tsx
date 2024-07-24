import React, { useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';
import './pdf-block.css';
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
	Action,
	ApiEntity,
	EventStatuses,
	PlaceholderView,
} from '../../../config/enum';
import { BASE_URL } from '../../../config/config';
import {
	ContractSign,
	Insertion,
	PagePlaceholder,
	Placeholder,
	Row,
} from '../../../config/types';
import { Document, pdfjs } from 'react-pdf';
import { useResizeDetector } from 'react-resize-detector';
import { isArray } from 'lodash';
import { PdfPage } from './pdf-page/pdf-page';
import { PdfAuditTrail } from '../pdf-audit-trail/pdf-audit-trail';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
type PlaceholderInsertion = {
	pageId?: number;
	id?: number;
	placeholderKey?: string;
	action?: Action;
	width?: number;
	height?: number;
	positionX?: number;
	positionY?: number;
};
export const PdfBlock = () => {
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
	// const [scale, setScale] = useState(1);
	const scale = useRef(1);
	const needUpdate = useRef(false);
	const readOnly = useRef(false);
	const [pdfData, setPdfData] = useState<ArrayBuffer>();
	const [delPlaceholderPosition, setDelPlaceholderPosition] = useState<
		PagePlaceholder[]
	>([]);
	const { getArrayBuffer, setArrayBuffer } = useSaveArrayBuffer();
	const contractEvent = useRef(contractEvents);
	const currentPagePl = useRef<PagePlaceholder[]>([]);
	const insertion = useRef<PlaceholderInsertion[]>([]);

	const { width, ref, height } = useResizeDetector();
	// console.log('scale', width, height);
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
					if (isMounted) {
						setContractSigns(payload.data);
						if (payload.data.length > 0) {
							readOnly.current = true;
						}
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
				console.log(
					'contractEventData',
					contractEvent.current,
					contractEvents,
					contractSigns
				);
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
						if (isMounted) {
							setSign('');
							// debugger;
							setContinueLoad(false);
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
				setLoad(false);
			}
		};
		getValue();
		return () => {
			isMounted = false;
		};
	}, [pdfFileLoad]);
	useEffect(() => {
		if (placeholder && placeholder.length > 0) {
			console.log('placeholder', placeholder);
			let pagePlaceholderTmp: PagePlaceholder[] = [];
			if (pagePlaceholder && pagePlaceholder.length > 0) {
				for (let i = 0; i < placeholder.length; i++) {
					let placeholderFilter = pagePlaceholder.filter(
						(pagePl) => pagePl.placeholderKey === placeholder[i].placeholderKey
					);
					if (placeholderFilter && placeholderFilter.length > 0) {
						for (let j = 0; j < placeholderFilter.length; j++) {
							placeholderFilter[j].value = placeholder[i].value as string;
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

	const save = async () => {
		if (needUpdate.current) {
			needUpdate.current = false;
			let resultPlaceholders: Placeholder[] = [];
			for (let index = 0; index < insertion.current.length; index++) {
				console.log('insertion.current[index]', insertion.current[index]);
				if (insertion.current[index].action === Action.UPDATE) {
					resultPlaceholders.push({
						placeholderKey: insertion.current[index].placeholderKey,
						insertion: [
							{
								pageId: insertion.current[index].pageId,
								id: insertion.current[index].id,
								width: insertion.current[index].width,
								height: insertion.current[index].height,
								positionX: insertion.current[index].positionX,
								positionY: insertion.current[index].positionY,
								action: Action.UPDATE,
							},
						],
					});
				} else {
					resultPlaceholders.push({
						placeholderKey: insertion.current[index].placeholderKey,
						insertion: [
							{
								pageId: insertion.current[index].pageId,
								id: insertion.current[index].id,
								action: Action.DELETE,
							},
						],
					});
				}
			}
			// let pagePlaceholderTmp = [...pagePlaceholder];
			// let resultPlaceholders: Placeholder[] = [];
			// for (let index = 0; index < pagePlaceholderTmp.length; index++) {
			// 	const placeholderFindIndex = resultPlaceholders.findIndex(
			// 		(resultPl) =>
			// 			resultPl.placeholderKey === pagePlaceholderTmp[index].placeholderKey
			// 	);
			// 	if (placeholderFindIndex >= 0) {
			// 		resultPlaceholders[placeholderFindIndex].insertion?.push({
			// 			pageId: pagePlaceholderTmp[index].pageId,
			// 			id: pagePlaceholderTmp[index].id,
			// 			width: pagePlaceholderTmp[index].width
			// 				? pagePlaceholderTmp[index].width
			// 				: 100,
			// 			height: pagePlaceholderTmp[index].height
			// 				? pagePlaceholderTmp[index].height
			// 				: 300,
			// 			positionX: pagePlaceholderTmp[index].positionX
			// 				? pagePlaceholderTmp[index].positionX
			// 				: 0,
			// 			positionY: pagePlaceholderTmp[index].positionY
			// 				? pagePlaceholderTmp[index].positionY
			// 				: 0,
			// 			action: Action.UPDATE,
			// 		});
			// 	} else {
			// 		resultPlaceholders.push({
			// 			placeholderKey: pagePlaceholderTmp[index].placeholderKey,
			// 			insertion: [
			// 				{
			// 					pageId: pagePlaceholderTmp[index].pageId,
			// 					id: pagePlaceholderTmp[index].id,
			// 					width: pagePlaceholderTmp[index].width,
			// 					height: pagePlaceholderTmp[index].height,
			// 					positionX: pagePlaceholderTmp[index].positionX,
			// 					positionY: pagePlaceholderTmp[index].positionY,
			// 					action: Action.UPDATE,
			// 				},
			// 			],
			// 		});
			// 	}
			// }
			// for (let index = 0; index < delPlaceholderPosition.length; index++) {
			// 	const placeholderFindIndex = resultPlaceholders.findIndex(
			// 		(resultPl) =>
			// 			resultPl.placeholderKey ===
			// 			delPlaceholderPosition[index].placeholderKey
			// 	);
			// 	if (placeholderFindIndex >= 0) {
			// 		resultPlaceholders[placeholderFindIndex].insertion?.push({
			// 			pageId: delPlaceholderPosition[index].pageId,
			// 			id: delPlaceholderPosition[index].id,
			// 			width: delPlaceholderPosition[index].width
			// 				? delPlaceholderPosition[index].width
			// 				: 100,
			// 			height: delPlaceholderPosition[index].height
			// 				? delPlaceholderPosition[index].height
			// 				: 300,
			// 			positionX: delPlaceholderPosition[index].positionX
			// 				? delPlaceholderPosition[index].positionX
			// 				: 0,
			// 			positionY: delPlaceholderPosition[index].positionY
			// 				? delPlaceholderPosition[index].positionY
			// 				: 0,
			// 			action: Action.DELETE,
			// 		});
			// 	} else {
			// 		resultPlaceholders.push({
			// 			placeholderKey: delPlaceholderPosition[index].placeholderKey,
			// 			insertion: [
			// 				{
			// 					pageId: delPlaceholderPosition[index].pageId,
			// 					id: delPlaceholderPosition[index].id,
			// 					width: delPlaceholderPosition[index].width,
			// 					height: delPlaceholderPosition[index].height,
			// 					positionX: delPlaceholderPosition[index].positionX,
			// 					positionY: delPlaceholderPosition[index].positionY,
			// 					action: Action.DELETE,
			// 				},
			// 			],
			// 		});
			// 	}
			// }
			let body = {
				data: {
					action: Action.UPDATE,
					clientKey: !token ? clientKey : undefined,
					contractKey: contractKey,
					placeholders: resultPlaceholders,
				},
			};
			await axios
				.post(BASE_URL + ApiEntity.PLACEHOLDER, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
						Authorization: token ? `Bearer ${token}` : undefined,
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					//console.log('PLACEHOLDER read', payload);
					// setRefreshPlaceholders(refreshPlaceholders + 1);
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
	return (
		<div ref={ref} style={{ overflow: 'auto' }}>
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
				// onMouseLeave={async (e: any) => {
				// 	await save();
				// }}
			>
				{new Array(numPages).fill(0).map((_, i) => {
					return (
						<PdfPage
							docRef={ref}
							width={1000}
							pageNumber={i}
							scale={scale.current}
							readonly={readOnly.current}
							pagePlaceholder={pagePlaceholder.filter(
								(pagePl) => pagePl.pageId?.toString() === i.toString()
							)}
							onCreate={(e: any) => {
								insertion.current.push({
									placeholderKey: e.pagePlaceholder.placeholderKey,
									pageId: e.pagePlaceholder.pageId,
									id: e.pagePlaceholder.id,
									width: e.pagePlaceholder.width,
									height: e.pagePlaceholder.height,
									positionX: e.pagePlaceholder.positionX,
									positionY: e.pagePlaceholder.positionY,
									action: Action.UPDATE,
								});
								needUpdate.current = true;
							}}
							onChange={(e: any) => {
								const insertionIndex = insertion.current.findIndex(
									(insert) =>
										insert.placeholderKey ===
											e.pagePlaceholder.placeholderKey &&
										insert.pageId?.toString() ===
											e.pagePlaceholder.pageId?.toString() &&
										insert.id?.toString() === e.pagePlaceholder.id?.toString()
								);
								if (insertionIndex >= 0) {
									insertion.current[insertionIndex] = {
										placeholderKey: e.pagePlaceholder.placeholderKey,
										pageId: e.pagePlaceholder.pageId,
										id: e.pagePlaceholder.id,
										width: e.pagePlaceholder.width,
										height: e.pagePlaceholder.height,
										positionX: e.pagePlaceholder.positionX,
										positionY: e.pagePlaceholder.positionY,
										action: Action.UPDATE,
									};
								} else {
									insertion.current.push({
										placeholderKey: e.pagePlaceholder.placeholderKey,
										pageId: e.pagePlaceholder.pageId,
										id: e.pagePlaceholder.id,
										width: e.pagePlaceholder.width,
										height: e.pagePlaceholder.height,
										positionX: e.pagePlaceholder.positionX,
										positionY: e.pagePlaceholder.positionY,
										action: Action.UPDATE,
									});
								}
								needUpdate.current = true;
							}}
							onDelete={(e) => {
								insertion.current.push({
									placeholderKey: e.pagePlaceholder.placeholderKey,
									pageId: e.pagePlaceholder.pageId,
									id: e.pagePlaceholder.id,
									action: Action.DELETE,
								});
								needUpdate.current = true;
							}}
						/>
					);
				})}
			</Document>
		</div>
	);
};
