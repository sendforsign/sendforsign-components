import React from 'react';

import { Space, Modal } from 'antd';
import { useTemplateListContext } from '../template-list-context';
import { TemplateEditor } from '../../template-editor';

export const ModalView = () => {
	const {
		apiKey,
		templateKey,
		setTemplateKey,
		clientKey,
		userKey,
		templateModal,
		setTemplateModal,
		refreshTemplate,
		setRefreshTemplate,
	} = useTemplateListContext();
	const handleCancel = () => {
		setTemplateKey('');
		setRefreshTemplate(refreshTemplate + 1);
		setTemplateModal(false);
	};
	//console.log(
		'templateKey, clientKey, userKey',
		templateKey,
		clientKey,
		userKey
	);
	return (
		<Modal
			open={templateModal}
			centered
			onCancel={handleCancel}
			closable={true}
			footer={<></>}
			width={1200}
		>
			<Space direction='vertical' size='large' style={{ display: 'flex' }}>
				<TemplateEditor
					apiKey={apiKey}
					clientKey={clientKey}
					userKey={userKey}
					templateKey={templateKey}
				/>
			</Space>
		</Modal>
	);
};
