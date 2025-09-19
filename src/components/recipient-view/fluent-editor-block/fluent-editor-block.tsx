import React, { useEffect, useRef } from 'react';
import FluentEditor from '@opentiny/fluent-editor';
// import QuillBetterTable from 'quill-better-table';
import ImageToolbarButtons from '@opentiny/fluent-editor';
import MarkdownShortcuts from 'quill-markdown-shortcuts';
import TableUp, { defaultCustomSelect, TableAlign, TableMenuSelect, TableMenuContextmenu, TableResizeBox, TableResizeScale, TableSelection, TableVirtualScrollbar } from 'quill-table-up';


import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
// import { useContractEditorContext } from '../contract-editor-context';
import { BASE_URL } from '../../../config/config';
import {
	Action,
	ApiEntity,
	ContractType,
	EventStatuses,
	PlaceholderView,
	SpecialType,
	Tags,
} from '../../../config/enum';
import { addBlotClass } from '../../../utils';

import '@opentiny/fluent-editor/style.css';
import 'quill-table-up/index.css'
import 'quill-table-up/table-creator.css'
import { useRecipientViewContext } from '../recipient-view-context';
import { changeValueInTag, convertQuillTablesInHTML, removeParentSpan } from '../../../utils/util-for-share';
import { ContractEvent } from '../../../config/types';

type Props = {
	value: string;
}

for (let index = 1; index <= 40; index++) {
	addBlotClass(index);
}

FluentEditor.register({ 'modules/table-up': TableUp }, true);
FluentEditor.register({ 'modules/markdownShortcuts': MarkdownShortcuts }, true);

