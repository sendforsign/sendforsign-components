import React, { FC } from 'react';

import { Space, Modal } from 'antd';
import { useContractListContext } from '../contract-list-context';
import { ContractEditor } from '../../contract-editor';
import useSaveParams from '../../../hooks/use-save-params';
export interface ModalViewProps {
	id?: string;
}
export const ModalView: FC<ModalViewProps> = ({ id }) => {
	const { clearParams } = useSaveParams();
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
		clearParams();
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
					apiKey={apiKey}
					clientKey={clientKey}
					userKey={userKey}
					contractKey={contractKey}
				/>
			</Space>
		</Modal>
	);
};
