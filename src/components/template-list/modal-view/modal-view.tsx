import React from 'react';

import { Space, Modal } from 'antd';
import { useTemplateListContext } from '../template-list-context';
import { TemplateEditor } from '../../template-editor';

export const ModalView = () => {
	const {
		templateKey,
		clientKey,
		userKey,
		templateModal,
		setTemplateModal,
		refreshTemplate,
		setRefreshTemplate,
	} = useTemplateListContext();
	const handleCancel = () => {
		setRefreshTemplate(refreshTemplate + 1);
		setTemplateModal(false);
	};
	console.log(
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
			style={{ display: 'flex', maxWidth: '1200px' }}
		>
			<Space direction='vertical' size='large' style={{ display: 'flex' }}>
				<TemplateEditor
					clientKey={clientKey}
					userKey={userKey}
					templateKey={templateKey}
				/>
			</Space>
		</Modal>
	);
};
