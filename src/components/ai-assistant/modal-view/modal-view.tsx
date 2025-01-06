import React, { FC, useEffect, useState } from 'react';

import { Card, Space, Modal, Typography, Tag, Segmented } from 'antd';
import { useAiAssistantContext } from '../ai-assistant-context';
import { ContractEditor } from '../../contract-editor';
import { ContractList } from '../../contract-list'; 
import { TemplateList } from '../../template-list';
// import useSaveParams from '../../../hooks/use-save-params';
export interface ModalViewProps {
	id?: string;
}
export const ModalView: FC<ModalViewProps> = ({ id }) => {
	// const { clearParams } = useSaveParams();
	const {
		apiKey,
		clientKey,
		userKey,
		setContractModal,
		contractModal,
		token,
		contractKey,
	} = useAiAssistantContext();
	const [currentKey, setCurrentKey] = useState('');
	const [load, setLoad] = useState(false);
	const { Title, Text } = Typography;

	useEffect(() => {
		if (contractModal) {
			if (contractKey !== currentKey || contractKey === '') {
				setCurrentKey(contractKey);
				setLoad(true);
				setTimeout(() => {
					setLoad(false);
				}, 10);
			}
		}
	}, [contractModal]);

	const handleCancel = () => {
		setContractModal(false);
	};
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
									Select a document to be signed
								</Title>
								<Text type='secondary'>
									Draft a document from scratch, use a template, or upload a
									file.
								</Text>
							</Space>
						</Space>
					</Card>
				</Space>
			) : (
				<Space direction='vertical' size='large' style={{ display: 'flex' }}>
					{
						contractKey === 'contracts' ? ( // Check if contractKey is 'contracts'
							<ContractList 
								apiKey={apiKey}
								clientKey={clientKey}
								token={token}
								userKey={userKey}
							/> // Show the ContractList
						) : contractKey === 'templates' ? ( // Check if contractKey is 'templates'
							<TemplateList 
								apiKey={apiKey}
								clientKey={clientKey}
								token={token}
								userKey={userKey}
							/> // Show the TemplateList
						) : (
							<ContractEditor
								apiKey={apiKey}
								clientKey={clientKey}
								token={token}
								userKey={userKey}
								contractKey={contractKey}
							/> // Show the ContractEditor in other cases
						)
					}
				</Space>
			)}
		</Modal>
	);
};
