import React, { useEffect, useRef, useState } from 'react';
// import './editor.css';
import QuillNamespace, { Quill } from 'quill';
import QuillBetterTable from 'quill-better-table';
import { useDispatch, useSelector } from 'react-redux';
// import { useDebouncedCallback } from 'use-debounce';
// import dayjs from 'dayjs';
// import utc from 'dayjs/plugin/utc';
// import {
// 	contractSelector,
// 	contractSignSelector,
// 	contractValueSelector,
// 	createContractSelector,
// 	setContractSign,
// 	setContractValue,
// 	setNotification,
// 	setSign,
// 	signSelector,
// } from 'slices/app-slice';
import { Space, Card, Typography } from 'antd';
// import { ContractValue, TimelineItems } from 'config/types';
// import {
// 	useCheckContractValueMutation,
// 	useSaveContractValueMutation,
// } from 'slices/contract-api-slice';
// import { useGetContractSignsByControlLinkQuery } from 'slices/contract-sign-api-slice';
// import { useSendEmailsSignByControlLinkMutation } from 'slices/contract-email-api-slice';
// import { useHistory } from 'react-router-dom';
// import { useAuth } from '@clerk/clerk-react';

// type Props = {
// 	stage: TimelineItems;
// };
QuillNamespace.register(
	{
		'modules/better-table': QuillBetterTable,
	},
	true
);

