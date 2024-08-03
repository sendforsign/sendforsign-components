import React, { useEffect, useRef, useState } from 'react';
import { Page } from 'react-pdf';
import { PagePlaceholder, Placeholder } from '../../../../config/types';
import { useContractEditorContext } from '../../contract-editor-context';
import { Action, ApiEntity, PlaceholderView } from '../../../../config/enum';
import { PdfPlaceholderPosition } from '../pdf-placeholder/pdf-placeholder-position';
import { BASE_URL } from '../../../../config/config';
import axios from 'axios';
import Draggable from 'react-draggable';
import { Resizable } from 're-resizable';
import { Button, Popover, Space } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignature } from '@fortawesome/free-solid-svg-icons';
import './pdf-page.css';
type Props = {
	docRef?: any;
	pageNumber: number;
	width: number;
	height?: number;
	scale: number;
	readonly?: boolean;
	pagePlaceholder: PagePlaceholder[];
	onChange?: (data: any) => void;
	onDelete?: (data: any) => void;
	onCreate?: (data: any) => void;
};
type MaxId = {
	placeholderKey?: string;
	id?: number;
};
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
export const PdfPage = ({
	docRef,
	pageNumber,
	width,
	height,
	scale,
	readonly,
	pagePlaceholder,
	onChange,
	onDelete,
	onCreate,
}: Props) => {
	const {
		placeholder,
		apiKey,
		token,
		clientKey,
		contractKey,
		setNotification,
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
	const [test, setTest] = useState({ x: 300, y: 300 });
	const [ready, setReady] = useState(false);

	const getPlaceholderKeys = (arr: PagePlaceholder[]) => {
		let placeholderKeyArr: string[] = arr.map((line) => {
			return line.placeholderKey ? line.placeholderKey : '';
		});
		let outputArray = Array.from(new Set(placeholderKeyArr));
		return outputArray;
	};

	useEffect(() => {
		let isMounted = true;

		if (pagePlaceholder.length > 0 && isMounted) {
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
		}
		return () => {
			isMounted = false;
		};
	}, [pagePlaceholder]);
	useEffect(() => {
		if (div) {
			div?.addEventListener('mousemove', (e: any) => {
				// debugger;
				if (finishDrop.current) {
					currentId.current.positionX = e.offsetX;
					currentId.current.positionY = e.offsetY;
					// console.log(
					// 	'mousemove',
					// 	currentId.current.positionX,
					// 	currentId.current.positionY
					// );

					insertion.current.push({
						placeholderKey: currentId.current.placeholderKey,
						pageId: currentId.current.pageId,
						id: currentId.current.id,
						width: currentId.current.width,
						height: currentId.current.height,
						positionX: currentId.current.positionX,
						positionY: currentId.current.positionY,
						action: Action.UPDATE,
					});
					needUpdate.current = true;
					// if (onCreate) {
					// 	onCreate({ pagePlaceholder: currentId.current });
					// }
					let currPagePlaceholderTmp = [...currPagePlaceholder];
					currPagePlaceholderTmp.push(currentId.current);
					setCurrPagePlaceholder(currPagePlaceholderTmp);
					currentId.current = {};
					finishDrop.current = false;
				}
			});
		}
		return () => {
			div?.removeEventListener('mousemove', () => {});
		};
	}, [div]);
	const save = async () => {
		if (needUpdate.current) {
			needUpdate.current = false;
			let resultPlaceholders: Placeholder[] = [];
			for (let index = 0; index < insertion.current.length; index++) {
				// console.log('insertion.current[index]', insertion.current[index]);
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

	const handleDrag = (index: number, position: any) => {
		console.log('handleDrag1', position, currPagePlaceholder[index]);

		const { lastX: posX, lastY: posY } = position;

		if (isNaN(posX) || isNaN(posY)) {
			return;
		}
		// first.current = true;
		const currPagePlaceholderTmp = [...currPagePlaceholder];
		currPagePlaceholderTmp[index].positionX = posX;
		currPagePlaceholderTmp[index].positionY = posY;
		setCurrPagePlaceholder(currPagePlaceholderTmp);
		// return;
		const insertionIndex = insertion.current.findIndex(
			(insert) =>
				insert.placeholderKey ===
					currPagePlaceholderTmp[index].placeholderKey &&
				insert.pageId?.toString() ===
					currPagePlaceholderTmp[index].pageId?.toString() &&
				insert.id?.toString() === currPagePlaceholderTmp[index].id?.toString()
		);
		if (insertionIndex >= 0) {
			insertion.current[index] = {
				placeholderKey: currPagePlaceholderTmp[index].placeholderKey,
				pageId: currPagePlaceholderTmp[index].pageId,
				id: currPagePlaceholderTmp[index].id,
				width: currPagePlaceholderTmp[index].width,
				height: currPagePlaceholderTmp[index].height,
				positionX: currPagePlaceholderTmp[index].positionX,
				positionY: currPagePlaceholderTmp[index].positionY,
				action: Action.UPDATE,
			};
		} else {
			insertion.current.push({
				placeholderKey: currPagePlaceholderTmp[index].placeholderKey,
				pageId: currPagePlaceholderTmp[index].pageId,
				id: currPagePlaceholderTmp[index].id,
				width: currPagePlaceholderTmp[index].width,
				height: currPagePlaceholderTmp[index].height,
				positionX: currPagePlaceholderTmp[index].positionX,
				positionY: currPagePlaceholderTmp[index].positionY,
				action: Action.UPDATE,
			});
		}

		needUpdate.current = true;
	};
	console.log('currPagePlaceholder', currPagePlaceholder);
	return (
		<Page
			renderTextLayer={false}
			width={width}
			// height={height}
			pageNumber={pageNumber + 1}
			// scale={scale}
			onLoadSuccess={(e) => {
				console.log('onLoadSuccess', e);
				setReady(true);
				setPageDetail(e);
			}}
			onMouseLeave={async (e: any) => {
				await save();
			}}
			onDragOver={(e) => {
				e.preventDefault();
			}}
			onDrop={(e) => {
				// debugger;
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
							value: currPlaceholder.value as string,
							name: currPlaceholder.name as string,
							view: currPlaceholder.view as PlaceholderView,
							positionX: 400,
							positionY: -600,
							width: 100,
							height: 50,
						};
						currentId.current = newPlaceholderPosition;
						finishDrop.current = true;
					}
				}
			}}
		>
			{ready && currPagePlaceholder && currPagePlaceholder.length > 0 && (
				<div
					id={`page_${pageNumber}`}
					style={{
						position: 'absolute',
						width: width,
						height: '708px',
						margin: 0,
						padding: 0,
						zIndex: 1,
						top: 0,
						left: 0,
					}}
				>
					{currPagePlaceholder &&
						currPagePlaceholder.length > 0 &&
						currPagePlaceholder.map((pagePl, index) => {
							return (
								// <PdfPlaceholderPosition
								// 	docRef={docRef}
								// 	pageDetail={pageDetail}
								// 	pagePlaceholder={pagePl}
								// 	readonly={readonly}
								// 	onChange={(e: any) => {
								// 		let pagePlaceholderTmp = [...currPagePl.current];
								// 		let placeholderIndex = pagePlaceholderTmp.findIndex(
								// 			(pagePl) =>
								// 				pagePl?.id?.toString() === e.pagePlaceholder.id.toString()
								// 		);
								// 		pagePlaceholderTmp[placeholderIndex] = e.pagePlaceholder;
								// 		currPagePl.current = pagePlaceholderTmp;
								// 		setCurrPagePlaceholder(pagePlaceholderTmp);
								// 		// if (onChange) {
								// 		// 	onChange({ pagePlaceholder: e.pagePlaceholder });
								// 		// }
								// 		const insertionIndex = insertion.current.findIndex(
								// 			(insert) =>
								// 				insert.placeholderKey ===
								// 					e.pagePlaceholder.placeholderKey &&
								// 				insert.pageId?.toString() ===
								// 					e.pagePlaceholder.pageId?.toString() &&
								// 				insert.id?.toString() === e.pagePlaceholder.id?.toString()
								// 		);
								// 		if (insertionIndex >= 0) {
								// 			insertion.current[insertionIndex] = {
								// 				placeholderKey: e.pagePlaceholder.placeholderKey,
								// 				pageId: e.pagePlaceholder.pageId,
								// 				id: e.pagePlaceholder.id,
								// 				width: e.pagePlaceholder.width,
								// 				height: e.pagePlaceholder.height,
								// 				positionX: e.pagePlaceholder.positionX,
								// 				positionY: e.pagePlaceholder.positionY,
								// 				action: Action.UPDATE,
								// 			};
								// 		} else {
								// 			insertion.current.push({
								// 				placeholderKey: e.pagePlaceholder.placeholderKey,
								// 				pageId: e.pagePlaceholder.pageId,
								// 				id: e.pagePlaceholder.id,
								// 				width: e.pagePlaceholder.width,
								// 				height: e.pagePlaceholder.height,
								// 				positionX: e.pagePlaceholder.positionX,
								// 				positionY: e.pagePlaceholder.positionY,
								// 				action: Action.UPDATE,
								// 			});
								// 		}
								// 		needUpdate.current = true;
								// 	}}
								// 	onDelete={(e: any) => {
								// 		let currPagePlaceholderTmp: PagePlaceholder[] = [];
								// 		for (
								// 			let index = 0;
								// 			index < currPagePlaceholder.length;
								// 			index++
								// 		) {
								// 			if (
								// 				currPagePlaceholder[index].pageId?.toString() ===
								// 					e.pagePlaceholder.pageId?.toString() &&
								// 				currPagePlaceholder[index].placeholderKey ===
								// 					e.pagePlaceholder.placeholderKey &&
								// 				currPagePlaceholder[index].id?.toString() ===
								// 					e.pagePlaceholder.id?.toString()
								// 			) {
								// 			} else {
								// 				currPagePlaceholderTmp.push(currPagePlaceholder[index]);
								// 			}
								// 		}
								// 		currPagePl.current = currPagePlaceholderTmp;
								// 		setCurrPagePlaceholder(currPagePlaceholderTmp);
								// 		insertion.current.push({
								// 			placeholderKey: e.pagePlaceholder.placeholderKey,
								// 			pageId: e.pagePlaceholder.pageId,
								// 			id: e.pagePlaceholder.id,
								// 			action: Action.DELETE,
								// 		});
								// 		needUpdate.current = true;
								// 	}}
								// />

								<Draggable
									// nodeRef={nodeRef}
									disabled={readonly}
									bounds='parent'
									onStop={(e, position) => {
										handleDrag(index, position);
									}}
									// onMouseDown={(e) => {
									// 	e.preventDefault();
									// 	e.stopPropagation();
									// 	console.log('onMouseDown', e);
									// }}
									// onStart={(e) => {
									// 	debugger;
									// 	// e.preventDefault();
									// 	// e.stopPropagation();
									// 	first.current = true;
									// }}
									// onMouseDown={(e) => {
									// 	debugger;
									// 	console.log('onMouseDown', e);
									// 	// e.preventDefault();
									// 	// e.stopPropagation();
									// 	setPositionVisible(true);
									// }}
									position={{
										x: pagePl.positionX as number,
										// x: 100,
										y: pagePl.positionY as number,
										// y: 100,
									}}
								>
									{/* <Resizable
							className='resizeComponent'
							size={{
								width: currPagePlaceholder[0].width || 100,
								height: currPagePlaceholder[0].height || 30,
							}}
							minHeight={30}
							minWidth={100}
							maxWidth={400}
							maxHeight={200}
							enable={{
								topRight: !readonly,
								bottomRight: !readonly,
								bottomLeft: !readonly,
								topLeft: !readonly,
							}}
							bounds='parent'
							onResizeStart={(e) => {
								e.stopPropagation();
								e.preventDefault();
							}}
							onResizeStop={(e, direction, ref, d) => {
								e.stopPropagation();
								e.preventDefault();
								handleResize(0, d);
							}}
						> */}
									{!readonly ? (
										<div
											id={`insertion_${pagePl?.placeholderKey?.replaceAll(
												'-',
												'_'
											)}-${pagePl.pageId}-${pagePl.id}`}
											className='resizeComponent'
											style={{
												width: `${(pagePl?.width as number) - 1}px`,
												height: `${(pagePl?.height as number) - 1}px`,
												// top: `${(pagePl?.positionY as number) - 1}px`,
												// left: `${
												// 	(pagePl?.positionX as number) - 1
												// }px`,
											}}
										>
											<Popover
												content={
													<Space
														direction='vertical'
														style={{ display: 'flex' }}
													>
														<Button
															block
															danger
															type='text'
															onClick={(e) => {
																let currPagePlaceholderTmp: PagePlaceholder[] =
																	[];
																for (
																	let i = 0;
																	i < currPagePlaceholder.length;
																	i++
																) {
																	if (
																		currPagePlaceholder[
																			i
																		].pageId?.toString() ===
																			pagePl.pageId?.toString() &&
																		currPagePlaceholder[i].placeholderKey ===
																			pagePl.placeholderKey &&
																		currPagePlaceholder[i].id?.toString() ===
																			pagePl.id?.toString()
																	) {
																	} else {
																		currPagePlaceholderTmp.push(
																			currPagePlaceholder[i]
																		);
																	}
																}
																// currPagePl.current = currPagePlaceholderTmp;
																setCurrPagePlaceholder(currPagePlaceholderTmp);
																insertion.current.push({
																	placeholderKey: pagePl.placeholderKey,
																	pageId: pagePl.pageId,
																	id: pagePl.id,
																	action: Action.DELETE,
																});
																needUpdate.current = true;
															}}
														>
															Delete
														</Button>
													</Space>
												}
												trigger='contextMenu'
											>
												{pagePl.view?.toString() ===
												PlaceholderView.SIGNATURE.toString() ? (
													pagePl.base64 ? (
														<img
															alt='signature'
															src={pagePl.base64}
															width={pagePl.width}
															height={pagePl.height}
														/>
													) : (
														<div>
															<FontAwesomeIcon icon={faSignature} />{' '}
															{pagePl.name}
														</div>
													)
												) : (
													<div
														style={{
															fontFamily: 'Inter',
															fontSize: 15,
															fontWeight: 500,
														}}
													>
														{pagePl.value ? pagePl.value : pagePl.name}
													</div>
												)}
											</Popover>
										</div>
									) : (
										<div
											id={`insertion_${pagePl?.placeholderKey?.replaceAll(
												'-',
												'_'
											)}-${pagePl.pageId}-${pagePl.id}`}
											style={{
												width: `${(pagePl.width as number) - 1}px`,
												height: `${(pagePl.height as number) - 1}px`,
											}}
										>
											{pagePl.view?.toString() ===
											PlaceholderView.SIGNATURE.toString() ? (
												pagePl.base64 ? (
													<img
														alt='signature'
														src={pagePl.base64}
														width={pagePl.width}
														height={pagePl.height}
													/>
												) : (
													<FontAwesomeIcon icon={faSignature} />
												)
											) : (
												<div
													style={{
														fontFamily: 'Inter',
														fontSize: 15,
														fontWeight: 500,
													}}
												>
													{pagePl.value ? pagePl.value : pagePl.name}
												</div>
											)}
										</div>
									)}
									{/* </Resizable> */}
								</Draggable>
							);
						})}
					<Draggable
						bounds='parent'
						onStop={(e, position) => {
							console.log('onStop', test, position);
							const { x, y } = position;
							setTest({ x, y });
						}}
						position={{
							x: test.x,
							y: test.y,
						}}
					>
						<div
							id={`testDraggable`}
							style={{
								background: '#fff',
								border: '1px solid #999',
								borderRadius: '3px',
								width: '180px',
								height: '180px',
								margin: '10px',
								padding: '10px',
								float: 'left',
							}}
						>
							My position can be changed programmatically. <br />I have a
							dragStop handler to sync state.
						</div>
					</Draggable>
				</div>
			)}
		</Page>
	);
};
