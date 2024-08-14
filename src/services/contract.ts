import { Node as ProseMirrorNode } from 'prosemirror-model';
import axios from "axios";
import { Action, ApiEntity } from "../config/enum";
import { BASE_URL } from "../config/config";
import { useKeysStore as keysStore } from '../stores'
import { isError } from '../config/types';

function getHeaders() {
  const { apiKey, token } = keysStore.getState();

  return {
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    'x-sendforsign-key': !token && apiKey ? apiKey : undefined, //process.env.SENDFORSIGN_API_KEY,
    Authorization: token ? `Bearer ${token}` : undefined,
  };
}

export async function getContract() {
  const { contractKey, clientKey, token, userKey,  } = keysStore.getState();
  const body = {
    data: {
      action: Action.READ,
      clientKey: !token ? clientKey : undefined,
      userKey: userKey ? userKey : '',
      contract: {
        contractKey,
      },
    },
  };
  const url: string = BASE_URL + ApiEntity.CONTRACT || '';

  try {
    const { data: { contract } } = await axios.post(
      url,
      body,
      {
        headers: getHeaders(),
        responseType: 'json',
      })

    return contract;
  } catch (error) {
    if (!isError(error)) {
      return;
    }
    // setNotification({
    //   text: error.response?.data.message ?? error.message,
    // });
  }
}

export async function updateContract(doc: ProseMirrorNode) {
  const { contractKey, clientKey, token, userKey } = keysStore.getState();
  const body = {
    data: {
      action: Action.UPDATE,
      clientKey: !token ? clientKey : undefined,
      userKey,
      contract: { contractKey, value: JSON.stringify(doc.toJSON()) },
    },
  };

  try {
    await axios.post(
      BASE_URL + ApiEntity.CONTRACT,
      body,
      {
        headers: {
          ...getHeaders(),
          'Content-Type': undefined,
        },
        responseType: 'json',
      });
  } catch (error) {
      if (!isError(error)) {
        return;
      }
      // setNotification({
      //   text: error.response?.data.message ?? error.message,
      // });
  }
}

export async function checkContractValue() {
  const { contractKey, clientKey, token, userKey } = keysStore.getState();
  const body = {
    clientKey: !token ? clientKey : undefined,
    userKey: userKey,
    contractKey: contractKey,
  };

  try {
    const { data: { changed, contractValue } } = await axios.post(
      BASE_URL + ApiEntity.CHECK_CONTRACT_VALUE,
      body,
      {
        headers: getHeaders(),
        responseType: 'json',
      },
    )
    return {
      hasChangeByOthers: changed,
      contractValue,
    }
  } catch(error) {
    if (!isError(error)) {
      return {
        hasChangeByOthers: true,
        contractValue: '',
      };
    }
    // setNotification({
    //   text: error.response?.data.message ?? error.message,
    // });
    return {
      hasChangeByOthers: true,
      contractValue: '',
    }
  }
}

export async function sendEmail() {
  const { contractKey, clientKey, token } = keysStore.getState();
  let body = {
    clientKey: !token ? clientKey : undefined,
    contractKey: contractKey,
  };

  try {
    await axios.post(
      BASE_URL + ApiEntity.CONTRACT_EMAIL_SIGN,
      body,
      {
        headers: getHeaders(),
        responseType: 'json',
      }
    );
  } catch (error) {
    if (!isError(error)) {
      return;
    }
    // setNotification({
    //   text: error.response?.data.message ?? error.message,
    // });
  }
};
