import React, { FC, useEffect, useRef, useState } from 'react';
import { Space } from 'antd';
import { ContractEditorProps } from './contract-editor.types';
import axios from 'axios';
import { BASE_URL } from '../../config/config';
import { Action, ApiEntity, ContractType } from '../../config/enum';
import useSaveArrayBuffer from '../../hooks/use-save-array-buffer';
import { ContractSign } from '../../config/types';
import { ContractEditorContext } from './contract-editor-context';
import { ApproveModal } from './approve-modal/approve-modal';
import { SignModal } from './sign-modal/sign-modal';
import { SendModal } from './send-modal/send-modal';
import { ResultModal } from './result-modal/result-modal';
import { HtmlBlock } from './html-block/html-block';
import { PdfBlock } from './pdf-block/pdf-block';
import { Notification } from './notification/notification';
import { DocumentTimilineBlock } from './document-timeline-block/document-timeline-block';
import { ChooseContractType } from './choose-contract-type/choose-contract-type';
import { ShareLinkBlock } from './share-link-block/share-link-block';
//env.config();

export const ContractEditor: FC<ContractEditorProps> = ({
	contractKey,
	clientKey,
	userKey,
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
	const [isNew, setIsNew] = useState(contractKey ? false : true);
	const [continueDisable, setContinueDisable] = useState(true);
	const [editorVisible, setEditorVisible] = useState(
		contractKey ? true : false
	);
	const [contractType, setContractType] = useState('');
	const [templateKey, setTemplateKey] = useState('');
	const [currContractKey, setCurrContractKey] = useState(contractKey);
	const [currClientKey, setCurrClientKey] = useState(clientKey);
	const [currUserKey, setCurrUserKey] = useState(userKey);
	const [continueLoad, setContinueLoad] = useState(false);
	const [createContract, setCreateContract] = useState(false);
	const [refreshShareLink, setRefreshShareLink] = useState(0);
	const [sign, setSign] = useState('');
	const [pdfFileLoad, setPdfFileLoad] = useState(0);
	const [refreshSign, setRefreshSign] = useState(0);
	const [refreshEvent, setRefreshEvent] = useState(0);
	const [notification, setNotification] = useState<{
		text: string | React.ReactNode;
	}>({ text: '' });
	const contractKeyRef = useRef(contractKey);

	useEffect(() => {
		clearArrayBuffer();
		let body = {};
		if (contractKeyRef.current) {
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
							// setPdfData(response.data);
							setPdfFileLoad(pdfFileLoad + 1);
						});
				} else {
					setContractValue(contractTmp.value as string);
				}
			};
			getContract();
		}
	}, []);

	useEffect(() => {
		const handleContinue = async () => {
			debugger;
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
					setIsNew(false);
				});
			if (contractType === ContractType.PDF.toString() && !templateKey) {
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
			setContinueLoad(false);
			setContinueDisable(true);
		};
		if (createContract) {
			handleContinue();
			setCreateContract(false);
		}
	}, [createContract]);

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
			}}
		>
			<Space direction='vertical' size={16} style={{ display: 'flex' }}>
				{isNew ? <ChooseContractType /> : <DocumentTimilineBlock />}
				{editorVisible && (
					<>
						{!isPdf ? <HtmlBlock /> : <PdfBlock />}
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
