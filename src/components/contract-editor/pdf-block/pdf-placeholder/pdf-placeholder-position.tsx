import React from 'react';
import './pdf-placeholder-position.css';
import { Resizable } from 're-resizable';
import Draggable from 'react-draggable';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PlaceholderView } from '../../../../config/enum';
import { PagePlaceholder } from '../../../../config/types';
import { Button, Popover, Space } from 'antd';

type Props = {
	pagePlaceholder: PagePlaceholder;
	onChange?: (data: any) => void;
	onDelete?: (data: any) => void;
};
export const PdfPlaceholderPosition = ({
	pagePlaceholder,
	onChange,
	onDelete,
}: Props) => {
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
	const handleDrag = async (position: any) => {
		const x =
			parseInt(
				(pagePlaceholder?.positionX
					? pagePlaceholder?.positionX
					: 0
				).toString(),
				10
			) + parseInt(position.deltaX.toString(), 10);
		const clientWidth =
			parseInt(position.node.parentNode.clientWidth.toString(), 10) -
			parseInt(
				(pagePlaceholder?.width ? pagePlaceholder?.width : 0).toString(),
				10
			);
		if (Math.abs(x) > clientWidth) {
			pagePlaceholder.positionX = clientWidth;
		} else if (x < 0) {
			pagePlaceholder.positionX = 0;
		} else {
			pagePlaceholder.positionX = parseInt(x.toString(), 10);
		}

		const y =
			parseInt(
				(pagePlaceholder?.positionY
					? pagePlaceholder?.positionY
					: 0
				).toString(),
				10
			) + parseInt(position.deltaY.toString(), 10);
		const clientHeight =
			0 +
			parseInt(
				(pagePlaceholder?.height ? pagePlaceholder.height : 0).toString(),
				10
			);
		if (Math.abs(y) > position.node.parentNode.clientHeight) {
			pagePlaceholder.positionY = parseInt(
				position.node.parentNode.clientHeight.toString(),
				10
			);
		} else if (y > -clientHeight) {
			pagePlaceholder.positionY = -clientHeight;
		} else {
			pagePlaceholder.positionY = parseInt(y.toString(), 10);
		}

		if (onChange) {
			onChange({ pagePlaceholder: pagePlaceholder });
		}
	};

	return (
		<Draggable
			bounds={`page_${pagePlaceholder.pageId}`}
			onStop={(e, position) => {
				e.stopPropagation();
				e.preventDefault();
				handleDrag(position);
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
				lockAspectRatio={true}
				resizeRatio={[1, 1]}
				onResizeStart={(e) => {
					e.stopPropagation();
					e.preventDefault();
				}}
				onResizeStop={(e, direction, ref, d) => {
					console.log('direction', direction, ref);
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
							<FontAwesomeIcon icon={faDownload} />
						) : (
							<>
								{pagePlaceholder.value
									? pagePlaceholder.value
									: pagePlaceholder.name}
							</>
						)}
					</div>
				</Popover>
			</Resizable>
		</Draggable>
	);
};
