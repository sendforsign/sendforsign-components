import React, { useEffect, useRef, useState } from 'react';
import { Page } from 'react-pdf';
import { PagePlaceholder } from '../../../../config/types';
import { useContractEditorContext } from '../../contract-editor-context';
import { PlaceholderView } from '../../../../config/enum';
import { PdfPlaceholderPosition } from '../pdf-placeholder/pdf-placeholder-position';
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
	const { placeholder, placeholderPdf, setPlaceholderPdf } =
		useContractEditorContext();
	const [currPagePlaceholder, setCurrPagePlaceholder] = useState<
		PagePlaceholder[]
	>([]);
	const [pageDetail, setPageDetail] = useState<any>({});
	// const [finishDrop, setFinishDrop] = useState(false);
	const finishDrop = useRef(false);
	const currentPage = useRef(0);
	const currentId = useRef<PagePlaceholder>({});
	const currentPosition = useRef<PagePlaceholder>({});
	const div = document.getElementById(`page_${pageNumber}`);

	useEffect(() => {
		if (pagePlaceholder.length > 0) {
			setCurrPagePlaceholder(pagePlaceholder);
		}
	}, [pagePlaceholder]);
	useEffect(() => {
		// 	if (finishDrop) {
		if (div) {
			div?.addEventListener('mousemove', (e: any) => {
				// debugger;
				if (finishDrop.current) {
					// 					// const findPlaceholderIndex = pagePlaceholder.findIndex(
					// 					// 	(currPagePl) =>
					// 					// 		currPagePl?.pageId?.toString() ===
					// 					// 			currentId?.current?.pageId?.toString() &&
					// 					// 		currPagePl.placeholderKey ===
					// 					// 			currentId.current.placeholderKey &&
					// 					// 		currPagePl.id?.toString() === currentId?.current?.id?.toString()
					// 					// );
					// 					// if (findPlaceholderIndex >= 0) {
					// 					// pagePlaceholder[findPlaceholderIndex].positionX = e.offsetX;
					// 					// pagePlaceholder[findPlaceholderIndex].positionY = -(
					// 					// 	e.target.offsetHeight - e.offsetY
					// 					// );
					// 					let tmpPosition = { ...currentId?.current };
					// 					tmpPosition.positionX = e.offsetX;
					// 					tmpPosition.positionY = -(e.target.offsetHeight - e.offsetY);
					// 					if (onCreate) {
					// 						onCreate({ pagePlaceholder: tmpPosition });
					// 					}
					// 					currentId.current = {};
					// 					setFinishDrop(false);
					// 					// }
					// }
					const divPage = div.querySelectorAll(
						`div[class*='react-pdf__Page']`
					)[0];
					console.log(
						'e.target',
						divPage,
						// divPage.offsetHeight,
						// divPage.offsetWidth,
						e,
						e.target.offsetWidth,
						e.target.offsetHeight,
						e.offsetX,
						e.offsetY
					);
					const offsetWidth =
						e.target.offsetWidth - (currentId.current.width as number);
					if (e.offsetX < 0) {
						currentId.current.positionX = 0;
					} else if (e.offsetX >= offsetWidth) {
						currentId.current.positionX = offsetWidth;
					} else {
						currentId.current.positionX = e.offsetX;
					}

					const offsetHeight = e.target.offsetHeight - e.offsetY;
					if (offsetHeight > -(currentId?.current?.height as number)) {
						currentId.current.positionY = -(offsetHeight as number);
					} else if (offsetHeight < -e.target.offsetHeight) {
						currentId.current.positionY = -e.target.offsetHeight;
					} else {
						currentId.current.positionY = -offsetHeight;
					}
					console.log(
						'mousemove',
						offsetWidth,
						offsetHeight,
						currentId.current.positionX,
						currentId.current.positionY
					);
					if (onCreate) {
						onCreate({ pagePlaceholder: currentId.current });
					}
					finishDrop.current = false;
					// currPagePlaceholder.push(currentId.current);
					// currentPosition.current.positionX = e.offsetX;
					// currentPosition.current.positionY = -(
					// 	e.target.offsetHeight - e.offsetY
					// );
				}
			});
		}
		// };
		return () => {
			div?.removeEventListener('mousemove', () => {});
		};
	}, [div]);
	return (
		<div id={`page_${pageNumber}`}>
			<Page
				renderTextLayer={false}
				width={width}
				// height={height}
				pageNumber={pageNumber + 1}
				// scale={scale}
				onLoadSuccess={(e) => {
					setPageDetail(e);
				}}
				onDragOver={(e) => {
					e.preventDefault();
				}}
				onDrop={(e) => {
					debugger;
					// const target = e.target;
					// Get the bounding rectangle of target.
					// const rect = target.getBoundingClientRect();
					const placeholderKey = e.dataTransfer.getData('placeholderKey');
					// console.log('onDrop e', placeholderKey, rect, currentPosition);
					currentPage.current = pageNumber;
					if (placeholderKey) {
						let pagePlaceholderTmp = [...currPagePlaceholder];
						let idTmp: number[] = [];
						let idMax = 0;
						if (pagePlaceholderTmp && pagePlaceholderTmp.length > 0) {
							idTmp = pagePlaceholderTmp
								?.filter((filt) => filt.placeholderKey === placeholderKey)
								?.map((filt) => {
									return filt.id ? filt.id : 0;
								});
							if (idTmp && idTmp.length > 0) {
								idMax = Math.max(...idTmp);
							} else {
								idMax = 0;
							}
						}
						const currPlaceholder = placeholder.find(
							(pl) => pl.placeholderKey === placeholderKey
						);
						if (currPlaceholder) {
							const newPlaceholderPosition: PagePlaceholder = {
								pageId: pageNumber,
								id: idMax + 1,
								placeholderKey: placeholderKey,
								value: currPlaceholder.value as string,
								name: currPlaceholder.name as string,
								view: currPlaceholder.view as PlaceholderView,
								positionX: 400,
								positionY: -600,
								width: 100,
								height: 50,
							};
							// pagePlaceholderTmp.push(newPlaceholderPosition);
							// setCurrPagePlaceholder(pagePlaceholderTmp);
							currentId.current = newPlaceholderPosition;
							finishDrop.current = true;
							// if (onCreate) {
							// 	onCreate({ pagePlaceholder: newPlaceholderPosition });
							// }
						}
						// setFinishDrop(true);
						// div?.addEventListener('mousemove', (e: any) => {
						// 	if (finishDrop.current) {
						// console.log(e, div);
						// const findPlaceholderIndex = pagePlaceholder.findIndex(
						// 	(currPagePl) =>
						// 		currPagePl?.pageId?.toString() ===
						// 			currentId?.current?.pageId?.toString() &&
						// 		currPagePl.placeholderKey ===
						// 			currentId.current.placeholderKey &&
						// 		currPagePl.id?.toString() === currentId?.current?.id?.toString()
						// );
						// if (findPlaceholderIndex >= 0) {
						// pagePlaceholder[findPlaceholderIndex].positionX = e.offsetX;
						// pagePlaceholder[findPlaceholderIndex].positionY = -(
						// 	e.target.offsetHeight - e.offsetY
						// );
						// let tmpPosition = { ...currentId?.current };
						// tmpPosition.positionX = e.offsetX;
						// tmpPosition.positionY = -(e.target.offsetHeight - e.offsetY);
						// if (onCreate) {
						// 	onCreate({ pagePlaceholder: tmpPosition });
						// }
						// currentId.current = {};
						// finishDrop.current = false;
						// setFinishDrop(false);
						// }
						// 	}
						// });
					}
				}}
				onClick={(e) => {
					// const target = e.target;
					// const rect = target.getBoundingClientRect();
					// console.log(
					// 	'Page e',
					// 	e,
					// 	e.target,
					// 	rect,
					// 	Math.trunc(e.target.offsetWidth),
					// 	Math.abs(Math.trunc(rect.left)),
					// 	Math.trunc(e.target.offsetHeight),
					// 	Math.trunc(rect.top),
					// 	Math.trunc(e.offsetWidth) - Math.abs(Math.trunc(rect.left)),
					// 	Math.trunc(e.offsetHeight) - Math.abs(Math.trunc(rect.top))
					// );
					if (placeholderPdf.placeholderKey) {
						let pagePlaceholderTmp = [...currPagePlaceholder];
						let idTmp: number[] = [];
						let idMax = 0;
						if (pagePlaceholderTmp && pagePlaceholderTmp.length > 0) {
							idTmp = pagePlaceholderTmp
								?.filter(
									(filt) =>
										filt.placeholderKey === placeholderPdf.placeholderKey
								)
								?.map((filt) => {
									return filt.id ? filt.id : 0;
								});
							if (idTmp && idTmp.length > 0) {
								idMax = Math.max(...idTmp);
							} else {
								idMax = 0;
							}
						}
						// console.log('onClick', pagePlaceholderTmp);
						const newPlaceholderPosition: PagePlaceholder = {
							pageId: pageNumber,
							id: idMax + 1,
							placeholderKey: placeholderPdf.placeholderKey,
							value: placeholderPdf.value as string,
							name: placeholderPdf.name as string,
							view: placeholderPdf.view as PlaceholderView,
							positionX: 400,
							// positionX:
							// 	Math.abs(Math.trunc(e.clientX)) -
							// 	Math.abs(Math.trunc(rect.left)) -
							// 	50,
							positionY: -600,
							// positionY: -(
							// 	Math.abs(Math.trunc(e.clientY)) -
							// 	Math.abs(Math.trunc(rect.top)) -
							// 	25
							// ),
							width: 100,
							height: 50,
						};
						setPlaceholderPdf({});
						if (onCreate) {
							onCreate({ pagePlaceholder: newPlaceholderPosition });
						}
					}
				}}
			>
				{currPagePlaceholder &&
					currPagePlaceholder.length > 0 &&
					currPagePlaceholder.map((pagePl) => {
						return (
							<PdfPlaceholderPosition
								docRef={docRef}
								pageDetail={pageDetail}
								pagePlaceholder={pagePl}
								readonly={readonly}
								onChange={(e: any) => {
									let pagePlaceholderTmp = [...currPagePlaceholder];
									let placeholderIndex = pagePlaceholderTmp.findIndex(
										(pagePl) =>
											pagePl?.id?.toString() === e.pagePlaceholder.id.toString()
									);
									pagePlaceholderTmp[placeholderIndex] = e.pagePlaceholder;
									setCurrPagePlaceholder(pagePlaceholderTmp);
									if (onChange) {
										onChange({ pagePlaceholder: pagePlaceholderTmp });
									}
								}}
								onDelete={onDelete}
							/>
						);
					})}
			</Page>
		</div>
	);
};
