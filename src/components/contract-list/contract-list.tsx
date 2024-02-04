import React, { FC, useEffect, useState } from 'react';
import { Typography, Tag, Card, Space, Row, Col, Button } from 'antd';
import { ContractListProps } from './contract-list.types';
import axios from 'axios';
import { BASE_URL } from '../../config/config';
import { Action, ApiEntity } from '../../config/enum';
import Table, { ColumnsType } from 'antd/es/table';
import useSaveParams from '../../hooks/use-save-params';
import { ContractListContext } from './contract-list-context';
import { ModalView } from './modal-view/modal-view';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

interface DataType {
	key: string;
	name?: string;
	status?: string[];
	createdAt?: string;
	createdBy?: string;
}

export const ContractList: FC<ContractListProps> = ({
	clientKey,
	isModal,
	userKey,
}) => {
	const { setParam, getParam } = useSaveParams();
	// if (!process.env.SENDFORSIGN_API_KEY) {
	//  TO DO
	// }
	// dayjs.extend(utc);

	const [currContractKey, setCurrContractKey] = useState('');
	const [currClientKey, setCurrClientKey] = useState(clientKey);
	const [currUserKey, setCurrUserKey] = useState(userKey);
	const [contractModal, setContractModal] = useState(false);
	const [needUpdate, setNeedUpdate] = useState(false);
	const [refreshContracts, setRefreshContracts] = useState(0);
	const [data, setData] = useState<DataType[]>([]);
	const { Title } = Typography;

	const chooseContract = (text: string) => {
		// debugger;
		setCurrContractKey(text);
		setParam('contractKey', text);
		if (isModal) {
			setContractModal(true);
			setParam('openModal', true);
		}
	};
	const columns: ColumnsType<DataType> = [
		{
			title: 'Document name',
			dataIndex: 'name',
			render: (_, { key, name }) => (
				<Button
					type='link'
					onClick={() => {
						chooseContract(key ? key : '');
					}}
				>
					{name}
				</Button>
			),
		},
		{
			title: 'Status',
			dataIndex: 'status',
			render: (_, { status }) => (
				<>
					{status?.map((tag) => {
						let color = 'purple';
						if (tag === 'Signed') {
							color = 'green';
						}
						return (
							<Tag color={color} key={tag}>
								{tag}
							</Tag>
						);
					})}
				</>
			),
		},
		{
			title: 'Created at',
			dataIndex: 'createdAt',
		},
		{
			title: 'Created by',
			dataIndex: 'createdBy',
		},
	];

	useEffect(() => {
		let body = {
			data: {
				action: Action.LIST,
				clientKey: clientKey,
				userKey: userKey,
			},
		};
		const getContracts = async () => {
			await axios
				.post(BASE_URL + ApiEntity.CONTRACT, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': 're_api_key', //process.env.SENDFORSIGN_API_KEY,
					},
					responseType: 'json',
				})
				.then((payload) => {
					console.log('editor list', payload);
					let array: DataType[] = payload.data.contracts.map(
						(contract: any) => {
							return {
								key: contract.contractKey,
								name: contract.name ? contract.name : 'Empty name',
								status: ['Draft'],
								createdAt: contract.createTime
									? contract.createTime.toString()
									: new Date().toString(),
							};
						}
					);
					setData(array);
				});
		};
		getContracts();
	}, [refreshContracts]);

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
			}}
		>
			<Space direction='vertical' size={16} style={{ display: 'flex' }}>
				<Card>
					<Table
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
			<ModalView
				id={currContractKey ? currContractKey : 'New contract'}
				isOpen={contractModal}
				clientKey={clientKey}
				userKey={userKey}
				contractKey={currContractKey}
			/>
		</ContractListContext.Provider>
	);
};
