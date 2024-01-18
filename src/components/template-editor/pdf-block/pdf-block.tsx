import React from 'react';
import { Card, Space, Typography } from 'antd';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { PdfViewer } from '../pdf-viewer/pdf-viewer';
import { useTemplateEditorContext } from '../template-editor-context';

export const PdfBlock = () => {
	const { continueLoad } = useTemplateEditorContext();
	dayjs.extend(utc);
	const { Title } = Typography;

	return (
		<Space direction='vertical' size={16} style={{ display: 'flex' }}>
			<Card>
				<Space direction='vertical' size={16} style={{ display: 'flex' }}>
					<Space direction='vertical' size={2} className='SharingDocHeader'>
						<Title level={4} style={{ margin: '0 0 0 0' }}>
							Review your document
						</Title>
					</Space>
					<PdfViewer />
				</Space>
			</Card>
		</Space>
	);
};
