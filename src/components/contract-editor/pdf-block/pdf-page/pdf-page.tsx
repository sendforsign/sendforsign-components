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
	pagePlaceholder,
	onChange,
	onDelete,
	onCreate,
}: Props) => {
	const { placeholderPdf, setPlaceholderPdf } = useContractEditorContext();
	const [currPagePlaceholder, setCurrPagePlaceholder] = useState<
		PagePlaceholder[]
	>([]);
	const [pageDetail, setPageDetail] = useState<any>({});

	useEffect(() => {
		if (pagePlaceholder.length > 0) {
			setCurrPagePlaceholder(pagePlaceholder);
		}
	}, [pagePlaceholder]);

	return (
		<div id={`page_${pageNumber}`}>
			<Page
				width={width}
				// height={height}
				pageNumber={pageNumber + 1}
				// scale={scale}
				onLoadSuccess={(e) => {
					setPageDetail(e);
				}}
				onClick={(e) => {
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
							positionX: e.clientX - 50,
							positionY: -(e.currentTarget.offsetHeight - e.clientY - 15),
							width: 100,
							height: 30,
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