export const FluentEditorBlock = ({ value }: Props) => {
	dayjs.extend(utc);
	const fluentRef = useRef<any>();

	const {
		sign,
		signs,
		contractEvent,
		setSign,
		contractSign,
		setContractSign,
		contract,
		setNotification,
		setContractValue,
		contractValue,
		placeholder,
		placeholdersFilling,
		setPlaceholdersFilling
	} = useRecipientViewContext();
	const container = document.querySelector('#contract-editor-container');

	useEffect(() => {
		if (document.querySelector('#contract-editor-container') && !fluentRef.current) {
			fluentRef.current = new FluentEditor('#contract-editor-container', {
				theme: 'snow',
				modules: {
					'toolbar': false,
					image: false,
					table: false,
					'table-up': false,
				},
				readOnly: true
			});
		}
	}, [container]);

	useEffect(() => {
		if (contract?.contractType?.toString() !== ContractType.PDF.toString() &&
			fluentRef.current) {
			// let processedValue = removeAilineTags(value);
			// processedValue = wrapTextNodes(value); // Обрабатываем HTML 
			let processedValue = value; // Обрабатываем HTML 
			if (processedValue.includes('quill-better-table-wrapper')) {
				processedValue = convertQuillTablesInHTML(processedValue);
			}
			if (processedValue && !contract?.audit) {
				// console.log('contractEventsData', contractEventsData);
				fluentRef?.current.clipboard.dangerouslyPasteHTML(processedValue);
				setContractValue({
					changeTime: contractValue.changeTime,
					contractValue: processedValue,
				});
			} else if (processedValue && contract.audit) {
				console.log('contract', contract);
				if (signs && signs.length > 0 && contract.audit) {
					fluentRef.current.clipboard.dangerouslyPasteHTML(
						auditTrailList(processedValue as string)
					);
				} else {
					fluentRef.current.clipboard.dangerouslyPasteHTML(
						processedValue
					);
				}
			}
		}
	}, [contract, signs]);

	useEffect(() => {
		if (sign &&
			contractSign &&
			contract.contractType &&
			contract.contractType.toString() !== ContractType.PDF.toString()) {
			let textTmp =
				fluentRef?.current?.root.innerHTML +
				`<br></br><p><img src='${sign}' alt="signature" /></p>`;
			textTmp = textTmp + `<p>Name: ${contractSign.fullName}</p>`;
			textTmp = textTmp + `<p>Email: ${contractSign.email}</p>`;
			textTmp =
				textTmp +
				`<p>Timestamp: ${dayjs(contractSign.createTime)
					.utc()
					.format('YYYY-MM-DD HH:mm:ss')} GMT</p>`;
			for (let i = 1; i < 5; i++) {
				let tag = '';
				let value = '';
				let color = '#a3e8f6';
				switch (i) {
					case SpecialType.DATE:
						tag = Tags.DATE;
						value = `${dayjs(contractSign.createTime)
							.utc()
							.format('YYYY-MM-DD HH:mm:ss')} GMT`;
						break;
					case SpecialType.FULLNAME:
						tag = Tags.FULLNAME;
						value = contractSign.fullName as string;
						break;
					case SpecialType.EMAIL:
						tag = Tags.EMAIL;
						value = contractSign.email as string;
						break;
					case SpecialType.SIGN:
						tag = Tags.SIGN;
						value = `<img src='${sign}' alt="signature" width="160" height="90"/>`;
						color = '#ffffff';
						break;
				}
				textTmp = changeValueInTag(
					tag,
					contractSign.recipientId as number,
					value,
					textTmp,
					color,
					[]
				);
			}
			handleChangeText(textTmp, false, true);
			fluentRef?.current?.clipboard.dangerouslyPasteHTML(textTmp);
			// debugger;
			// setContinueLoad(false);
			setSign('');
			setContractSign({});
			fluentRef?.current?.enable(false);
		}
	}, [sign, contractSign]);

	useEffect(() => {
		if (
			placeholdersFilling &&
			contract &&
			contract.contractType &&
			contract.contractType.toString() !== ContractType.PDF.toString()
		) {
			fluentRef?.current?.clipboard.dangerouslyPasteHTML(contractValue.contractValue);

			handleChangeText(contractValue.contractValue as string, false, false);
			setPlaceholdersFilling(false);
		}
	}, [placeholdersFilling]);

	const auditTrailList = (value: string): string => {
		console.log('8');
		let newValue = value;
		const signedEvent = contractEvent?.filter(
			(contractEventData: ContractEvent) =>
				contractEventData.status?.toString() === (EventStatuses?.SIGNED?.toString?.() ?? '')
		) ?? [];
		if (signedEvent.length > 0) {
			const signedEventString = signedEvent.map(
				(contractEventData: ContractEvent) => {
					let ipProp = '';
					if (contractEventData.ipInfo) {
						const json = JSON.parse(contractEventData.ipInfo);
						if (json) {
							ipProp = `<p>IP: ${json.ip}</p>
							<p>Location: ${json.city}, ${json.country_name}</p>
							<p>Timezone: ${json.timezone}, ${json.utc_offset}</p>`;
						}
					}
					const signFind = signs.find(
						(signData) =>
							signData.email === contractEventData.email &&
							signData.fullName === contractEventData.name
					);
					return `
				<tr>
				  <td> 
					<p><b>${contractEventData.name}</b></p>
					<p><b>${contractEventData.email}</b></p>
				  </td> 
				  <td>
					<p>
					  ${dayjs(contractEventData.createTime).format(
						'YYYY-MM-DD @ HH:mm:ss'
					)} GMT
					</p>
				  </td>         
				  <td>
					${ipProp}
				  </td>
				  <td>
					<img src='${signFind ? signFind.base64 : ''}' alt="signature" />
				  </td>
				</tr>`;
				}
			);
			newValue = `${newValue}
		  <br>
		  <h3 class="ql-align-center">Signature Certificate</h3>
		  <br>
		  <table style="background-color: rgb(242, 242, 242);">
		  <colgroup><col width="500"><col width="500"></colgroup>
		  <tbody>
			<tr>
			  <td class="ql-size-small ql-align-center">Document ID</td>
			  <td class="ql-size-small ql-align-center">Document name</td>
			</tr>
			<tr>
			  <td class="ql-align-center"><b>${contract.controlLink}</b></td>
			  <td class="ql-align-center"><b>${contract.contractName}</b></td>
			</tr>
		  </tbody>
		</table>
		  <br> 
			<table style="background-color: rgb(242, 242, 242);">
			  <colgroup><col width="330"><col width="170"><col width="250"><col width="250"></colgroup>
			  <tbody>
				<tr>
				  <td class="ql-size-small">Signed by</td>
				  <td class="ql-size-small">When</td>
				  <td class="ql-size-small">Where</td>
				  <td class="ql-size-small">Signature</td>
				</tr>
				${signedEventString.join('')} 
			  </tbody>
			</table>`;
		}

		return newValue;
	};

	const handleChangeText = async (
		content: string,
		needCheck: boolean = true,
		email: boolean = false
	) => {
		let contentTmp = content;

		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = contentTmp;
		for (let index = 0; index < placeholder.length; index++) {
			if (
				placeholder[index].view?.toString() !==
				PlaceholderView.SIGNATURE.toString()
			) {
				let tag = `placeholder${placeholder[index].id}`;
				if (placeholder[index].specialType) {
					switch (placeholder[index].specialType) {
						case SpecialType.DATE:
							tag = `date${placeholder[index].id}`;
							break;

						case SpecialType.FULLNAME:
							tag = `fullname${placeholder[index].id}`;
							break;

						case SpecialType.EMAIL:
							tag = `email${placeholder[index].id}`;
							break;

						case SpecialType.SIGN:
							tag = `sign${placeholder[index].id}`;
							break;

						case SpecialType.INITIALS:
							tag = `initials${placeholder[index].id}`;
							break;
					}
				}
				const elements = tempDiv.getElementsByTagName(tag);
				for (let i = 0; i < elements.length; i++) {
					let element: any = elements[i];
					removeParentSpan(element);
				}
			}
		}
		contentTmp = tempDiv.innerHTML;

		let body = {};
		let changed = false;
		let contractValueTmp = '';
		if (needCheck) {
			body = {
				shareLink: contract.shareLink,
			};
			await axios
				.post(BASE_URL + ApiEntity.CHECK_CONTRACT_CHANGED, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						'Content-Type': 'application/vnd.api+json',
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					//console.log('CHECK_CONTRACT_VALUE read', payload);
					if (payload.data.changed && payload.data.contractValue) {
						changed = payload.data.changed;
						setContractValue(payload.data.contractValue);
						contractValueTmp = payload.data.contractValue;
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
		} else {
			contractValueTmp = contentTmp;
		}
		if (!changed) {
			body = {
				shareLink: contract.shareLink,
				contractValue: contentTmp,
			};
			await axios
				.post(BASE_URL + ApiEntity.RECIPIENT_CONTRACT, body, {
					headers: {
						Accept: 'application/vnd.api+json',
						// 'Content-Type': 'application/vnd.api+json',
					},
					responseType: 'json',
				})
				.then((payload: any) => {
					//console.log('editor read', payload);
					if (email) {
						sendEmail();
					}
					// setDocumentCurrentSaved(true); 
					// setIsDone(true);
					setContractValue({ contractValue: payload.data.contractValue, changeTime: payload.data.changeTime });
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
		} else {
			if (contractValueTmp) {
				fluentRef?.current?.clipboard.dangerouslyPasteHTML(contractValueTmp);
			}
			setNotification({
				text: 'Contract updated. Please, reload the page.',
			});
		}
	};
	const sendEmail = async () => {
		let body = {
			shareLink: contract.shareLink,
		};
		await axios
			.post(BASE_URL + ApiEntity.RECIPIENT_SIGN_EMAIL, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				//console.log('editor read', payload);
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
		<div id='contract-editor-container'>
			{/* Тулбар будет автоматически вставлен FluentEditor внутрь этого контейнера, но мы хотим явно обернуть его */}
		</div>
	);
};
