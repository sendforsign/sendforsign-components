import React, { FC, useEffect, useState } from 'react';
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
} from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import { BASE_URL } from '../../config/config';
import { Action, ApiEntity } from '../../config/enum';
import Table from 'antd/es/table';
import useSaveParams from '../../hooks/use-save-params';
import { ContractListContext } from './contract-list-context';
import { ModalView } from './modal-view/modal-view';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { EventStatus } from '../../config/types';

interface DataType {
	key: string;
	name?: string;
	status?: string;
	createdAt?: string;
	createdBy?: string;
}
export interface ContractListProps {
	apiKey?: string;
	clientKey?: string;
	userKey?: string;
	isModal?: boolean;
}

export const ContractList: FC<ContractListProps> = ({
	apiKey,
	clientKey,
	isModal = true,
	userKey,
}) => {
	if (
		!apiKey &&
		!process.env.REACT_APP_SENDFORSIGN_KEY &&
		!window.location.href.includes('story')
	) {
		throw new Error('Missing Publishable Key');
	}
	const { setParam, getParam, clearParams } = useSaveParams();
	const [currContractKey, setCurrContractKey] = useState('');
	const [currClientKey, setCurrClientKey] = useState(clientKey);
	const [currUserKey, setCurrUserKey] = useState(userKey);
	const [currApiKey, setCurrApiKey] = useState(apiKey);
	const [contractModal, setContractModal] = useState(false);
	const [needUpdate, setNeedUpdate] = useState(false);
	const [refreshContracts, setRefreshContracts] = useState(0);
	const [data, setData] = useState<DataType[]>([]);
	const [eventStatus, setEventStatus] = useState<EventStatus[]>([]);
	const [spinLoad, setSpinLoad] = useState(false);
	const { Title } = Typography;

	const chooseContract = (text: string) => {
		// debugger;
		clearParams();
		setCurrContractKey(text);
		setParam('contractKey', text);
		// console.log('contractKey 1', text);
		if (isModal) {
			setContractModal(true);
			setParam('openModal', true);
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
			title: 'Created at',
			dataIndex: 'createdAt',
		},
		// {
		// 	title: 'Created by',
		// 	dataIndex: 'createdBy',
		// },
	];
	useEffect(() => {
		setCurrApiKey(apiKey ? apiKey : process.env.REACT_APP_SENDFORSIGN_KEY);
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
				clientKey: clientKey,
				userKey: userKey,
			},
		};
		const getContracts = async () => {
			let eventStatusTmp: EventStatus[] = [];
			await axios
				.get(BASE_URL + ApiEntity.EVENT_STATUS, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': apiKey, //process.env.SENDFORSIGN_API_KEY,
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					//console.log('getEventStatus read', payload);
					if (isMounted) {
						eventStatusTmp = payload.data;
						setEventStatus(eventStatusTmp);
					}
				});
			await axios
				.post(BASE_URL + ApiEntity.CONTRACT, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': apiKey, //process.env.SENDFORSIGN_API_KEY,
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					//console.log('editor list', payload);
					if (isMounted) {
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
					}
				});
		};
		if (currApiKey) {
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
				refreshContracts,
				setRefreshContracts,
				needUpdate,
				setNeedUpdate,
				apiKey: currApiKey,
				setApiKey: setCurrApiKey,
			}}
		>
			{spinLoad ? (
				<Spin spinning={spinLoad} fullscreen />
			) : (
				<Space direction='vertical' size={16} style={{ display: 'flex' }}>
					<Card style={{ overflow: 'auto' }}>
						<Table
							style={{ minWidth: 600 }}
							columns={columns}
							dataSource={data}
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
		</ContractListContext.Provider>
	);
};
