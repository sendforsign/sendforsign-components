import React, { FC, useEffect, useRef, useState } from 'react';
import {
	Typography,
	Card,
	Space,
	Row,
	Col,
	Button,
	Spin,
	MenuProps,
	Dropdown,
	Empty,
} from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import { BASE_URL } from '../../config/config';
import { Action, ApiEntity } from '../../config/enum';
import Table, { ColumnsType } from 'antd/es/table';
import { TemplateListContext } from './template-list-context';
import { ModalView } from './modal-view/modal-view';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Notification } from './notification/notification';
import { RenameModal } from './rename-modal';

interface DataType {
	key?: string;
	name?: string;
	status?: string[];
	createdAt?: string;
	changedAt?: string;
}
export interface TemplateListProps {
	apiKey?: string;
	clientKey?: string;
	token?: string;
	userKey?: string;
	isModal?: boolean;
}
export const TemplateList: FC<TemplateListProps> = ({
	apiKey,
	clientKey,
	token,
	isModal = true,
	userKey,
}) => {
	const [currTemplateKey, setCurrTemplateKey] = useState('');
	const [currClientKey, setCurrClientKey] = useState(clientKey);
	const [currUserKey, setCurrUserKey] = useState(userKey);
	const [currApiKey, setCurrApiKey] = useState(apiKey);
	const [currToken, setCurrToken] = useState(token);
	const [notification, setNotification] = useState({});
	const [templateModal, setTemplateModal] = useState(false);
	const [refreshTemplate, setRefreshTemplate] = useState(0);
	const [spinLoad, setSpinLoad] = useState(false);
	const [templatesLoad, setTemplatesLoad] = useState(false);
	const [renameModal, setRenameModal] = useState({ open: false, templateKey: '', name: '' });
	const [data, setData] = useState<DataType[]>([]);
	const currentRecord = useRef<DataType>({});
	const { Title } = Typography;
	const items: MenuProps['items'] = [
		{
			label: 'Delete',
			key: Action.DELETE,
		},
		{
			label: 'Rename',
			key: Action.RENAME,
		},
		{
			label: 'Duplicate',
			key: Action.DUPLICATE,
		},
	];

	const chooseTemplate = (text: string) => {
		setCurrTemplateKey(text);
		if (isModal) {
			setTemplateModal(true);
		}
	};
	const dropdownClick: MenuProps['onClick'] = async (e: any) => {
		if (currentRecord.current && currentRecord.current.key) {
			let url = '';
			switch (e.key) {
				case Action.DELETE:
					url = BASE_URL + ApiEntity.TEMPLATE;
					let bodyTemplate = {
						data: {
							action: Action.DELETE,
							clientKey: !token ? currClientKey : undefined,
							userKey: currUserKey ? currUserKey : '',
							template: {
								templateKey: currentRecord.current.key,
							},
						},
					};
					await axios
						.post(url, bodyTemplate, {
							headers: {
								Accept: 'application/vnd.api+json',
								'Content-Type': 'application/vnd.api+json',
								'x-sendforsign-key':
									!currToken && currApiKey ? currApiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
								Authorization: currToken ? `Bearer ${currToken}` : undefined,
							},
							responseType: 'json',
						})
						.then((result) => {
							if (result.data.code === 201) {
								let dataTmp = data.filter(
									(line) => line.key !== currentRecord.current.key
								);
								setData(dataTmp);
								setNotification({
									text: result.data.message,
								});
							}
							currentRecord.current = {};
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
					break;
				case Action.RENAME:
					setRenameModal({ open: true, templateKey: currentRecord.current.key, name: currentRecord.current.name as string });
					break;
				case Action.DUPLICATE:
					url = BASE_URL + ApiEntity.TEMPLATE;
					const body = {
						data: {
							action: Action.DUPLICATE,
							clientKey: !token ? currClientKey : undefined,
							userKey: currUserKey ? currUserKey : '',
							template: {
								templateKey: currentRecord.current.key,
							},
						},
					};
					await axios
						.post(url, body, {
							headers: {
								Accept: 'application/vnd.api+json',
								'Content-Type': 'application/vnd.api+json',
								'x-sendforsign-key':
									!currToken && currApiKey ? currApiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
								Authorization: currToken ? `Bearer ${currToken}` : undefined,
							},
							responseType: 'json',
						})
						.then((result) => {
							if (result.data.code === 201) {
								setNotification({
									text: result.data.message,
								});
								setRefreshTemplate(refreshTemplate + 1);
							}
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
					break;
			}
		}
	};
	const columns: ColumnsType<DataType> = [
		{
			title: 'Template name',
			dataIndex: 'name',
			render: (_: any, record: DataType) => (
				<Button
					type='link'
					onClick={() => {
						chooseTemplate(record.key ? record.key : '');
					}}
				>
					{record.name}
				</Button>
			),
		},
		{
			title: 'Created at',
			dataIndex: 'createdAt',
		},
		{
			title: 'Modified at',
			dataIndex: 'changedAt',
		},
		{
			title: 'Action',
			dataIndex: 'action',
			render: (_: any, record: DataType) => {
				return (
					<Dropdown
						menu={{ items, onClick: dropdownClick }}
						onOpenChange={() => {
							currentRecord.current = record;
						}}
					>
						<Button
							icon={<FontAwesomeIcon icon={faEllipsisVertical} />}
							type='text'
						/>
					</Dropdown>
				);
			},
		},
	];

	useEffect(() => {
		setCurrToken(token);
	}, [token]);
	useEffect(() => {
		setCurrApiKey(apiKey);
	}, [apiKey]);
	useEffect(() => {
		setCurrClientKey(clientKey);
	}, [clientKey]);
	useEffect(() => {
		setCurrUserKey(userKey);
	}, [userKey]);
	useEffect(() => {
		let isMounted = true;
		let body = {
			data: {
				action: Action.LIST,
				clientKey: !token ? clientKey : undefined,
				userKey: userKey,
			},
		};
		const getTemplate = async () => {
			setTemplatesLoad(true);
			await axios
				.post(BASE_URL + ApiEntity.TEMPLATE, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': !currToken && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
						Authorization: currToken ? `Bearer ${currToken}` : undefined,
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					let array: DataType[] = payload.data.templates.map(
						(template: any) => {
							return {
								key: template.templateKey,
								name: template.name ? template.name : 'Empty name',
								// status: ['Draft'],
								createdAt: dayjs(
									template.createTime
										? template.createTime.toString()
										: new Date().toString()
								).format('YYYY-MM-DD HH:mm:ss'),
								changedAt: dayjs(
									template.changeTime
										? template.changeTime.toString()
										: new Date().toString()
								).format('YYYY-MM-DD HH:mm:ss'),
							};
						}
					);
					setData(array);
					setTemplatesLoad(false);
				});
		};
		if (currApiKey || currToken) {
			setSpinLoad(false);
			getTemplate();
		} else {
			setSpinLoad(true);
		}
		return () => {
			isMounted = false;
		};
	}, [refreshTemplate]);

	const toggleButton = (
		<Button
			type='primary'
			onClick={() => {
				chooseTemplate('');
			}}
		>
			Add template
		</Button>
	);

	return (
		<TemplateListContext.Provider
			value={{
				templateModal,
				setTemplateModal,
				templateKey: currTemplateKey,
				setTemplateKey: setCurrTemplateKey,
				clientKey: currClientKey,
				setClientKey: setCurrClientKey,
				userKey: currUserKey,
				setUserKey: setCurrUserKey,
				refreshTemplate,
				setRefreshTemplate,
				apiKey: currApiKey,
				setApiKey: setCurrApiKey,
				token: currToken,
				setToken: setCurrToken,
				notification,
				setNotification,
				renameModal,
				setRenameModal
			}}
		>
			{spinLoad ? (
				<Spin spinning={spinLoad} fullscreen />
			) : (
				<Space direction='vertical' size={16} style={{ display: 'flex' }}>
					<Card style={{ overflow: 'auto' }}>
						<Table
							loading={templatesLoad}
							style={{ minWidth: 600 }}
							columns={columns}
							dataSource={data}
							locale={{
								emptyText: (
									<Empty
										image={Empty.PRESENTED_IMAGE_SIMPLE}
										description="You haven't created any templates yet"
									>
										{toggleButton}
									</Empty>
								),
							}}
							title={() => (
								<Row>
									<Col>
										<Title
											level={4}
											style={{
												margin: '0',
												display: 'flex',
												textAlign: 'center',
											}}
										>
											Templates
										</Title>
									</Col>
									<Col flex={'auto'}></Col>
									<Col>
										<Button
											type='primary'
											icon={<FontAwesomeIcon icon={faPlus} />}
											onClick={() => {
												chooseTemplate('');
											}}
										>
											Add template
										</Button>
									</Col>
								</Row>
							)}
						/>
					</Card>
				</Space>
			)}
			<ModalView />
			<RenameModal onSave={(e: any) => {
				if (e.success) {
					setRefreshTemplate(refreshTemplate + 1);
				}
			}} />
			<Notification />
		</TemplateListContext.Provider>
	);
};
