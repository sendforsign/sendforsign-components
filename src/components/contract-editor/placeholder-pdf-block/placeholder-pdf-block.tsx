import React, { useEffect, useRef, useState } from 'react';
import {
	Space,
	Card,
	Typography,
	Button,
	Input,
	Radio,
	Row,
	Tooltip,
	Col,
	Popover,
	Divider,
	Select,
} from 'antd';
import { useContractEditorContext } from '../contract-editor-context';
import { BASE_URL } from '../../../config/config';
import {
	Action,
	ApiEntity,
	ContractType,
	ContractTypeText,
	PlaceholderColor,
	PlaceholderFill,
	PlaceholderTypeText,
	PlaceholderView,
} from '../../../config/enum';
import axios from 'axios';
import { Placeholder, Recipient } from '../../../config/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faCircle,
	faCircleQuestion,
	faClose,
	faFont,
	faGear,
	faSignature,
} from '@fortawesome/free-solid-svg-icons';
import { useDrag } from 'react-dnd';
import { PlaceholderDrag } from './placeholder-drag';

type Props = {
	// quillRef: React.MutableRefObject<QuillNamespace | undefined>;
};

type Option = { value: string; label: React.JSX.Element };
export const PlaceholderPdfBlock = () => {
	const {
		apiKey,
		userKey,
		token,
		contractType,
		contractKey,
		clientKey,
		placeholder,
		continueLoad,
		setPlaceholder,
		setPlaceholderChange,
		setPlaceholderDelete,
		refreshPlaceholders,
		refreshOnlyPlaceholders,
		setPlaceholderVisible,
		placeholderVisible,
		setNotification,
		contractPlaceholderCount,
		setContractPlaceholderCount,
		signs,
	} = useContractEditorContext();
	const [currPlaceholder, setCurrPlaceholder] = useState(refreshPlaceholders);
	const [placeholderLoad, setPlaceholderLoad] = useState(false);
	// const [placeholderRecipients, setPlaceholderRecipients] = useState<
	// 	Recipient[]
	// >([]);
	const [selectPlaceholder, setSelectPlaceholder] = useState<Option[]>([]);
	const [selectedPlaceholders, setSelectedPlaceholders] = useState<
		Placeholder[]
	>([]);
	const [selectedOtion, setSelectedOtion] = useState('0');
	const random = useRef(0);
	const readonlyCurrent = useRef(false);
	const placeholderRecipients = useRef<Recipient[]>([]);

	const { Title, Text } = Typography;
	const getPlaceholders = async (load = true) => {
		//console.log('PlaceholderBlock');
		if (load) {
			setPlaceholderLoad(true);
		}
		const body = {
			data: {
				action: Action.LIST,
				clientKey: !token ? clientKey : undefined,
				contractKey: contractKey,
			},
		};
		await axios
			.post(BASE_URL + ApiEntity.PLACEHOLDER, body, {
				// .post('http://localhost:5000/api/' + ApiEntity.PLACEHOLDER, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
					Authorization: token ? `Bearer ${token}` : undefined,
					'x-sendforsign-component': true,
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				//console.log('getPlaceholders read', payload);

				if (payload.data.placeholders && payload.data.placeholders.length > 0) {
					let placeholderTmp: Placeholder[] = [];
					for (
						let index = 0;
						index < payload.data.placeholders.length;
						index++
					) {
						placeholderTmp.push({
							...payload.data.placeholders[index],
							color: payload.data.placeholders[index].color
								? payload.data.placeholders[index].color
								: PlaceholderColor.OTHER,
						});
					}
					setPlaceholder(placeholderTmp);
					setContractPlaceholderCount(placeholderTmp.length);
					handleChangeSelect(selectedOtion, placeholderTmp);
				} else {
					setContractPlaceholderCount(0);
				}
				if (load) {
					setPlaceholderLoad(false);
				}
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
	const getRecipients = async () => {
		const body = {
			data: {
				action: Action.LIST,
				clientKey: !token ? clientKey : undefined,
				userKey: userKey,
				contractKey: contractKey,
				// getShareLinks: true,
			},
		};
		await axios
			.post(BASE_URL + ApiEntity.RECIPIENT, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
					Authorization: token ? `Bearer ${token}` : undefined,
					'x-sendforsign-component': true,
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				let selectOptions: Option[] = [
					{
						value: '0',
						label: (
							<span>
								<FontAwesomeIcon
									icon={faCircle}
									color={PlaceholderColor.OTHER}
									size='sm'
								/>{' '}
								All placeholders
							</span>
						),
					},
					{
						value: '1',
						label: (
							<span>
								<FontAwesomeIcon
									icon={faCircle}
									color={PlaceholderColor.OWNER}
									size='sm'
								/>{' '}
								Contract owner
							</span>
						),
					},
				];
				if (payload.data.recipients && payload.data.recipients.length > 0) {
					placeholderRecipients.current = payload.data.recipients.map(
						(recipient: Recipient) => {
							selectOptions.push({
								value: recipient.recipientKey as string,
								label: (
									<span>
										<FontAwesomeIcon
											icon={faCircle}
											color={recipient.color}
											size='sm'
										/>{' '}
										{recipient.fullname}
									</span>
								),
							});
							return {
								id: recipient.id,
								fullname: recipient.fullname,
								email: recipient.email,
								customMessage: recipient.customMessage,
								position: recipient.position,
								action: recipient.action,
								recipientKey: recipient.recipientKey,
								color: recipient.color,
								type: recipient.type,
							};
						}
					);
				}
				setSelectPlaceholder(selectOptions);
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

	useEffect(() => {
		let isMounted = true;
		if (
			(contractType.toString() === ContractType.PDF.toString() ||
				contractType.toString() === ContractTypeText.PDF.toString()) &&
			contractKey &&
			(clientKey || token) &&
			placeholderVisible &&
			(refreshPlaceholders || !placeholder || placeholder.length === 0)
		) {
			setCurrPlaceholder(refreshPlaceholders);
			getRecipients();
			getPlaceholders();
		}
		return () => {
			isMounted = false;
		};
	}, [refreshPlaceholders, placeholderVisible]);
	useEffect(() => {
		if (refreshOnlyPlaceholders) {
			getPlaceholders(false);
		}
	}, [refreshOnlyPlaceholders]);
	useEffect(() => {
		if (signs && signs.length > 0) {
			readonlyCurrent.current = true;
		}
	}, [signs]);

	const handleAddPlaceholder = async () => {
		let placeholdersTmp: Placeholder[] = [...placeholder];
		placeholdersTmp.push({
			name: `Name${contractPlaceholderCount + 1}`,
			value: '',
			type: PlaceholderTypeText.INTERNAL,
			fillingType:
				selectedOtion === '1'
					? PlaceholderFill.CREATOR
					: selectedOtion !== '0'
						? PlaceholderFill.SPECIFIC
						: PlaceholderFill.NONE,
			externalRecipientKey:
				selectedOtion !== '0' && selectedOtion !== '1' ? selectedOtion : '',
		});

		let body = {
			data: {
				action: Action.CREATE,
				clientKey: !token ? clientKey : undefined,
				contractKey: contractKey,
				placeholder: {
					name: `Name${placeholdersTmp.length}`,
					value: '',
					type: PlaceholderTypeText.INTERNAL,
					fillingType:
						selectedOtion === '1'
							? PlaceholderFill.CREATOR
							: selectedOtion !== '0'
								? PlaceholderFill.SPECIFIC
								: PlaceholderFill.NONE,
					externalRecipientKey:
						selectedOtion !== '0' && selectedOtion !== '1' ? selectedOtion : '',
				},
			},
		};
		await axios
			.post(BASE_URL + ApiEntity.PLACEHOLDER, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
					Authorization: token ? `Bearer ${token}` : undefined,
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				placeholdersTmp[placeholdersTmp.length - 1] = {
					name: `Name${contractPlaceholderCount + 1}`,
					value: '',
					type: PlaceholderTypeText.INTERNAL,
					fillingType: PlaceholderFill.NONE,
					createtime: payload.data.placeholder.createTime,
					id: payload.data.placeholder.id,
					placeholderKey: payload.data.placeholder.placeholderKey,
				};
				setPlaceholder(placeholdersTmp);
				setContractPlaceholderCount(contractPlaceholderCount + 1);
				getPlaceholders(false);
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
	const handleChange = (placeholderChange: Placeholder, id: number) => {
		let placeholderTmp = [...placeholder];
		const holderIndex = placeholder.findIndex(
			(pl) => pl.id?.toString() === id.toString() && !pl.isSpecial
		);
		placeholderTmp[holderIndex] = placeholderChange;
		console.log('onChange2', placeholderChange);
		setPlaceholderChange(placeholderChange);
		setPlaceholder(placeholderTmp);
	};
	const handleDelete = (placeholderDelete: Placeholder, id: number) => {
		let placeholderTmp = [...placeholder];
		const holderIndex = placeholder.findIndex(
			(pl) => pl.id?.toString() === id.toString() && !pl.isSpecial
		);
		placeholderTmp.splice(holderIndex, 1);
		setPlaceholderDelete(placeholderDelete.placeholderKey as string);
		setPlaceholder(placeholderTmp);
	};

	const handleChangeSelect = (e: any, placeholderUpdate?: Placeholder[]) => {
		setPlaceholderLoad(true);
		const placeholderTmp = placeholderUpdate || placeholder;
		switch (e) {
			case '0':
				setSelectedPlaceholders(placeholderTmp);
				random.current = Math.random();
				break;
			case '1':
				const placeholdersOwner = placeholderTmp.filter(
					(holder) =>
						holder.fillingType?.toString() ===
						PlaceholderFill.CREATOR.toString()
				);
				setSelectedPlaceholders(placeholdersOwner);
				random.current = Math.random();
				break;
			default:
				const placeholdersFilter = placeholderTmp.filter(
					(holder) => holder.externalRecipientKey === e
				);
				setSelectedPlaceholders(placeholdersFilter);
				random.current = Math.random();
				break;
		}
		setPlaceholderLoad(false);
		setSelectedOtion(e);
	};
	// console.log('readonly', readonly, readonlyCurrent.current);
	return (
		<Card
			loading={placeholderLoad || continueLoad}
			key={`PlaceholderBlock${contractKey}`}
		>
			<Space direction='vertical' size={16} style={{ display: 'flex' }}>
				<Space direction='vertical' size={2}>
					<Space>
						<Title level={4} style={{ margin: '0 0 0 0' }}>
							Placeholders
						</Title>
					</Space>
					<Text type='secondary'>Add reusable text to the content.</Text>
				</Space>
				<Select
					// defaultValue='All placeholders'
					value={selectedOtion}
					style={{ width: '100%' }}
					onChange={(e) => handleChangeSelect(e)}
					options={selectPlaceholder}
				/>
				<div>
					{placeholder &&
						placeholder.map((holder) => {
							const find = selectedPlaceholders.find(
								(selectedPlaceholder) =>
									selectedPlaceholder.placeholderKey === holder.placeholderKey
							);
							return (
								<PlaceholderDrag
									placeholder={holder}
									recipients={placeholderRecipients.current}
									readonly={readonlyCurrent.current}
									style={!find ? { display: 'none' } : undefined}
									onChange={(e: any) => {
										handleChange(e.placeholder, holder.id as number);
									}}
									onDelete={(e: any) => {
										handleDelete(e.placeholder, holder.id as number);
									}}
								/>
							);
						})}
				</div>
				<Space direction='vertical' size={2} style={{ display: 'flex' }}>
					<Button
						disabled={readonlyCurrent.current}
						block
						type='dashed'
						onClick={handleAddPlaceholder}
					>
						Add placeholder
					</Button>
				</Space>
			</Space>
		</Card>
	);
};
