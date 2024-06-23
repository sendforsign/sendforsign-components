import React, { useEffect, useRef, useState } from 'react';
import { Page } from 'react-pdf';
import { PagePlaceholder } from '../../../../config/types';
import { useContractEditorContext } from '../../contract-editor-context';
import { PlaceholderView } from '../../../../config/enum';
import { PdfPlaceholderPosition } from '../pdf-placeholder/pdf-placeholder-position';
type Props = {
	pageNumber: number;
	width: number;
	height: number;
	scale: number;
	pagePlaceholder: PagePlaceholder[];
	onChange?: (data: any) => void;
	onDelete?: (data: any) => void;
};
export const PdfPage = ({
	pageNumber,
	width,
	height,
	scale,
	pagePlaceholder,
	onChange,
	onDelete,
}: Props) => {
	const { placeholderPdf, setPlaceholderPdf } = useContractEditorContext();
	const needUpdate = useRef(false);
	const [currPagePlaceholder, setCurrPagePlaceholder] = useState<
		PagePlaceholder[]
	>([]);

	useEffect(() => {
		if (pagePlaceholder.length > 0) {
			setCurrPagePlaceholder(pagePlaceholder);
		}
	}, [pagePlaceholder]);

	return (
		<div id={`page_${pageNumber}`}>
			<Page
				width={width}
				height={height}
				pageNumber={pageNumber + 1}
				scale={scale}
				onKeyDown={(e: any) => {
					console.log('onKeyDown');
				}}
				onKeyUp={(e: any) => {
					console.log('onKeyUp');
				}}
				onKeyPress={(e: any) => {
					console.log('onKeyPress');
				}}
				onClick={(e) => {
					if (placeholderPdf.placeholderKey) {
						let pagePlaceholderTmp = [...currPagePlaceholder];
						let idTmp: number[] = [];
						let idMax = 0;
						if (pagePlaceholderTmp && pagePlaceholderTmp.length > 0) {
							idTmp = pagePlaceholderTmp?.map((filt) => {
								return filt.id ? filt.id : 0;
							});
							idMax = Math.max(...idTmp);
						}
						const newPlaceholderPosition: PagePlaceholder = {
							pageId: pageNumber,
							id: idMax + 1,
							placeholderKey: placeholderPdf.placeholderKey,
							value: placeholderPdf.value as string,
							name: placeholderPdf.name as string,
							view: placeholderPdf.view as PlaceholderView,
							positionX: parseInt((e.clientX - 50).toString(), 10),
							positionY:
								-e.currentTarget.offsetHeight +
								parseInt((e.clientY + 15).toString(), 10),
							width: 100,
							height: 30,
						};
						pagePlaceholderTmp.push(newPlaceholderPosition);
						setCurrPagePlaceholder(pagePlaceholderTmp);
						setPlaceholderPdf({});
						needUpdate.current = true;
					}
				}}
			>
				{currPagePlaceholder &&
					currPagePlaceholder.length > 0 &&
					currPagePlaceholder.map((pagePl) => {
						return (
							<PdfPlaceholderPosition
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
