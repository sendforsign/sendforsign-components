import React, { useEffect, useRef, useState } from 'react';
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
import { Action, ApiEntity, PlaceholderView } from '../../../config/enum';
import { BASE_URL } from '../../../config/config';
import {
	ContractSign,
	Insertion,
	PagePlaceholder,
	Placeholder,
} from '../../../config/types';
import { Document, pdfjs } from 'react-pdf';
import { useResizeDetector } from 'react-resize-detector';
import { isArray } from 'lodash';
import { PdfPage } from './pdf-page/pdf-page';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
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
		setPdfFileLoad,
		continueLoad,
		setContinueLoad,
		setNotification,
	} = useContractEditorContext();
	dayjs.extend(utc);
	const [contractSigns, setContractSigns] = useState<ContractSign[]>([]);
	const [numPages, setNumPages] = useState(1);
	// const [scale, setScale] = useState(1);
	const scale = useRef(1);
	const needUpdate = useRef(false);
	const [pdfData, setPdfData] = useState<ArrayBuffer>();
	const [pagePlaceholder, setPagePlaceholder] = useState<PagePlaceholder[]>([]);
	const [delPlaceholderPosition, setDelPlaceholderPosition] = useState<
		PagePlaceholder[]
	>([]);
	const { getArrayBuffer, setArrayBuffer } = useSaveArrayBuffer();

	const { width, ref, height } = useResizeDetector();
	console.log('scale', scale.current);
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
						pagePlaceholderTmp.push(pagePlaceholder[i]);
					}
				}
				setPagePlaceholder(pagePlaceholderTmp);
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
								});
							}
						}
					}
				}

				setPagePlaceholder(pagePlaceholderTmp);
			}
		}
	}, [placeholder]);

	const save = async () => {
		if (needUpdate.current) {
			needUpdate.current = false;
			let pagePlaceholderTmp = [...pagePlaceholder];
			let resultPlaceholders: Placeholder[] = [];
			for (let index = 0; index < pagePlaceholderTmp.length; index++) {
				const placeholderFindIndex = resultPlaceholders.findIndex(
					(resultPl) =>
						resultPl.placeholderKey === pagePlaceholderTmp[index].placeholderKey
				);
				if (placeholderFindIndex >= 0) {
					resultPlaceholders[placeholderFindIndex].insertion?.push({
						pageId: pagePlaceholderTmp[index].pageId,
						id: pagePlaceholderTmp[index].id,
						width: pagePlaceholderTmp[index].width
							? pagePlaceholderTmp[index].width
							: 100,
						height: pagePlaceholderTmp[index].height
							? pagePlaceholderTmp[index].height
							: 300,
						positionX: pagePlaceholderTmp[index].positionX
							? pagePlaceholderTmp[index].positionX
							: 0,
						positionY: pagePlaceholderTmp[index].positionY
							? pagePlaceholderTmp[index].positionY
							: 0,
						action: Action.UPDATE,
					});
				} else {
					resultPlaceholders.push({
						placeholderKey: pagePlaceholderTmp[index].placeholderKey,
						insertion: [
							{
								pageId: pagePlaceholderTmp[index].pageId,
								id: pagePlaceholderTmp[index].id,
								width: pagePlaceholderTmp[index].width,
								height: pagePlaceholderTmp[index].height,
								positionX: pagePlaceholderTmp[index].positionX,
								positionY: pagePlaceholderTmp[index].positionY,
								action: Action.UPDATE,
							},
						],
					});
				}
			}
			for (let index = 0; index < delPlaceholderPosition.length; index++) {
				const placeholderFindIndex = resultPlaceholders.findIndex(
					(resultPl) =>
						resultPl.placeholderKey ===
						delPlaceholderPosition[index].placeholderKey
				);
				if (placeholderFindIndex >= 0) {
					resultPlaceholders[placeholderFindIndex].insertion?.push({
						pageId: delPlaceholderPosition[index].pageId,
						id: delPlaceholderPosition[index].id,
						width: delPlaceholderPosition[index].width
							? delPlaceholderPosition[index].width
							: 100,
						height: delPlaceholderPosition[index].height
							? delPlaceholderPosition[index].height
							: 300,
						positionX: delPlaceholderPosition[index].positionX
							? delPlaceholderPosition[index].positionX
							: 0,
						positionY: delPlaceholderPosition[index].positionY
							? delPlaceholderPosition[index].positionY
							: 0,
						action: Action.DELETE,
					});
				} else {
					resultPlaceholders.push({
						placeholderKey: delPlaceholderPosition[index].placeholderKey,
						insertion: [
							{
								pageId: delPlaceholderPosition[index].pageId,
								id: delPlaceholderPosition[index].id,
								width: delPlaceholderPosition[index].width,
								height: delPlaceholderPosition[index].height,
								positionX: delPlaceholderPosition[index].positionX,
								positionY: delPlaceholderPosition[index].positionY,
								action: Action.DELETE,
							},
						],
					});
				}
			}
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
				onMouseLeave={async (e: any) => {
					await save();
				}}
			>
				{new Array(numPages).fill(0).map((_, i) => {
					return (
						<PdfPage
							height={height as number}
							width={width as number}
							pageNumber={i}
							scale={scale.current}
							pagePlaceholder={pagePlaceholder.filter(
								(pagePl) => pagePl.pageId?.toString() === i.toString()
							)}
							onChange={(e: any) => {
								const currPagePlaceholder = e.pagePlaceholder;
								let pagePlaceholderTmp = [...pagePlaceholder];
								for (
									let index = 0;
									index < currPagePlaceholder.length;
									index++
								) {
									const findIndex = pagePlaceholderTmp.findIndex(
										(pagePl) =>
											pagePl?.pageId?.toString() ===
												currPagePlaceholder[index].pageId.toString() &&
											pagePl.placeholderKey ===
												currPagePlaceholder[index].placeholderKey &&
											pagePl?.id?.toString() ===
												currPagePlaceholder[index].id.toString()
									);
									if (findIndex >= 0) {
										pagePlaceholderTmp[findIndex] = currPagePlaceholder[index];
									}
								}
								setPagePlaceholder(pagePlaceholderTmp);
								needUpdate.current = true;
							}}
							onDelete={(e) => {
								const delPlaceholderPositionTmp = [...delPlaceholderPosition];
								delPlaceholderPositionTmp.push(e.pagePlaceholder);
								setDelPlaceholderPosition(delPlaceholderPositionTmp);
								let pagePlaceholderTmp: PagePlaceholder[] = [];
								for (let index = 0; index < pagePlaceholder.length; index++) {
									if (
										pagePlaceholder[index].pageId?.toString() ===
											e.pagePlaceholder.pageId?.toString() &&
										pagePlaceholder[index].placeholderKey ===
											e.pagePlaceholder.placeholderKey &&
										pagePlaceholder[index].id?.toString() ===
											e.pagePlaceholder.id?.toString()
									) {
									} else {
										pagePlaceholderTmp.push(pagePlaceholder[index]);
									}
								}
								setPagePlaceholder(pagePlaceholderTmp);
							}}
						/>
						// <div
						// 	id={`page_${i}`}
						// 	onDrop={(e) => {
						// 		console.log(e);
						// 	}}
						// >
						// 	<Page
						// 		width={width}
						// 		height={height}
						// 		pageNumber={i + 1}
						// 		scale={scale.current}
						// 		onClick={(e) => {
						// 			if (placeholderPdf.placeholderKey) {
						// 				let pagePlaceholderTmp = [...pagePlaceholder];
						// 				let idTmp: number[] = [];
						// 				const filter = pagePlaceholderTmp.filter(
						// 					(pagePl) => pagePl.pageId?.toString() === i.toString()
						// 				);
						// 				let idMax = 0;
						// 				if (filter && filter.length > 0) {
						// 					idTmp = filter?.map((filt) => {
						// 						return filt.id ? filt.id : 0;
						// 					});
						// 					idMax = Math.max(...idTmp);
						// 				}
						// 				const newPlaceholderPosition: PagePlaceholder = {
						// 					pageId: i,
						// 					id: idMax + 1,
						// 					placeholderKey: placeholderPdf.placeholderKey,
						// 					value: placeholderPdf.value as string,
						// 					name: placeholderPdf.name as string,
						// 					view: placeholderPdf.view as PlaceholderView,
						// 					positionX: parseInt((e.clientX - 50).toString(), 10),
						// 					positionY:
						// 						-e.currentTarget.offsetHeight +
						// 						parseInt((e.clientY + 15).toString(), 10),
						// 					width: 100,
						// 					height: 30,
						// 				};
						// 				pagePlaceholderTmp.push(newPlaceholderPosition);
						// 				setPagePlaceholder(pagePlaceholderTmp);
						// 				setPlaceholderPdf({});
						// 				needUpdate.current = true;
						// 			}
						// 		}}
						// 	>
						// 		{pagePlaceholder &&
						// 			pagePlaceholder.length > 0 &&
						// 			pagePlaceholder
						// 				.filter(
						// 					(pagePl) => pagePl.pageId?.toString() === i.toString()
						// 				)
						// 				.map((pagePl) => {
						// 					return (
						// 						<PdfPlaceholderPosition
						// 							pagePlaceholder={pagePl}
						// 							onChange={(e: any) => {
						// 								console.log(e);
						// 							}}
						// 						/>
						// 						// <Draggable
						// 						// 	bounds='parent'
						// 						// 	onStop={(e, position) => {
						// 						// 		e.stopPropagation();
						// 						// 		e.preventDefault();
						// 						// 		handleDrag(pagePl.pageId, pagePl.id, position);
						// 						// 	}}
						// 						// 	position={{
						// 						// 		x: pagePl.positionX,
						// 						// 		y: pagePl.positionY,
						// 						// 	}}
						// 						// 	// onMouseDown={(e: any) => {
						// 						// 	// 	console.log('onMouseDown', e);
						// 						// 	// }}
						// 						// 	// onStart={(e: any) => {
						// 						// 	// 	console.log('onStart', e);
						// 						// 	// }}
						// 						// >
						// 						// 	//{' '}
						// 						// 	{/* <Resizable
						// 						// // 	className='resizeComponent'
						// 						// // 	size={{
						// 						// // 		width: pagePl.width,
						// 						// // 		height: pagePl.height,
						// 						// // 	}}
						// 						// // 	minHeight={'30px'}
						// 						// // 	minWidth={'100px'}
						// 						// // 	maxWidth={'400px'}
						// 						// // 	maxHeight={'200px'}
						// 						// // 	enable={{
						// 						// // 		topRight: true,
						// 						// // 		bottomRight: true,
						// 						// // 		bottomLeft: true,
						// 						// // 		topLeft: true,
						// 						// // 	}}
						// 						// // 	bounds={'parent'}
						// 						// // 	boundsByDirection={false}
						// 						// // 	lockAspectRatio={true}
						// 						// // 	resizeRatio={[1, 1]}
						// 						// // 	onResizeStart={(e) => {
						// 						// // 		e.stopPropagation();
						// 						// // 		e.preventDefault();
						// 						// // 	}}
						// 						// // 	onResizeStop={(e, direction, ref, d) => {
						// 						// // 		console.log('direction', direction, ref);
						// 						// // 		e.stopPropagation();
						// 						// // 		e.preventDefault();
						// 						// // 		handleResize(pagePl.pageId, pagePl.id, d);
						// 						// // 	}}
						// 						// // > */}
						// 						// 	<div
						// 						// 		id={`insertion-${pagePl.pageId}-${pagePl.id}-${pagePl.placeholderKey}`}
						// 						// 		className='resizeComponent'
						// 						// 		// onClick={() => {
						// 						// 		// 	console.log('onClick');
						// 						// 		// }}
						// 						// 		// onResize={(e: any) => {
						// 						// 		// 	console.log('onResizeCapture', e);
						// 						// 		// }}
						// 						// 		// draggable
						// 						// 		// onDragStart={(e: any) => {
						// 						// 		// 	console.log('onClick');
						// 						// 		// }}
						// 						// 	>
						// 						// 		{pagePl.view?.toString() ===
						// 						// 		PlaceholderView.SIGNATURE.toString() ? (
						// 						// 			<FontAwesomeIcon icon={faDownload} />
						// 						// 		) : (
						// 						// 			<>{pagePl.value ? pagePl.value : pagePl.name}</>
						// 						// 		)}
						// 						// 	</div>
						// 						// 	// {/* </Resizable> */}
						// 						// 	//{' '}
						// 						// </Draggable>
						// 					);
						// 				})}
						// 	</Page>
						// </div>
					);
				})}
			</Document>
		</div>
	);
};
