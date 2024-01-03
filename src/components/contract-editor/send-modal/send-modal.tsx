import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
  Space,
  Card,
  Typography,
  Button,
  Input,
  Modal,
  Tooltip,
  Spin,
  Segmented,
  InputNumber,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faCopy, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useContractEditorContext } from "../contract-editor-context";
import { BASE_URL } from "../../../config/config";
import { ApiEntity, ContractAction } from "../../../config/enum";
import axios from "axios";

export const SendModal = () => {
  const {
    sendModal,
    setSendModal,
    contractKey,
    clientKey,
    setSign,
    setResultModal,
    refreshSign,
    setRefreshSign,
    setContractSign,
  } = useContractEditorContext();
  const [signLoad, setSignLoad] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [signDisable, setSignDisable] = useState(true);
  const { Title, Text } = Typography;
  const padRef = useRef(null);

  const handleOk = async () => {
    if (fullName && email) {
      setSignLoad(true);
      let canvas: any = padRef?.current?.toDataURL();
      const body = {
        clientKey: clientKey,
        contractKey: contractKey,
        fullName: fullName,
        email: email,
        owner: false,
        base64: canvas,
      };
      await axios
        .post(BASE_URL + ApiEntity.CONTRACT_SIGN, body, {
          headers: {
            Accept: "application/vnd.api+json",
            "Content-Type": "application/vnd.api+json",
            "x-sendforsign-key": "re_api_key", //process.env.SENDFORSIGN_API_KEY,
          },
          responseType: "json",
        })
        .then((payload) => {
          console.log("getContract read", payload);
          setContractSign(payload.data);
          setSign(canvas);
          setSignLoad(false);
          handleCancel();
          setResultModal({ open: true, action: ContractAction.SIGN });
          setRefreshSign(refreshSign + 1);
        });
    }
  };
  const handleChange = (e: any) => {
    switch (e.target.id) {
      case "FullName":
        setFullName(e.target.value);
        // fullNameRef.current = e.target.value;
        break;

      case "Email":
        setEmail(e.target.value);
        // emailRef.current = e.target.value;
        break;
    }
  };
  const handleClear = () => {
    padRef?.current?.clear();
    setSignDisable(true);
  };
  const handleBegin = () => {
    setSignDisable(false);
  };
  const handleCancel = () => {
    setFullName("");
    setEmail("");
    handleClear();
    setSendModal(false);
  };

  return (
    <Modal
      title="Send this document"
      open={sendModal}
      centered
      onOk={handleOk}
      onCancel={handleCancel}
      footer={
        <>
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>
          <Button key="submit" type="primary" loading={signLoad}>
            Send to 2 recipients
          </Button>
        </>
      }
    >
      <Space
        direction="vertical"
        size="large"
        style={{ display: "flex", margin: "32px 0 32px 0" }}
      >
        <Card>
          <Space direction="vertical" size={16} style={{ display: "flex" }}>
            <Space direction="vertical" size={2}>
              <Title level={5} style={{ margin: "0 0 0 0" }}>
                Enter the recipient's information.
              </Title>
              <Text type="secondary">
                We will send the document to this recipient.
              </Text>
            </Space>
            <Input
              id="FullName"
              placeholder="Recipient's full name"
              value={fullName}
              onChange={handleChange}
            />
            <Input
              id="Email"
              placeholder="Recipient's email"
              value={email}
              onChange={handleChange}
            />
            <Input
              id="CustomMessage"
              placeholder="Private note; leave empty for the default message"
            />
            <Space>
              <Spin spinning={false}>
                <Tooltip title="Set what recipient needs to do with the document or lock so they can't open it.">
                  <Segmented options={["Sign", "Approve", "View", "Lock"]} />
                </Tooltip>
              </Spin>
              <Tooltip title="Set signing order.">
                <InputNumber min={1} max={10} defaultValue={1} />
              </Tooltip>
            </Space>
          </Space>
        </Card>

        <Card>
          <Space direction="vertical" size={16} style={{ display: "flex" }}>
            <Space direction="vertical" size={2}>
              <Title level={5} style={{ margin: "0 0 0 0" }}>
                Enter the recipient's information.
              </Title>
              <Text type="secondary">
                We will send the document to this recipient.
              </Text>
            </Space>
            <Input
              id="FullName"
              placeholder="Recipient's full name"
              value={fullName}
              onChange={handleChange}
            />
            <Input
              id="Email"
              placeholder="Recipient's email"
              value={email}
              onChange={handleChange}
            />
            <Input
              id="CustomMessage"
              placeholder="Private note; leave empty for the default message"
            />
            <Space>
              <Spin spinning={false}>
                <Tooltip title="Set what recipient needs to do with the document or lock so they can't open it.">
                  <Segmented options={["Sign", "Approve", "View", "Lock"]} />
                </Tooltip>
              </Spin>
              <Tooltip title="Set signing order.">
                <InputNumber min={1} max={10} defaultValue={1} />
              </Tooltip>
              <Tooltip title="Delete recipient.">
                <Button type="text" icon={<FontAwesomeIcon icon={faTrash} />} />
              </Tooltip>
            </Space>
          </Space>
        </Card>
        <Button type="dashed" block>
          Add recipient
        </Button>
      </Space>
    </Modal>
  );
};
