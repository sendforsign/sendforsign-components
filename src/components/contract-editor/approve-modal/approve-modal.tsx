import React, { useState } from 'react';

import { Space, Card, Typography, Modal, Button, Input } from 'antd';
import { useContractEditorContext } from '../contract-editor-context';
import axios from 'axios';
import { BASE_URL } from '../../../config/config';
import { ApiEntity, ContractAction } from '../../../config/enum';

export const ApproveModal = () => {
	const {
		apiKey,
		token,
		approveModal,
		setApproveModal,
		contractKey,
		clientKey,
		refreshEvent,
		setResultModal,
		setRefreshEvent,
	} = useContractEditorContext();
	const { Title, Text } = Typography;
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [spinLoad, setSpinLoad] = useState(false);

	// console.log('contractKey 9');
	const handleOk = async () => {
		setSpinLoad(true);
		const body = {
			clientKey: !token ? clientKey : undefined,
			contractKey: contractKey,
			fullName: fullName,
			email: email,
		};
		await axios
			.post(BASE_URL + ApiEntity.CONTRACT_APPROVE, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
					Authorization: token ? `Bearer ${token}` : undefined,
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				//console.log('getContract read', payload);
				setSpinLoad(false);
				setRefreshEvent(refreshEvent + 1);
				handleCancel();
				sendEmail();
				setResultModal({ open: true, action: ContractAction.APPROVE });
			});
	};
	const handleCancel = () => {
		setEmail('');
		setFullName('');
		setApproveModal(false);
	};
	const handleChange = (e: any) => {
		switch (e.target.id) {
			case 'FullName':
				setFullName(e.target.value);
				break;

			case 'Email':
				setEmail(e.target.value);
				break;
		}
	};
	const sendEmail = async () => {
		let body = {
			clientKey: !token ? clientKey : undefined,
			contractKey: contractKey,
		};
		await axios
			.post(BASE_URL + ApiEntity.CONTRACT_EMAIL_APPROVE, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
					Authorization: token ? `Bearer ${token}` : undefined,
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				//console.log('editor read', payload);
			});
	};
	return (
		<Modal
			title='Approve this document'
			open={approveModal}
			centered
			onOk={handleOk}
			onCancel={handleCancel}
			footer={
				<>
					<Button key='back' onClick={handleCancel}>
						Cancel
					</Button>
					<Button
						key='submit'
						type='primary'
						disabled={!fullName || !email ? true : false}
						onClick={handleOk}
						loading={spinLoad}
					>
						Approve
					</Button>
				</>
			}
		>
			<Space
				direction='vertical'
				size='large'
				style={{ display: 'flex', margin: '32px 0 0 0' }}
			>
				<Card bordered={true} key={`ApproveModal${new Date().toString()}`}>
					<Space direction='vertical' size={16} style={{ display: 'flex' }}>
						<Space direction='vertical' size={2}>
							<Title level={5} style={{ margin: '0 0 0 0' }}>
								Leave your name and email
							</Title>
							<Text type='secondary'>
								We will send the approved document to this email.
							</Text>
						</Space>
						<Input
							id='FullName'
							placeholder='Enter your full name'
							value={fullName}
							onChange={handleChange}
						/>
						<Input
							id='Email'
							placeholder='Enter your email'
							value={email}
							onChange={handleChange}
						/>
					</Space>
				</Card>
			</Space>
		</Modal>
	);
};
