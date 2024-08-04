import React, { useEffect, useRef, useState } from 'react';
import './pdf-placeholder-position.css';
import { Resizable } from 're-resizable';
import Draggable from 'react-draggable';
import { faDownload, faSignature } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PlaceholderView } from '../../../../config/enum';
import { PagePlaceholder } from '../../../../config/types';
import { Button, Popover, Space } from 'antd';
import { isNaN } from 'lodash';
import { DraggableCore } from 'react-draggable';

type Props = {
	docRef?: any;
	pageDetail?: any;
	readonly?: boolean;
	pagePlaceholder: PagePlaceholder;
	onChange?: (data: any) => void;
	onDelete?: (data: any) => void;
};

export const PdfPlaceholderPosition = ({
	docRef,
	pageDetail,
	readonly,
	pagePlaceholder,
	onChange,
	onDelete,
}: Props) => {
	const [positionVisible, setPositionVisible] = useState(false);
	const first = useRef(false);
	// const positionPl = useRef(pagePlaceholder);
	const [currPagePl, setCurrPagePl] =
		useState<PagePlaceholder>(pagePlaceholder);

	useEffect(() => {
		let isMounted = true;
		if (isMounted) setCurrPagePl(pagePlaceholder); // add conditional check

		return () => {
			isMounted = false;
		};
	}, [pagePlaceholder]);
	const handleResize = (size: any) => {
		console.log('handleResize', size);

		const plTmp = { ...currPagePl };

		plTmp.width =
			parseInt((currPagePl.width as number).toString() || '0', 10) +
			parseInt(size.width, 10);

		plTmp.height =
			parseInt((currPagePl.height as number).toString() || '0', 10) +
			parseInt(size.height, 10);
		setCurrPagePl(plTmp);
		if (onChange) {
			onChange({ pagePlaceholder: plTmp });
		}
	};

	const handleDrag = (e: any, position: any) => {
		console.log('handleDrag1', e, position, pagePlaceholder);

		const { x: posX, y: posY } = position;
		if (!first.current && (isNaN(posX) || isNaN(posY))) {
			return;
		}
		first.current = true;
		// positionPl.current.positionX = posX;
		// positionPl.current.positionY = posY;
		const plTmp = { ...currPagePl };
		plTmp.positionX = posX;
		plTmp.positionY = posY;
		setCurrPagePl(plTmp);
		// let x = 0;
		// const clientWidth =
		// 	parseInt(position.node.parentNode.clientWidth.toString(), 10) -
		// 	parseInt(
		// 		(pagePlaceholder?.width ? pagePlaceholder?.width : 0).toString(),
		// 		10
		// 	);
		// if (isNaN(position.lastX)) {
		// 	x = parseInt(
		// 		(pagePlaceholder?.positionX
		// 			? pagePlaceholder?.positionX
		// 			: 0
		// 		).toString(),
		// 		10
		// 	);
		// } else {
		// 	if (parseInt(position.lastX.toString(), 10) < 0) {
		// 		x = 0;
		// 	} else if (parseInt(position.lastX.toString(), 10) > clientWidth) {
		// 		x = clientWidth;
		// 	} else {
		// 		x = parseInt(position.lastX.toString(), 10);
		// 	}
		// }
		// pagePlaceholder.positionX = parseInt(x.toString(), 10);
		// let y = 0;
		// const clientHeight =
		// 	0 -
		// 	parseInt(
		// 		(pagePlaceholder?.height ? pagePlaceholder.height : 0).toString(),
		// 		10
		// 	);
		// if (isNaN(position.lastY)) {
		// 	y = parseInt(
		// 		(pagePlaceholder.positionY
		// 			? pagePlaceholder.positionY
		// 			: clientHeight
		// 		).toString(),
		// 		10
		// 	);
		// } else {
		// 	if (parseInt(position.lastY.toString(), 10) > clientHeight) {
		// 		y = clientHeight;
		// 	} else if (
		// 		parseInt(position.lastY.toString(), 10) <
		// 		-position.node.parentNode.clientHeight
		// 	) {
		// 		y = -position.node.parentNode.clientHeight;
		// 	} else {
		// 		y = parseInt(position.lastY.toString(), 10);
		// 	}
		// }
		// pagePlaceholder.positionY = parseInt(y.toString(), 10);
		// pagePlaceholder.positionY = posY;
		// pagePlaceholder.positionX = posX;
		// console.log('handleDrag2', pagePlaceholder);

		if (onChange) {
			onChange({ pagePlaceholder: plTmp });
		}
	};

	console.log('positionPl', currPagePl, currPagePl);
	return (
		<Draggable
			// nodeRef={nodeRef}
			disabled={readonly}
			bounds='parent'
			onStop={handleDrag}
			// onStop={handleDrag}
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
				x: currPagePl.positionX as number,
				y: currPagePl.positionY as number,
			}}
		>
			<Resizable
				className='resizeComponent'
				size={{
					width: currPagePl.width || 100,
					height: currPagePl.height || 30,
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
					handleResize(d);
				}}
			>
				{!readonly ? (
					<div
						id={`insertion_${currPagePl?.placeholderKey?.replaceAll(
							'-',
							'_'
						)}-${currPagePl.pageId}-${currPagePl.id}`}
						style={{
							width: `${(currPagePl?.width as number) - 1}px`,
							height: `${(currPagePl?.height as number) - 1}px`,
							top: `${(currPagePl?.positionY as number) - 1}px`,
							left: `${(currPagePl?.positionX as number) - 1}px`,
						}}
					>
						<Popover
							content={
								<Space direction='vertical' style={{ display: 'flex' }}>
									<Button
										block
										danger
										type='text'
										onClick={(e) => {
											if (onDelete) {
												e.stopPropagation();
												e.preventDefault();
												onDelete({ currPagePl });
											}
										}}
									>
										Delete
									</Button>
								</Space>
							}
							trigger='contextMenu'
						>
							{currPagePl.view?.toString() ===
							PlaceholderView.SIGNATURE.toString() ? (
								currPagePl.base64 ? (
									<img
										alt='signature'
										src={currPagePl.base64}
										width={currPagePl.width}
										height={currPagePl.height}
										style={{objectFit: 'contain'}}
									/>
								) : (
									<div>
										<FontAwesomeIcon icon={faSignature} /> {currPagePl.name}
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
									{currPagePl.value ? currPagePl.value : currPagePl.name}
								</div>
							)}
						</Popover>
					</div>
				) : (
					<div
						id={`insertion_${currPagePl?.placeholderKey?.replaceAll(
							'-',
							'_'
						)}-${currPagePl.pageId}-${currPagePl.id}`}
						style={{
							width: `${(currPagePl.width as number) - 1}px`,
							height: `${(currPagePl.height as number) - 1}px`,
						}}
					>
						{currPagePl.view?.toString() ===
						PlaceholderView.SIGNATURE.toString() ? (
							currPagePl.base64 ? (
								<img
									alt='signature'
									src={currPagePl.base64}
									width={currPagePl.width}
									height={currPagePl.height}
									style={{objectFit: 'contain'}}
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
								{currPagePl.value ? currPagePl.value : currPagePl.name}
							</div>
						)}
					</div>
				)}
			</Resizable>
		</Draggable>
	);
};
