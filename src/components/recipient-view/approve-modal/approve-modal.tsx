import React, { useEffect, useState } from 'react';
import { Space, Card, Typography, Modal, Button, Input } from 'antd';
import axios from 'axios';
import { BASE_URL } from '../../../config/config';
import { ApiEntity, ContractAction } from '../../../config/enum';
import { useRecipientViewContext } from '../recipient-view-context';

export const ApproveModal = () => {
	const {
		contract,
		setIsDone,
		approveModal,
		setApproveModal,
		setResultModal,
		setNotification
	} = useRecipientViewContext()
	const { Title, Text } = Typography;
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [spinLoad, setSpinLoad] = useState(false);

	useEffect(() => {
		if (contract && contract.fullname && contract.email) {
			setFullName(contract.fullname);
			setEmail(contract.email);
		}
	}, [contract]);
	// console.log('contractKey 9');
	const handleOk = async () => {
		setSpinLoad(true);
		const body = {
			shareLink: contract.shareLink,
			fullName: fullName,
			email: email,
		};
		await axios
			.post(BASE_URL + ApiEntity.RECIPIENT_APPROVE, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				//console.log('getContract read', payload);
				setSpinLoad(false);
				handleCancel();
				sendEmail();
				setResultModal({ open: true, action: ContractAction.APPROVE });
				setIsDone(true);
			})
			.catch((error) => {
				setNotification({
					text:
						error.response && error.response.data && error.response.data.message
							? error.response.data.message
							: error.message,
				});
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
			shareLink: contract.shareLink,
		};
		await axios
			.post(BASE_URL + ApiEntity.RECIPIENT_APPROVE_EMAIL, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				//console.log('editor read', payload);
			})
			.catch((error) => {
				setNotification({
					text:
						error.response && error.response.data && error.response.data.message
							? error.response.data.message
							: error.message,
				});
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
