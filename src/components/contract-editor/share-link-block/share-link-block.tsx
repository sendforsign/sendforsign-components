import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Tooltip, Card, Space } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ApiEntity } from '../../../config/enum';
import { useContractEditorContext } from '../contract-editor-context';
import axios from 'axios';
import { BASE_URL } from '../../../config/config';
import {
	faDownload,
	faHatWizard,
	faObjectUngroup,
	faPaperPlane,
	faSignature,
	faStamp,
} from '@fortawesome/free-solid-svg-icons';
import useSaveArrayBuffer from '../../../hooks/use-save-array-buffer';

export const ShareLinkBlock = () => {
	const {
		apiKey,
		token,
		contractKey,
		clientKey,
		userKey,
		continueLoad,
		setSignModal,
		setSendModal,
		setApproveModal,
		refreshShareLink,
		setRefreshShareLink,
		setContractValue,
		refreshRecipients,
		setRefreshRecipients,
		refreshPlaceholders,
		setRefreshPlaceholders,
		setNotification,
		signCount,
		refreshSign,
		setRefreshSign,
		placeholderVisible,
		setPlaceholderVisible,
		AiVisible,
		setAiVisible,
		setIpInfo,
		contractName,
	} = useContractEditorContext();
	dayjs.extend(utc);

	const [shareLinks, setShareLinks] = useState([]);
	const [addBtnSpin, setAddBtnSpin] = useState(false);
	const [sendSpin, setSendSpin] = useState(false);
	const [signSpin, setSignSpin] = useState(false);
	const [approveSpin, setApproveSpin] = useState(false);
	const [downloadPdfSpin, setDownloadPdfSpin] = useState(false);

	useEffect(() => {
		setShareLinks([]);
	}, []);
	useEffect(() => {
		let isMounted = true;
		// console.log('contractKey 7');
		if (contractKey) {
			const getShareLinks = async () => {
				let url = `${BASE_URL}${ApiEntity.CONTRACT_SHARE_LINK}?contractKey=${contractKey}&clientKey=${clientKey}`;
				await axios
					.get(url, {
						headers: {
							Accept: 'application/vnd.api+json',
							'Content-Type': 'application/vnd.api+json',
							'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
							Authorization: token ? `Bearer ${token}` : undefined,
						},
						responseType: 'json',
					})
					.then((payload: any) => {
						setShareLinks(payload.data);
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
			getShareLinks();
		}
		return () => {
			isMounted = false;
		};
	}, [contractKey, refreshShareLink]);
	const getSignIPInfo = async () => {
		await axios
			.get('https://ipapi.co/json', {
				responseType: 'json',
			})
			.then((payload: any) => {
				setIpInfo(JSON.stringify(payload.data));
			});
	};
	const handleAddShareLink = async () => {
		setAddBtnSpin(true);
		const body = {
			clientKey: !token ? clientKey : undefined,
			contractKey: contractKey,
		};
		await axios
			.post(BASE_URL + ApiEntity.CONTRACT_SHARE_LINK, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
					Authorization: token ? `Bearer ${token}` : undefined,
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				//console.log('handleAddShareLink read', payload);
				setRefreshShareLink(refreshShareLink + 1);
				setAddBtnSpin(false);
			})
			.catch((error) => {
				setNotification({
					text:
						error.response && error.response.data && error.response.data.message
							? error.response.data.message
							: error.message,
				});
			});
	};
	const checkChangeContract = async () => {
		let changed = false;
		let body = {
			clientKey: !token ? clientKey : undefined,
			userKey: userKey,
			contractKey: contractKey,
			signCount: signCount,
		};
		await axios
			.post(BASE_URL + ApiEntity.CHECK_CONTRACT_VALUE, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
					Authorization: token ? `Bearer ${token}` : undefined,
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				//console.log('CHECK_CONTRACT_VALUE read', payload);
				if (payload.data.changed && payload.data.contractValue) {
					changed = payload.data.changed;
					setContractValue(payload.data.contractValue);
					setRefreshSign(refreshSign + 1);
				}
			})
			.catch((error) => {
				setNotification({
					text:
						error.response && error.response.data && error.response.data.message
							? error.response.data.message
							: error.message,
				});
			});
		return changed;
	};
	const handleSendClick = async () => {
		setSendSpin(true);
		const changed = await checkChangeContract();
		if (changed) {
			setNotification({
				text: 'Contract updated. You must check document again.',
			});
		} else {
			setRefreshRecipients(refreshRecipients + 1);
			setSendModal(true);
		}
		setSendSpin(false);
	};
	const handleSignClick = async () => {
		getSignIPInfo();
		setSignSpin(true);
		const changed = await checkChangeContract();
		if (changed) {
			setNotification({
				text: 'Contract updated. You must check document again.',
			});
		} else {
			setSignModal(true);
		}
		setSignSpin(false);
	};
	const handleApproveClick = async () => {
		setApproveSpin(true);
		const changed = await checkChangeContract();
		if (changed) {
			setNotification({
				text: 'Contract updated. You must check document again.',
			});
		} else {
			setApproveModal(true);
		}
		setApproveSpin(false);
	};
	const handleDownloadClick = async () => {
		setDownloadPdfSpin(true);
		// if (contractType.toString() !== ContractType.PDF.toString()) {
		let url = `${BASE_URL}${ApiEntity.DOWNLOAD_PDF}?contractKey=${contractKey}&clientKey=${clientKey}`;

		await axios
			.get(url, {
				headers: {
					'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
					Authorization: token ? `Bearer ${token}` : undefined,
				},
				responseType: 'blob',
			})
			.then((payload) => {
				const encodedUri = window.URL.createObjectURL(payload.data as Blob);
				const link = document.createElement('a');

				link.setAttribute('href', encodedUri);
				link.setAttribute('download', `${contractName}.pdf`);

				link.click();
				setDownloadPdfSpin(false);
			})
			.catch((error) => {
				setNotification({
					text:
						error.response && error.response.data && error.response.data.message
							? error.response.data.message
							: error.message,
				});
			});
	};
	return (
		<Space direction='vertical' size={16} style={{ display: 'flex' }}>
			<Card
				loading={continueLoad}
				style={{
					backdropFilter: 'blur(5px)',
					background: 'rgba(255, 255, 255, 0.8)',
				}}
			>
				<Space
					direction='vertical'
					size={16}
					style={{ display: 'flex' }}
					align='center'
				>
					<Space wrap>
						<Tooltip title='Share the document with recipients.'>
							<div>
								<Button
									id='SendContract'
									type='primary'
									icon={<FontAwesomeIcon icon={faPaperPlane} />}
									onClick={handleSendClick}
									// disabled={signDisable}
									loading={sendSpin}
								>
									Recipients
								</Button>
							</div>
						</Tooltip>
						<Tooltip title='Sign the document from your side.'>
							<div>
								<Button
									id='SignContract'
									type='default'
									icon={<FontAwesomeIcon icon={faSignature} />}
									onClick={handleSignClick}
									loading={signSpin}
								>
									Sign
								</Button>
							</div>
						</Tooltip>
						<Tooltip title='Approve the document from your side.'>
							<div>
								<Button
									id='ApproveContract'
									type='default'
									icon={<FontAwesomeIcon icon={faStamp} />}
									onClick={handleApproveClick}
									loading={approveSpin}
								>
									Approve
								</Button>
							</div>
						</Tooltip>
						<Tooltip title='Manage reusable fields.'>
							<div>
								<Button
									id='ManagePlaceholder'
									type='default'
									icon={<FontAwesomeIcon icon={faObjectUngroup} />}
									onClick={() => {
										setRefreshPlaceholders(refreshPlaceholders + 1);
										setPlaceholderVisible(!placeholderVisible);
										setAiVisible(false);
									}}
									style={{
										backgroundColor: placeholderVisible ? '#e6f7ff' : 'inherit', // Highlight when visible
									}}
								>
									Placeholders
								</Button>
							</div>
						</Tooltip>
						{/* <Tooltip title='Ask AI assistant.'>
							<div>
								<Button
									id='AskAI'
									type='default'
									icon={<FontAwesomeIcon icon={faHatWizard} />}
									onClick={() => {
										setAiVisible(!AiVisible);
										setPlaceholderVisible(false);
									}}
									style={{
										backgroundColor: AiVisible ? '#e6f7ff' : 'inherit', // Highlight when visible
									}}
								>
									AI Assistant
								</Button>
							</div>
						</Tooltip> */}
						<Tooltip title='Download PDF.'>
							<div>
								<Button
									id='DownloadPdf'
									type='default'
									loading={downloadPdfSpin}
									icon={<FontAwesomeIcon icon={faDownload} />}
									onClick={handleDownloadClick}
								>
									Download PDF
								</Button>
							</div>
						</Tooltip>
					</Space>
				</Space>
			</Card>
		</Space>
	);
};
