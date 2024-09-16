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
} from 'antd';
import { useContractEditorContext } from '../contract-editor-context';
import { BASE_URL } from '../../../config/config';
import {
	Action,
	ApiEntity,
	ContractType,
	ContractTypeText,
	PlaceholderFill,
	PlaceholderTypeText,
	PlaceholderView,
} from '../../../config/enum';
import axios from 'axios';
import { Placeholder, Recipient } from '../../../config/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
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
		setPlaceholderVisible,
		placeholderVisible,
		refreshPlaceholderRecipients,
		setNotification,
		contractPlaceholderCount,
		setContractPlaceholderCount,
		signs,
	} = useContractEditorContext();
	const [currPlaceholder, setCurrPlaceholder] = useState(refreshPlaceholders);
	const [placeholderLoad, setPlaceholderLoad] = useState(false);
	const [placeholderRecipients, setPlaceholderRecipients] = useState<
		Recipient[]
	>([]);
	const readonlyCurrent = useRef(false);

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
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
					Authorization: token ? `Bearer ${token}` : undefined,
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
						placeholderTmp.push(payload.data.placeholders[index]);
					}
					setPlaceholder(placeholderTmp);
					setContractPlaceholderCount(placeholderTmp.length);
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
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				//console.log('getShareLinks read', payload);
				if (payload.data.recipients && payload.data.recipients.length > 0) {
					setPlaceholderRecipients(
						payload.data.recipients.map((recipient: Recipient) => {
							return {
								id: recipient.id,
								fullname: recipient.fullname,
								email: recipient.email,
								customMessage: recipient.customMessage,
								position: recipient.position,
								action: recipient.action,
								recipientKey: recipient.recipientKey,
							};
						})
					);
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
	useEffect(() => {
		let isMounted = true;
		if (
			contractType.toString() === ContractType.PDF.toString() &&
			contractKey &&
			(clientKey || token)
		) {
			getRecipients();
		}
		return () => {
			isMounted = false;
		};
	}, [refreshPlaceholderRecipients]);

	useEffect(() => {
		let isMounted = true;
		if (
			(contractType.toString() === ContractType.PDF.toString() ||
				contractType.toString() === ContractTypeText.PDF.toString()) &&
			contractKey &&
			(clientKey || token) &&
			placeholderVisible &&
			(currPlaceholder !== refreshPlaceholders ||
				!placeholder ||
				placeholder.length === 0)
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
			fillingType: PlaceholderFill.NONE,
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
	const handleChange = (placeholderChange: Placeholder, index: number) => {
		let placeholderTmp = [...placeholder];
		placeholderTmp[index] = placeholderChange;
		setPlaceholderChange(placeholderChange);
		setPlaceholder(placeholderTmp);
	};
	const handleDelete = (placeholderDelete: Placeholder, index: number) => {
		let placeholderTmp = [...placeholder];
		placeholderTmp.splice(index, 1);
		setPlaceholderDelete(placeholderDelete.placeholderKey as string);
		setPlaceholder(placeholderTmp);
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
						<Tooltip title='Close sidebar.'>
							<Button
								size='small'
								icon={<FontAwesomeIcon icon={faClose} />}
								onClick={() => {
									setPlaceholderVisible(!placeholderVisible);
								}}
							/>
						</Tooltip>
					</Space>
					<Text type='secondary'>Add reusable text to the content.</Text>
				</Space>
				{placeholder &&
					placeholder.map((holder, index) => {
						return (
							<PlaceholderDrag
								placeholder={holder}
								recipients={placeholderRecipients}
								readonly={readonlyCurrent.current}
								onChange={(e: any) => {
									handleChange(e.placeholder, index);
								}}
								onDelete={(e: any) => {
									handleDelete(e.placeholder, index);
								}}
							/>
						);
					})}

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
