import React, { useEffect, useRef, useState } from 'react';
import { Space, Card, Typography, Button } from 'antd';
import { useTemplateEditorContext } from '../template-editor-context';
import { BASE_URL } from '../../../config/config';
import {
	Action,
	ApiEntity,
	PlaceholderFill,
	PlaceholderTypeText,
} from '../../../config/enum';
import axios from 'axios';
import { Placeholder } from '../../../config/types';
import { useDrag } from 'react-dnd';
import { PlaceholderDrag } from './placeholder-drag';

export const PlaceholderPdfBlock = () => {
	const {
		apiKey,
		token,
		isPdf,
		templateKey,
		clientKey,
		placeholder,
		continueLoad,
		setPlaceholder,
		refreshPlaceholders,
		setNotification,
		setPlaceholderChange,
		setPlaceholderDelete,
		templatePlaceholderCount,
		setTemplatePlaceholderCount,
	} = useTemplateEditorContext();
	const [currPlaceholder, setCurrPlaceholder] = useState(refreshPlaceholders);
	const [placeholderLoad, setPlaceholderLoad] = useState(false);

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
				templateKey: templateKey,
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
					setTemplatePlaceholderCount(placeholderTmp.length);
				} else {
					setTemplatePlaceholderCount(0);
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

	useEffect(() => {
		let isMounted = true;
		if (
			isPdf &&
			templateKey &&
			(clientKey || token) &&
			(currPlaceholder !== refreshPlaceholders || placeholder.length === 0)
		) {
			setCurrPlaceholder(refreshPlaceholders);
			getPlaceholders();
		}
		return () => {
			isMounted = false;
		};
	}, [refreshPlaceholders]);

	const handleAddPlaceholder = async () => {
		let placeholdersTmp = [...placeholder];
		placeholdersTmp.push({
			name: `Name${templatePlaceholderCount + 1}`,
			value: '',
			type: PlaceholderTypeText.INTERNAL,
			fillingType: PlaceholderFill.NONE,
		});

		setPlaceholder(placeholdersTmp);

		let body = {
			data: {
				action: Action.CREATE,
				clientKey: !token ? clientKey : undefined,
				templateKey: templateKey,
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
					name: `Name${templatePlaceholderCount + 1}`,
					value: '',
					type: PlaceholderTypeText.INTERNAL,
					fillingType: PlaceholderFill.NONE,
					createtime: payload.data.placeholder.createTime,
					id: payload.data.placeholder.id,
					placeholderKey: payload.data.placeholder.placeholderKey,
				};
				setPlaceholder(placeholdersTmp);
				setTemplatePlaceholderCount(templatePlaceholderCount + 1);
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
	return (
		<Card
			loading={placeholderLoad || continueLoad}
			key={`PlaceholderBlock${templateKey}`}
		>
			<Space direction='vertical' size={16} style={{ display: 'flex' }}>
				<Space direction='vertical' size={2}>
					<Title level={4} style={{ margin: '0 0 0 0' }}>
						Placeholders
					</Title>
					<Text type='secondary'>Add reusable text to the content.</Text>
				</Space>
				{placeholder &&
					placeholder.map((holder, index) => {
						return (
							<PlaceholderDrag
								placeholder={holder}
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
