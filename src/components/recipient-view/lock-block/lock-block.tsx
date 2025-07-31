import React from 'react';
import { Button, Card, Result, Space } from 'antd';

export const LockBlock = () => {

  return (
    <Card style={{ opacity: 1 }} bordered={true} className="SharingCardToHide">
      <Space direction="vertical" size={16} style={{ display: 'flex' }}>
        <Result
          title="This document is locked by the contract owner"
          subTitle="Please ask the person who shared this document with you if they can unlock it."
          status="warning"
          extra={
            <Button
              type="primary"
              key="console"
              onClick={() => {
              }}
            >
              Go to Sendforsign
            </Button>
          }
        />
      </Space>
    </Card>
  );
};
