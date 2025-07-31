import React, { useEffect } from 'react';
import { notification as notificationAntd } from 'antd';
import { useRecipientViewContext } from '../recipient-view-context';

export const Notification = () => {
	const { notification, setNotification } = useRecipientViewContext();
	const [api, contextHolder] = notificationAntd.useNotification();

	useEffect(() => {
		if (notification && notification.text) {
			const key = `open${Date.now()}`;

			api.open({
				message: 'Sendforsign assistant',
				description: notification.text,
				placement: 'bottomRight',
				// btn: btn,
				// onClose: closeNotification,
				key,
			});
			setNotification({ text: '' });
		}
	}, [notification]);

	return <>{contextHolder}</>;
};
