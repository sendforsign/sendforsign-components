import React from 'react';

import { Space, Modal } from 'antd';
import { useTemplateListContext } from '../template-list-context';
import { TemplateEditor } from '../../template-editor';
import useSaveParams from '../../../hooks/use-save-params';

export const ModalView = () => {
	const { clearParams } = useSaveParams();
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
	const handleCancel = () => {
		setTemplateKey('');
		setRefreshTemplate(refreshTemplate + 1);
		setTemplateModal(false);
		clearParams();
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
			<Space direction='vertical' size='large' style={{ display: 'flex' }}>
				<TemplateEditor
					apiKey={apiKey}
					clientKey={clientKey}
					token={token}
					userKey={userKey}
					templateKey={templateKey}
				/>
			</Space>
		</Modal>
	);
};
