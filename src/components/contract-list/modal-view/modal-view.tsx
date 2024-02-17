import React, { FC } from 'react';

import { Space, Modal } from 'antd';
import { useContractListContext } from '../contract-list-context';
import { ContractEditor } from '../../contract-editor';
import { ModalViewProps } from './modal-view.types';

export const ModalView: FC<ModalViewProps> = ({ id }) => {
	const {
		contractKey,
		contractModal,
		apiKey,
		clientKey,
		userKey,
		setContractKey,
		setContractModal,
		refreshContracts,
		setRefreshContracts,
	} = useContractListContext();

	const handleCancel = () => {
		// debugger;
		setContractKey('');
		setContractModal(false);
		setRefreshContracts(refreshContracts + 1);
	};
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
					id={id}
					apiKey={apiKey}
					clientKey={clientKey}
					userKey={userKey}
					contractKey={contractKey}
				/>
			</Space>
		</Modal>
	);
};
