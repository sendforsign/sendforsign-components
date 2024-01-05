import React, { FC, useEffect, useRef, useState } from "react";
import "./template-editor.css";
import { Space } from "antd";
import { TemplateEditorProps } from "./template-editor.types";
import axios from "axios";
import { BASE_URL } from "../../config/config";
import { Action, ApiEntity } from "../../config/enum";
import useSaveArrayBuffer from "../../hooks/use-save-array-buffer";
import { TemplateEditorContext } from "./template-editor-context";
import { HtmlBlock } from "./html-block/html-block";
import { PdfBlock } from "./pdf-block/pdf-block";
import { ChooseTemplateType } from "./choose-template-type/choose-template-type";
import { Template } from "../../config/types";

export const TemplateEditor: FC<TemplateEditorProps> = ({
  templateKey,
  clientKey,
  userKey,
}) => {
  // if (!process.env.SENDFORSIGN_API_KEY) {
  // 	console.log(
  // 		'process.env.SENDFORSIGN_API_KEY',
  // 		process.env.SENDFORSIGN_API_KEY
  // 	);
  // }
  // const { setSignModal } = useContractEditorContext();

  const { getArrayBuffer, setArrayBuffer, clearArrayBuffer } =
    useSaveArrayBuffer();

  const [resultModal, setResultModal] = useState({ open: false, action: "" });
  const [templateName, setTemplateName] = useState("");
  const [templateValue, setTemplateValue] = useState("");
  const [isPdf, setIsPdf] = useState(false);
  const [isNew, setIsNew] = useState(templateKey ? false : true);
  const [createTemplate, setCreateTemplate] = useState(false);
  const [continueLoad, setContinueLoad] = useState(false);
  const [editorVisible, setEditorVisible] = useState(
    templateKey ? true : false
  );
  const [templateType, setTemplateType] = useState("");
  const [currTemplateKey, setCurrTemplateKey] = useState(templateKey);
  const [currClientKey, setCurrClientKey] = useState(clientKey);
  const [currUserKey, setCurrUserKey] = useState(userKey);
  const [pdfFileLoad, setPdfFileLoad] = useState(0);
  const templateKeyRef = useRef(templateKey);

  useEffect(() => {
    clearArrayBuffer();

    const getTemplate = async () => {
      let body = {
        data: {
          action: Action.READ,
          clientKey: clientKey,
          userKey: userKey,
          template: {
            templateKey: templateKeyRef.current,
          },
        },
      };
      let templateTmp: Template = {};
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
          console.log("getTemplate read", payload);
          templateTmp = payload.data.template;
        });
      if (templateTmp.isPdf) {
        await axios
          .get(templateTmp.value as string, {
            responseType: "arraybuffer",
          })
          .then(async function (response) {
            setIsPdf(true);
            await setArrayBuffer("pdfFileTemplate", response.data);
            setPdfFileLoad(pdfFileLoad + 1);
          });
      } else {
        setTemplateValue(templateTmp.value as string);
      }
    };
    if (templateKeyRef.current) {
      getTemplate();
    }
  }, []);

  useEffect(() => {
    // debugger;
    if (currTemplateKey) {
      templateKeyRef.current = currTemplateKey as string; //|| getParam('contractKey');
    }
  }, [currTemplateKey]);

  useEffect(() => {
    const handleContinue = async () => {
      // setLoadEditor(true);
      let body = {
        data: {
          action: Action.CREATE,
          clientKey: clientKey,
          userKey: userKey,
          template: {
            name: templateName,
            value: templateValue,
            isPdf: isPdf,
          },
        },
      };
      let templateTmp: Template = {};
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
          console.log("TEMPLATE editor read", payload);
          setCurrTemplateKey(payload.data.template.templateKey);
          templateTmp = payload.data.template;
          setIsNew(false);
        });
      if (isPdf) {
        const formData = new FormData();
        const pdfFile = (await getArrayBuffer(
          "pdfFileTemplate"
        )) as ArrayBuffer;
        const pdfFileBlob = new Blob([pdfFile], { type: "application/pdf" });
        formData.append("pdf", pdfFileBlob);
        let url = `${BASE_URL}${ApiEntity.UPLOAD_PDF}?templateKey=${templateTmp.templateKey}&clientKey=${clientKey}`;
        await axios
          .post(url, formData, {
            headers: {
              "x-sendforsign-key": "re_api_key", //process.env.SENDFORSIGN_API_KEY,
            },
            responseType: "json",
          })
          .then((payload) => {
            console.log("editor read", payload);
          });
      }
      setEditorVisible(true);
      setContinueLoad(false);
    };
    if (createTemplate) {
      setCreateTemplate(false);
      handleContinue();
    }
  }, [createTemplate]);

  return (
    <TemplateEditorContext.Provider
      value={{
        resultModal,
        setResultModal,
        clientKey: currClientKey,
        setClientKey: setCurrClientKey,
        userKey: currUserKey,
        setUserKey: setCurrUserKey,
        templateKey: currTemplateKey,
        setTemplateKey: setCurrTemplateKey,
        pdfFileLoad,
        setPdfFileLoad,
        templateName,
        setTemplateName,
        templateValue,
        setTemplateValue,
        templateType,
        setTemplateType,
        editorVisible,
        setEditorVisible,
        isPdf,
        setIsPdf,
        createTemplate,
        setCreateTemplate,
        continueLoad,
        setContinueLoad,
      }}
    >
      <Space direction="vertical" size={16} style={{ display: "flex" }}>
        {isNew && <ChooseTemplateType />}
        {editorVisible && <>{!isPdf ? <HtmlBlock /> : <PdfBlock />}</>}
      </Space>
    </TemplateEditorContext.Provider>
  );
};
