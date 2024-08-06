import React, { CSSProperties, useEffect, useRef } from 'react';
import './pdf-placeholder.css';
import { Resizable } from 're-resizable';
import { faSignature } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PlaceholderView } from '../../../../config/enum';
import { PagePlaceholder } from '../../../../config/types';
import { Button, Popover, Space } from 'antd';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useTemplateEditorContext } from '../../template-editor-context';

type Props = {
	id: string;
	readonly?: boolean;
	pagePlaceholder: PagePlaceholder;
	onChange?: (data: any) => void;
	onDelete?: (data: any) => void;
};
function getStyles(
	left: number,
	top: number,
	isDragging: boolean
): CSSProperties {
	const transform = `translate3d(${left}px, ${top}px, 0)`;
	return {
		position: 'absolute',
		transform,
		WebkitTransform: transform,
		opacity: isDragging ? 0 : 1,
		height: isDragging ? 0 : '',
		display: 'inline-block',
	};
}
export const PdfPlaceholder = ({
	id,
	readonly,
	pagePlaceholder,
	onChange,
	onDelete,
}: Props) => {
	const { setPagePlaceholderDrag } = useTemplateEditorContext();
	// console.log('pagePlaceholder PdfPlaceholder', pagePlaceholder);
	const currPagePlaceholder = useRef<PagePlaceholder>(pagePlaceholder);
	const [{ isDragging }, drag, preview] = useDrag(
		() => ({
			type: `placeholder${pagePlaceholder.pageId}`,
			item: { id: id, pagePlaceholder: pagePlaceholder },
			collect: (monitor) => ({
				isDragging: !!monitor.isDragging(),
				canDrag: !readonly,
			}),
		}),
		[readonly]
	);
	useEffect(() => {
		preview(getEmptyImage(), { captureDraggingState: true });
	}, []);
	useEffect(() => {
		currPagePlaceholder.current = pagePlaceholder;
		// console.log('useEffect currPagePlaceholder', currPagePlaceholder.current);
	}, [pagePlaceholder]);

	const handleResize = (size: any) => {
		// console.log('handleResize', size);

		const plTmp = { ...pagePlaceholder };

		plTmp.width =
			parseInt((pagePlaceholder.width as number).toString() || '0', 10) +
			parseInt(size.width, 10);

		plTmp.height =
			parseInt((pagePlaceholder.height as number).toString() || '0', 10) +
			parseInt(size.height, 10);

		currPagePlaceholder.current.width = plTmp.width;
		currPagePlaceholder.current.height = plTmp.height;
		// setCurrPagePl(plTmp);
		if (onChange) {
			onChange({ pagePlaceholder: plTmp });
		}
	};
	// console.log('currPagePlaceholder', currPagePlaceholder.current);
	return (
		<div
			id={id}
			ref={drag}
			style={getStyles(
				pagePlaceholder.positionX as number,
				pagePlaceholder.positionY as number,
				isDragging
			)}
			onDrag={() => {
				setPagePlaceholderDrag(currPagePlaceholder.current);
			}}
		>
			<Resizable
				className='resizeComponent'
				size={{
					width: pagePlaceholder.width || 100,
					height: pagePlaceholder.height || 30,
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
						style={{
							width: `${(pagePlaceholder?.width as number) - 1}px`,
							height: `${(pagePlaceholder?.height as number) - 1}px`,
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
												onDelete({ pagePlaceholder });
											}
										}}
									>
										Delete
									</Button>
								</Space>
							}
							trigger='contextMenu'
						>
							{pagePlaceholder.view?.toString() ===
							PlaceholderView.SIGNATURE.toString() ? (
								pagePlaceholder.base64 ? (
									<img
										alt='signature'
										src={pagePlaceholder.base64}
										width={pagePlaceholder.width}
										height={pagePlaceholder.height}
									/>
								) : (
									<div>
										<FontAwesomeIcon icon={faSignature} />{' '}
										{pagePlaceholder.name}
									</div>
								)
							) : (
								<div
									style={{
										fontFamily: 'Inter',
										fontSize: 15,
										fontWeight: 500,
										width: `${(pagePlaceholder?.width as number) - 1}px`,
										height: `${(pagePlaceholder?.height as number) - 1}px`,
									}}
								>
									{pagePlaceholder.value
										? pagePlaceholder.value
										: pagePlaceholder.name}
								</div>
							)}
						</Popover>
					</div>
				) : (
					<div
						style={{
							width: `${(pagePlaceholder.width as number) - 1}px`,
							height: `${(pagePlaceholder.height as number) - 1}px`,
						}}
					>
						{pagePlaceholder.view?.toString() ===
						PlaceholderView.SIGNATURE.toString() ? (
							pagePlaceholder.base64 ? (
								<img
									alt='signature'
									src={pagePlaceholder.base64}
									width={pagePlaceholder.width}
									height={pagePlaceholder.height}
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
								{pagePlaceholder.value
									? pagePlaceholder.value
									: pagePlaceholder.name}
							</div>
						)}
					</div>
				)}
			</Resizable>
		</div>
	);
};
