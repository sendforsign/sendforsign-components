import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
// import './editor.css';
// import { useDebouncedCallback } from 'use-debounce';
// import dayjs from 'dayjs';
// import utc from 'dayjs/plugin/utc';
// import {
// 	contractSelector,
// 	contractSignSelector,
// 	contractValueSelector,
// 	createContractSelector,
// 	setContractSign,
// 	setContractValue,
// 	setNotification,
// 	setSign,
// 	signSelector,
// } from 'slices/app-slice';
import {
	Space,
	Card,
	Typography,
	Tag,
	Layout,
	Image,
	Menu,
	Row,
	Col,
	Button,
} from 'antd';
import { ListProps } from './list.types';
import axios from 'axios';
import { BASE_URL } from '../../config/config';
import { Action, ApiEntity } from '../../config/enum';
import Table, { ColumnsType } from 'antd/es/table';
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';
// import { ModalView } from '../modal-view';
import useSaveParams from '../../hooks/use-save-params';
import { ModalView } from '../modal-view';
// import ModalView from '../modal-view';
// import { ModalView } from './modal-view/modal-view';

// import { ContractValue, TimelineItems } from 'config/types';
// import {
// 	useCheckContractValueMutation,
// 	useSaveContractValueMutation,
// } from 'slices/contract-api-slice';
// import { useGetContractSignsByControlLinkQuery } from 'slices/contract-sign-api-slice';
// import { useSendEmailsSignByControlLinkMutation } from 'slices/contract-email-api-slice';
// import { useHistory } from 'react-router-dom';
// import { useAuth } from '@clerk/clerk-react';

interface DataType {
	key?: React.Key;
	name?: string;
	status?: string[];
	created?: string;
	cost?: string;
}

export const List: FC<ListProps> = ({ clientKey, isModal, userKey }) => {
	const { setParam, getParam } = useSaveParams();
	// if (!process.env.SENDFORSIGN_API_KEY) {
	//  TO DO
	// }
	// dayjs.extend(utc);
	// const dispatch = useDispatch();
	// const history = useHistory();
	// const contract = useSelector(contractSelector);
	// const contractValue = useSelector(contractValueSelector);
	// const sign = useSelector(signSelector);
	// const contractSign = useSelector(contractSignSelector);
	// const createContract = useSelector(createContractSelector);
	// const templateLoading = useSelector(loadingSelector);
	// const templateText = useSelector(templateTextSelector);
	// const textState = useSelector(textSelector);
	// const [spinLoad, setSpinLoad] = useState(true);
	const openModalRef = useRef(false);
	const [openModal, setOpenModal] = useState(false);
	const [data, setData] = useState<DataType[]>([]);
	const { Title } = Typography;
	// const [openModal, setOpenModal] = useReducer(appReducer, initialState);

	// const { isLoaded, userId, sessionId, getToken } = useAuth();

	// const [saveValue] = useSaveContractValueMutation();
	// const [checkContractValue] = useCheckContractValueMutation();
	// const [sendEmail] = useSendEmailsSignByControlLinkMutation();

	// const { data: contractSignsData } = useGetContractSignsByControlLinkQuery(
	// 	{ controlLink: contract.controlLink, userId: userId },
	// 	{ skip: contract.controlLink ? false : true }
	// );
	const chooseContract = (text: string) => {
		setParam('contractKey', text);
		if (isModal) {
			setOpenModal(true);
			// openModalRef.current = true;
			setParam('openModal', true);
		}
	};
	const columns: ColumnsType<DataType> = [
		{
			title: 'Document name',
			dataIndex: 'name',
			render: (text: string) => (
				<Button
					type='link'
					onClick={() => {
						chooseContract(text);
					}}
				>
					{text}
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
			dataIndex: 'created',
		},
		{
			title: 'Cost for you',
			dataIndex: 'cost',
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
		const getContract = async () => {
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
						(contract: any, index: number) => {
							return {
								key: index.toString(),
								name: contract.contractKey,
								status: ['Draft'],
								created: contract.createTime
									? contract.createTime.toString()
									: new Date().toString(),
							};
						}
					);
					setData(array);
					// setValue(payload.data.contract.value);
				});
		};
		getContract();
	}, []);
	useEffect(() => {
		if (!getParam('openModal')) {
			setOpenModal(false);
		}
	}, [getParam('openModal')]);
	return (
		<>
			<Layout>
				{/* <Sider
				style={{
					overflow: 'auto',
					height: '100vh',
					position: 'fixed',
					// background: colorBgContainer,
					left: 0,
					top: 0,
					bottom: 0,
				}}
			>
				<Image
					style={{ margin: '24px' }}
					width={140}
					preview={false}
					src='https://mintlify.s3-us-west-1.amazonaws.com/sendforsign/logo/dark.svg'
				/>
				<Menu
					mode='inline'
					defaultSelectedKeys={['1']}
					items={items}
					onClick={handleMenuClick}
				/>
			</Sider> */}
				{/* <Layout style={{ marginLeft: 200 }}> */}
				{/* <HeaderMenu /> */}
				<Content style={{ margin: '0px 32px', overflow: 'initial' }}>
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
										// icon={<FontAwesomeIcon icon={faPlus} />}
										onClick={() => {
											// history.push('/');
										}}
									>
										Add document
									</Button>
								</Col>
							</Row>
						)}
					/>
				</Content>
				{/* </Layout> */}
			</Layout>
			<ModalView key={getParam('contractKey')} isOpen={openModal} />
		</>
	);
};
