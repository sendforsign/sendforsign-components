import React, { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faCopy, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, Tooltip, Row, Col, Input, Segmented, Spin } from 'antd';

import { SegmentedLabeledOption } from 'antd/es/segmented';
import { ApiEntity, ShareLinkView } from '../../../config/enum';
import { useContractEditorContext } from '../contract-editor-context';
import axios from 'axios';
import { BASE_URL, SHARE_URL } from '../../../config/config';
//env.config();

type Props = {
	controlLink: string;
	id: number;
	shareLink: string;
	view: ShareLinkView;
};

export const ShareLinkLine = ({ controlLink, id, shareLink, view }: Props) => {
	const {
		apiKey,
		setNotification,
		clientKey,
		refreshShareLink,
		setRefreshShareLink,
	} = useContractEditorContext();
	const options = [
		{ label: 'Sign', value: ShareLinkView.SIGN },
		{ label: 'Approve', value: ShareLinkView.APPROVE },
		{ label: 'View', value: ShareLinkView.VIEW },
		{
			value: ShareLinkView.LOCK,
			icon: <FontAwesomeIcon icon={faLock} />,
		},
	];
	const [changeSpin, setChangeSpin] = useState(false);
	const [deleteSpin, setDeleteSpin] = useState(false);
	const shareLinkFull = `${SHARE_URL}/sharing/${shareLink}`;

	const handleClick = () => {
		setNotification({
			text: 'Sharing link copied. Share the link with recipients for reviewing, signing, and more.',
		});
	};
	const handleDelete = async () => {
		setDeleteSpin(true);
		const body = {
			clientKey: clientKey,
			contractKey: controlLink,
			id: id,
		};
		await axios
			.delete(BASE_URL + ApiEntity.CONTRACT_SHARE_LINK, {
				data: body,
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': apiKey, //process.env.SENDFORSIGN_API_KEY,
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				//console.log('handleDelete read', payload);
				setRefreshShareLink(refreshShareLink + 1);
				setDeleteSpin(false);
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
	const handleChange = async (e: any) => {
		setChangeSpin(true);
		const body = {
			clientKey: clientKey,
			contractKey: controlLink,
			shareLink: shareLink,
			id: id,
			view: e,
		};
		await axios
			.put(BASE_URL + ApiEntity.CONTRACT_SHARE_LINK, body, {
				headers: {
					Accept: 'application/vnd.api+json',
					'Content-Type': 'application/vnd.api+json',
					'x-sendforsign-key': apiKey, //process.env.SENDFORSIGN_API_KEY,
				},
				responseType: 'json',
			})
			.then((payload: any) => {
				//console.log('handleChange read', payload);
				setRefreshShareLink(refreshShareLink + 1);
				setChangeSpin(false);
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
		<Row gutter={8} align='middle'>
			<Col flex={'auto'}>
				<Tooltip title='Copy and share this link with recipients.'>
					<div>
						<Input
							id={`shareLink${id}`}
							value={shareLinkFull}
							readOnly={true}
							suffix={
								<>
									{id.toString() !== '1' && (
										<Tooltip title='Delete link.'>
											<div>
												<Button
													type='text'
													size='small'
													icon={<FontAwesomeIcon icon={faTrash} />}
													onClick={handleDelete}
													loading={deleteSpin}
												/>
											</div>
										</Tooltip>
									)}
									<CopyToClipboard
										text={shareLinkFull}
										children={
											<Tooltip title='Copy to clipboard.'>
												<div>
													<Button
														type='text'
														size='small'
														icon={<FontAwesomeIcon icon={faCopy} />}
														onClick={handleClick}
													/>
												</div>
											</Tooltip>
										}
									/>
								</>
							}
						/>
					</div>
				</Tooltip>
			</Col>
			<Col>
				<Spin spinning={changeSpin}>
					<Tooltip title='Set what others can do via the link or lock so no one can open it.'>
						<div>
							<Segmented
								options={options}
								value={view}
								onChange={handleChange}
							/>
						</div>
					</Tooltip>
				</Spin>
			</Col>
		</Row>
	);
};
