import React, { FC, useEffect, useState } from 'react';

import { Card, Space, Modal, Typography, Tag, Segmented } from 'antd';
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
		token,
		setContractKey,
		setContractModal,
		refreshContracts,
		setRefreshContracts,
	} = useContractListContext();
	const [currentKey, setCurrentKey] = useState('');
	const [load, setLoad] = useState(false);
	const { Title, Text } = Typography;

	useEffect(() => {
		if (contractModal) {
			if (contractKey !== currentKey) {
				setCurrentKey(contractKey);
				setLoad(true);
				setTimeout(() => {
					setLoad(false);
				}, 10);
			}
		}
	}, [contractModal]);

	const handleCancel = () => {
		// debugger;
		setContractKey('');
		setContractModal(false);
		setRefreshContracts(refreshContracts + 1);
		clearParams();
	};
	// const handleStep = (e: any) => {
	// 	console.log('handleStep', e);
	// };
	// const handleSave = (e: any) => {
	// 	console.log('handleSave', e);
	// };
	return (
		<Modal
			key={id}
			open={contractModal}
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
									Select a document type or upload a file
								</Title>
								<Text type='secondary'>
									This will speed up the drafting process.
								</Text>
							</Space>
						</Space>
					</Card>
				</Space>
			) : (
				<Space direction='vertical' size='large' style={{ display: 'flex' }}>
					<ContractEditor
						apiKey={apiKey}
						clientKey={clientKey}
						token={token}
						userKey={userKey}
						contractKey={contractKey}
						// onStepChange={handleStep}
						// onDocumentSave={handleSave}
					/>
				</Space>
			)}
		</Modal>
	);
};
