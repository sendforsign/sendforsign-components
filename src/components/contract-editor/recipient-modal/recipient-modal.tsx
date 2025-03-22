import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal } from 'antd';
import { useContractEditorContext } from '../contract-editor-context';
import {
	Action,
	ApiEntity,
	ContractAction,
	PlaceholderColor,
	RecipientType,
	ShareLinkViewText,
} from '../../../config/enum';
import axios from 'axios';
import { BASE_URL } from '../../../config/config';
import { Recipient } from '../../../config/types';
import { RecipientContent } from './recipient-content';

export const RecipientModal = () => {
	const {
		apiKey,
		token,
		sendModal,
		setSendModal,
		contractKey,
		clientKey,
		userKey,
		placeholder,
		isPdf,
		refreshEvent,
		setRefreshPlaceholders,
		refreshPlaceholders,
		refreshRecipients,
		setRefreshEvent,
		setResultModal,
		setNotification,
		setRefreshPagePlaceholders,
	} = useContractEditorContext();
	const [sendLoad, setSendLoad] = useState(false);
	const [saveLoad, setSaveLoad] = useState(false);
	const [insertRecipient, setInsertRecipient] = useState<Recipient[]>([]);
	const [updateRecipient, setUpdateRecipient] = useState<Recipient[]>([]);
	const [deleteRecipient, setDeleteRecipient] = useState<Recipient[]>([]);
	const [recipients, setRecipients] = useState<Recipient[]>([]);
	const [id, setId] = useState(0);
	const [recipientInit, setRecipientInit] = useState(false);
	const [load, setLoad] = useState(false);
	const isSave = useRef(false);

	useEffect(() => {
		let isMounted = true;
		if (contractKey && sendModal) {
			setLoad(true);
			const getRecipients = async () => {
				setUpdateRecipient([]);
				setDeleteRecipient([]);
				setInsertRecipient([]);

				let body = {
					data: {
						action: Action.LIST,
						clientKey: !token ? clientKey : undefined,
						userKey: userKey,
						contractKey: contractKey,
						getShareLinks: true,
					},
				};
				await axios
					.post(BASE_URL + ApiEntity.RECIPIENT, body, {
						headers: {
							Accept: 'application/vnd.api+json',
							'Content-Type': 'application/vnd.api+json',
							'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
							Authorization: token ? `Bearer ${token}` : undefined,
						},
						responseType: 'json',
					})
					.then((payload: any) => {
						//console.log('getRecipients read', payload);
						if (payload.data.recipients && payload.data.recipients.length > 0) {
							setRecipientInit(false);
							setRecipients(
								payload.data.recipients.map((recipient: Recipient) => {
									return {
										id: recipient.id,
										fullname: recipient.fullname,
										email: recipient.email,
										customMessage: recipient.customMessage,
										position: recipient.position,
										action: recipient.action,
										recipientKey: recipient.recipientKey,
										shareLink: recipient.shareLink,
										isDone: recipient.isDone,
										type: recipient.type,
									};
								})
							);
							let idArr = payload.data.recipients.map(
								(recipient: Recipient) => {
									return parseInt(
										recipient.id ? recipient.id?.toString() : '0',
										10
									);
								}
							);
							let idTmp = Math.max(...idArr);
							setId(idTmp);
							// setDataLoad(false);
						} else {
							setRecipientInit(true);
							setId(0);
							setRecipients([
								{
									id: 0,
									fullname: '',
									email: '',
									customMessage: '',
									position: 1,
									action: ShareLinkViewText.SIGN,
									recipientKey: '',
								},
							]);
							// setDataLoad(false);
						}
						setLoad(false);
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
			};
			getRecipients();
		}
		return () => {
			isMounted = false;
		};
	}, [sendModal]);

	const handleSend = async () => {
		if (
			recipients &&
			recipients.length > 0 &&
			recipients[0].fullname &&
			recipients[0].email
		) {
			setSendLoad(true);
			const body = {
				data: {
					action: Action.SEND,
					clientKey: !token ? clientKey : undefined,
					userKey: userKey,
					contractKey: contractKey,
					recipients: recipients,
				},
			};
			await axios
				.post(BASE_URL + ApiEntity.RECIPIENT, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
						Authorization: token ? `Bearer ${token}` : undefined,
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					isSave.current = true;
					setSendLoad(false);
					handleCancel();
					if (payload.data.result) {
						setResultModal({ open: true, action: ContractAction.SEND });
						setRefreshEvent(refreshEvent + 1);
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
		}
	};

	const handleChange = (e: any, index: number) => {
		let recipientsTmp = [...recipients];
		switch (e.target.id) {
			case 'FullName':
				recipientsTmp[index].fullname = e.target.value;
				break;
			case 'Email':
				recipientsTmp[index].email = e.target.value;
				break;
			case 'CustomMessage':
				recipientsTmp[index].customMessage = e.target.value;
				break;
			case 'TypeSwitch':
				recipientsTmp[index].type = e.target.value
					? RecipientType.INTERNAL
					: RecipientType.EXTERNAL;
				break;
		}
		setRecipients(recipientsTmp);
		if (
			!updateRecipient.find(
				(recipient) => recipient.id === recipientsTmp[index].id
			) &&
			recipientsTmp[index].recipientKey
		) {
			updateRecipient.push(recipientsTmp[index]);
			setUpdateRecipient(updateRecipient);
		}
	};
	const handleClick = (e: any, index: number) => {
		let recipientsTmp = [...recipients];
		recipientsTmp[index].action = e;
		setRecipients(recipientsTmp);
		if (recipientsTmp[index].recipientKey) {
			if (
				!updateRecipient.find(
					(recipient) => recipient.id === recipientsTmp[index].id
				) &&
				recipientsTmp[index].recipientKey
			) {
				updateRecipient.push(recipientsTmp[index]);
				setUpdateRecipient(updateRecipient);
			}
		}
	};

	const handleSaveAndClose = async () => {
		if (updateRecipient.length > 0) {
			for (let index = 0; index < updateRecipient.length; index++) {
				const recipientFind = recipients.find(
					(recipient) => recipient.id === updateRecipient[index].id
				);
				if (recipientFind) {
					setSaveLoad(true);
					const body = {
						data: {
							action: Action.UPDATE,
							clientKey: !token ? clientKey : undefined,
							userKey: userKey,
							contractKey: contractKey,
							recipient: {
								recipientKey: recipientFind.recipientKey,
								fullname: recipientFind.fullname,
								email: recipientFind.email,
								customMessage: recipientFind.customMessage,
								action: recipientFind.action,
								position: recipientFind.position,
								type: recipientFind.type,
							},
						},
					};
					await axios
						.post(BASE_URL + ApiEntity.RECIPIENT, body, {
							headers: {
								Accept: 'application/vnd.api+json',
								'Content-Type': 'application/vnd.api+json',
								'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
								Authorization: token ? `Bearer ${token}` : undefined,
							},
							responseType: 'json',
						})
						.then((payload: any) => {})
						.catch((error) => {
							isSave.current = true;
							setNotification({
								text:
									error.response &&
									error.response.data &&
									error.response.data.message
										? error.response.data.message
										: error.message,
							});
						});
				}
			}
		}
		if (deleteRecipient.length > 0) {
			setSaveLoad(true);
			let refreshPage: string[] = [];
			for (let index = 0; index < deleteRecipient.length; index++) {
				const body = {
					data: {
						action: Action.DELETE,
						clientKey: !token ? clientKey : undefined,
						userKey: userKey,
						contractKey: contractKey,
						recipient: {
							recipientKey: deleteRecipient[index].recipientKey,
						},
					},
				};
				await axios
					.post(BASE_URL + ApiEntity.RECIPIENT, body, {
						headers: {
							Accept: 'application/vnd.api+json',
							'Content-Type': 'application/vnd.api+json',
							'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
							Authorization: token ? `Bearer ${token}` : undefined,
						},
						responseType: 'json',
					})
					.then((payload: any) => {
						isSave.current = true;
						if (!isPdf) {
							removeClasses(deleteRecipient[index].recipientKey as string);
						}
						refreshPage.push(deleteRecipient[index].recipientKey as string);
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
			}
			if (refreshPage.length > 0) {
				setRefreshPagePlaceholders(refreshPage);
			}
		}
		if (insertRecipient.length > 0) {
			let insertTmp: Recipient[] = [];
			if (recipients[0] && !recipients[0].recipientKey) {
				insertTmp.push({
					id: recipients[0].id,
					fullname: recipients[0].fullname,
					email: recipients[0].email,
					customMessage: recipients[0].customMessage,
					position: recipients[0].position,
					action: recipients[0].action,
					type: recipients[0].type,
					recipientKey: '',
				});
			}
			for (let index = 0; index < insertRecipient.length; index++) {
				const recipientFind = recipients.find(
					(recipient) => recipient.id === insertRecipient[index].id
				);
				if (recipientFind) {
					insertTmp.push(recipientFind);
				}
			}
			if (insertTmp.length > 0) {
				setSaveLoad(true);
				const body = {
					data: {
						action: Action.CREATE,
						clientKey: !token ? clientKey : undefined,
						userKey: userKey,
						contractKey: contractKey,
						recipients: insertTmp,
					},
				};
				await axios
					.post(BASE_URL + ApiEntity.RECIPIENT, body, {
						headers: {
							Accept: 'application/vnd.api+json',
							'Content-Type': 'application/vnd.api+json',
							'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
							Authorization: token ? `Bearer ${token}` : undefined,
						},
						responseType: 'json',
					})
					.then((payload: any) => {
						isSave.current = true;
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
			}
		}
		if (
			recipients.length === 1 &&
			recipientInit &&
			updateRecipient.length === 0 &&
			deleteRecipient.length === 0 &&
			insertRecipient.length === 0
		) {
			setSaveLoad(true);
			const body = {
				data: {
					action: Action.CREATE,
					clientKey: !token ? clientKey : undefined,
					userKey: userKey,
					contractKey: contractKey,
					recipients: [
						{
							id: recipients[0].id,
							fullname: recipients[0].fullname,
							email: recipients[0].email,
							customMessage: recipients[0].customMessage,
							position: recipients[0].position,
							type: recipients[0].type,
							action: recipients[0].action,
							recipientKey: '',
						},
					],
				},
			};
			await axios
				.post(BASE_URL + ApiEntity.RECIPIENT, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
						'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
						Authorization: token ? `Bearer ${token}` : undefined,
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					isSave.current = true;
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
		}
		handleCancel();
	};
	const handleDelete = (index: number) => {
		let recipientsTmp = [...recipients];
		if (recipientsTmp[index].recipientKey) {
			deleteRecipient.push(recipients[index]);
			setDeleteRecipient(deleteRecipient);
		}

		recipientsTmp.splice(index, 1);
		setRecipients(recipientsTmp);
	};
	const handleInsert = () => {
		// debugger;
		let recipientsTmp = [...recipients];
		let idTmp = id + 1;
		setId(idTmp);
		recipientsTmp.push({
			id: idTmp,
			position: 1,
			action: ShareLinkViewText.SIGN,
			recipientKey: '',
			fullname: '',
			email: '',
			customMessage: '',
		});
		setRecipients(recipientsTmp);
		insertRecipient.push({
			id: idTmp,
			position: 1,
			action: ShareLinkViewText.SIGN,
			recipientKey: '',
			fullname: '',
			email: '',
			customMessage: '',
		});
		setInsertRecipient(insertRecipient);
	};

	const removeClasses = (recipientKey: string) => {
		const placeholderFilter = placeholder.filter(
			(holder) => holder.externalRecipientKey === recipientKey
		);
		if (placeholderFilter) {
			for (let i = 0; i < placeholderFilter.length; i++) {
				const elements = document.getElementsByTagName(
					`placeholder${placeholderFilter[i].id}`
				);
				for (let i = 0; i < elements.length; i++) {
					let element: any = elements[i];
					element.style.background = PlaceholderColor.OTHER;
				}
			}
		}
	};
	const handleCancel = () => {
		setSaveLoad(false);
		setRecipients([]);
		if (isSave.current) {
			setRefreshPlaceholders(refreshPlaceholders + 1);
			isSave.current = false;
		}
		setSendModal(false);
	};
	return (
		<Modal
			key={`SendModal${contractKey}`}
			title='Send this document'
			open={sendModal}
			centered
			onCancel={handleCancel}
			footer={
				<>
					<Button key='cancel' onClick={handleCancel}>
						Cancel
					</Button>
					<Button
						loading={saveLoad}
						key='saveAndClose'
						onClick={handleSaveAndClose}
					>
						Save & Close
					</Button>
					<Button
						key='submit'
						type='primary'
						loading={sendLoad}
						onClick={handleSend}
						disabled={
							recipients &&
							recipients.length > 0 &&
							recipients[0].fullname &&
							recipients[0].email
								? false
								: true
						}
					>
						{`Send to ${recipients.length} recipient${
							recipients.length === 1 ? '' : 's'
						}`}
					</Button>
				</>
			}
		>
			<RecipientContent
				isModal={true}
				load={load}
				handleChangeLoad={(type: string) => {
					switch (type) {
						case 'send':
							setSendLoad(false);
							break;
						default:
							break;
					}
				}}
				handleCancel={handleCancel}
				handleClick={handleClick}
				handleChange={handleChange}
				handleDelete={handleDelete}
				handleInsert={handleInsert}
				recipients={recipients}
			/>
		</Modal>
	);
};