const Editor = () => {
	// dayjs.extend(utc);
	// const dispatch = useDispatch();
	// const history = useHistory();
	// const contract = useSelector(contractSelector);
	// const contractValue = useSelector(contractValueSelector);
	// const sign = useSelector(signSelector);
	// const contractSign = useSelector(contractSignSelector);
	// const createContract = useSelector(createContractSelector);
	// const templateLoading = useSelector(loadingSelector);
	// const templateText = useSelector(templateTextSelector);
	// const textState = useSelector(textSelector);
	// const [spinLoad, setSpinLoad] = useState(true);
	const { Title, Text } = Typography;
	const quillRef = useRef<Quill>();
	// const { isLoaded, userId, sessionId, getToken } = useAuth();

	// const [saveValue] = useSaveContractValueMutation();
	// const [checkContractValue] = useCheckContractValueMutation();
	// const [sendEmail] = useSendEmailsSignByControlLinkMutation();

	// const { data: contractSignsData } = useGetContractSignsByControlLinkQuery(
	// 	{ controlLink: contract.controlLink, userId: userId },
	// 	{ skip: contract.controlLink ? false : true }
	// );

	// console.log('EditorBlock');
	useEffect(() => {
		quillRef.current = new QuillNamespace('#editor-container', {
			modules: {
				toolbar: {
					container: [
						['bold', 'italic', 'underline', 'strike', 'blockquote'],
						[{ color: [] }, { background: [] }],
						[
							{ list: 'ordered' },
							{ list: 'bullet' },
							{ indent: '-1' },
							{ indent: '+1' },
						],
						[{ align: [] }],
						['link', 'image', 'table'],
						['blockquote', 'code-block'],
						[{ direction: 'rtl' }],
					],
					handlers: {
						table: addTable,
					},
				},
				table: false, // disable table module
				'better-table': {
					operationMenu: {
						items: {
							unmergeCells: {
								text: 'Unmerge',
							},
						},
					},
				},
				keyboard: {
					bindings: QuillBetterTable.keyboardBindings,
				},
				history: {
					delay: 5000,
					maxStack: 5000,
					userOnly: true,
				},
			},
			scrollingContainer: 'body',
			theme: 'bubble',
		});

		quillRef.current
			.getModule('toolbar')
			.container.addEventListener(
				'mousedown',
				(e: { preventDefault: () => void; stopPropagation: () => void }) => {
					e.preventDefault();
					e.stopPropagation();
				}
			);

		quillRef.current.on(
			'text-change',
			function (delta: any, oldDelta: any, source: any) {
				if (source === 'user') {
					// handleChange(quillRef.current.root.innerHTML);
				}
			}
		);
	}, []);

	// useEffect(() => {
	// 	if (sign && contractSign) {
	// 		let textTmp =
	// 			quillRef.current.root.innerHTML +
	// 			`<br></br><p><img src='${sign}' alt="signature" /></p>`;
	// 		textTmp = textTmp + `<p>Name: ${contractSign.fullName}</p>`;
	// 		textTmp = textTmp + `<p>Email: ${contractSign.email}</p>`;
	// 		textTmp =
	// 			textTmp +
	// 			`<p>Timestamp: ${dayjs(contractSign.createTime).format(
	// 				'YYYY-MM-DD HH:mm:ss'
	// 			)} GMT</p>`;

	// 		quillRef.current.clipboard.dangerouslyPasteHTML(textTmp);

	// 		const releventDiv = document.getElementById('part-3');
	// 		releventDiv.scrollIntoView({ behavior: 'auto' });
	// 		dispatch(setSign(null));
	// 		dispatch(setContractSign({}));
	// 		quillRef.current.enable(false);
	// 		sendPdf(textTmp);
	// 	}
	// }, [sign]);

	// useEffect(() => {
	// 	if (contract && contract.controlLink && contract.contractValue) {
	// 		quillRef.current.clipboard.dangerouslyPasteHTML(contract.contractValue);
	// 		setSpinLoad(false);
	// 		if (createContract) {
	// 			const releventDiv = document.getElementById('part-3');
	// 			releventDiv.scrollIntoView({ behavior: 'auto' });
	// 		}
	// 	}
	// }, [contract]);

	// useEffect(() => {
	// 	if (contractSignsData && contractSignsData.length > 0) {
	// 		quillRef.current.enable(false);
	// 	}
	// }, [contractSignsData]);

	// const sendPdf = async (textSend?: any) => {
	// 	debugger;
	// 	let textTmp = '';
	// 	if (typeof textSend === 'string') {
	// 		textTmp = textSend;
	// 	} else {
	// 		textTmp = quillRef.current.root.innerHTML;
	// 	}
	// 	await saveValue({
	// 		controlLink: contract.controlLink,
	// 		contractValue: textTmp,
	// 	})
	// 		.unwrap()
	// 		.then((payload) => {
	// 			dispatch(
	// 				setContractValue({
	// 					contractValue: payload.contractValue,
	// 					changeTime: payload.changeTime,
	// 				})
	// 			);
	// 		});
	// 	await sendEmail({
	// 		shareLink: contract.shareLink,
	// 	});
	// };
	const addTable = () => {
		debugger;
		(quillRef.current as QuillNamespace)
			.getModule('better-table')
			.insertTable(3, 3);
	};
	// const handleChange = useDebouncedCallback(
	// 	async (content: string) => {
	// 		let changed = false;
	// 		let contactValueTmp: ContractValue = {};
	// 		await checkContractValue({
	// 			controlLink: contract.controlLink,
	// 			changeTime: contractValue.changeTime,
	// 		})
	// 			.unwrap()
	// 			.then((payload) => {
	// 				changed = payload && payload.changed ? payload.changed : false;
	// 				if (payload && payload.contractValue) {
	// 					contactValueTmp.changeTime = payload.changeTime;
	// 					contactValueTmp.contractValue = payload.contractValue;
	// 				}
	// 			});
	// 		if (!changed) {
	// 			await saveValue({
	// 				controlLink: contract.controlLink,
	// 				contractValue: content,
	// 			})
	// 				.unwrap()
	// 				.then((payload) => {
	// 					contactValueTmp.changeTime =
	// 						payload && payload.changeTime
	// 							? payload.changeTime
	// 							: (new Date() as Date);
	// 					contactValueTmp.contractValue =
	// 						payload && payload.contractValue ? payload.contractValue : '';
	// 				});
	// 			dispatch(
	// 				setContractValue({
	// 					contractValue: contactValueTmp.contractValue,
	// 					changeTime: contactValueTmp.changeTime,
	// 				})
	// 			);
	// 		} else {
	// 			quillRef.current.enable(false);
	// 			dispatch(
	// 				setContractValue({
	// 					contractValue: contactValueTmp.contractValue,
	// 					changeTime: contactValueTmp.changeTime,
	// 				})
	// 			);
	// 			dispatch(
	// 				setNotification({
	// 					text: 'Contract updated. You must reload your page',
	// 				})
	// 			);
	// 			quillRef.current.clipboard.dangerouslyPasteHTML(
	// 				contactValueTmp.contractValue
	// 			);
	// 		}
	// 	},
	// 	5000,
	// 	// The maximum time func is allowed to be delayed before it's invoked:
	// 	{ maxWait: 5000 }
	// );

	return (
		<Card
			// style={{ opacity: stage.opacity }}
			bordered={true}
			id='part-2'
		>
			<Space direction='vertical' size={16} style={{ display: 'flex' }}>
				<Space direction='vertical' size={2}>
					<Title level={4} style={{ margin: '0 0 0 0' }}>
						Review your document, highlight text to see options
					</Title>
					<Text type='secondary'>
						The green text is where you may want to replace it with your own
						text.
					</Text>
				</Space>
				<div id='scroll-container'>
					<div id='editor-container' />
				</div>
			</Space>
		</Card>
	);
};
export default Editor;
