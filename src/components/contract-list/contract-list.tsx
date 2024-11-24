import React, { FC, useEffect, useRef, useState } from 'react';
import {
	Typography,
	Tag,
	Card,
	Space,
	Row,
	Col,
	Button,
	TableColumnsType,
	Spin,
	Dropdown,
	MenuProps,
	Empty,
	Statistic,
	Input,
	Select,
	Tooltip,
} from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import { BASE_URL } from '../../config/config';
import { Action, ApiEntity } from '../../config/enum';
import Table from 'antd/es/table';
import { ContractListContext } from './contract-list-context';
import { ModalView } from './modal-view/modal-view';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faBookBookmark,
	faEllipsisVertical,
	faLightbulb,
	faPaperclip,
	faPlus,
	faQuestion,
	faSignature,
} from '@fortawesome/free-solid-svg-icons';
import { EventStatus } from '../../config/types';
import { Notification } from './notification/notification';

const { Option } = Select;
const { TextArea } = Input;

interface DataType {
	key?: string;
	name?: string;
	status?: string;
	createdAt?: string;
	createdBy?: string;
}
export interface ContractListProps {
	apiKey?: string;
	clientKey?: string;
	token?: string;
	userKey?: string;
	isModal?: boolean;
}

export const ContractList: FC<ContractListProps> = ({
	apiKey,
	clientKey,
	token,
	isModal = true,
	userKey,
}) => {
	const [currClientKey, setCurrClientKey] = useState(clientKey);
	const [currContractKey, setCurrContractKey] = useState('');
	const [currUserKey, setCurrUserKey] = useState(userKey);
	const [currApiKey, setCurrApiKey] = useState(apiKey);
	const [currToken, setCurrToken] = useState(token);
	const [notification, setNotification] = useState({});
	const [contractModal, setContractModal] = useState(false);
	const [needUpdate, setNeedUpdate] = useState(false);
	const [refreshContracts, setRefreshContracts] = useState(0);
	const [data, setData] = useState<DataType[]>([]);
	const [eventStatus, setEventStatus] = useState<EventStatus[]>([]);
	const [spinLoad, setSpinLoad] = useState(false);
	const [contractsLoad, setContractsLoad] = useState(false);
	const currentRecord = useRef<DataType>({});
	const { Title, Text } = Typography;
	const items: MenuProps['items'] = [
		{
			label: 'Archive',
			key: Action.ARCHIVE,
		},
		{
			label: 'Convert into template',
			key: Action.CONVERT,
		},
	];

	const chooseContract = (text: string) => {
		setCurrContractKey(text);
		if (isModal) {
			setContractModal(true);
		}
	};
	const dropdownClick: MenuProps['onClick'] = async (e: any) => {
		if (currentRecord.current && currentRecord.current.key) {
			switch (e.key) {
				case Action.ARCHIVE:
					const urlContract: string = BASE_URL + ApiEntity.CONTRACT;
					const bodyContract = {
						data: {
							action: Action.ARCHIVE,
							clientKey: !token ? currClientKey : undefined,
							userKey: currUserKey ? currUserKey : '',
							contract: {
								contractKey: currentRecord.current.key,
							},
						},
					};
					await axios
						.post(urlContract, bodyContract, {
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
				case Action.CONVERT:
					const urlTemplate: string = BASE_URL + ApiEntity.TEMPLATE;
					const bodyTemplate = {
						data: {
							action: Action.CONVERT,
							clientKey: !token ? currClientKey : undefined,
							userKey: currUserKey ? currUserKey : '',
							template: {
								contractKey: currentRecord.current.key,
								name: `New template ${dayjs(new Date().toString()).format(
									'YYYY-MM-DD HH:mm:ss'
								)}`,
							},
						},
					};
					await axios
						.post(urlTemplate, bodyTemplate, {
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
			}
		}
	};
	const columns: TableColumnsType<DataType> = [
		{
			title: 'Document name',
			dataIndex: 'name',
			render: (_: any, record: DataType) => (
				<Button
					type='link'
					onClick={() => {
						// debugger;
						chooseContract(record.key ? record.key : '');
					}}
				>
					{record.name}
				</Button>
			),
		},
		{
			title: 'Status',
			dataIndex: 'status',
			render: (_: any, record: DataType) => {
				let statusFind = eventStatus.find(
					(status) => status.name === record.status
				);
				return (
					<Tag
						color={statusFind && statusFind.color ? statusFind.color : 'purple'}
						key={record.status ? record.status : 'Draft'}
					>
						{record.status ? record.status : 'Draft'}
					</Tag>
				);
			},
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
		setRefreshContracts(refreshContracts + 1);
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
		const getContracts = async () => {
			setContractsLoad(true);
			let eventStatusTmp: EventStatus[] = [];
			// console.log('axios', axios, BASE_URL, ApiEntity.EVENT_STATUS);
			await axios
				.get(BASE_URL + ApiEntity.EVENT_STATUS, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': !currToken && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
						Authorization: currToken ? `Bearer ${currToken}` : undefined,
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					//console.log('getEventStatus read', payload);
					eventStatusTmp = payload.data;
					setEventStatus(eventStatusTmp);
				});
			await axios
				.post(BASE_URL + ApiEntity.CONTRACT, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': !currToken && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
						Authorization: currToken ? `Bearer ${currToken}` : undefined,
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					//console.log('editor list', payload);
					let array: DataType[] = payload.data.contracts.map(
						(contract: any) => {
							return {
								key: contract.contractKey,
								name: contract.name ? contract.name : 'Empty name',
								status: contract.status,
								createdAt: dayjs(
									contract.createTime
										? contract.createTime.toString()
										: new Date().toString()
								).format('YYYY-MM-DD HH:mm:ss'),
							};
						}
					);
					setData(array);
					setContractsLoad(false);
				});
		};
		if (currApiKey || currToken) {
			setSpinLoad(false);
			getContracts();
		} else {
			setSpinLoad(true);
		}
		return () => {
			isMounted = false;
		};
	}, [refreshContracts]);

	// console.log('contractKey 2', currContractKey);
	const toggleButton = (
		<Button
			type='primary'
			onClick={() => {
				chooseContract('');
			}}
		>
			Add document
		</Button>
	);

	return (
		<ContractListContext.Provider
			value={{
				contractModal,
				setContractModal,
				contractKey: currContractKey,
				setContractKey: setCurrContractKey,
				clientKey: currClientKey,
				setClientKey: setCurrClientKey,
				userKey: currUserKey,
				setUserKey: setCurrUserKey,
				token: currToken,
				setToken: setCurrToken,
				refreshContracts,
				setRefreshContracts,
				needUpdate,
				setNeedUpdate,
				apiKey: currApiKey,
				setApiKey: setCurrApiKey,
				notification,
				setNotification,
			}}
		>
			{spinLoad ? (
				<Spin spinning={spinLoad} fullscreen />
			) : (
				<Space direction='vertical' size={16} style={{ display: 'flex' }}>
					<Card style={{ overflow: 'auto' }}>
						<Table
							loading={contractsLoad}
							style={{ minWidth: 600 }}
							columns={columns}
							dataSource={data}
							locale={{
								emptyText: (
									<Empty
										image={Empty.PRESENTED_IMAGE_SIMPLE}
										description="You haven't created any documents yet"
									>
										{toggleButton}
									</Empty>
								),
							}}
							title={() => (
								<Row>
									<Col>
										<Title
											level={3}
											style={{
												margin: '0',
												display: 'flex',
												textAlign: 'center',
											}}
										>
											Documents
										</Title>
									</Col>
									<Col flex={'auto'}></Col>
									<Col>
										<Button
											type='primary'
											icon={<FontAwesomeIcon icon={faPlus} />}
											onClick={() => {
												chooseContract('');
											}}
										>
											Add document
										</Button>
									</Col>
								</Row>
							)}
						/>
					</Card>
				</Space>
			)}
			<ModalView id={currContractKey ? currContractKey : 'New contract'} />
			<Notification />
		</ContractListContext.Provider>
	);
};
