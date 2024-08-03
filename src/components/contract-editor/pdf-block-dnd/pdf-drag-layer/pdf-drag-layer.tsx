import React, { CSSProperties } from 'react';

import { useDragLayer, XYCoord } from 'react-dnd';
import { PdfPlaceholderPreview } from '../pdf-placeholder-preview';
import { useContractEditorContext } from '../../contract-editor-context';

export const PdfDragLayer = () => {
	const { pagePlaceholderDrag } = useContractEditorContext();
	const layerStyles: CSSProperties = {
		position: 'fixed',
		pointerEvents: 'none',
		zIndex: 100,
		left: 0,
		top: 0,
		width: '100%',
		height: '100%',
	};

	function getItemStyles(
		initialOffset: XYCoord | null,
		currentOffset: XYCoord | null
	) {
		if (!initialOffset || !currentOffset) {
			return {
				display: 'none',
			};
		}

		let { x, y } = currentOffset;

		const transform = `translate(${x}px, ${y}px)`;
		return {
			transform,
			WebkitTransform: transform,
		};
	}

	const { itemType, isDragging, item, initialOffset, currentOffset } =
		useDragLayer((monitor) => ({
			item: monitor.getItem(),
			itemType: monitor.getItemType(),
			initialOffset: monitor.getInitialSourceClientOffset(),
			currentOffset: monitor.getSourceClientOffset(),
			isDragging: monitor.isDragging(),
		}));

	function renderItem() {
		if (itemType?.toString().includes('placeholder') && pagePlaceholderDrag) {
			return <PdfPlaceholderPreview pagePlaceholder={pagePlaceholderDrag} />;
		} else {
			return null;
		}
	}
	// console.log('item', item, itemType, initialOffset, currentOffset, isDragging);

	if (!isDragging) {
		return null;
	}
	return (
		<div style={layerStyles}>
			<div style={getItemStyles(initialOffset, currentOffset)}>
				{renderItem()}
			</div>
		</div>
	);
};
