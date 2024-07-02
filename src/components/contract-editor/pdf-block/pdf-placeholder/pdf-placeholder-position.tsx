import React, { useRef } from 'react';
import './pdf-placeholder-position.css';
import { Resizable } from 're-resizable';
import Draggable from 'react-draggable';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PlaceholderView } from '../../../../config/enum';
import { PagePlaceholder } from '../../../../config/types';
import { Button, Popover, Space } from 'antd';
import { isNaN } from 'lodash';

type Props = {
	docRef?: any;
	pageDetail?: any;
	pagePlaceholder: PagePlaceholder;
	onChange?: (data: any) => void;
	onDelete?: (data: any) => void;
};
export const PdfPlaceholderPosition = ({
	docRef,
	pageDetail,
	pagePlaceholder,
	onChange,
	onDelete,
}: Props) => {
	const first = useRef(false);
	const handleResize = async (size: any) => {
		pagePlaceholder.width =
			parseInt(
				(pagePlaceholder?.width ? pagePlaceholder?.width : 0).toString(),
				10
			) + parseInt(size.width, 10);
		pagePlaceholder.height =
			parseInt(
				(pagePlaceholder?.height ? pagePlaceholder?.height : 0).toString(),
				10
			) + parseInt(size.height, 10);
		if (onChange) {
			onChange({ pagePlaceholder: pagePlaceholder });
		}
	};
	const handleDrag = async (e: any, position: any) => {
		// console.log('handleDrag', position, pagePlaceholder);
		if (!first.current && (isNaN(position.lastX) || isNaN(position.lastY))) {
			return;
		}
		first.current = true;
		let x = 0;
		const clientWidth =
			parseInt(position.node.parentNode.clientWidth.toString(), 10) -
			parseInt(
				(pagePlaceholder?.width ? pagePlaceholder?.width : 0).toString(),
				10
			);
		if (isNaN(position.lastX)) {
			x = parseInt(
				(pagePlaceholder?.positionX
					? pagePlaceholder?.positionX
					: 0
				).toString(),
				10
			);
		} else {
			if (parseInt(position.lastX.toString(), 10) < 0) {
				x = 0;
			} else if (parseInt(position.lastX.toString(), 10) > clientWidth) {
				x = clientWidth;
			} else {
				x = parseInt(position.lastX.toString(), 10);
			}
		}
		pagePlaceholder.positionX = parseInt(x.toString(), 10);
		let y = 0;
		const clientHeight =
			0 -
			parseInt(
				(pagePlaceholder?.height ? pagePlaceholder.height : 0).toString(),
				10
			);
		if (isNaN(position.lastY)) {
			y = parseInt(
				(pagePlaceholder.positionY
					? pagePlaceholder.positionY
					: clientHeight
				).toString(),
				10
			);
		} else {
			if (parseInt(position.lastY.toString(), 10) > clientHeight) {
				y = clientHeight;
			} else if (
				parseInt(position.lastY.toString(), 10) <
				-position.node.parentNode.clientHeight
			) {
				y = -position.node.parentNode.clientHeight;
			} else {
				y = parseInt(position.lastY.toString(), 10);
			}
		}
		pagePlaceholder.positionY = parseInt(y.toString(), 10);
		if (onChange) {
			onChange({ pagePlaceholder: pagePlaceholder });
		}
	};

	return (
		<Draggable
			// bounds={`page_${pagePlaceholder.pageId}`}
			bounds='parent'
			onStop={(e, position) => {
				e.stopPropagation();
				e.preventDefault();
				handleDrag(e, position);
			}}
			position={{
				x: pagePlaceholder.positionX as number,
				y: pagePlaceholder.positionY as number,
			}}
		>
			<Resizable
				className='resizeComponent'
				size={{
					width: pagePlaceholder.width as number,
					height: pagePlaceholder.height as number,
				}}
				minHeight={'30px'}
				minWidth={'100px'}
				maxWidth={'400px'}
				maxHeight={'200px'}
				enable={{
					topRight: true,
					bottomRight: true,
					bottomLeft: true,
					topLeft: true,
				}}
				bounds={'parent'}
				boundsByDirection={false}
				// lockAspectRatio={true}
				// resizeRatio={[1, 1]}
				onResizeStart={(e) => {
					e.stopPropagation();
					e.preventDefault();
				}}
				onResizeStop={(e, direction, ref, d) => {
					// console.log('direction', direction, ref);
					e.stopPropagation();
					e.preventDefault();
					handleResize(d);
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
										onDelete({ pagePlaceholder: pagePlaceholder });
									}
								}}
							>
								Delete
							</Button>
						</Space>
					}
					trigger='contextMenu'
				>
					<div
						id={`insertion_${pagePlaceholder?.placeholderKey?.replaceAll(
							'-',
							'_'
						)}-${pagePlaceholder.pageId}-${pagePlaceholder.id}`}
						style={{
							width: `${(pagePlaceholder.width as number) - 1}px`,
							height: `${(pagePlaceholder.height as number) - 1}px`,
						}}
					>
						{pagePlaceholder.view?.toString() ===
						PlaceholderView.SIGNATURE.toString() ? (
							<>
								{pagePlaceholder.base64 ? (
									<img
										alt='signature'
										src={pagePlaceholder.base64}
										width={pagePlaceholder.width}
										height={pagePlaceholder.height}
									/>
								) : (
									<FontAwesomeIcon icon={faDownload} />
								)}
							</>
						) : (
							<div
								style={{
									fontFamily: 'Inter',
									fontSize: 15,
									fontWeight: 500,
									color: 'black',
								}}
							>
								{pagePlaceholder.value
									? pagePlaceholder.value
									: pagePlaceholder.name}
							</div>
						)}
					</div>
				</Popover>
			</Resizable>
		</Draggable>
	);
};
