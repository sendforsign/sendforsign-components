import React, { FC, useEffect, useState } from 'react';

import { Button, Card, Input, Modal, Space } from 'antd';
import { BASE_URL } from '../../../config/config';
import { Action, ApiEntity } from '../../../config/enum';
import axios from 'axios';
import { useTemplateListContext } from '../template-list-context';
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
	} = useTemplateListContext();
	const [saveDisable, setSaveDisable] = useState(true);
	const [saveLoading, setSaveLoading] = useState(false);
	const [templateName, setTemplateName] = useState('');

	useEffect(() => {
		if (renameModal.open) {
			setTemplateName(renameModal.name);
		}
	}, [renameModal]);

	const handleCancel = () => {
		setRenameModal({ open: false, templateKey: '', name: '' });
	};
	const handleChange = (e: any) => {
		switch (e.target.id) {
			case 'TemplateName':
				if (e.target.value === renameModal.name || e.target.value === '') {
					setSaveDisable(true);
				} else {
					setSaveDisable(false);
				}
				setTemplateName(e.target.value);
				break;
		}
	};
	const handleSave = async () => {
		setSaveLoading(true);
		const urlTemplate: string = BASE_URL + ApiEntity.TEMPLATE;
		const body = {
			data: {
				action: Action.UPDATE,
				clientKey: !token ? clientKey : undefined,
				userKey: userKey ? userKey : '',
				template: {
					templateKey: renameModal.templateKey,
					name: templateName
				},
			},
		};
		await axios
			.post(urlTemplate, body, {
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
			title='Rename template'
			key={renameModal.templateKey}
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
						id='TemplateName'
						placeholder='Enter new name'
						value={templateName}
						onChange={handleChange}
					/>
				</Space>
			</Space>
		</Modal>
	);
};
