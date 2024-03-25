import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Tooltip, Card, Space, Typography, FloatButton } from 'antd';
import { ApiEntity, ShareLinkView } from '../../../config/enum';
import { useContractEditorContext } from '../contract-editor-context';
import axios from 'axios';
import { BASE_URL } from '../../../config/config';
import {
	faObjectUngroup,
	faPaperPlane,
	faPlane,
	faSignature,
	faSquarePlus,
	faStamp,
} from '@fortawesome/free-solid-svg-icons';
import { ShareLinkLine } from '../share-link-line/share-link-line';
import { ContractShareLink } from '../../../config/types';

export const ShareLinkBlock = () => {
	const {
		apiKey,
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
		setNotification,
		signCount,
		refreshSign,
		setRefreshSign,
		placeholderVisible,
		setPlaceholderVisible,
	} = useContractEditorContext();

	const [shareLinks, setShareLinks] = useState([]);
	const [addBtnSpin, setAddBtnSpin] = useState(false);
	const [sendSpin, setSendSpin] = useState(false);
	const [signSpin, setSignSpin] = useState(false);
	const [approveSpin, setApproveSpin] = useState(false);
	const [downloadPdfSpin, setDownloadPdfSpin] = useState(false);
	const { Title, Text } = Typography;

	useEffect(() => {
		setShareLinks([]);
	}, []);
	useEffect(() => {
		let isMounted = true;
		if (contractKey) {
			const getShareLinks = async () => {
				let url = `${BASE_URL}${ApiEntity.CONTRACT_SHARE_LINK}?contractKey=${contractKey}&clientKey=${clientKey}`;
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
						if (isMounted) {
							setShareLinks(payload.data);
						}
					});
			};
			getShareLinks();
		}
		return () => {
			isMounted = false;
		};
	}, [contractKey, refreshShareLink]);

	const handleAddShareLink = async () => {
		setAddBtnSpin(true);
		const body = {
			clientKey: clientKey,
			contractKey: contractKey,
		};
		await axios
			.post(BASE_URL + ApiEntity.CONTRACT_SHARE_LINK, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': apiKey, //process.env.SENDFORSIGN_API_KEY,
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				//console.log('handleAddShareLink read', payload);
				setRefreshShareLink(refreshShareLink + 1);
				setAddBtnSpin(false);
			});
	};
	const checkChangeContract = async () => {
		let changed = false;
		let body = {
			clientKey: clientKey,
			userKey: userKey,
			contractKey: contractKey,
			signCount: signCount,
		};
		await axios
			.post(BASE_URL + ApiEntity.CHECK_CONTRACT_VALUE, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': apiKey, //process.env.SENDFORSIGN_API_KEY,
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
		let url = `${BASE_URL}${ApiEntity.DOWNLOAD_PDF}?contractKey=${contractKey}&clientKey=${clientKey}`;

		await axios
			.get(url, {
				headers: {
					'x-sendforsign-key': apiKey, //process.env.SENDFORSIGN_API_KEY,
				},
				responseType: 'arraybuffer',
			})
			.then((payload) => {
				debugger;
				const content = new Blob([payload.data as ArrayBuffer], {
					type: payload.headers['content-type'],
				});

				const encodedUri = window.URL.createObjectURL(content);
				const link = document.createElement('a');

				link.setAttribute('href', encodedUri);
				link.setAttribute('download', 'attachment.pdf');

				link.click();
				setDownloadPdfSpin(false);
			});
	};
	return (
		<Space direction='vertical' size={16} style={{ display: 'flex' }}>
			<Card loading={continueLoad}>
				<Space direction='vertical' size={16} style={{ display: 'flex' }}>
					<Space direction='vertical' size={2} style={{ maxWidth: '600px' }}>
						<Title level={4} style={{ margin: '0 0 0 0' }}>
							Share, sign, approve, and more
						</Title>
						<Text type='secondary'>
							See what's possible to do with your document.
						</Text>
					</Space>
					{shareLinks &&
						shareLinks.map((shareLine: ContractShareLink) => {
							return (
								<ShareLinkLine
									controlLink={contractKey ? contractKey : ''}
									shareLink={shareLine.shareLink ? shareLine.shareLink : ''}
									id={shareLine.id ? shareLine.id : 0}
									view={shareLine.view ? shareLine.view : ShareLinkView.SIGN}
								/>
							);
						})}

					<Space>
						<Tooltip title='Share the document with recipients.'>
							<div>
								<Button
									id='SendContract'
									type='default'
									icon={<FontAwesomeIcon icon={faPaperPlane} />}
									onClick={handleSendClick}
									// disabled={signDisable}
									loading={sendSpin}
								>
									Send
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
										setPlaceholderVisible(!placeholderVisible);
									}}
								>
									Placeholders
								</Button>
							</div>
						</Tooltip>
						<Tooltip title='Download pdf.'>
							<div>
								<Button
									id='DownloadPdf'
									type='default'
									loading={downloadPdfSpin}
									icon={<FontAwesomeIcon icon={faObjectUngroup} />}
									onClick={handleDownloadClick}
								>
									Download PDF
								</Button>
							</div>
						</Tooltip>
						<Tooltip title='Add another link to this contract.'>
							<div>
								<Button
									icon={<FontAwesomeIcon icon={faSquarePlus} />}
									onClick={handleAddShareLink}
									loading={addBtnSpin}
								></Button>
							</div>
						</Tooltip>
					</Space>
				</Space>
			</Card>
		</Space>
	);
};
