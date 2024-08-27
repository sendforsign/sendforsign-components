import React, { useEffect } from 'react';
import { notification as notificationAntd } from 'antd';
import { useContractListContext } from '../contract-list-context';

export const Notification = () => {
	const { notification, setNotification } = useContractListContext();
	const [api, contextHolder] = notificationAntd.useNotification();

	useEffect(() => {
		if (notification && notification.text) {
			const key = `open${Date.now()}`;

			api.open({
				message: 'Sendforsign assistant',
				description: notification.text,
				placement: 'bottomRight', 
				key,
			});
			setNotification({ text: '' });
		}
	}, [notification]);

	return <>{contextHolder}</>;
};
