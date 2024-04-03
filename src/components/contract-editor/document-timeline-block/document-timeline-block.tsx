import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
	Space,
	Card,
	Typography,
	Tag,
	Timeline,
	Row,
	Col,
	TimelineItemProps,
} from 'antd';
import { useContractEditorContext } from '../contract-editor-context';
import axios from 'axios';
import { ApiEntity } from '../../../config/enum';
import { BASE_URL } from '../../../config/config';
import { EventStatus } from '../../../config/types';

export const DocumentTimilineBlock = () => {
	const {
		apiKey,
		contractKey,
		clientKey,
		refreshEvent,
		continueLoad,
		setContractEvents,
	} = useContractEditorContext();
	const [timelines, setTimelines] = useState<TimelineItemProps[]>([]);
	const { Title, Text } = Typography;

	useEffect(() => {
		let isMounted = true;
		const getContractEvents = async () => {
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
					}
				});
			const url = `${BASE_URL}${ApiEntity.CONTRACT_EVENT}?contractKey=${contractKey}&clientKey=${clientKey}`;
			await axios
				.get(url, {
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
						setContractEvents(payload.data);
						const timelinesTmp: TimelineItemProps[] = payload.data.map(
							(contractEventData: {
								status: { toString: () => string | undefined };
								createTime:
									| string
									| number
									| Date
									| dayjs.Dayjs
									| null
									| undefined;
								email:
									| string
									| number
									| boolean
									| React.ReactElement<
											any,
											string | React.JSXElementConstructor<any>
									  >
									| Iterable<React.ReactNode>
									| React.ReactPortal
									| null
									| undefined;
								name:
									| string
									| number
									| boolean
									| React.ReactElement<
											any,
											string | React.JSXElementConstructor<any>
									  >
									| Iterable<React.ReactNode>
									| React.ReactPortal
									| null
									| undefined;
							}) => {
								const statusFind = eventStatusTmp.find(
									(eventStatus) =>
										eventStatus?.id?.toString() ===
										contractEventData.status.toString()
								);
								return {
									color: 'gray',
									label: (
										<>
											<Text type='secondary'>
												{dayjs(contractEventData.createTime).format(
													'YYYY-MM-DD HH:mm:ss'
												)}
											</Text>
										</>
									),
									children: (
										<>
											<Space direction='vertical' size={16}>
												<Tag color={statusFind?.color}>{statusFind?.name}</Tag>
												{contractEventData.email && (
													<Space direction='vertical' wrap>
														{contractEventData.email && (
															<Space direction='horizontal'>
																<Text type='secondary'>Email</Text>
																<Tag bordered={false}>
																	{contractEventData.email}
																</Tag>
															</Space>
														)}
														{contractEventData.name && (
															<Space direction='horizontal'>
																<Text type='secondary'>Name</Text>
																<Tag bordered={false}>
																	{contractEventData.name}
																</Tag>
															</Space>
														)}
													</Space>
												)}
											</Space>
										</>
									),
								};
							}
						);
						setTimelines(timelinesTmp);
					}
				});
		};
		if (apiKey) {
			getContractEvents();
		}
		return () => {
			isMounted = false;
		};
	}, [refreshEvent]);
	return (
		<Space direction='vertical' size={16} style={{ display: 'flex' }}>
			<Card loading={continueLoad}>
				<Space direction='vertical' size={16} style={{ display: 'flex' }}>
					<Space direction='vertical' size={2} style={{ maxWidth: '600px' }}>
						<Title level={4} style={{ margin: '0 0 0 0' }}>
							Timeline{' '}
						</Title>
						<Text type='secondary'>
							See what's happening with your document.
						</Text>
					</Space>
					<Row>
						<Col flex={'auto'}></Col>
						<Col span='24' style={{ maxWidth: '450px' }}>
							<Timeline
								style={{ marginTop: '24px' }}
								mode='left'
								items={timelines}
							/>
						</Col>
						<Col flex={'auto'}></Col>
					</Row>
				</Space>
			</Card>
		</Space>
	);
};
