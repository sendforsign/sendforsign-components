import React from 'react';
import { PagePlaceholder } from '../../../../config/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignature } from '@fortawesome/free-solid-svg-icons';
import { PlaceholderView } from '../../../../config/enum';
import './pdf-placeholder-preview.css';
type Props = {
	pagePlaceholder: PagePlaceholder;
};
export const PdfPlaceholderPreview = ({ pagePlaceholder }: Props) => {
	// console.log('PdfPlaceholderPreview', pagePlaceholder);
	return (
		<div
			id={`insertion_${pagePlaceholder?.placeholderKey?.replaceAll('-', '_')}-${
				pagePlaceholder.pageId
			}-${pagePlaceholder.id}`}
			style={{
				width: `${pagePlaceholder.width as number}px`,
				height: `${pagePlaceholder.height as number}px`,
			}}
			className='resizeComponent'
		>
			{pagePlaceholder.view?.toString() ===
			PlaceholderView.SIGNATURE.toString() ? (
				pagePlaceholder.base64 ? (
					<img
						alt='signature'
						src={pagePlaceholder.base64}
						width={pagePlaceholder.width}
						height={pagePlaceholder.height}
						style={{objectFit: 'contain'}}
					/>
				) : (
					<FontAwesomeIcon icon={faSignature} />
				)
			) : (
				<div
					style={{
						fontFamily: 'Inter',
						fontWeight: 500,
						color: 'black',
						wordBreak: 'break-word', // Break long words onto the next line
						overflowWrap: 'break-word',
						whiteSpace: 'normal', // Allow text to wrap
						maxHeight: '100%', // Ensure it doesn't exceed the container
					}}
				>
					{pagePlaceholder.value ? pagePlaceholder.value : pagePlaceholder.name}
				</div>
			)}
		</div>
	);
};
