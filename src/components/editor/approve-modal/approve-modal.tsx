import React, { useState } from 'react';

import { Space, Card, Typography, Modal, Button, Input } from 'antd';
import { useEditorContext } from '../editor-context';
import axios from 'axios';
import { BASE_URL } from '../../../config/config';
import { ApiEntity, ContractAction } from '../../../config/enum';

export const ApproveModal = () => {
	const {
		approveModal,
		setApproveModal,
		contractKey,
		clientKey,
		setResultModal,
	} = useEditorContext();
	const { Title, Text } = Typography;
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [spinLoad, setSpinLoad] = useState(false);

	const handleOk = async () => {
		setSpinLoad(true);
		const body = {
			clientKey: clientKey,
			contractKey: contractKey,
			fullName: fullName,
			email: email,
		};
		await axios
			.post(BASE_URL + ApiEntity.CONTRACT_APPROVE, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': 're_api_key', //process.env.SENDFORSIGN_API_KEY,
				},
				responseType: 'json',
			})
			.then((payload) => {
				console.log('getContract read', payload);
				setSpinLoad(false);
				handleCancel();
				setResultModal({ open: true, action: ContractAction.APPROVE });
			});
		// await saveApprove({
		//   shareLink: contract.shareLink ? contract.shareLink : undefined,
		//   controlLink: contract.controlLink ? contract.controlLink : undefined,
		//   fullName: fullName,
		//   email: email,
		// })
		//   .unwrap()
		//   .then(() => {
		//     setSpinLoad(false);
		//     sendEmail({ shareLink: contract.shareLink });
		//     handleCancel();
		//     dispatch(
		//       setResultModal({ open: true, action: ContractAction.APPROVE })
		//     );
		//   });
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
				<Card bordered={true}>
					<Space direction='vertical' size={16} style={{ display: 'flex' }}>
						<Space direction='vertical' size={2}>
							<Title level={5} style={{ margin: '0 0 0 0' }}>
								Leave your name and email
							</Title>
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
