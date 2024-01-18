import React, { FC, useEffect, useState } from 'react';

import { Space, Modal, Card, Typography } from 'antd';
import { useContractListContext } from '../contract-list-context';
import { ContractEditor } from '../../contract-editor';
import { ModalViewProps } from './modal-view.types';

export const ModalView: FC<ModalViewProps> = ({
	isOpen,
	clientKey,
	userKey,
	contractKey,
	id,
}) => {
	const {
		setContractKey,
		setContractModal,
		refreshContracts,
		setRefreshContracts,
	} = useContractListContext();
	const { Title, Text } = Typography;

	const handleCancel = () => {
		debugger;
		setContractKey('');
		setContractModal(false);
		setRefreshContracts(refreshContracts + 1);
	};
	return (
		<Modal
			open={isOpen}
			centered
			onCancel={handleCancel}
			closable={true}
			footer={<></>}
			width={1200}
		>
			<Space direction='vertical' size='large' style={{ display: 'flex' }}>
				{/* {visibleSpin ? (
					<Space direction='vertical' size={16} style={{ display: 'flex' }}>
						<Card loading={true}>
							<Space direction='vertical' size={16} style={{ display: 'flex' }}>
								<Space direction='vertical' size={2}>
									<Title level={4} style={{ margin: '0 0 0 0' }}>
										Review your document, highlight text to see options
									</Title>
									<Text type='secondary'>
										The green text is where you may want to replace it with your
										own text.
									</Text>
								</Space>
							</Space>
						</Card>
					</Space>
				) : ( */}
				<ContractEditor
					id={id}
					clientKey={clientKey}
					userKey={userKey}
					contractKey={contractKey}
				/>
				{/* )} */}
			</Space>
		</Modal>
	);
};
