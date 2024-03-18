import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import {
	Space,
	Card,
	Typography,
	Button,
	Input,
	Modal,
	Tabs,
	Spin,
} from 'antd';
import { useContractEditorContext } from '../contract-editor-context';
import { BASE_URL } from '../../../config/config';
import { ApiEntity, ContractAction } from '../../../config/enum';
import axios from 'axios';
import env from 'dotenv';
//env.config();

export const SignModal = () => {
	const {
		signModal,
		setSignModal,
		contractKey,
		clientKey,
		setSign,
		setResultModal,
		refreshSign,
		refreshEvent,
		setRefreshSign,
		setContractSign,
		setRefreshEvent,
		apiKey,
	} = useContractEditorContext();
	const [signLoad, setSignLoad] = useState(false);
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [signDisable, setSignDisable] = useState(true);
	const { Title, Text } = Typography;
	const padRef = useRef<any>(null);

	const handleOk = async () => {
		if (fullName && email) {
			setSignLoad(true);
			let canvas: any = padRef?.current?.toDataURL();
			const body = {
				clientKey: clientKey,
				contractKey: contractKey,
				fullName: fullName,
				email: email,
				owner: false,
				base64: canvas,
			};
			await axios
				.post(BASE_URL + ApiEntity.CONTRACT_SIGN, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': apiKey, //process.env.SENDFORSIGN_API_KEY,
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					//console.log('getContract read', payload);
					setContractSign(payload.data);
					setSign(canvas);
					setSignLoad(false);
					handleCancel();
					setResultModal({ open: true, action: ContractAction.SIGN });
					setRefreshSign(refreshSign + 1);
					setRefreshEvent(refreshEvent + 1);
				});
		}
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
	const handleClear = () => {
		padRef?.current?.clear();
		setSignDisable(true);
	};
	const handleBegin = () => {
		setSignDisable(false);
	};
	const handleCancel = () => {
		setFullName('');
		setEmail('');
		handleClear();
		setSignModal(false);
	};

	const items = [
		{
			key: '1',
			label: `Leave your signature`,
			children: (
				<SignatureCanvas
					ref={padRef}
					penColor='rgb(34, 30, 252)'
					canvasProps={{ width: 350, height: 200, className: 'sigCanvas' }}
					onBegin={handleBegin}
				/>
			),
		},
	];
	return (
		<Modal
			title='Sign this document'
			open={signModal}
			centered
			onOk={handleOk}
			onCancel={handleCancel}
			footer={
				<>
					<Button key='clear' onClick={handleClear} style={{ float: 'left' }}>
						Start over
					</Button>
					<Button key='back' onClick={handleCancel}>
						Cancel
					</Button>
					<Button
						key='submit'
						type='primary'
						disabled={signDisable}
						onClick={handleOk}
						loading={signLoad}
					>
						Sign
					</Button>
				</>
			}
		>
			<Space
				direction='vertical'
				style={{ display: 'flex', margin: '32px 0 0 0' }}
			>
				<Card>
					<Space direction='vertical' size={16} style={{ display: 'flex' }}>
						<Space direction='vertical' size={2}>
							<Title level={5} style={{ margin: '0 0 0 0' }}>
								Leave your name and email
							</Title>
							<Text type='secondary'>
								We will send the signed document to this email.
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
				<Spin spinning={!fullName || !email} style={{ display: 'none' }}>
					<Space direction='vertical' style={{ display: 'flex' }}>
						<Card bordered={true}>
							<Space direction='vertical' size={16} style={{ display: 'flex' }}>
								<Space direction='vertical' size={2}>
									{/* <Title level={5} style={{ margin: '0 0 0 0' }}>
									Leave your signature
								</Title> */}
									<Tabs defaultActiveKey='1' items={items} size='small' />
								</Space>
							</Space>
						</Card>
						<Text type='secondary' style={{ fontSize: 12 }}>
							By clicking Sign, I acknowledge that this electronic signature
							will represent my signature in all document uses, including
							legally binding contracts.
						</Text>
					</Space>
				</Spin>
			</Space>
		</Modal>
	);
};
