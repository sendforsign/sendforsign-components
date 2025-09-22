import React, { FC, useEffect, useState } from 'react';

import { Card, Space, Modal, Typography, Tag, Segmented } from 'antd';
import { useContractListContext } from '../contract-list-context';
import { ContractEditor } from '../../contract-editor';
// import useSaveParams from '../../../hooks/use-save-params';
export interface ModalViewProps {
	id?: string;
}
export const ModalView: FC<ModalViewProps> = ({ id }) => {
	// const { clearParams } = useSaveParams();
	const {
		contractKey,
		contractModal,
		apiKey,
		clientKey,
		userKey,
		token,
		aiShow,
		setContractKey,
		setContractModal,
		refreshContracts,
		setRefreshContracts,
	} = useContractListContext();
	const [currentKey, setCurrentKey] = useState('');
	const [load, setLoad] = useState(false);
	const [documentSaved, setDocumentSaved] = useState(false);
	const [pendingClose, setPendingClose] = useState(false);
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

	useEffect(() => {
		if (pendingClose && documentSaved) {
			// Если документ сохранен и мы ждем закрытия, закрываем модальное окно
			setPendingClose(false);
			setContractKey('');
			setContractModal(false);
			setRefreshContracts(refreshContracts + 1);
			setDocumentSaved(false); // Сбрасываем состояние для следующего использования
		}
	}, [documentSaved, pendingClose]);

	const handleCancel = () => {
		if (documentSaved) {
			// Если документ уже сохранен, закрываем сразу
			setContractKey('');
			setContractModal(false);
			setRefreshContracts(refreshContracts + 1);
		} else {
			// Если документ не сохранен, ждем пока он сохранится
			setPendingClose(true);
		}
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
					<ContractEditor
						apiKey={apiKey}
						clientKey={clientKey}
						token={token}
						userKey={userKey}
						contractKey={contractKey}
						ai={aiShow}
						onDocumentSave={(e: any) => setDocumentSaved(e.documentSaved)}
					/>
				</Space>
			)}
		</Modal>
	);
};
