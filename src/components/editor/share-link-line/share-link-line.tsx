import React, { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faCopy, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, Tooltip, Row, Col, Input, Segmented, Spin } from 'antd';

import { SegmentedLabeledOption } from 'antd/es/segmented';
import { ShareLinkView } from '../../../config/enum';
import { useEditorContext } from '../editor-context';

type Props = {
	controlLink: string;
	id: number;
	shareLink: string;
	view: ShareLinkView;
};

export const ShareLinkLine = ({ controlLink, id, shareLink, view }: Props) => {
	const { setNotification } = useEditorContext();
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
	const shareLinkFull = `${window.location.origin}/sharing/${shareLink}`;

	const handleClick = () => {
		setNotification({
			text: 'Sharing link copied. Share the link with recipients for reviewing, signing, and more.',
		});
	};
	const handleDelete = async () => {
		setDeleteSpin(true);
		// await deleteShareLink({
		// 	id: id,
		// 	shareLink: shareLink,
		// 	controlLink: controlLink,
		// }).then(() => {
		// 	setDeleteSpin(false);
		// });
	};
	const handleChange = async (e: any) => {
		setChangeSpin(true);
		// await updateShareLink({
		// 	id: id,
		// 	shareLink: shareLink,
		// 	controlLink: controlLink,
		// 	view: e,
		// }).then(() => {
		// 	setChangeSpin(false);
		// });
	};
	return (
		<Row gutter={8} align='middle'>
			<Col flex={'auto'}>
				<Tooltip title='Copy and share this link with recipients.'>
					<Input
						id={`shareLink${id}`}
						value={shareLinkFull}
						readOnly={true}
						suffix={
							<>
								{id.toString() !== '1' && (
									<Tooltip title='Delete link.'>
										<Button
											type='text'
											size='small'
											icon={<FontAwesomeIcon icon={faTrash} />}
											onClick={handleDelete}
											loading={deleteSpin}
										/>
									</Tooltip>
								)}
								<CopyToClipboard
									text={shareLinkFull}
									children={
										<Tooltip title='Copy to clipboard.'>
											<Button
												type='text'
												size='small'
												icon={<FontAwesomeIcon icon={faCopy} />}
												onClick={handleClick}
											/>
										</Tooltip>
									}
								/>
							</>
						}
					/>
				</Tooltip>
			</Col>
			<Col>
				<Spin spinning={changeSpin}>
					<Tooltip title='Set what others can do via the link or lock so no one can open it.'>
						<Segmented options={options} value={view} onChange={handleChange} />
					</Tooltip>
				</Spin>
			</Col>
		</Row>
	);
};
