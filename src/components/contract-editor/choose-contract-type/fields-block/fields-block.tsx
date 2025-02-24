import React, { useEffect, useRef, useState } from 'react';
import {
	Space,
	Card,
	Typography,
	Button,
	Tag,
	Input,
	Steps,
	theme,
} from 'antd';
import axios from 'axios';
import { useContractEditorContext } from '../../contract-editor-context';
import {
	Action,
	ApiEntity,
	ContractSteps,
	PlaceholderFill,
	RecipientType,
	ShareLinkViewText,
} from '../../../../config/enum';
import { BASE_URL } from '../../../../config/config';
import { Placeholder, Recipient } from '../../../../config/types';
import { RecipientContent } from '../../send-modal/recipient-content';

type Props = {
	handleContinue: () => void;
	templateKey?: string;
};

export const FieldsBlock = ({ handleContinue, templateKey }: Props) => {
	const {
		apiKey,
		continueDisable,
		setContinueDisable,
		clientKey,
		placeholder,
		token: currToken,
		contractName,
		setContractName,
		setPlaceholder,
		continueLoad,
		setFillPlaceholder,
		setRecipientFilling,
		setFillRecipient,
		setCurrentData,
		setNotification,
		setLoad,
	} = useContractEditorContext();
	const { Title, Text } = Typography;
	const currPlaceholder = useRef(placeholder);
	const [steps, setSteps] = useState<
		{ key: string; name: string; value: string }[]
	>([]);
	const [insertRecipient, setInsertRecipient] = useState<Recipient[]>([]);
	const [recipients, setRecipients] = useState<Recipient[]>([
		{
			id: 0,
			fullname: '',
			email: '',
			customMessage: '',
			position: 1,
			action: ShareLinkViewText.SIGN,
			recipientKey: '',
		},
	]);

	const [current, setCurrent] = useState(0);
	const [items, setItems] = useState<
		{
			key: string;
			title: string;
		}[]
	>([]);
	const { token } = theme.useToken();

	const handleChange = (e: any, placeholderKey: string) => {
		let stepsTmp: { key: string; name: string; value: string }[] = [...steps];
		switch (e.target.id) {
			case 'ContractName':
				setContractName(e.target.value);
				if (stepsTmp.length > 0 && stepsTmp[0]) {
					stepsTmp[0].value = e.target.value;
				}
				if (e.target.value) {
					setContinueDisable(false);
				} else {
					setContinueDisable(true);
				}
				break;
			default:
				const index = currPlaceholder.current.findIndex(
					(holder) => holder.placeholderKey === placeholderKey
				);
				currPlaceholder.current[index].value = e.target.value;
				const stepIndex = stepsTmp.findIndex(
					(step) => step.key === placeholderKey
				);
				stepsTmp[stepIndex].value = currPlaceholder.current[index]
					.value as string;
				setPlaceholder(currPlaceholder.current);
				break;
		}
		setSteps(stepsTmp);
	};

	useEffect(() => {
		setSteps([
			{
				key: 'ContractName',
				name: 'What is the name of your document?',
				value: contractName,
			},
			{
				key: 'Recipients',
				name: 'who are your recipients?',
				value: '',
			},
		]);
		setItems([
			{
				key: 'ContractName',
				title: '',
			},
			{
				key: 'Recipients',
				title: '',
			},
		]);
	}, []);

	useEffect(() => {
		const getPlaceholder = async () => {
			// debugger;
			const body = {
				data: {
					action: Action.LIST,
					clientKey: !currToken ? clientKey : undefined,
					templateKey: templateKey,
				},
			};
			await axios
				.post(BASE_URL + ApiEntity.PLACEHOLDER, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': !currToken && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
						Authorization: currToken ? `Bearer ${currToken}` : undefined,
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					//console.log('getPlaceholders read', payload);
					let stepsTmp: { key: string; name: string; value: string }[] = [];
					stepsTmp.push({
						key: 'ContractName',
						name: 'What is the name of your document?',
						value: contractName,
					});
					stepsTmp.push({
						key: 'Recipients',
						name: 'who are your recipients?',
						value: '',
					});
					if (
						payload.data.placeholders &&
						payload.data.placeholders.length > 0
					) {
						let placeholderTmp: Placeholder[] = [];
						for (
							let index = 0;
							index < payload.data.placeholders.length;
							index++
						) {
							placeholderTmp.push(payload.data.placeholders[index]);
						}

						setPlaceholder(placeholderTmp);
						currPlaceholder.current = placeholderTmp;
						// debugger;

						placeholderTmp
							?.filter(
								(holder) =>
									holder.fillingType?.toString() ===
									PlaceholderFill.CREATOR.toString()
							)
							.forEach((holder) => {
								setFillPlaceholder(true);
								stepsTmp.push({
									key: holder.placeholderKey as string,
									name: holder.name as string,
									value: holder.value as string,
								});
							});
					}
					setItems(
						stepsTmp.map((step) => {
							return { key: step.key, title: '' };
						})
					);
					setSteps(stepsTmp);
					setLoad(false);
					// setFieldBlockVisible(true);
					setCurrentData({ currentStep: ContractSteps.QN_A_STEP });
					// setCreateDisable(true);
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
				});
		};
		if (templateKey) {
			getPlaceholder();
		}
	}, [templateKey]);

	const next = () => {
		setCurrent(current + 1);
	};

	const prev = () => {
		setCurrent(current - 1);
	};

	const handleClickRecipient = (e: any, index: number) => {
		let recipientsTmp = [...recipients];
		recipientsTmp[index].action = e;
		setRecipients(recipientsTmp);
	};
	const handleChangeRecipient = (e: any, index: number) => {
		let recipientsTmp = [...recipients];
		switch (e.target.id) {
			case 'FullName':
				recipientsTmp[index].fullname = e.target.value;
				break;
			case 'Email':
				recipientsTmp[index].email = e.target.value;
				break;
			case 'CustomMessage':
				recipientsTmp[index].customMessage = e.target.value;
				break;
			case 'TypeSwitch':
				recipientsTmp[index].type = e.target.value
					? RecipientType.INTERNAL
					: RecipientType.EXTERNAL;
				break;
		}
		setRecipients(recipientsTmp);
	};
	const handleInsertRecipient = () => {
		// debugger;
		let recipientsTmp = [...recipients];
		let idTmp = recipientsTmp[recipientsTmp.length - 1].id
			? (recipientsTmp[recipientsTmp.length - 1]?.id as number) + 1
			: 1;
		recipientsTmp.push({
			id: idTmp,
			position: 1,
			action: ShareLinkViewText.SIGN,
			recipientKey: '',
			fullname: '',
			email: '',
			customMessage: '',
		});
		setRecipients(recipientsTmp);
		insertRecipient.push({
			id: idTmp,
			position: 1,
			action: ShareLinkViewText.SIGN,
			recipientKey: '',
			fullname: '',
			email: '',
			customMessage: '',
		});
		setInsertRecipient(insertRecipient);
	};

	const handleDeleteRecipient = (index: number) => {
		let recipientsTmp = [...recipients];

		recipientsTmp.splice(index, 1);
		setRecipients(recipientsTmp);
	};

	const handleSaveRecipients = async () => {
		if (insertRecipient.length > 0) {
			let insertTmp: Recipient[] = [];
			if (recipients[0] && !recipients[0].recipientKey) {
				insertTmp.push({
					id: recipients[0].id,
					fullname: recipients[0].fullname,
					email: recipients[0].email,
					customMessage: recipients[0].customMessage,
					position: recipients[0].position,
					action: recipients[0].action,
					recipientKey: '',
				});
			}
			for (let index = 0; index < insertRecipient.length; index++) {
				const recipientFind = recipients.find(
					(recipient) =>
						recipient.id === insertRecipient[index].id &&
						recipient.fullname &&
						recipient.email
				);
				if (recipientFind) {
					insertTmp.push(recipientFind);
				}
			}
			if (insertTmp.length > 0) {
				setFillRecipient(true);
				setRecipientFilling(insertTmp);
			}
		}
		if (recipients.length === 1 && insertRecipient.length === 0) {
			setFillRecipient(true);
			setRecipientFilling([
				{
					id: recipients[0].id,
					fullname: recipients[0].fullname,
					email: recipients[0].email,
					customMessage: recipients[0].customMessage,
					position: recipients[0].position,
					type: recipients[0].type,
					action: recipients[0].action,
					recipientKey: '',
				},
			]);
		}
	};

	return (
		<Card bordered={true}>
			<Space direction='vertical' size={16} style={{ display: 'flex' }}>
				<Space direction='vertical' size={2}>
					<Title level={4} style={{ margin: '0' }}>
						Answer the questions below to create your document
					</Title>
				</Space>
				{steps.length > 1 ? (
					<>
						<Steps current={current} items={items} size='small' />
						{steps[current].key === 'Recipients' ? (
							<RecipientContent
								isModal={false}
								load={true}
								handleClick={handleClickRecipient}
								handleChange={handleChangeRecipient}
								handleInsert={handleInsertRecipient}
								handleDelete={handleDeleteRecipient}
								recipients={recipients}
							/>
						) : (
							<Card
								style={{
									marginTop: 16,
									textAlign: 'center',
									color: token.colorTextTertiary,
									backgroundColor: token.colorFillAlter,
									borderRadius: token.borderRadiusLG,
								}}
							>
								<Space direction='vertical' style={{ display: 'flex' }}>
									<Title level={5} style={{ margin: '0' }}>
										{steps[current].name}
									</Title>
									<Text type='secondary'>
										Enter the value in the field below.
									</Text>
									<Input
										id={steps[current].key}
										placeholder={`Type here`}
										value={steps[current].value}
										onChange={(e) => handleChange(e, steps[current].key)}
									/>
								</Space>
							</Card>
						)}
						<div style={{ marginTop: 24 }}>
							{current > 0 && (
								<Button style={{ margin: '0 8px' }} onClick={() => prev()}>
									Previous
								</Button>
							)}
							{current < steps.length - 1 && (
								<Button
									type='primary'
									disabled={continueDisable}
									onClick={() => next()}
								>
									Next
								</Button>
							)}
							{current === steps.length - 1 && (
								<Button
									type='primary'
									onClick={async () => {
										if (recipients[0].fullname && recipients[0].email) {
											await handleSaveRecipients();
										}
										handleContinue();
									}}
									loading={continueLoad}
								>
									Done
								</Button>
							)}
						</div>
					</>
				) : (
					<>
						<Card
							style={{
								marginTop: 16,
								textAlign: 'center',
								color: token.colorTextTertiary,
								backgroundColor: token.colorFillAlter,
								borderRadius: token.borderRadiusLG,
							}}
						>
							<Space direction='vertical' style={{ display: 'flex' }}>
								<Title level={5} style={{ margin: '0' }}>
									What is the name of your document?
								</Title>
								<Text type='secondary'>
									Enter the value in the field below.
								</Text>
								<Input
									id={'ContractName'}
									placeholder='Type here'
									value={contractName}
									onChange={(e) => handleChange(e, 'ContractName')}
								/>
							</Space>
						</Card>
						<Button
							type='primary'
							onClick={handleContinue}
							loading={continueLoad}
						>
							Done
						</Button>
					</>
				)}
			</Space>
		</Card>
	);
};
