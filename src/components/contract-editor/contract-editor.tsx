import React, { FC, useEffect, useRef, useState } from 'react';
import './contract-editor.css';
import { Card, Space, Typography } from 'antd';
import { ContractEditorProps } from './contract-editor.types';
import axios from 'axios';
import { BASE_URL } from '../../config/config';
import {
  Action,
  ApiEntity,
  ContractType,
  ContractTypeText,
} from "../../config/enum";
import useSaveArrayBuffer from "../../hooks/use-save-array-buffer";
import { ContractSign } from "../../config/types";
import { ContractEditorContext } from "./contract-editor-context";
import { ApproveModal } from "./approve-modal/approve-modal";
import { SignModal } from "./sign-modal/sign-modal";
import { SendModal } from "./send-modal/send-modal";
import { ResultModal } from "./result-modal/result-modal";
import { HtmlBlock } from "./html-block/html-block";
import { PdfBlock } from "./pdf-block/pdf-block";
import { Notification } from "./notification/notification";
import { DocumentTimilineBlock } from "./document-timeline-block/document-timeline-block";
import { ChooseContractType } from "./choose-contract-type/choose-contract-type";
import { ShareLinkBlock } from "./share-link-block/share-link-block";
//env.config();

export const ContractEditor: FC<ContractEditorProps> = ({
	contractKey,
	clientKey,
	userKey,
	id,
}) => {
	// if (!process.env.SENDFORSIGN_API_KEY) {
	// 	console.log(
	// 		'process.env.SENDFORSIGN_API_KEY',
	// 		process.env.SENDFORSIGN_API_KEY
	// 	);
	// }
	const { setArrayBuffer, getArrayBuffer, clearArrayBuffer } =
		useSaveArrayBuffer();
	const [signModal, setSignModal] = useState(false);
	const [sendModal, setSendModal] = useState(false);
	const [approveModal, setApproveModal] = useState(false);
	const [resultModal, setResultModal] = useState({ open: false, action: '' });
	const [contractName, setContractName] = useState('');
	const [contractValue, setContractValue] = useState('');
	const [contractSign, setContractSign] = useState<ContractSign>({});
	const [isPdf, setIsPdf] = useState(false);
	const [isNew, setIsNew] = useState(false);
	const [continueDisable, setContinueDisable] = useState(true);
	const [editorVisible, setEditorVisible] = useState(false);
	const [contractType, setContractType] = useState('');
	const [templateKey, setTemplateKey] = useState('');
	const [currContractKey, setCurrContractKey] = useState(contractKey);
	const [currClientKey, setCurrClientKey] = useState(clientKey);
	const [currUserKey, setCurrUserKey] = useState(userKey);
	const [continueLoad, setContinueLoad] = useState(false);
	const [createContract, setCreateContract] = useState(false);
	const [readonly, setReadonly] = useState(false);
	const [pdfDownload, setPdfDownload] = useState(false);
	const [sign, setSign] = useState('');
	const [pdfFileLoad, setPdfFileLoad] = useState(0);
	const [refreshSign, setRefreshSign] = useState(0);
	const [refreshEvent, setRefreshEvent] = useState(0);
	const [refreshShareLink, setRefreshShareLink] = useState(0);
	const [refreshRecipients, setRefreshRecipients] = useState(0);
	const [signCount, setSignCount] = useState(0);
	const [notification, setNotification] = useState<{
		text: string | React.ReactNode;
	}>({ text: '' });
	const contractKeyRef = useRef(contractKey);
	const { Title } = Typography;
	console.log('contractKey', contractKey, currClientKey);
	// useEffect(() => {
	// 	debugger;
	// 	setEditorVisible(false);
	// }, []);
	useEffect(() => {
		setCurrClientKey(clientKey);
	}, [clientKey]);
	useEffect(() => {
		setCurrUserKey(userKey);
	}, [userKey]);
	useEffect(() => {
		// debugger;
		setEditorVisible(false);
		setContinueLoad(true);
		contractKeyRef.current = contractKey;
		setCurrContractKey(contractKey);
		clearArrayBuffer();
		let body = {};
		if (contractKeyRef.current) {
			setIsNew(false);
			setEditorVisible(true);
			setContinueLoad(true);
			setRefreshEvent(refreshEvent + 1);
			setRefreshShareLink(refreshShareLink + 1);
			setRefreshSign(refreshSign + 1);
			body = {
				data: {
					action: Action.READ,
					clientKey: clientKey,
					userKey: userKey,
					contract: {
						contractKey: contractKeyRef.current,
					},
				},
			};

			const getContract = async () => {
				let contractTmp: { contractType?: any; value?: string } = {};
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
						console.log('getContract read', payload);
						contractTmp = payload.data.contract;
					});
				if (contractTmp?.contractType === ContractType.PDF.toString()) {
					await axios
						.get(contractTmp.value as string, {
							responseType: 'arraybuffer',
						})
						.then(async function (response) {
							setIsPdf(true);
							await setArrayBuffer('pdfFile', response.data);
							await setArrayBuffer('pdfFileOriginal', response.data);
							setPdfDownload(true);
							// setPdfData(response.data);
							setPdfFileLoad(pdfFileLoad + 1);
						});
				} else {
					// debugger;
					setContractValue(
						contractTmp.value ? (contractTmp.value as string) : '<div></div>'
					);
				}
			};
			getContract();
		} else {
			setIsNew(true);
			setPdfDownload(false);
			setContractName('');
			setContractType('');
			// debugger;
			setContractValue('<div></div>');
			setReadonly(false);
		}
	}, [contractKey]);

	useEffect(() => {
		const handleContinue = async () => {
			// debugger;
			setContinueLoad(true);
			let body = {
				data: {
					action: Action.CREATE,
					clientKey: clientKey,
					userKey: userKey,
					contract: {
						name: contractName,
						value: contractValue,
						templateKey: templateKey,
						contractType: contractType,
					},
				},
			};
			let contractKeyTmp = '';
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
					console.log('editor read', payload);
					setCurrContractKey(payload.data.contract.contractKey);
					contractKeyTmp = payload.data.contract.contractKey;
					setRefreshEvent(refreshEvent + 1);
				});
			if (contractType === ContractTypeText.PDF.toString() && !templateKey) {
				const formData = new FormData();
				const pdfFile = (await getArrayBuffer('pdfFile')) as ArrayBuffer;
				const pdfFileBlob = new Blob([pdfFile], { type: 'application/pdf' });
				formData.append('pdf', pdfFileBlob);
				let url = `${BASE_URL}${ApiEntity.UPLOAD_PDF}?contractKey=${contractKeyTmp}&clientKey=${clientKey}`;
				await axios
					.post(url, formData, {
						headers: {
							'x-sendforsign-key': 're_api_key', //process.env.SENDFORSIGN_API_KEY,
						},
						responseType: 'json',
					})
					.then((payload) => {
						console.log('editor read', payload);
					});
			}
			setEditorVisible(true);
			setContinueDisable(true);
			// debugger;
			setIsNew(false);
			setContinueLoad(false);
		};
		if (createContract) {
			handleContinue();
			setCreateContract(false);
		}
	}, [createContract]);
	console.log('editorVisible', continueLoad);
	return (
		<ContractEditorContext.Provider
			value={{
				signModal,
				setSignModal,
				sendModal,
				setSendModal,
				approveModal,
				setApproveModal,
				resultModal,
				setResultModal,
				notification,
				setNotification,
				contractKey: currContractKey as string,
				setContractKey: setCurrContractKey,
				contractName,
				setContractName,
				contractType,
				setContractType,
				templateKey,
				setTemplateKey,
				clientKey: currClientKey,
				setClientKey: setCurrClientKey,
				userKey: currUserKey,
				setUserKey: setCurrUserKey,
				sign,
				setSign,
				contractSign,
				setContractSign,
				pdfFileLoad,
				setPdfFileLoad,
				refreshSign,
				setRefreshSign,
				refreshEvent,
				setRefreshEvent,
				refreshShareLink,
				setRefreshShareLink,
				refreshRecipients,
				setRefreshRecipients,
				contractValue,
				setContractValue,
				createContract,
				setCreateContract,
				isPdf,
				setIsPdf,
				continueDisable,
				setContinueDisable,
				continueLoad,
				setContinueLoad,
				editorVisible,
				setEditorVisible,
				readonly,
				setReadonly,
				signCount,
				setSignCount,
				pdfDownload,
				setPdfDownload,
			}}
		>
			<Space id={id} direction='vertical' size={16} style={{ display: 'flex' }}>
				{isNew ? <ChooseContractType /> : <DocumentTimilineBlock />}
				{!isNew && (
					<>
						{editorVisible && (
							<>
								{!isPdf ? (
									<>{contractValue && <HtmlBlock value={contractValue} />}</>
								) : (
									<PdfBlock />
								)}
							</>
						)}
						<ShareLinkBlock />
					</>
				)}
			</Space>
			<SignModal />
			<SendModal />
			<ApproveModal />
			<ResultModal />
			<Notification />
		</ContractEditorContext.Provider>
	);
};
