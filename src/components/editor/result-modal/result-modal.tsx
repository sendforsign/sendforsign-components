import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Space, Modal, Button, Result } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignature, faStamp } from '@fortawesome/free-solid-svg-icons';
import { useEditorContext } from '../editor-context';
import { ContractAction } from '../../../config/enum';

export const ResultModal = () => {
	const { resultModal, setResultModal } = useEditorContext();

	const handleCancel = () => {
		setResultModal({ open: false, action: '' });
	};
	return (
		<Modal
			open={resultModal.open}
			centered
			onCancel={handleCancel}
			closable={false}
			footer={<></>}
		>
			<Space direction='vertical' size='large' style={{ display: 'flex' }}>
				<Result
					icon={
						resultModal.action === ContractAction.SIGN ? (
							<FontAwesomeIcon icon={faSignature} size='4x' />
						) : (
							<FontAwesomeIcon icon={faStamp} size='4x' />
						)
					}
					title={
						resultModal.action === ContractAction.SIGN
							? 'Document signed'
							: 'Document approved'
					}
					subTitle={
						resultModal.action === ContractAction.SIGN
							? 'We will send the signed PDF to all signatories via email.'
							: 'We will send email confirmations to all approvers.'
					}
					extra={
						<Button key='back' onClick={handleCancel}>
							Close
						</Button>
					}
				/>
			</Space>
		</Modal>
	);
};
