import React from 'react';

import { Space, Modal } from 'antd';
import { useContractListContext } from '../contract-list-context';
import { ContractEditor } from '../../contract-editor';

export const ModalView = () => {
	const {
		contractKey,
		setContractKey,
		clientKey,
		userKey,
		contractModal,
		setContractModal,
	} = useContractListContext();
	const handleCancel = () => {
		setContractKey('');
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
			width={1200}
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
