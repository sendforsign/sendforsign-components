import React, { FC, useEffect, useState } from 'react';
import { Typography, Card, Space, Row, Col, Button, Spin } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import { BASE_URL } from '../../config/config';
import { Action, ApiEntity } from '../../config/enum';
import Table, { ColumnsType } from 'antd/es/table';
import useSaveParams from '../../hooks/use-save-params';
import { TemplateListContext } from './template-list-context';
import { ModalView } from './modal-view/modal-view';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

interface DataType {
	key: string;
	name?: string;
	status?: string[];
	createdAt?: string;
	changedAt?: string;
	createdBy?: string;
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
	if (!apiKey && !token && !window.location.href.includes('story')) {
		throw new Error('Missing authority data');
	}
	const { setParam, getParam, clearParams } = useSaveParams();
	const [currTemplateKey, setCurrTemplateKey] = useState('');
	const [currClientKey, setCurrClientKey] = useState(clientKey);
	const [currUserKey, setCurrUserKey] = useState(userKey);
	const [currApiKey, setCurrApiKey] = useState(apiKey);
	const [currToken, setCurrToken] = useState(token);
	const [templateModal, setTemplateModal] = useState(false);
	const [refreshTemplate, setRefreshTemplate] = useState(0);
	const [spinLoad, setSpinLoad] = useState(false);
	const [data, setData] = useState<DataType[]>([]);
	const { Title } = Typography;
	const chooseTemplate = (text: string) => {
		// debugger;
		clearParams();
		setCurrTemplateKey(text);
		setParam('templateKey', text);
		if (isModal) {
			setTemplateModal(true);
			setParam('openModalTemplate', true);
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
		// {
		// 	title: 'Status',
		// 	dataIndex: 'status',
		// 	render: (_: any, record: DataType) => (
		// 		<>
		// 			{record.status?.map((tag) => {
		// 				let color = 'purple';
		// 				if (tag === 'Signed') {
		// 					color = 'green';
		// 				}
		// 				return (
		// 					<Tag color={color} key={tag}>
		// 						{tag}
		// 					</Tag>
		// 				);
		// 			})}
		// 		</>
		// 	),
		// },
		{
			title: 'Created at',
			dataIndex: 'createdAt',
		},
		{
			title: 'Modified at',
			dataIndex: 'changedAt',
		},
		{
			title: 'Created by',
			dataIndex: 'createdBy',
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
				clientKey: clientKey,
				userKey: userKey,
			},
		};
		const getTemplate = async () => {
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
					if (isMounted) {
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
					}
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
		</TemplateListContext.Provider>
	);
};
