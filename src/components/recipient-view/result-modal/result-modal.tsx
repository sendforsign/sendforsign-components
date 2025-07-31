import React from 'react';
import { Space, Modal, Button, Result, Typography } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignature, faStamp } from '@fortawesome/free-solid-svg-icons';
import { ContractAction } from '../../../config/enum';
import { useRecipientViewContext } from '../recipient-view-context';

const { Text, Link, Title } = Typography;

export const ResultModal = () => {
  const { resultModal, setResultModal } = useRecipientViewContext();

  const handleCancel = () => {
    setResultModal({ open: false, action: undefined });
  };
  return (
    <Modal
      open={resultModal.open}
      centered
      // onCancel={handleCancel}
      closable={false}
      footer={<></>}
    >
      <Space direction="vertical" size="large" style={{ display: 'flex' }}>
        <Result
          status="success"
          title={
            resultModal.action === ContractAction.SIGN
              ? <Title level={3}>You have signed this document</Title>
              : <Title level={3}>You have approved this document</Title>
          }
          subTitle={
            resultModal.action === ContractAction.SIGN
              ? <Text type='secondary' style={{ maxWidth: 200 }}>We will notify you and share the signed document once all parties have signed.</Text>
              : <Text type='secondary' style={{ maxWidth: 200 }}>We will notify the contract owner that this document has been reviewed and approved.</Text>
          }
          extra={
            <Button key="back" onClick={handleCancel}>
              Close
            </Button>
          }
        />
      </Space>
    </Modal>
  );
};
