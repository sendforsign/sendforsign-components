import React, { FC, useEffect, useState } from 'react';

import { Button, Card, Input, Modal, Space } from 'antd';
import { useContractListContext } from '../contract-list-context';
import { BASE_URL } from '../../../config/config';
import { Action, ApiEntity } from '../../../config/enum';
import axios from 'axios';
type RenameModalProps = {
	onSave?: (data?: any) => void;
}
export const RenameModal: FC<RenameModalProps> = ({ onSave }) => {
	const {
		renameModal,
		setRenameModal,
		apiKey,
		clientKey,
		userKey,
		token,
		setNotification
	} = useContractListContext();
	const [saveDisable, setSaveDisable] = useState(true);
	const [saveLoading, setSaveLoading] = useState(false);
	const [contractName, setContractName] = useState('');

	useEffect(() => {
		if (renameModal.open) {
			setContractName(renameModal.name);
		}
	}, [renameModal]);

	const handleCancel = () => {
		setRenameModal({ open: false, contractKey: '', name: '' });
	};
	const handleChange = (e: any) => {
		switch (e.target.id) {
			case 'ContractName':
				if (e.target.value === renameModal.name || e.target.value === '') {
					setSaveDisable(true);
				} else {
					setSaveDisable(false);
				}
				setContractName(e.target.value);
				break;
		}
	};
	const handleSave = async () => {
		setSaveLoading(true);
		const urlContract: string = BASE_URL + ApiEntity.CONTRACT;
		const bodyContract = {
			data: {
				action: Action.UPDATE,
				clientKey: !token ? clientKey : undefined,
				userKey: userKey ? userKey : '',
				contract: {
					contractKey: renameModal.contractKey,
					name: contractName
				},
			},
		};
		await axios
			.post(urlContract, bodyContract, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key':
						!token && apiKey ? apiKey : undefined,
					Authorization: token ? `Bearer ${token}` : undefined,
				},
				responseType: 'json',
			})
			.then((result) => {
				if (result.data.code === 201) {
					setNotification({
						text: result.data.message,
					});
					if (onSave) {
						onSave({ success: true });
					}
				}
				setSaveLoading(false);
				handleCancel();
			})
			.catch((error) => {
				setNotification({
					text:
						error.response &&
							error.response.data &&
							error.response.data.message
							? error.response.data.message
							: error.message,
				});
				setSaveLoading(false);
			});
	};
	return (
		<Modal
			title='Rename contract'
			key={renameModal.contractKey}
			open={renameModal.open}
			centered
			onCancel={handleCancel}
			closable={true}
			footer={
				<>
					<Button key='back' onClick={handleCancel}>
						Cancel
					</Button>
					<Button
						key='submit'
						type='primary'
						disabled={saveDisable}
						onClick={handleSave}
						loading={saveLoading}
					>
						Save
					</Button>
				</>
			}
		>
			<Space
				direction='vertical'
				style={{ display: 'flex', margin: '16px 0 0 0' }}
			>
				<Space direction='vertical' size={16} style={{ display: 'flex' }}>
					<Input
						id='ContractName'
						placeholder='Enter new name'
						value={contractName}
						onChange={handleChange}
					/>
				</Space>
			</Space>
		</Modal>
	);
};
