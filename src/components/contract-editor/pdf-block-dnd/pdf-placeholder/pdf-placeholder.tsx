import React, { CSSProperties, useEffect, useRef } from 'react';
import './pdf-placeholder.css';
import { Resizable } from 're-resizable';
import { faSignature } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PlaceholderView, SpecialType } from '../../../../config/enum';
import { PagePlaceholder } from '../../../../config/types';
import { Button, Popover, Space } from 'antd';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useContractEditorContext } from '../../contract-editor-context';

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
	isDragging: boolean,
	color: string
): CSSProperties {
	const transform = `translate3d(${left}px, ${top}px, 0)`;
	return {
		position: 'absolute',
		transform,
		WebkitTransform: transform,
		opacity: isDragging ? 0 : 1,
		height: isDragging ? 0 : '',
		display: 'inline-block',
		background: color,
	};
}
export const PdfPlaceholder = ({
	id,
	readonly,
	pagePlaceholder,
	onChange,
	onDelete,
}: Props) => {
	const { setPagePlaceholderDrag, ready } = useContractEditorContext();
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
	useEffect(() => {
		adjustTextSize(currPagePlaceholder.current);
	}, [pagePlaceholder, ready]);
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

	const adjustTextSize = (pagePlaceholder: PagePlaceholder) => {
		// const div = document.getElementById(`${pagePlaceholder.id}_div`); // Получаем все элементы с классом 'hola'
		const divs = document.getElementsByClassName('hola'); // Получаем все элементы с классом 'hola'
		if (divs.length === 0) return; // Проверяем, существуют ли элементы

		// console.log('adjustTextSize', divs);

		Array.from(divs).forEach((div) => {
			if (div.id !== `${id}_div`) {
				return;
			}
			// Применяем логику к каждому элементу
			const element = div as HTMLElement; // Cast to HTMLElement
			element.style.fontFamily = 'sans-serif';
			const fontSize = 14;
			let currentFontSize = fontSize;

			// Проверяем, помещается ли текст
			while (element.scrollHeight > (pagePlaceholder?.height as number)) {
				currentFontSize -= 1;
				element.style.fontSize = `${currentFontSize}px`; // Use the casted element
				if (currentFontSize <= 1) {
					break; // Предотвращаем бесконечный цикл
				}
			}
		});
	};
	// console.log('currPagePlaceholder', currPagePlaceholder.current);
	return (
		<div
			id={id}
			ref={!readonly ? drag : undefined}
			style={getStyles(
				pagePlaceholder.positionX as number,
				pagePlaceholder.positionY as number,
				isDragging,
				currPagePlaceholder.current.color as string
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
				style={{ background: currPagePlaceholder.current.color }}
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
						id={`${id}_div`}
						className='hola'
						style={{
							fontFamily: 'Inter',
							fontWeight: 500,
							color: 'black',
							wordBreak: 'break-word', // Break long words onto the next line
							overflowWrap: 'break-word',
							whiteSpace: 'normal', // Allow text to wrap
							maxHeight: '100%', // Ensure it doesn't exceed the container
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
								PlaceholderView.SIGNATURE.toString() ||
							(pagePlaceholder.isSpecial &&
								pagePlaceholder.specialType?.toString() ===
									SpecialType.SIGN.toString()) ? (
								pagePlaceholder.base64 ? (
									<img
										alt='signature'
										src={pagePlaceholder.base64}
										width={pagePlaceholder.width}
										height={pagePlaceholder.height}
										style={{ objectFit: 'contain' }}
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
						id={`${id}_div`}
						className='hola'
						style={{
							fontFamily: 'Inter',
							fontWeight: 500,
							color: 'black',
							wordBreak: 'break-word', // Break long words onto the next line
							overflowWrap: 'break-word',
							whiteSpace: 'normal', // Allow text to wrap
							maxHeight: '100%', // Ensure it doesn't exceed the container
							width: `${(pagePlaceholder.width as number) - 1}px`,
							height: `${(pagePlaceholder.height as number) - 1}px`,
						}}
					>
						{pagePlaceholder.view?.toString() ===
							PlaceholderView.SIGNATURE.toString() ||
						(pagePlaceholder.isSpecial &&
							pagePlaceholder.specialType?.toString() ===
								SpecialType.SIGN.toString()) ? (
							pagePlaceholder.base64 ? (
								<img
									alt='signature'
									src={pagePlaceholder.base64}
									width={pagePlaceholder.width}
									height={pagePlaceholder.height}
									style={{ objectFit: 'contain' }}
								/>
							) : (
								<FontAwesomeIcon icon={faSignature} />
							)
						) : (
							<div>
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
