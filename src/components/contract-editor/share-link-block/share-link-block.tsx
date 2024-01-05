import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Tooltip, Card, Space, Typography } from "antd";
import { ApiEntity, ShareLinkView } from "../../../config/enum";
import { useContractEditorContext } from "../contract-editor-context";
import axios from "axios";
import { BASE_URL } from "../../../config/config";
import {
  faPaperPlane,
  faPlane,
  faSignature,
  faSquarePlus,
  faStamp,
} from "@fortawesome/free-solid-svg-icons";
import { ShareLinkLine } from "../share-link-line/share-link-line";
import { ContractShareLink } from "../../../config/types";

export const ShareLinkBlock = () => {
  const {
    contractKey,
    clientKey,
    setSignModal,
    setSendModal,
    setApproveModal,
    refreshShareLink,
    setRefreshShareLink,
  } = useContractEditorContext();
  // if (!process.env.SENDFORSIGN_API_KEY) {
  // 	console.log(
  // 		'process.env.SENDFORSIGN_API_KEY',
  // 		process.env.SENDFORSIGN_API_KEY
  // 	);
  // }
  // const { setSignModal } = useContractEditorContext();

  // const { setSignModal } = useContext(EditorContext) as TEditorContextType;

  const [shareLinks, setShareLinks] = useState([]);
  const [addBtnSpin, setAddBtnSpin] = useState(false);
  const { Title, Text } = Typography;

  useEffect(() => {
    // debugger;
    if (contractKey) {
      const getShareLinks = async () => {
        let url = `${BASE_URL}${ApiEntity.CONTRACT_SHARE_LINK}?contractKey=${contractKey}&clientKey=${clientKey}`;
        await axios
          .get(url, {
            headers: {
              Accept: "application/vnd.api+json",
              "Content-Type": "application/vnd.api+json",
              "x-sendforsign-key": "re_api_key", //process.env.SENDFORSIGN_API_KEY,
            },
            responseType: "json",
          })
          .then((payload) => {
            console.log("getShareLinks read", payload);
            setShareLinks(payload.data);
          });
      };
      getShareLinks();
    }
  }, [contractKey, refreshShareLink]);

  const handleAddShareLink = async () => {
    setAddBtnSpin(true);
    const body = {
      clientKey: clientKey,
      contractKey: contractKey,
    };
    await axios
      .post(BASE_URL + ApiEntity.CONTRACT_SHARE_LINK, body, {
        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          "x-sendforsign-key": "re_api_key", //process.env.SENDFORSIGN_API_KEY,
        },
        responseType: "json",
      })
      .then((payload) => {
        console.log("handleAddShareLink read", payload);
        setRefreshShareLink(refreshShareLink + 1);
        setAddBtnSpin(false);
      });
  };
  return (
    <Space direction="vertical" size={16} style={{ display: "flex" }}>
      <Card>
        <Space direction="vertical" size={16} style={{ display: "flex" }}>
          <Space direction="vertical" size={2} style={{ maxWidth: "600px" }}>
            <Title level={4} style={{ margin: "0 0 0 0" }}>
              Share, sign, approve, and more
            </Title>
            <Text type="secondary">
              See what's possible to do with your document.
            </Text>
          </Space>
          {shareLinks &&
            shareLinks.map((shareLine: ContractShareLink) => {
              return (
                <ShareLinkLine
                  controlLink={contractKey ? contractKey : ""}
                  shareLink={shareLine.shareLink ? shareLine.shareLink : ""}
                  id={shareLine.id ? shareLine.id : 0}
                  view={shareLine.view ? shareLine.view : ShareLinkView.SIGN}
                />
              );
            })}

          <Space>
            <Tooltip title="Share the document with recipients.">
              <Button
                id="sendContract"
                type="default"
                icon={<FontAwesomeIcon icon={faPaperPlane} />}
                onClick={() => {
                  setSendModal(true);
                }}
                // disabled={signDisable}
                // loading={signSpin}
              >
                Send
              </Button>
            </Tooltip>
            <Tooltip title="Sign the document from your side.">
              <Button
                id="signContract"
                type="default"
                icon={<FontAwesomeIcon icon={faSignature} />}
                onClick={() => {
                  setSignModal(true);
                }}
                // disabled={signDisable}
                // loading={signSpin}
              >
                Sign
              </Button>
            </Tooltip>
            <Tooltip title="Approve the document from your side.">
              <Button
                id="ApproveContract"
                type="default"
                icon={<FontAwesomeIcon icon={faStamp} />}
                onClick={() => {
                  setApproveModal(true);
                }}
                // disabled={approveDisable}
                // loading={approveSpin}
                // disabled={disableSign}
              >
                Approve
              </Button>
            </Tooltip>
            <Tooltip title="Add another link to this contract.">
              <Button
                icon={<FontAwesomeIcon icon={faSquarePlus} />}
                onClick={handleAddShareLink}
                loading={addBtnSpin}
              ></Button>
            </Tooltip>
          </Space>
        </Space>
      </Card>
    </Space>
  );
};
