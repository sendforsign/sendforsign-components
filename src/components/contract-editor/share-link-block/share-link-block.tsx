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
		setNotification,
		signCount,
		refreshSign,
		setRefreshSign,
		placeholderVisible,
		setPlaceholderVisible,
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
		// } else {
		// 	const arrayBuffer: ArrayBuffer = (await getArrayBuffer(
		// 		'pdfFile'
		// 	)) as ArrayBuffer;
		// 	if (arrayBuffer) {
		// 		const merger = new PDFMerger();
		// 		const pdfDoc = await PDFDocument.load(arrayBuffer);
		// 		const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
		// 		const pages = pdfDoc.getPages();
		// 		const textSize = 10;
		// 		for (let i = 0; i < pagePlaceholder.length; i++) {
		// 			const scale =
		// 				pages[pagePlaceholder[i].pageId as number].getWidth() / 1000;
		// 			if (
		// 				pagePlaceholder[i]?.view?.toString() ===
		// 				PlaceholderView.SIGNATURE.toString()
		// 			) {
		// 				const pngImage = await pdfDoc.embedPng(
		// 					pagePlaceholder[i].base64 as string
		// 				);
		// 				pages[pagePlaceholder[i].pageId as number].drawImage(pngImage, {
		// 					x: (pagePlaceholder[i].positionX as number) * scale,
		// 					y:
		// 						(Math.abs(pagePlaceholder[i].positionY as number) -
		// 							(pagePlaceholder[i].height as number)) *
		// 						scale,
		// 					width: (pagePlaceholder[i].width as number) * scale,
		// 					height: (pagePlaceholder[i].height as number) * scale,
		// 				});
		// 			} else {
		// 				pages[pagePlaceholder[i].pageId as number].drawText(
		// 					(pagePlaceholder[i].value as string)
		// 						? (pagePlaceholder[i].value as string)
		// 						: (pagePlaceholder[i].name as string),
		// 					{
		// 						x: (pagePlaceholder[i]?.positionX as number) * scale,
		// 						y:
		// 							Math.abs(pagePlaceholder[i].positionY as number) * scale -
		// 							textSize,
		// 						font: helveticaFont,
		// 						size: textSize,
		// 						lineHeight: 12,
		// 						color: rgb(0, 0, 0),
		// 						opacity: 1,
		// 						maxWidth: (pagePlaceholder[i].width as number) * scale,
		// 					}
		// 				);
		// 			}
		// 		}
		// 		const pdfBytes = await pdfDoc.save();
		// 		await merger.add(pdfBytes.buffer);

		// 		let rows: Row[] = contractEvents
		// 			.filter(
		// 				(contractEventData) =>
		// 					contractEventData.status.toString() ===
		// 					EventStatuses.SIGNED.toString()
		// 			)
		// 			?.map((contractEventData) => {
		// 				let row: Row = {};
		// 				if (contractEventData.ipInfo) {
		// 					const json = JSON.parse(contractEventData.ipInfo);
		// 					if (json) {
		// 						row.json = json;
		// 					}
		// 				}
		// 				const signFind = signs.find(
		// 					(signData) =>
		// 						signData.email === contractEventData.email &&
		// 						signData.fullName === contractEventData.name
		// 				);
		// 				if (signFind) {
		// 					row.base64 = signFind.base64;
		// 				}
		// 				row.email = contractEventData.email;
		// 				row.name = contractEventData.name;
		// 				row.createTime = `${dayjs(contractEventData.createTime).format(
		// 					'YYYY-MM-DD @ HH:mm:ss'
		// 				)} GMT`;
		// 				return row;
		// 			});

		// 		const auditTrail = await pdf(
		// 			<PdfAuditTrail
		// 				contract={{ controlLink: contractKey, contractName: contractName }}
		// 				rows={rows}
		// 			/>
		// 		).toBlob();
		// 		await merger.add(await auditTrail.arrayBuffer());

		// 		const mergedPdfBlob = await merger.saveAsBlob();

		// 		// const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
		// 		const encodedUri = window.URL.createObjectURL(mergedPdfBlob);
		// 		const link = document.createElement('a');

		// 		link.setAttribute('href', encodedUri);
		// 		link.setAttribute('download', `${contractName}.pdf`);

		// 		link.click();
		// 		setDownloadPdfSpin(false);
		// 	}
		// }
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
					{/* <Space direction='vertical' size={2} style={{ maxWidth: '600px' }}>
						<Title level={4} style={{ margin: '0 0 0 0' }}>
							Share, sign, approve, and more
						</Title>
						<Text type='secondary'>
							See what's possible to do with your document.
						</Text>
					</Space> */}
					{/* {shareLinks &&
						shareLinks.map((shareLine: ContractShareLink) => {
							return (
								<ShareLinkLine
									controlLink={contractKey ? contractKey : ''}
									shareLink={shareLine.shareLink ? shareLine.shareLink : ''}
									id={shareLine.id ? shareLine.id : 0}
									view={shareLine.view ? shareLine.view : ShareLinkView.SIGN}
								/>
							);
						})} */}

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
										setPlaceholderVisible(!placeholderVisible);
									}}
								>
									Placeholders
								</Button>
							</div>
						</Tooltip>
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
