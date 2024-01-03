import React, { FC, useEffect, useState } from "react";
import { Typography, Tag, Card, Space, Row, Col, Button } from "antd";
import { TemplateListProps } from "./template-list.types";
import axios from "axios";
import { BASE_URL } from "../../config/config";
import { Action, ApiEntity } from "../../config/enum";
import Table, { ColumnsType } from "antd/es/table";
import { Content } from "antd/es/layout/layout";
import useSaveParams from "../../hooks/use-save-params";
import { TemplateListContext } from "./template-list-context";
import { ModalView } from "./modal-view/modal-view";

interface DataType {
  key: string;
  name?: string;
  status?: string[];
  createdAt?: string;
  changedAt?: string;
  createdBy?: string;
}

export const TemplateList: FC<TemplateListProps> = ({
  clientKey,
  isModal,
  userKey,
}) => {
  const { setParam, getParam } = useSaveParams();
  // if (!process.env.SENDFORSIGN_API_KEY) {
  //  TO DO
  // }
  // dayjs.extend(utc);

  const [currTemplateKey, setCurrTemplateKey] = useState("");
  const [currClientKey, setCurrClientKey] = useState(clientKey);
  const [currUserKey, setCurrUserKey] = useState(userKey);
  const [templateModal, setTemplateModal] = useState(false);
  const [refreshTemplate, setRefreshTemplate] = useState(0);
  const [data, setData] = useState<DataType[]>([]);
  const { Title } = Typography;
  const chooseContract = (text: string) => {
    debugger;
    setCurrTemplateKey(text);
    setParam("templateKey", text);
    if (isModal) {
      setTemplateModal(true);
      setParam("openModalTemplate", true);
    }
  };
  const columns: ColumnsType<DataType> = [
    {
      title: "Document name",
      dataIndex: "name",
      render: (_, { key, name }) => (
        <Button
          type="link"
          onClick={() => {
            chooseContract(key ? key : "");
          }}
        >
          {name}
        </Button>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (_, { status }) => (
        <>
          {status?.map((tag) => {
            let color = "purple";
            if (tag === "Signed") {
              color = "green";
            }
            return (
              <Tag color={color} key={tag}>
                {tag}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: "Created at",
      dataIndex: "createdAt",
    },
    {
      title: "Changed at",
      dataIndex: "changedAt",
    },
    {
      title: "Created by",
      dataIndex: "createdBy",
    },
  ];

  useEffect(() => {
    let body = {
      data: {
        action: Action.LIST,
        clientKey: clientKey,
        userKey: userKey,
      },
    };
    const getTemplate = async () => {
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
          console.log("editor list", payload);
          let array: DataType[] = payload.data.templates.map(
            (template: any) => {
              return {
                key: template.templateKey,
                name: template.name ? template.name : "Empty name",
                status: ["Draft"],
                createdAt: template.createTime
                  ? template.createTime.toString()
                  : new Date().toString(),
                changedAt: template.changeTime
                  ? template.changeTime.toString()
                  : new Date().toString(),
              };
            }
          );
          setData(array);
          // setValue(payload.data.contract.value);
        });
    };
    getTemplate();
  }, [refreshTemplate]);
  useEffect(() => {
    if (!getParam("openModalTemplate")) {
      setTemplateModal(false);
    }
  }, [getParam("openModalTemplate")]);
  return (
    <TemplateListContext.Provider
      value={{
        templateModal,
        setTemplateModal,
        templateKey: currTemplateKey,
        setTemplateKey: setCurrTemplateKey,
        clientKey: currClientKey,
        setClientKey: setCurrClientKey,
        userKey: currUserKey,
        setUserKey: setCurrUserKey,
        refreshTemplate,
        setRefreshTemplate,
      }}
    >
      <Space direction="vertical" size={16} style={{ display: "flex" }}>
        <Card>
          <Table
            columns={columns}
            dataSource={data}
            title={() => (
              <Row>
                <Col>
                  <Title
                    level={3}
                    style={{
                      margin: "0",
                      display: "flex",
                      textAlign: "center",
                    }}
                  >
                    Templates
                  </Title>
                </Col>
                <Col flex={"auto"}></Col>
                <Col>
                  <Button
                    type="primary"
                    // icon={<FontAwesomeIcon icon={faPlus} />}
                    onClick={() => {
                      setParam("templateKey", "");
                      setCurrTemplateKey("");
                      setTemplateModal(true);
                    }}
                  >
                    Add template
                  </Button>
                </Col>
              </Row>
            )}
          />
        </Card>
      </Space>
      <ModalView key={currTemplateKey} />
    </TemplateListContext.Provider>
  );
};
