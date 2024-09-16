import React, { useEffect, useState } from 'react';

import { Space, Modal, Typography, Card } from 'antd';
import { useTemplateListContext } from '../template-list-context';
import { TemplateEditor } from '../../template-editor';
// import useSaveParams from '../../../hooks/use-save-params';

export const ModalView = () => {
	// const { clearParams } = useSaveParams();
	const {
		apiKey,
		token,
		templateKey,
		setTemplateKey,
		clientKey,
		userKey,
		templateModal,
		setTemplateModal,
		refreshTemplate,
		setRefreshTemplate,
	} = useTemplateListContext();
	const [currentKey, setCurrentKey] = useState('');
	const [load, setLoad] = useState(false);
	const { Title, Text } = Typography;

	useEffect(() => {
		if (templateModal) {
			if (templateKey !== currentKey) {
				setCurrentKey(templateKey);
				setLoad(true);
				setTimeout(() => {
					setLoad(false);
				}, 10);
			}
		}
	}, [templateModal]);
	const handleCancel = () => {
		setTemplateKey('');
		setRefreshTemplate(refreshTemplate + 1);
		setTemplateModal(false);
		// clearParams();
	};
	return (
		<Modal
			open={templateModal}
			centered
			onCancel={handleCancel}
			closable={true}
			footer={<></>}
			width={1200}
		>
			{load ? (
				<Space direction='vertical' size='large' style={{ display: 'flex' }}>
					<Card loading={load}>
						<Space direction='vertical' size={16} style={{ display: 'flex' }}>
							<Space direction='vertical' size={2}>
								<Title level={4} style={{ margin: '0' }}>
									Select a document to be signed
								</Title>
								<Text type='secondary'>
									Draft from scratch, use a template, or upload a file.
								</Text>
							</Space>
						</Space>
					</Card>
				</Space>
			) : (
				<Space direction='vertical' size='large' style={{ display: 'flex' }}>
					<TemplateEditor
						apiKey={apiKey}
						clientKey={clientKey}
						token={token}
						userKey={userKey}
						templateKey={templateKey}
					/>
				</Space>
			)}
		</Modal>
	);
};
