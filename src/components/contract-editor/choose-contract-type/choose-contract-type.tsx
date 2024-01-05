import React, { useEffect, useState } from "react";
import { Space, Card, Typography, Button, Tag, Input } from "antd";
import axios from "axios";
import Segmented, { SegmentedLabeledOption } from "antd/es/segmented";
import { useContractEditorContext } from "../contract-editor-context";
import useSaveArrayBuffer from "../../../hooks/use-save-array-buffer";
import { Action, ApiEntity, ContractType } from "../../../config/enum";
import { BASE_URL } from "../../../config/config";
import { docx2html } from "../../../utils";
import { Template } from "../../../config/types";

export const ChooseContractType = () => {
  const {
    continueDisable,
    setContinueDisable,
    clientKey,
    userKey,
    setIsPdf,
    setCreateContract,
    contractName,
    setContractValue,
    setContractName,
    setContractType,
    setTemplateKey,
    continueLoad,
  } = useContractEditorContext();
  // if (!process.env.SENDFORSIGN_API_KEY) {
  // 	console.log(
  // 		'process.env.SENDFORSIGN_API_KEY',
  // 		process.env.SENDFORSIGN_API_KEY
  // 	);
  // }

  // const [contractSign, setContractSign] = useState<ContractSign>({});
  const [options, setOptions] = useState<SegmentedLabeledOption[]>([]);

  const [createDisable, setCreateDisable] = useState(true);
  const [fieldBlockVisible, setFieldBlockVisible] = useState(false);
  const [loadSegmented, setLoadSegmented] = useState(false);
  const [btnName, setBtnName] = useState("Create contract");
  const [pdfFileLoad, setPdfFileLoad] = useState(0);
  const { Title, Text } = Typography;
  const { setArrayBuffer, getArrayBuffer, clearArrayBuffer } =
    useSaveArrayBuffer();
  useEffect(() => {
    // clearArrayBuffer();

    const getTemplates = async () => {
      let body = {
        data: {
          action: Action.LIST,
          clientKey: clientKey,
          userKey: userKey,
        },
      };
      await axios
        .post(BASE_URL + ApiEntity.TEMPLATE, body, {
          headers: {
            Accept: "application/vnd.api+json",
            "Content-Type": "application/vnd.api+json",
            "x-sendforsign-key": "re_api_key", //process.env.SENDFORSIGN_API_KEY,
          },
          responseType: "json",
        })
        .then((payload) => {
          console.log("editor read", payload);
          let array: SegmentedLabeledOption[] = [];
          array.push({
            label: (
              <div
                style={{
                  paddingTop: "8px",
                  width: 100,
                  whiteSpace: "normal",
                  lineHeight: "20px",
                }}
              >
                <Tag style={{ margin: "4px 0" }} color={"magenta"}>
                  File
                </Tag>
                <div style={{ padding: "4px 0" }}>Upload your DOCX file</div>
              </div>
            ),
            value: `template_${ContractType.DOCX}`,
          });
          array.push({
            label: (
              <div
                style={{
                  paddingTop: "8px",
                  width: 100,
                  whiteSpace: "normal",
                  lineHeight: "20px",
                }}
              >
                <Tag style={{ margin: "4px 0" }} color={"magenta"}>
                  File
                </Tag>
                <div style={{ padding: "4px 0" }}>Upload your PDF file</div>
              </div>
            ),
            value: `template_${ContractType.PDF}`,
          });
          array.push({
            label: (
              <div
                style={{
                  paddingTop: "8px",
                  width: 100,
                  whiteSpace: "normal",
                  lineHeight: "20px",
                }}
              >
                <Tag style={{ margin: "4px 0" }} color={"cyan"}>
                  Empty
                </Tag>
                <div style={{ padding: "4px 0" }}>Draft from scratch</div>
              </div>
            ),
            value: `template_${ContractType.EMPTY}`,
          });
          payload.data.templates.forEach((template: any) => {
            array.push({
              label: (
                <div
                  style={{
                    paddingTop: "8px",
                    width: 100,
                    whiteSpace: "normal",
                    lineHeight: "20px",
                  }}
                >
                  <Tag style={{ margin: "4px 0" }} color={"cyan"}>
                    User
                  </Tag>
                  <div style={{ padding: "4px 0" }}>{template.name}</div>
                </div>
              ),
              value: template.templateKey,
            });
          });
          setOptions(array);
        });
    };
    getTemplates();
  }, []);

  const handleCreate = () => {
    setFieldBlockVisible(true);
    setCreateDisable(true);
  };
  const handleContinue = async () => {
    setCreateContract(true);
  };
  const handleChange = (e: any) => {
    switch (e.target.id) {
      case "ContractName":
        setContractName(e.target.value);
        if (e.target.value) {
          setContinueDisable(false);
        } else {
          setContinueDisable(true);
        }
        break;
    }
  };
  const handleChoose = async (e: any) => {
    let contractType = e.toString().split("_");
    if (
      contractType[1] === ContractType.DOCX.toString() ||
      contractType[1] === ContractType.PDF.toString()
    ) {
      setBtnName("Upload file");
    } else {
      setBtnName("Create contract");
    }
    if (contractType[1]) {
      let input = null;
      switch (contractType[1]) {
        case ContractType.DOCX.toString():
          input = document.createElement("input");
          input.type = "file";
          input.accept =
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

          input.onchange = (e: any) => {
            // debugger;
            let file = e.target.files[0];
            let reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = (readerEvent) => {
              if (readerEvent) {
                docx2html(
                  readerEvent?.target?.result as ArrayBuffer,
                  (payload: any) => {
                    debugger;
                    setContractValue(payload);
                    setContractType(ContractType.DOCX.toString());
                    setCreateDisable(false);
                  }
                );
              }
            };
          };

          input.click();
          break;
        case ContractType.PDF.toString():
          input = document.createElement("input");
          input.type = "file";
          input.accept = "application/pdf";

          input.onchange = (e: any) => {
            // 	debugger;
            let file = e.target.files[0];
            const fileSize = Math.round(file.size / 1048576);
            if (fileSize > 15) {
              alert("File too big, please select a file less than 15mb");
              return;
            }
            let reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = async (readerEvent) => {
              // debugger;
              setIsPdf(true);
              const arrayBuffer = readerEvent?.target?.result as ArrayBuffer;
              await setArrayBuffer("pdfFile", arrayBuffer);
              await setArrayBuffer("pdfFileOriginal", arrayBuffer);
              setContractType(ContractType.PDF.toString());
              setCreateDisable(false);
              setPdfFileLoad(pdfFileLoad + 1);
            };
          };

          input.click();
          break;
        case ContractType.EMPTY.toString():
          setContractType(ContractType.EMPTY.toString());
          setCreateDisable(false);
          break;
        default:
          break;
      }
    } else {
      let body = {
        data: {
          action: Action.READ,
          clientKey: clientKey,
          userKey: userKey,
          template: { templateKey: e },
        },
      };
      let template: Template = {};
      await axios
        .post(BASE_URL + ApiEntity.TEMPLATE, body, {
          headers: {
            Accept: "application/vnd.api+json",
            "Content-Type": "application/vnd.api+json",
            "x-sendforsign-key": "re_api_key", //process.env.SENDFORSIGN_API_KEY,
          },
          responseType: "json",
        })
        .then((payload) => {
          template = payload.data.template;
        });
      if (template.isPdf) {
        debugger;
        await axios
          .get(template.value as string, {
            responseType: "arraybuffer",
          })
          .then(async function (response) {
            setIsPdf(true);
            setContractType(ContractType.PDF.toString());
            await setArrayBuffer("pdfFile", response.data);
            await setArrayBuffer("pdfFileOriginal", response.data);
            // setPdfData(response.data);
            setPdfFileLoad(pdfFileLoad + 1);
            setContractValue(template.value ? template.value : "");
            setCreateDisable(false);
          });
      } else {
        setContractValue(template.value ? template.value : "");
        setCreateDisable(false);
      }
      setTemplateKey(e);
    }
  };
  return (
    <Space direction="vertical" size={16} style={{ display: "flex" }}>
      <Card loading={loadSegmented}>
        <Space direction="vertical" size={16} style={{ display: "flex" }}>
          <Space direction="vertical" size={2}>
            <Title level={4} style={{ margin: "0" }}>
              Select a document type or upload a file
            </Title>
            <Text type="secondary">
              This will speed up the drafting process.
            </Text>
          </Space>
          <Segmented options={options} onChange={handleChoose} />
          <Button
            type="primary"
            disabled={createDisable}
            onClick={handleCreate}
          >
            {btnName}
          </Button>
        </Space>
      </Card>
      {fieldBlockVisible && (
        <Card bordered={true}>
          <Space direction="vertical" size={16} style={{ display: "flex" }}>
            <Space direction="vertical" size={2}>
              <Title level={4} style={{ margin: "0" }}>
                Let's create your document
              </Title>
            </Space>
            <Input
              id="ContractName"
              placeholder="Enter your document name"
              value={contractName}
              onChange={handleChange}
              // readOnly={!continueDisable}
            />
            <Button
              type="primary"
              disabled={continueDisable}
              onClick={handleContinue}
              loading={continueLoad}
            >
              Continue
            </Button>
          </Space>
        </Card>
      )}
    </Space>
  );
};
