import React from 'react';

import { Space, Modal } from 'antd';
import { useContractListContext } from '../contract-list-context';
import { ContractEditor } from '../../contract-editor';

export const ModalView = () => {
	const { contractKey, clientKey, userKey, contractModal, setContractModal } =
		useContractListContext();
	const handleCancel = () => {
		setContractModal(false);
	};
	console.log(
		'contractKey, clientKey, userKey',
		contractKey,
		clientKey,
		userKey
	);
	return (
		<Modal
			open={contractModal}
			centered
			onCancel={handleCancel}
			closable={true}
			footer={<></>}
			style={{ display: 'flex', maxWidth: '1200px' }}
		>
			<Space direction='vertical' size='large' style={{ display: 'flex' }}>
				<ContractEditor
					clientKey={clientKey}
					userKey={userKey}
					contractKey={contractKey}
				/>
			</Space>
		</Modal>
	);
};
