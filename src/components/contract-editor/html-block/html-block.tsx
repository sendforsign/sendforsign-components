import React, { useEffect, useRef } from "react";
// import './html-block.css';
import "quill/dist/quill.bubble.css";
import QuillNamespace, { Quill } from "quill";
import QuillBetterTable from "quill-better-table";
import { useDebouncedCallback } from "use-debounce";
import {
  Space,
  Card,
  Typography,
  Button,
  Row,
  Col,
  Input,
  Tooltip,
  Popover,
  Segmented,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useContractEditorContext } from "../contract-editor-context";
import { BASE_URL } from "../../../config/config";
import { Action, ApiEntity } from "../../../config/enum";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGear,
  faGlobe,
  faGrip,
  faGripVertical,
  faLeftLong,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

//env.config();
type Props = {
  value: string;
};
QuillNamespace.register(
  {
    "modules/better-table": QuillBetterTable,
  },
  true
);
export const HtmlBlock = ({ value }: Props) => {
  dayjs.extend(utc);
  const {
    contractKey,
    clientKey,
    userKey,
    sign,
    setSign,
    contractSign,
    setContractSign,
    continueLoad,
    setContinueLoad,
    setNotification,
    readonly,
    refreshSign,
    setReadonly,
    setSignCount,
  } = useContractEditorContext();
  const { Title, Text } = Typography;
  const quillRef = useRef<Quill>();
  const container = document.querySelector("#contract-editor-container");
  // console.log(
  // 	'container1',
  // 	document.querySelector('#contract-editor-container'),
  // 	quillRef
  // );
  useEffect(() => {
    let Inline = QuillNamespace.import("blots/inline");
    class PlaceholderBlot extends Inline {}
    PlaceholderBlot.className = "customclass1";
    PlaceholderBlot.blotName = "placeholder1";
    PlaceholderBlot.tagName = "placeholder1";
    QuillNamespace.register(PlaceholderBlot);

    class PlaceholderBlot2 extends Inline {}
    PlaceholderBlot2.className = "customclass2";
    PlaceholderBlot2.blotName = "placeholder2";
    PlaceholderBlot2.tagName = "placeholder2";
    QuillNamespace.register(PlaceholderBlot2);

    if (document.querySelector("#contract-editor-container")) {
      quillRef.current = new QuillNamespace("#contract-editor-container", {
        modules: {
          toolbar: {
            container: [
              ["bold", "italic", "underline", "strike"], // toggled buttons
              ["blockquote", "code-block"],

              [{ list: "ordered" }, { list: "bullet" }],
              [{ script: "sub" }, { script: "super" }], // superscript/subscript
              [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
              [{ direction: "rtl" }], // text direction

              [{ size: ["small", false, "large", "huge"] }], // custom dropdown

              [{ color: [] }, { background: [] }], // dropdown with defaults from theme
              [{ font: [] }],
              [{ align: [] }],

              ["clean"],
            ],
            handlers: {
              table: addTable,
            },
          },
          table: false, // disable table module
          "better-table": {
            operationMenu: {
              items: {
                unmergeCells: {
                  text: "Unmerge",
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
        scrollingContainer: "body",
        theme: "bubble",
      });

      if (quillRef.current) {
        quillRef.current
          .getModule("toolbar")
          .container.addEventListener(
            "mousedown",
            (e: {
              preventDefault: () => void;
              stopPropagation: () => void;
            }) => {
              e.preventDefault();
              e.stopPropagation();
            }
          );

        quillRef.current.on(
          "text-change",
          function (delta: any, oldDelta: any, source: any) {
            if (source === "user") {
              handleChangeText(
                quillRef?.current ? quillRef?.current?.root?.innerHTML : ""
              );
            }
          }
        );
      }
    }
  }, [container]);
  useEffect(() => {
    if (value && quillRef?.current) {
      quillRef?.current?.clipboard.dangerouslyPasteHTML(value);
      setContinueLoad(false);
      // console.log(
      // 	'quillRef?.current?.root.innerHTML',
      // 	quillRef?.current?.root.innerHTML,
      // 	document.querySelector('ql-code-block-container')
      // );
    }
  }, [value]);
  useEffect(() => {
    if (readonly) {
      quillRef?.current?.enable(!readonly);
    }
  }, [readonly]);
  useEffect(() => {
    if (sign && contractSign) {
      let textTmp =
        quillRef?.current?.root.innerHTML +
        `<br></br><p><img src='${sign}' alt="signature" /></p>`;
      textTmp = textTmp + `<p>Name: ${contractSign.fullName}</p>`;
      textTmp = textTmp + `<p>Email: ${contractSign.email}</p>`;
      textTmp =
        textTmp +
        `<p>Timestamp: ${dayjs(contractSign.createTime).format(
          "YYYY-MM-DD HH:mm:ss"
        )} GMT</p>`;

      handleChangeText(textTmp, false);
      quillRef?.current?.clipboard.dangerouslyPasteHTML(textTmp);
      debugger;
      setContinueLoad(false);
      setSign("");
      setContractSign({});
      quillRef?.current?.enable(false);
      sendEmail();
    }
  }, [sign, contractSign]);
  useEffect(() => {
    const getSigns = async () => {
      let url = `${BASE_URL}${ApiEntity.CONTRACT_SIGN}?contractKey=${contractKey}&clientKey=${clientKey}`;
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
          console.log("getSigns read", payload);
          setSignCount(payload.data.length);
          if (payload.data.length > 0) {
            setReadonly(true);
          }
        });
    };
    getSigns();
  }, [refreshSign]);

  const addTable = () => {
    (quillRef.current as QuillNamespace)
      .getModule("better-table")
      .insertTable(3, 3);
  };
  const handleChangeText = useDebouncedCallback(
    async (content: string, needCheck: boolean = true) => {
      let body = {};
      let changed = false;
      let contractValueTmp = "";
      if (needCheck) {
        body = {
          clientKey: clientKey,
          userKey: userKey,
          contractKey: contractKey,
        };
        await axios
          .post(BASE_URL + ApiEntity.CHECK_CONTRACT_VALUE, body, {
            headers: {
              Accept: "application/vnd.api+json",
              "Content-Type": "application/vnd.api+json",
              "x-sendforsign-key": "re_api_key", //process.env.SENDFORSIGN_API_KEY,
            },
            responseType: "json",
          })
          .then((payload) => {
            console.log("CHECK_CONTRACT_VALUE read", payload);
            changed = payload.data.changed;
            contractValueTmp = payload.data.contractValue;
          });
      }
      if (!changed) {
        body = {
          data: {
            action: Action.UPDATE,
            clientKey: clientKey,
            userKey: userKey,
            contract: { contractKey: contractKey, value: content },
          },
        };
        await axios
          .post(BASE_URL + ApiEntity.CONTRACT, body, {
            headers: {
              Accept: "application/vnd.api+json",
              "Content-Type": "application/vnd.api+json",
              "x-sendforsign-key": "re_api_key", //process.env.SENDFORSIGN_API_KEY,
            },
            responseType: "json",
          })
          .then((payload) => {
            console.log("editor read", payload);
          });
      } else {
        setReadonly(true);
        if (contractValueTmp) {
          quillRef?.current?.clipboard.dangerouslyPasteHTML(contractValueTmp);
        }
        setNotification({
          text: "Contract updated. Please, reload the page.",
        });
      }
    },
    5000,
    // The maximum time func is allowed to be delayed before it's invoked:
    { maxWait: 5000 }
  );
  const sendEmail = async () => {
    let body = {
      clientKey: clientKey,
      contractKey: contractKey,
    };
    await axios
      .post(BASE_URL + ApiEntity.CONTRACT_EMAIL_SIGN, body, {
        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          "x-sendforsign-key": "re_api_key", //process.env.SENDFORSIGN_API_KEY,
        },
        responseType: "json",
      })
      .then((payload) => {
        console.log("editor read", payload);
      });
  };

  const popoverContent = (
    <Space direction="vertical" style={{ display: "flex" }}>
      <Button block type="text">
        Rename
      </Button>
      <Button block type="text">
        Insert into the text
      </Button>
      <Button block danger type="text">
        Delete
      </Button>
    </Space>
  );
  console.log(
    "quillRef?.current?.root.innerHTM 2",
    document.querySelector("#ql-code-block-container")
  );
  return (
    <Row gutter={{ xs: 8, sm: 8, md: 8, lg: 8 }}>
      <Col flex="auto">
        <Space direction="vertical" style={{ display: "flex" }}>
          <Card>
            <Space direction="vertical" size={16} style={{ display: "flex" }}>
              <Space direction="vertical" size={2}>
                <Title level={4} style={{ margin: "0 0 0 0" }}>
                  Review your document
                </Title>
                <Text type="secondary">Highlight text to see options.</Text>
              </Space>
              <div id="scroll-container">
                <div id="contract-editor-container" />
              </div>
            </Space>
          </Card>
        </Space>
      </Col>
      <Col flex="300px" style={{ display: "block" }}>
        <Space direction="vertical" style={{ display: "flex" }}>
          <Card>
            <Space direction="vertical" size={16} style={{ display: "flex" }}>
              <Space direction="vertical" size={2}>
                <Title level={4} style={{ margin: "0 0 0 0" }}>
                  Placeholders
                </Title>
                <Text type="secondary">Add reusable text to the content.</Text>
              </Space>

              <Space direction="vertical" size={2} style={{ display: "flex" }}>
                <Row>
                  <Col>
                    <Tooltip title="Click to insert this placeholder into the text.">
                      <Button
                        size="small"
                        type="text"
                        icon={<FontAwesomeIcon icon={faLeftLong} size="sm" />}
                      />
                    </Tooltip>
                  </Col>
                  <Col>
                    <Tooltip title="Click to see more options.">
                      <Popover content={popoverContent} trigger="click">
                        <Text>Placeholder name</Text>
                      </Popover>
                    </Tooltip>
                  </Col>
                  <Col flex={"auto"} />
                  <Col>
                    <Tooltip title="Set who fills in this field: the user when creating a draft or the external signer when signing.">
                      <Segmented
                        size="small"
                        options={[
                          {
                            value: "Internal",
                            icon: <FontAwesomeIcon icon={faUser} size="xs" />,
                          },
                          {
                            value: "External",
                            icon: <FontAwesomeIcon icon={faGlobe} size="xs" />,
                          },
                        ]}
                      />
                    </Tooltip>
                  </Col>
                </Row>
                <Input placeholder="Enter value" />
              </Space>

              <Space direction="vertical" size={2} style={{ display: "flex" }}>
                <Row>
                  <Col>
                    <Tooltip title="Click to insert this placeholder into the text.">
                      <Button
                        size="small"
                        type="text"
                        icon={<FontAwesomeIcon icon={faLeftLong} size="sm" />}
                      />
                    </Tooltip>
                  </Col>
                  <Col>
                    <Tooltip title="Click to see more options.">
                      <Popover content={popoverContent} trigger="click">
                        <Text>Placeholder name</Text>
                      </Popover>
                    </Tooltip>
                  </Col>
                  <Col flex={"auto"} />
                  <Col>
                    <Tooltip title="Set who fills in this field: the user when creating a draft or the external signer when signing.">
                      <Segmented
                        size="small"
                        options={[
                          {
                            value: "Internal",
                            icon: <FontAwesomeIcon icon={faUser} size="xs" />,
                          },
                          {
                            value: "External",
                            icon: <FontAwesomeIcon icon={faGlobe} size="xs" />,
                          },
                        ]}
                      />
                    </Tooltip>
                  </Col>
                </Row>
                <Input placeholder="Enter value" />
              </Space>

              <Space direction="vertical" size={2} style={{ display: "flex" }}>
                <Button block type="dashed">
                  Add placeholder
                </Button>
              </Space>
            </Space>
          </Card>
        </Space>
      </Col>
    </Row>
  );
};
