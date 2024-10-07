import React, { useEffect, useRef, useState } from 'react';
import {
	Space,
	Card,
	Typography,
	Button,
	Input,
	Radio,
	Row,
	Tooltip,
	Col,
	Popover,
	Divider,
	Select,
} from 'antd';
import QuillNamespace from 'quill';
import { useContractEditorContext } from '../contract-editor-context';
import { BASE_URL } from '../../../config/config';
import {
	Action,
	ApiEntity,
	ContractType,
	ContractTypeText,
	PlaceholderColor,
	PlaceholderFill,
	PlaceholderTypeText,
	PlaceholderView,
	SpecialType,
} from '../../../config/enum';
import axios from 'axios';
import { Placeholder, Recipient } from '../../../config/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faCircle,
	faCircleQuestion,
	faClose,
	faFont,
	faGear,
	faLeftLong,
	faSignature,
} from '@fortawesome/free-solid-svg-icons';
import { parseDate } from 'pdf-lib';

type Props = {
	quillRef: React.MutableRefObject<QuillNamespace | undefined>;
};
type Option = { value: string; label: React.JSX.Element };
export const PlaceholderHtmlBlock = ({ quillRef }: Props) => {
	const {
		apiKey,
		userKey,
		token,
		readonly,
		contractType,
		contractKey,
		clientKey,
		placeholder,
		continueLoad,
		setPlaceholder,
		refreshPlaceholders,
		setPlaceholderVisible,
		placeholderVisible,
		setNotification,
		contractPlaceholderCount,
		setContractPlaceholderCount,
	} = useContractEditorContext();
	const [currPlaceholder, setCurrPlaceholder] = useState(refreshPlaceholders);
	const [placeholderLoad, setPlaceholderLoad] = useState(false);
	const [delLoad, setDelLoad] = useState(false);
	const [selectPlaceholder, setSelectPlaceholder] = useState<Option[]>([]);
	const [selectedPlaceholders, setSelectedPlaceholders] = useState<
		Placeholder[]
	>([]);
	const [selectedOtion, setSelectedOtion] = useState('0');
	const readonlyCurrent = useRef(false);
	// const selectedOtion = useRef('0');
	const placeholderRecipients = useRef<Recipient[]>([]);

	const { Title, Text } = Typography;

	const getPlaceholders = async (load = true) => {
		//console.log('PlaceholderBlock');

		if (load) {
			setPlaceholderLoad(true);
		}
		const body = {
			data: {
				action: Action.LIST,
				clientKey: !token ? clientKey : undefined,
				contractKey: contractKey,
			},
		};
		await axios
			.post(BASE_URL + ApiEntity.PLACEHOLDER, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
					Authorization: token ? `Bearer ${token}` : undefined,
					'x-sendforsign-component': true,
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				//console.log('getPlaceholders read', payload);

				if (payload.data.placeholders && payload.data.placeholders.length > 0) {
					let placeholderTmp: Placeholder[] = [];
					for (
						let index = 0;
						index < payload.data.placeholders.length;
						index++
					) {
						if (
							payload.data.placeholders[index].view.toString() !==
							PlaceholderView.SIGNATURE.toString()
						) {
							const elements = document.getElementsByTagName(
								`placeholder${payload.data.placeholders[index].id}`
							);
							placeholderTmp.push({
								...payload.data.placeholders[index],
								color: payload.data.placeholders[index].color
									? payload.data.placeholders[index].color
									: PlaceholderColor.OTHER,
							});
							for (let i = 0; i < elements.length; i++) {
								let element: any = elements[i];
								element.style.background = payload.data.placeholders[index]
									.color
									? payload.data.placeholders[index].color
									: PlaceholderColor.OTHER;
							}
						}
					}
					setPlaceholder(placeholderTmp);
					setContractPlaceholderCount(placeholderTmp.length);
					handleChangeSelect(selectedOtion, placeholderTmp);
				} else {
					setContractPlaceholderCount(0);
				}
				if (load) {
					setPlaceholderLoad(false);
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
	};
	const getRecipients = async () => {
		const body = {
			data: {
				action: Action.LIST,
				clientKey: !token ? clientKey : undefined,
				userKey: userKey,
				contractKey: contractKey,
				// getShareLinks: true,
			},
		};
		await axios
			.post(BASE_URL + ApiEntity.RECIPIENT, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
					Authorization: token ? `Bearer ${token}` : undefined,
					'x-sendforsign-component': true,
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				//console.log('getShareLinks read', payload);
				let selectOptions: Option[] = [
					{
						value: '0',
						label: (
							<span>
								<FontAwesomeIcon
									icon={faCircle}
									color={PlaceholderColor.OTHER}
									size='sm'
								/>{' '}
								All placeholders
							</span>
						),
					},
					{
						value: '1',
						label: (
							<span>
								<FontAwesomeIcon
									icon={faCircle}
									color={PlaceholderColor.OWNER}
									size='sm'
								/>{' '}
								Contract owner
							</span>
						),
					},
				];
				if (payload.data.recipients && payload.data.recipients.length > 0) {
					placeholderRecipients.current = payload.data.recipients.map(
						(recipient: Recipient) => {
							selectOptions.push({
								value: recipient.recipientKey as string,
								label: (
									<span>
										<FontAwesomeIcon
											icon={faCircle}
											color={recipient.color}
											size='sm'
										/>{' '}
										{recipient.fullname}
									</span>
								),
							});
							return {
								id: recipient.id,
								fullname: recipient.fullname,
								email: recipient.email,
								customMessage: recipient.customMessage,
								position: recipient.position,
								action: recipient.action,
								recipientKey: recipient.recipientKey,
								color: recipient.color,
							};
						}
					);
				}
				setSelectPlaceholder(selectOptions);
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

	useEffect(() => {
		let isMounted = true;
		if (
			contractType.toString() !== ContractType.PDF.toString() &&
			contractType.toString() !== ContractTypeText.PDF.toString() &&
			contractKey &&
			(clientKey || token) &&
			placeholderVisible &&
			(currPlaceholder !== refreshPlaceholders ||
				!placeholder ||
				placeholder.length === 0)
		) {
			setCurrPlaceholder(refreshPlaceholders);
			getRecipients();
			getPlaceholders();
		}
		return () => {
			isMounted = false;
		};
	}, [refreshPlaceholders, placeholderVisible]);
	useEffect(() => {
		if (readonly) {
			readonlyCurrent.current = true;
		}
	}, [readonly]);

	const updatePlaceholderClass = ({
		id,
		specialType,
		recipientKey,
		owner,
		deleteClass,
	}: {
		id: number;
		specialType?: number;
		recipientKey?: string;
		owner?: boolean;
		deleteClass?: boolean;
	}) => {
		if (!specialType) {
			let placeholderFind = placeholder.find(
				(pl) => pl.id?.toString() === id.toString() && !pl.isSpecial
			) as Placeholder;

			if (placeholderFind && placeholderFind.id) {
				const elements = document.getElementsByTagName(
					`placeholder${placeholderFind.id}`
				);
				if (!deleteClass) {
					let color = '';
					if (owner) {
						color = PlaceholderColor.OWNER;
					} else {
						if (recipientKey) {
							const recipientFind = placeholderRecipients.current.find(
								(recipient) => recipient.recipientKey === recipientKey
							);
							if (recipientFind) {
								color = recipientFind.color as string;
							}
						}
					}
					for (let i = 0; i < elements.length; i++) {
						let element: any = elements[i];
						element.style.background = color ? color : PlaceholderColor.OTHER;
					}
				} else {
					for (let i = 0; i < elements.length; i++) {
						let element: any = elements[i];
						element.style.removeProperty('background');
					}
				}
				quillRef?.current?.clipboard.dangerouslyPasteHTML(0, '', 'user');
			}
		} else {
			let elements: HTMLCollectionOf<Element> = {
				item: function (index: number): Element | null {
					throw new Error('Function not implemented.');
				},
				namedItem: function (name: string): Element | null {
					throw new Error('Function not implemented.');
				},
				length: 0,
			};
			switch (specialType) {
				case SpecialType.DATE:
					elements = document.getElementsByTagName(`date${id}`);

					break;

				case SpecialType.FULLNAME:
					elements = document.getElementsByTagName(`fullname${id}`);
					break;

				case SpecialType.EMAIL:
					elements = document.getElementsByTagName(`email${id}`);
					break;

				case SpecialType.SIGN:
					elements = document.getElementsByTagName(`sign${id}`);
					break;

				case SpecialType.INITIALS:
					elements = document.getElementsByTagName(`initials${id}`);
					break;
			}
			let color = '';
			if (recipientKey) {
				const recipientFind = placeholderRecipients.current.find(
					(recipient) => recipient.recipientKey === recipientKey
				);
				if (recipientFind) {
					color = recipientFind.color as string;
				}
			}
			for (let i = 0; i < elements.length; i++) {
				let element: any = elements[i];
				element.style.background = color ? color : PlaceholderColor.OTHER;
			}
			quillRef?.current?.clipboard.dangerouslyPasteHTML(0, '', 'user');
		}
	};
	const deleteTag = (id: number) => {
		let text = quillRef?.current?.root.innerHTML;
		let tag = `<placeholder${id} class=`;
		let array = text?.split(tag);
		let resultText = '';
		// debugger;
		if (array) {
			for (let i = 0; i < array.length; i++) {
				if (array.length > 1) {
					if (i === 0) {
						let findSpan = array[i];
						let posStart = findSpan.length - 60;
						if (posStart <= 0) {
							resultText += findSpan;
						} else {
							let posSpan = findSpan.lastIndexOf('<span style=');
							if (posSpan < posStart) {
								resultText += findSpan;
							} else {
								resultText += findSpan.substring(0, posSpan);
							}
						}
					} else {
						tag = `</placeholder${id}>`;
						const lineArr = array[i].split(tag);
						for (let j = 0; j < lineArr.length; j++) {
							if (j > 0) {
								let findSpan = lineArr[j];
								if (j === 1) {
									let posSpan = findSpan.indexOf('</span>');
									if (posSpan !== 0) {
										resultText += findSpan;
									} else {
										resultText += findSpan.substring(7, findSpan.length);
									}
								} else {
									resultText += findSpan;
								}
							}
						}
					}
				} else {
					resultText = array[i];
				}
			}
			quillRef?.current?.clipboard.dangerouslyPasteHTML(resultText, 'user');
			quillRef?.current?.blur();
		}
	};
	const changeValueInTag = (id: number, value: string) => {
		let text = quillRef?.current?.root.innerHTML;
		let contenteditable = false;
		if (text?.includes('contenteditable')) {
			contenteditable = true;
		}
		let tag = `<placeholder${id} class=`;
		let array = text?.split(tag);
		let resultText = '';
		// debugger;
		if (array) {
			for (let i = 0; i < array.length; i++) {
				if (array.length > 1) {
					if (i === 0) {
						resultText += array[i];
					} else {
						resultText += `<placeholder${id} class=`;
						tag = `</placeholder${id}>`;
						const lineArr = array[i].split(tag);
						for (let j = 0; j < lineArr.length; j++) {
							if (j === 0) {
								tag = contenteditable
									? `"placeholderClass${id}" contenteditable="false"`
									: `"placeholderClass${id}"`;
								const elArray = lineArr[j].split(tag);
								for (let k = 0; k < elArray.length; k++) {
									if (k === 0) {
										resultText += contenteditable
											? `${elArray[k]}"placeholderClass${id}" contenteditable="false">`
											: `${elArray[k]}"placeholderClass${id}">`;
									} else {
										resultText += `${value}</placeholder${id}>`;
									}
								}
							} else {
								resultText += lineArr[j];
							}
						}
					}
				} else {
					resultText = array[i];
				}
			}
			quillRef?.current?.clipboard.dangerouslyPasteHTML(resultText, 'user');
			// handleChangeText(resultText, false);
			quillRef?.current?.blur();
		}
		//console.log('changeValueInTag', quillRef?.current?.root.innerHTML);
	};
	const changeValue = async (placeholderChange: Placeholder) => {
		if (placeholderChange.isSpecial || readonlyCurrent.current) {
			return;
		}
		let placeholdersTmp = [...placeholder];
		const holderIndex = placeholdersTmp.findIndex(
			(holder) => holder.id?.toString() === placeholderChange.id?.toString()
		);
		if (placeholdersTmp[holderIndex].name) {
			changeValueInTag(
				placeholdersTmp[holderIndex].id
					? (placeholdersTmp[holderIndex].id as number)
					: 0,
				placeholdersTmp[holderIndex].value
					? (placeholdersTmp[holderIndex].value as string)
					: `{{{${placeholdersTmp[holderIndex].name as string}}}}`
			);
		}

		let body = {
			data: {
				action: Action.UPDATE,
				clientKey: !token ? clientKey : undefined,
				contractKey: contractKey,
				placeholder: {
					placeholderKey: placeholdersTmp[holderIndex].placeholderKey,
					value: placeholdersTmp[holderIndex].value,
				},
			},
		};
		await axios
			.post(BASE_URL + ApiEntity.PLACEHOLDER, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
					Authorization: token ? `Bearer ${token}` : undefined,
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				//console.log('PLACEHOLDER read', payload);
				// setRefreshPlaceholders(refreshPlaceholders + 1);
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
	const handleAddPlaceholder = async () => {
		let placeholdersTmp = [...placeholder];
		placeholdersTmp.push({
			name: `Name${contractPlaceholderCount + 1}`,
			value: '',
			type: PlaceholderTypeText.INTERNAL,
			fillingType:
				selectedOtion === '1'
					? PlaceholderFill.CREATOR
					: selectedOtion !== '0'
					? PlaceholderFill.SPECIFIC
					: PlaceholderFill.NONE,
			externalRecipientKey:
				selectedOtion !== '0' && selectedOtion !== '1' ? selectedOtion : '',
		});
		setPlaceholder(placeholdersTmp);
		handleChangeSelect(selectedOtion, placeholdersTmp);

		let body = {
			data: {
				action: Action.CREATE,
				clientKey: !token ? clientKey : undefined,
				contractKey: contractKey,
				placeholder: {
					name: `Name${placeholdersTmp.length}`,
					value: '',
					type: PlaceholderTypeText.INTERNAL,
					fillingType:
						selectedOtion === '1'
							? PlaceholderFill.CREATOR
							: selectedOtion !== '0'
							? PlaceholderFill.SPECIFIC
							: PlaceholderFill.NONE,
					externalRecipientKey:
						selectedOtion !== '0' && selectedOtion !== '1' ? selectedOtion : '',
				},
			},
		};
		await axios
			.post(BASE_URL + ApiEntity.PLACEHOLDER, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
					Authorization: token ? `Bearer ${token}` : undefined,
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				//console.log('PLACEHOLDER read', payload);
				// setRefreshPlaceholders(refreshPlaceholders + 1);
				getPlaceholders(false);
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
	const handleInsertPlaceholder = (holderInsert: Placeholder) => {
		const position = quillRef?.current?.getSelection();
		//console.log('position', position, quillRef);
		if (!holderInsert.isSpecial) {
			const empty = holderInsert.value
				? holderInsert.value?.replace(/\s/g, '')
				: '';

			quillRef?.current?.clipboard.dangerouslyPasteHTML(
				position ? position?.index : 0,
				`<placeholder${holderInsert.id} className={placeholderClass${
					holderInsert.id
				}} contenteditable="false">${
					empty ? holderInsert.value : `{{{${holderInsert.name}}}}`
				}</placeholder${holderInsert.id}>`,
				'user'
			);
			updatePlaceholderClass({
				id: holderInsert.id as number,
				owner:
					holderInsert.fillingType === PlaceholderFill.CREATOR ? true : false,
				recipientKey: holderInsert.externalRecipientKey,
			});
		} else {
			let tag = '';
			switch (holderInsert.specialType) {
				case SpecialType.DATE:
					const date = holderInsert.value ? parseDate(holderInsert.value) : '';
					tag = `<date${holderInsert.id} className={dateClass${
						holderInsert.id
					}} contenteditable="false">${
						date ? date : `{{{${holderInsert.name}}}}`
					}</date${holderInsert.id}>`;
					break;

				case SpecialType.FULLNAME:
					tag = `<fullname${holderInsert.id} className={fullnameClass${
						holderInsert.id
					}} contenteditable="false">${
						holderInsert.value
							? holderInsert.value
							: `{{{${holderInsert.name}}}}`
					}</fullname${holderInsert.id}>`;
					break;

				case SpecialType.EMAIL:
					tag = `<email${holderInsert.id} className={emailClass${
						holderInsert.id
					}} contenteditable="false">${
						holderInsert.value
							? holderInsert.value
							: `{{{${holderInsert.name}}}}`
					}</email${holderInsert.id}>`;
					break;

				case SpecialType.SIGN:
					tag = `<sign${holderInsert.id} className={signClass${
						holderInsert.id
					}} contenteditable="false">${`{{{${holderInsert.name}}}}`}</sign${
						holderInsert.id
					}>`;
					break;

				case SpecialType.INITIALS:
					tag = `<initials${holderInsert.id} className={initialsClass${
						holderInsert.id
					}} contenteditable="false">${
						holderInsert.value
							? `<img
									alt='initials'
									src={${holderInsert.value}} 
									style={{ objectFit: 'contain' }}
								/>`
							: `{{{${holderInsert.name}}}}`
					}</initials${holderInsert.id}>`;
					break;
			}
			quillRef?.current?.clipboard.dangerouslyPasteHTML(
				position ? position?.index : 0,
				tag,
				'user'
			);
			updatePlaceholderClass({
				id: holderInsert.id as number,
				specialType: holderInsert.specialType,
				owner:
					holderInsert.fillingType === PlaceholderFill.CREATOR ? true : false,
				recipientKey: holderInsert.externalRecipientKey,
			});
		}
	};
	const handleDeletePlaceholder = async (id: number) => {
		setDelLoad(true);
		let placeholdersTmp = [...placeholder];
		const holderIndex = placeholdersTmp.findIndex(
			(holder) => holder.id?.toString() === id.toString()
		);
		let body = {
			data: {
				action: Action.DELETE,
				clientKey: !token ? clientKey : undefined,
				contractKey: contractKey,
				placeholder: {
					placeholderKey: placeholdersTmp[holderIndex].placeholderKey,
				},
			},
		};
		deleteTag(id);
		placeholdersTmp.splice(holderIndex, 1);
		setPlaceholder(placeholdersTmp);
		await axios
			.post(BASE_URL + ApiEntity.PLACEHOLDER, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
					Authorization: token ? `Bearer ${token}` : undefined,
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				handleChangeSelect(selectedOtion, placeholdersTmp);
				getPlaceholders(false);
				setDelLoad(false);
			})
			.catch((error) => {
				setNotification({
					text:
						error.response && error.response.data && error.response.data.message
							? error.response.data.message
							: error.message,
				});
				setDelLoad(false);
			});
	};
	const handleChange = (e: any, placeholderChange: Placeholder) => {
		if (placeholderChange.isSpecial || readonlyCurrent.current) {
			return;
		}
		let placeholderTmp = [...placeholder];
		const holderIndex = placeholderTmp.findIndex(
			(holder) => holder.id?.toString() === placeholderChange.id?.toString()
		);
		switch (e.target.id) {
			case 'PlaceholderName':
				placeholderTmp[holderIndex].name = e.target.value;

				break;

			case 'PlaceholderValue':
				placeholderTmp[holderIndex].value = e.target.value;

				break;
		}
		setPlaceholder(placeholderTmp);
	};
	const handleBlur = async (e: any, placeholderChange: Placeholder) => {
		if (placeholderChange.isSpecial || readonlyCurrent.current) {
			return;
		}
		switch (e.target.id) {
			case 'PlaceholderName':
				let placeholdersTmp = [...placeholder];
				const holderIndex = placeholdersTmp.findIndex(
					(holder) => holder.id?.toString() === placeholderChange.id?.toString()
				);
				let body = {
					data: {
						action: Action.UPDATE,
						clientKey: !token ? clientKey : undefined,
						contractKey: contractKey,
						placeholder: {
							placeholderKey: placeholdersTmp[holderIndex].placeholderKey,
							name: placeholdersTmp[holderIndex].name,
						},
					},
				};
				await axios
					.post(BASE_URL + ApiEntity.PLACEHOLDER, body, {
						headers: {
							Accept: 'application/vnd.api+json',
							'Content-Type': 'application/vnd.api+json',
							'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
							Authorization: token ? `Bearer ${token}` : undefined,
						},
						responseType: 'json',
					})
					.then((payload: any) => {
						//console.log('PLACEHOLDER read', payload);
						// setRefreshPlaceholders(refreshPlaceholders + 1);
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
				break;

			case 'PlaceholderValue':
				changeValue(placeholderChange);
				break;
		}
	};
	const handleEnter = (placeholderChange: Placeholder) => {
		changeValue(placeholderChange);
	};
	const handleChangeFilling = async (e: any, id: number) => {
		// console.log('handleChangeFilling', e);

		let placeholderTmp = [...placeholder];
		const holderIndex = placeholderTmp.findIndex(
			(holder) => holder.id?.toString() === id.toString()
		);
		let body = {
			data: {
				action: Action.UPDATE,
				clientKey: !token ? clientKey : undefined,
				contractKey: contractKey,
				placeholder: {
					placeholderKey: placeholderTmp[holderIndex].placeholderKey,
					fillingType: 1,
					externalRecipientKey: '',
				},
			},
		};
		if (
			e.target.value.toString() === PlaceholderFill.NONE.toString() ||
			e.target.value.toString() === PlaceholderFill.CREATOR.toString() ||
			e.target.value.toString() === PlaceholderFill.ANY.toString()
		) {
			placeholderTmp[holderIndex].fillingType = e.target.value;
			body.data.placeholder.fillingType = e.target.value;
			placeholderTmp[holderIndex].externalRecipientKey = '';
			body.data.placeholder.externalRecipientKey = '';
			if (e.target.value.toString() === PlaceholderFill.CREATOR.toString()) {
				updatePlaceholderClass({
					id: placeholderTmp[holderIndex].id as number,
					owner: true,
				});
			} else {
				updatePlaceholderClass({
					id: placeholderTmp[holderIndex].id as number,
					owner: false,
				});
			}
		} else {
			placeholderTmp[holderIndex].fillingType = PlaceholderFill.SPECIFIC;
			placeholderTmp[holderIndex].externalRecipientKey = e.target.value;
			body.data.placeholder.fillingType = PlaceholderFill.SPECIFIC;
			body.data.placeholder.externalRecipientKey = e.target.value;

			updatePlaceholderClass({
				id: placeholderTmp[holderIndex].id as number,
				owner: false,
				recipientKey: e.target.value,
			});
		}
		setPlaceholder(placeholderTmp);
		await axios
			.post(BASE_URL + ApiEntity.PLACEHOLDER, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
					Authorization: token ? `Bearer ${token}` : undefined,
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				getPlaceholders(false);
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
	const handleChangeSelect = (e: any, placeholderUpdate?: Placeholder[]) => {
		const placeholderTmp = placeholderUpdate || placeholder;
		switch (e) {
			case '0':
				setSelectedPlaceholders(placeholderTmp);
				break;
			case '1':
				const placeholdersOwner = placeholderTmp.filter(
					(holder) =>
						holder.fillingType?.toString() ===
						PlaceholderFill.CREATOR.toString()
				);
				setSelectedPlaceholders(placeholdersOwner);
				break;
			default:
				const placeholdersFilter = placeholderTmp.filter(
					(holder) => holder.externalRecipientKey === e
				);
				setSelectedPlaceholders(placeholdersFilter);
				break;
		}
		setSelectedOtion(e);
	};
	return (
		<Card
			loading={placeholderLoad || continueLoad}
			key={`PlaceholderBlock${contractKey}`}
		>
			<Space direction='vertical' size={16} style={{ display: 'flex' }}>
				<Space direction='vertical' size={2}>
					<Space>
						<Title level={4} style={{ margin: '0 0 0 0' }}>
							Placeholders
						</Title>
						<Tooltip title='Close sidebar.'>
							<Button
								size='small'
								icon={<FontAwesomeIcon icon={faClose} />}
								onClick={() => {
									setPlaceholderVisible(!placeholderVisible);
								}}
							/>
						</Tooltip>
					</Space>
					<Text type='secondary'>Add reusable text to the content.</Text>
				</Space>
				<Select
					defaultValue='All placeholders'
					style={{ width: '100%' }}
					onChange={(e) => handleChangeSelect(e)}
					options={selectPlaceholder}
				/>
				{selectedPlaceholders &&
					selectedPlaceholders.map((holder) => {
						return (
							<Space
								className='ph-style'
								draggable={!readonlyCurrent.current}
								direction='vertical'
								size={2}
								style={{ display: 'flex' }}
								key={holder.placeholderKey}
							>
								<Row wrap={false} align={'middle'}>
									<Col>
										<Tooltip title='Click to insert the placeholder at the current cursor position in the text.'>
											<div>
												<Button
													disabled={readonlyCurrent.current}
													style={{ background: `${holder.color}` }}
													size='small'
													type='text'
													icon={
														<FontAwesomeIcon
															icon={
																holder.view?.toString() !==
																	PlaceholderView.SIGNATURE.toString() &&
																holder.specialType?.toString() !==
																	SpecialType.SIGN.toString()
																	? faFont
																	: faSignature
															}
															size='sm'
															onClick={() => {
																handleInsertPlaceholder(holder);
															}}
														/>
													}
												/>
											</div>
										</Tooltip>
									</Col>
									<Col>
										<Input
											readOnly={
												holder.view?.toString() !==
													PlaceholderView.SIGNATURE.toString() &&
												!holder.isSpecial &&
												!readonlyCurrent.current
													? false
													: true
											}
											id='PlaceholderName'
											placeholder='Enter placeholder name'
											variant='borderless'
											value={holder.name}
											onChange={(e: any) => handleChange(e, holder)}
											onBlur={(e: any) => handleBlur(e, holder)}
										/>
									</Col>
									<Col flex={'auto'}></Col>
									{holder.view?.toString() !==
										PlaceholderView.SIGNATURE.toString() &&
										!holder.isSpecial && (
											<Col flex='24px'>
												<Popover
													content={
														<Space
															direction='vertical'
															style={{ display: 'flex' }}
														>
															<Space>
																<Text type='secondary'>
																	Who fills in this field:
																</Text>
																<Tooltip title='Set who fills in this field: a contract owner when creating a contract from this template or an external recipient when opening a contract.'>
																	<div>
																		<Button
																			disabled={readonlyCurrent.current}
																			size='small'
																			icon={
																				<FontAwesomeIcon
																					icon={faCircleQuestion}
																					size='xs'
																				/>
																			}
																			type='text'
																		></Button>
																	</div>
																</Tooltip>
															</Space>
															<Radio.Group
																size='small'
																value={
																	holder.fillingType &&
																	holder.fillingType.toString() !==
																		PlaceholderFill.SPECIFIC.toString()
																		? holder.fillingType?.toString()
																		: holder.fillingType &&
																		  holder.fillingType.toString() ===
																				PlaceholderFill.SPECIFIC.toString() &&
																		  holder.externalRecipientKey &&
																		  placeholderRecipients.current &&
																		  placeholderRecipients.current.length > 0
																		? placeholderRecipients.current.find(
																				(placeholderRecipient) =>
																					placeholderRecipient.recipientKey?.includes(
																						holder.externalRecipientKey as string
																					)
																		  )?.recipientKey
																		: '1'
																}
																onChange={(e: any) =>
																	handleChangeFilling(e, holder.id as number)
																}
															>
																<Space direction='vertical'>
																	<Radio
																		value={PlaceholderFill.NONE.toString()}
																	>
																		None
																	</Radio>
																	<Radio
																		value={PlaceholderFill.CREATOR.toString()}
																	>
																		Contract owner
																	</Radio>
																	{placeholderRecipients.current &&
																		placeholderRecipients.current.length > 0 &&
																		placeholderRecipients.current.map(
																			(placeholderRecipient) => {
																				return (
																					<Radio
																						value={
																							placeholderRecipient.recipientKey
																						}
																					>
																						{placeholderRecipient.fullname}
																					</Radio>
																				);
																			}
																		)}
																</Space>
															</Radio.Group>
															<Divider style={{ margin: 0 }} />
															<Button
																disabled={readonlyCurrent.current}
																loading={delLoad}
																block
																danger
																type='text'
																onClick={() => {
																	handleDeletePlaceholder(holder.id as number);
																}}
															>
																Delete
															</Button>
														</Space>
													}
													trigger='click'
												>
													<div>
														<Button
															disabled={readonlyCurrent.current}
															size='small'
															type='text'
															icon={<FontAwesomeIcon icon={faGear} size='xs' />}
														/>
													</div>
												</Popover>
											</Col>
										)}
								</Row>
								{holder.view?.toString() !==
									PlaceholderView.SIGNATURE.toString() &&
									!holder.isSpecial && (
										<Input
											readOnly={readonlyCurrent.current}
											id='PlaceholderValue'
											placeholder='Enter value'
											value={holder.value}
											onChange={(e: any) => handleChange(e, holder)}
											onBlur={(e: any) => handleBlur(e, holder)}
											onPressEnter={() => handleEnter(holder)}
										/>
									)}
							</Space>
						);
					})}

				<Space direction='vertical' size={2} style={{ display: 'flex' }}>
					<Button
						disabled={readonlyCurrent.current}
						block
						type='dashed'
						onClick={handleAddPlaceholder}
					>
						Add placeholder
					</Button>
				</Space>
			</Space>
		</Card>
	);
};
