import React, { useEffect, useRef, useState } from 'react';
import { Page } from 'react-pdf';
import {
	DragItem,
	NewDrag,
	PagePlaceholder,
	Placeholder,
} from '../../../../config/types';
import { useContractEditorContext } from '../../contract-editor-context';
import { Action, ApiEntity, PlaceholderView } from '../../../../config/enum';
import { PdfPlaceholder } from '../pdf-placeholder/pdf-placeholder';
import { BASE_URL } from '../../../../config/config';
import axios from 'axios';
import './pdf-page.css';
import { useDrop } from 'react-dnd';
import { PdfDragLayer } from '../pdf-drag-layer';
type Props = {
	id: string;
	idInsert: string;
	pageNumber: number;
	width: number;
	readonly?: boolean;
	pagePlaceholder: PagePlaceholder[];
};
type MaxId = {
	placeholderKey?: string;
	id?: number;
};
type PlaceholderInsertion = {
	pageId?: number;
	id?: number;
	placeholderKey?: string;
	isSpecial?: boolean;
	specialType?: number;
	action?: Action;
	width?: number;
	height?: number;
	positionX?: number;
	positionY?: number;
};
export const PdfPage = ({
	id,
	idInsert,
	pageNumber,
	width,
	readonly,
	pagePlaceholder,
}: Props) => {
	const {
		placeholder,
		placeholderChange,
		setPlaceholderChange,
		placeholderDelete,
		setPlaceholderDelete,
		pagePlaceholderDrag,
		setPagePlaceholderDrag,
		apiKey,
		token,
		clientKey,
		contractKey,
		setNotification,
		placeholderPdf,
		setPlaceholderPdf,
		refreshPagePlaceholders,
		refreshPlaceholders,
		setRefreshPagePlaceholders,
	} = useContractEditorContext();
	const currPagePl = useRef<PagePlaceholder[]>([]);
	const [currPagePlaceholder, setCurrPagePlaceholder] = useState<
		PagePlaceholder[]
	>([]);
	const [pageDetail, setPageDetail] = useState<any>({});
	// const [finishDrop, setFinishDrop] = useState(false);
	const finishDrop = useRef(false);
	const currentPage = useRef(0);
	const currentId = useRef<PagePlaceholder>({});
	const maxId = useRef<MaxId[]>([]);
	const insertion = useRef<PlaceholderInsertion[]>([]);
	const needUpdate = useRef(false);
	const first = useRef(false);

	const div = document.getElementById(`page_${pageNumber}`);
	const [ready, setReady] = useState(false);

	const [, drop] = useDrop(
		() => ({
			accept: `placeholder${pageNumber}`,
			drop: async (item: DragItem, monitor) => {
				if (readonly) {
					return undefined;
				}
				const delta = monitor.getDifferenceFromInitialOffset() as {
					x: number;
					y: number;
				};

				let left = Math.round(
					parseInt((pagePlaceholderDrag.positionX as number).toString()) +
						delta.x
				);
				const offsetWidth =
					(div?.offsetWidth as number) -
					parseInt((pagePlaceholderDrag.width as number).toString());
				if (left < 0) {
					left = 0;
				} else if (left > offsetWidth) {
					left = offsetWidth;
				}

				let top = Math.round(
					parseInt((pagePlaceholderDrag.positionY as number).toString()) +
						delta.y
				);
				const offsetHeight =
					(div?.offsetHeight as number) -
					parseInt((pagePlaceholderDrag.height as number).toString());
				if (top < 0) {
					top = 0;
				} else if (top > offsetHeight) {
					top = offsetHeight;
				}
				// console.log('PdfPage currPagePlaceholder', currPagePlaceholder);
				const findIndex = currPagePlaceholder.findIndex(
					(currPl) =>
						currPl.placeholderKey === pagePlaceholderDrag.placeholderKey &&
						currPl.pageId?.toString() ===
							pagePlaceholderDrag.pageId?.toString() &&
						currPl.id?.toString() === pagePlaceholderDrag.id?.toString()
				);
				if (findIndex >= 0) {
					let currPagePlaceholderTmp = [...currPagePlaceholder];
					currPagePlaceholderTmp[findIndex].positionX = left;
					currPagePlaceholderTmp[findIndex].positionY = top;
					setCurrPagePlaceholder(currPagePlaceholderTmp);

					const insertionIndex = insertion.current.findIndex(
						(insert) =>
							insert.placeholderKey === pagePlaceholderDrag.placeholderKey &&
							insert.pageId?.toString() ===
								pagePlaceholderDrag.pageId?.toString() &&
							insert.id?.toString() === pagePlaceholderDrag.id?.toString()
					);
					if (insertionIndex >= 0) {
						insertion.current[insertionIndex] = {
							placeholderKey: pagePlaceholderDrag.placeholderKey,
							pageId: pagePlaceholderDrag.pageId,
							id: pagePlaceholderDrag.id,
							width: pagePlaceholderDrag.width,
							height: pagePlaceholderDrag.height,
							isSpecial: pagePlaceholderDrag.isSpecial,
							specialType: pagePlaceholderDrag.specialType,
							positionX: left,
							positionY: top,
							action: Action.UPDATE,
						};
					} else {
						insertion.current.push({
							placeholderKey: pagePlaceholderDrag.placeholderKey,
							pageId: pagePlaceholderDrag.pageId,
							id: pagePlaceholderDrag.id,
							width: pagePlaceholderDrag.width,
							height: pagePlaceholderDrag.height,
							isSpecial: pagePlaceholderDrag.isSpecial,
							specialType: pagePlaceholderDrag.specialType,
							positionX: left,
							positionY: top,
							action: Action.UPDATE,
						});
					}
					needUpdate.current = true;
					await save();
				}
				setPagePlaceholderDrag({});
				return undefined;
			},
			collect: (monitor) => ({
				isOver: monitor.isOver(),
				canDrop: monitor.canDrop(),
			}),
		}),
		[currPagePlaceholder, insertion.current, div, pagePlaceholderDrag]
	);
	const [, dropInsert] = useDrop(
		() => ({
			accept: `chosePlaceholder`,
			drop: async (item: NewDrag, monitor) => {
				return undefined;
			},
			collect: (monitor) => ({
				isOver: monitor.isOver(),
				canDrop: monitor.canDrop(),
			}),
		}),
		[currPagePlaceholder, insertion.current, div]
	);
	const getPlaceholderKeys = (arr: PagePlaceholder[]) => {
		let placeholderKeyArr: string[] = arr.map((line) => {
			return line.placeholderKey ? line.placeholderKey : '';
		});
		let outputArray = Array.from(new Set(placeholderKeyArr));
		return outputArray;
	};

	useEffect(() => {
		let isMounted = true;

		if (pagePlaceholder.length > 0 && isMounted && !first.current) {
			// console.log('4');
			// console.log('PdfPage pagePlaceholder', pagePlaceholder);
			currPagePl.current = pagePlaceholder;
			setCurrPagePlaceholder(pagePlaceholder);
			const keyArr = getPlaceholderKeys(pagePlaceholder);
			for (let i = 0; i < keyArr.length; i++) {
				if (keyArr[i]) {
					const pagePlaceholderFilter = pagePlaceholder.filter(
						(pagePl) => pagePl.placeholderKey === keyArr[i]
					);
					let idTmp: number[] = [];
					let idMax = 0;
					for (let j = 0; j < pagePlaceholderFilter.length; j++) {
						idTmp = pagePlaceholderFilter?.map((filt) => {
							return filt.id ? filt.id : 0;
						});
						if (idTmp && idTmp.length > 0) {
							idMax = Math.max(...idTmp);
						} else {
							idMax = 0;
						}
					}
					maxId.current.push({ placeholderKey: keyArr[i], id: idMax });
				}
			}
			first.current = true;
		}
		return () => {
			isMounted = false;
		};
	}, [pagePlaceholder]);
	useEffect(() => {
		if (div) {
			div?.addEventListener('mousemove', async (e: any) => {
				// debugger;
				if (finishDrop.current && !readonly) {
					currentId.current.positionX = e.offsetX;
					currentId.current.positionY = e.offsetY;
					// console.log('mousemove', currPagePlaceholder, currPagePl.current);

					insertion.current.push({
						placeholderKey: currentId.current.placeholderKey,
						pageId: currentId.current.pageId,
						id: currentId.current.id,
						isSpecial: currentId.current.isSpecial,
						specialType: currentId.current.specialType,
						width: currentId.current.width,
						height: currentId.current.height,
						positionX: currentId.current.positionX,
						positionY: currentId.current.positionY,
						action: Action.UPDATE,
					});
					needUpdate.current = true;
					let currPagePlaceholderTmp = [...currPagePl.current];
					currPagePlaceholderTmp.push(currentId.current);
					setCurrPagePlaceholder(currPagePlaceholderTmp);
					currPagePl.current.push(currentId.current);
					currentId.current = {};
					finishDrop.current = false;
					await save();
				}
			});
		}
		return () => {
			div?.removeEventListener('mousemove', () => {});
		};
	}, [div]);
	useEffect(() => {
		if (
			currPagePlaceholder &&
			currPagePlaceholder.length > 0 &&
			placeholderChange &&
			placeholderChange.placeholderKey
		) {
			// console.log('3');
			setPlaceholderChange({});
			let pagePlaceholderTmp = [...currPagePlaceholder];
			let pagePlaceholderFilter = pagePlaceholderTmp.filter(
				(pagePl) => pagePl.placeholderKey === placeholderChange.placeholderKey
			);
			for (let i = 0; i < pagePlaceholderFilter.length; i++) {
				const pagePlaceholderIndex = pagePlaceholderTmp.findIndex(
					(pagePl) =>
						pagePl.id?.toString() === pagePlaceholderFilter[i].id?.toString() &&
						pagePl.placeholderKey === pagePlaceholderFilter[i].placeholderKey
				);
				if (pagePlaceholderIndex >= 0) {
					pagePlaceholderTmp[pagePlaceholderIndex].value =
						placeholderChange.value;
					pagePlaceholderTmp[pagePlaceholderIndex].name =
						placeholderChange.name;
					pagePlaceholderTmp[pagePlaceholderIndex].color =
						placeholderChange.color;
				}
			}
			setCurrPagePlaceholder(pagePlaceholderTmp);
			currPagePl.current = pagePlaceholderTmp;
		}
	}, [placeholderChange]);
	useEffect(() => {
		if (
			currPagePlaceholder &&
			currPagePlaceholder.length > 0 &&
			placeholderDelete
		) {
			// console.log('2');
			setPlaceholderDelete('');
			let pagePlaceholderTmp = [...currPagePlaceholder];
			let pagePlaceholderFilter = pagePlaceholderTmp.filter(
				(pagePl) => pagePl.placeholderKey !== placeholderDelete
			);
			setCurrPagePlaceholder(pagePlaceholderFilter);
			currPagePl.current = pagePlaceholderFilter;
		}
	}, [placeholderDelete]);
	useEffect(() => {
		if (
			refreshPagePlaceholders &&
			refreshPagePlaceholders.length > 0 &&
			currPagePlaceholder &&
			currPagePlaceholder.length > 0
		) {
			// console.log('1');
			setRefreshPagePlaceholders([]);
			let pagePlaceholderTmp = currPagePlaceholder.filter((pagePl) => {
				return !refreshPagePlaceholders.includes(
					pagePl.externalRecipientKey as string
				);
			});
			setCurrPagePlaceholder(pagePlaceholderTmp);
			currPagePl.current = pagePlaceholderTmp;
		}
	}, [refreshPagePlaceholders]);
	useEffect(() => {
		if (placeholder && placeholder.length > 0 && !readonly) {
			// console.log('placeholder', placeholder);
			let pagePlaceholderTmp = [...currPagePlaceholder];
			for (let i = 0; i < placeholder.length; i++) {
				const pagePlaceholderFilter = pagePlaceholderTmp.map((pagePl) => {
					if (
						pagePl.placeholderKey === placeholder[i].placeholderKey ||
						pagePl.externalRecipientKey === placeholder[i].placeholderKey
					) {
						return { ...pagePl, color: placeholder[i].color };
					} else {
						return pagePl;
					}
				});
				pagePlaceholderTmp = pagePlaceholderFilter;
			}
			setCurrPagePlaceholder(pagePlaceholderTmp);
			currPagePl.current = pagePlaceholderTmp;
		}
	}, [placeholder]);
	const save = async () => {
		if (needUpdate.current && !readonly) {
			// debugger;
			needUpdate.current = false;
			let resultPlaceholders: Placeholder[] = [];
			for (let index = 0; index < insertion.current.length; index++) {
				// console.log('insertion.current[index]', insertion.current[index]);
				if (insertion.current[index].action === Action.UPDATE) {
					resultPlaceholders.push({
						placeholderKey: insertion.current[index].placeholderKey,
						isSpecial: insertion.current[index].isSpecial,
						specialType: insertion.current[index].isSpecial
							? insertion.current[index].specialType
							: undefined,
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
						isSpecial: insertion.current[index].isSpecial,
						specialType: insertion.current[index].isSpecial
							? insertion.current[index].specialType
							: undefined,
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
			insertion.current = [];
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
					// .post('http://localhost:5000/api/' + ApiEntity.PLACEHOLDER, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
						Authorization: token ? `Bearer ${token}` : undefined,
					},
					responseType: 'json',
				})
				.then((payload: any) => {})
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
	// console.log('currPagePlaceholder', currPagePlaceholder);
	return (
		<Page
			renderTextLayer={false}
			width={width}
			// height={height}
			pageNumber={pageNumber + 1}
			// scale={scale}
			onLoadSuccess={(e) => {
				// console.log('onLoadSuccess', e);
				setReady(true);
				setPageDetail(e);
			}}
			onDragOver={(e) => {
				e.preventDefault();
			}}
			onDrop={(e) => {
				if (placeholderPdf && placeholderPdf.placeholderKey) {
					setPlaceholderPdf({});
					const placeholderKey = e.dataTransfer.getData('placeholderKey');
					currentPage.current = pageNumber;
					if (placeholderKey) {
						let idMax = 0;
						const findIndex = maxId.current.findIndex(
							(max) => max.placeholderKey === placeholderKey
						);
						if (findIndex >= 0) {
							maxId.current[findIndex].id =
								(maxId.current[findIndex].id as number) + 1;
							idMax = maxId.current[findIndex].id as number;
						} else {
							maxId.current.push({ placeholderKey: placeholderKey, id: 1 });
							idMax = 1;
						}
						const currPlaceholder = placeholder.find(
							(pl) => pl.placeholderKey === placeholderKey
						);
						if (currPlaceholder) {
							const newPlaceholderPosition: PagePlaceholder = {
								pageId: pageNumber,
								id: idMax,
								placeholderKey: placeholderKey,
								specialType: currPlaceholder.specialType,
								isSpecial: currPlaceholder.isSpecial,
								value: currPlaceholder.value as string,
								name: currPlaceholder.name as string,
								view: currPlaceholder.view as PlaceholderView,
								positionX: 400,
								positionY: -600,
								width: 100,
								height: 50,
								color: currPlaceholder.color,
								externalRecipientKey: currPlaceholder.externalRecipientKey,
							};
							currentId.current = newPlaceholderPosition;
							finishDrop.current = true;
						}
					}
					e.stopPropagation();
					e.preventDefault();
				}
			}}
		>
			{ready && (
				<>
					<div
						id={id}
						ref={drop}
						style={{
							position: 'absolute',
							width: width,
							height: div?.offsetHeight ? `${div.offsetHeight}px` : '100%',
							margin: 0,
							padding: 0,
							zIndex: 1,
							top: 0,
							left: 0,
						}}
						// onDrop={() => {
						// 	console.log('onClick', pageNumber);
						// }}
					>
						<div
							id={idInsert}
							ref={dropInsert}
							style={{
								position: 'absolute',
								width: width,
								height: div?.offsetHeight ? `${div.offsetHeight}px` : '100%',
								margin: 0,
								padding: 0,
								zIndex: 1,
								top: 0,
								left: 0,
							}}
						>
							{currPagePlaceholder &&
								currPagePlaceholder.length > 0 &&
								currPagePlaceholder.map((pagePl) => {
									let random = Math.random();
									return (
										<PdfPlaceholder
											id={`insertion_${random}_${pagePl?.placeholderKey?.replaceAll(
												'-',
												'_'
											)}-${pagePl.pageId}-${pagePl.id}`}
											pagePlaceholder={pagePl}
											readonly={readonly}
											onChange={async (e: any) => {
												let pagePlaceholderTmp = [...currPagePlaceholder];
												let placeholderIndex = pagePlaceholderTmp.findIndex(
													(pagePl) =>
														pagePl?.id?.toString() ===
															e.pagePlaceholder.id.toString() &&
														pagePl.placeholderKey ===
															e.pagePlaceholder.placeholderKey
												);
												pagePlaceholderTmp[placeholderIndex] =
													e.pagePlaceholder;
												currPagePl.current = pagePlaceholderTmp;
												setCurrPagePlaceholder(pagePlaceholderTmp);

												const insertionIndex = insertion.current.findIndex(
													(insert) =>
														insert.placeholderKey ===
															e.pagePlaceholder.placeholderKey &&
														insert.pageId?.toString() ===
															e.pagePlaceholder.pageId?.toString() &&
														insert.id?.toString() ===
															e.pagePlaceholder.id?.toString()
												);
												if (insertionIndex >= 0) {
													insertion.current[insertionIndex] = {
														placeholderKey: e.pagePlaceholder.placeholderKey,
														pageId: e.pagePlaceholder.pageId,
														id: e.pagePlaceholder.id,
														isSpecial: e.pagePlaceholder.isSpecial,
														specialType: e.pagePlaceholder.specialType,
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
														isSpecial: e.pagePlaceholder.isSpecial,
														specialType: e.pagePlaceholder.specialType,
														width: e.pagePlaceholder.width,
														height: e.pagePlaceholder.height,
														positionX: e.pagePlaceholder.positionX,
														positionY: e.pagePlaceholder.positionY,
														action: Action.UPDATE,
													});
												}
												needUpdate.current = true;
												await save();
											}}
											onDelete={async (e: any) => {
												let currPagePlaceholderTmp: PagePlaceholder[] = [];
												for (
													let index = 0;
													index < currPagePlaceholder.length;
													index++
												) {
													if (
														currPagePlaceholder[index].pageId?.toString() ===
															e.pagePlaceholder.pageId?.toString() &&
														currPagePlaceholder[index].placeholderKey ===
															e.pagePlaceholder.placeholderKey &&
														currPagePlaceholder[index].id?.toString() ===
															e.pagePlaceholder.id?.toString()
													) {
													} else {
														currPagePlaceholderTmp.push(
															currPagePlaceholder[index]
														);
													}
												}
												currPagePl.current = currPagePlaceholderTmp;
												setCurrPagePlaceholder(currPagePlaceholderTmp);

												insertion.current.push({
													placeholderKey: e.pagePlaceholder.placeholderKey,
													pageId: e.pagePlaceholder.pageId,
													id: e.pagePlaceholder.id,
													isSpecial: e.pagePlaceholder.isSpecial,
													specialType: e.pagePlaceholder.specialType,
													action: Action.DELETE,
												});
												needUpdate.current = true;
												await save();
											}}
										/>
									);
								})}
						</div>
					</div>
					<PdfDragLayer />
				</>
			)}
			<></>
		</Page>
	);
};
