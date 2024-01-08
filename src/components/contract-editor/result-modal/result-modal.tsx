import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Space, Modal, Button, Result } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faSignature,
  faStamp,
} from "@fortawesome/free-solid-svg-icons";
import { useContractEditorContext } from "../contract-editor-context";
import { ContractAction } from "../../../config/enum";

export const ResultModal = () => {
  const { resultModal, setResultModal } = useContractEditorContext();

  const handleCancel = () => {
    setResultModal({ open: false, action: "" });
  };
  return (
    <Modal
      open={resultModal.open}
      centered
      onCancel={handleCancel}
      closable={false}
      footer={<></>}
    >
      <Space direction="vertical" size="large" style={{ display: "flex" }}>
        <Result
          icon={
            resultModal.action === ContractAction.SIGN ? (
              <FontAwesomeIcon icon={faSignature} size="4x" />
            ) : resultModal.action === ContractAction.APPROVE ? (
              <FontAwesomeIcon icon={faStamp} size="4x" />
            ) : (
              <FontAwesomeIcon icon={faPaperPlane} size="4x" />
            )
          }
          title={
            resultModal.action === ContractAction.SIGN
              ? "Document signed"
              : resultModal.action === ContractAction.APPROVE
              ? "Document approved"
              : "Document sent"
          }
          subTitle={
            resultModal.action === ContractAction.SIGN
              ? "Every signatory will receive a signed copy via email."
              : resultModal.action === ContractAction.APPROVE
              ? "Every approver will get an email notification."
              : "The recipients will receive a notification by email."
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
