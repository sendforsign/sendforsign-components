import React, { FC, useEffect, useRef, useState } from 'react';
import {
    Typography,
    Tag,
    Card,
    Space,
    Row,
    Col,
    Button,
    TableColumnsType,
    Spin,
    Dropdown,
    MenuProps,
    Empty,
    Statistic,
    Input,
    Select,
    Tooltip,
    Steps,
} from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import { BASE_URL } from '../../config/config';
import { Action, ApiEntity, ContractAction, ContractType, EventStatuses, PlaceholderView, ShareLinkView, SpecialType, Tags } from '../../config/enum';
import Table from 'antd/es/table';
// import { ContractListContext } from './contract-list-context';
// import { ModalView } from './modal-view/modal-view';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBookBookmark,
    faDownload,
    faEllipsisVertical,
    faLightbulb,
    faPaperclip,
    faPlus,
    faQuestion,
    faSignature,
    faStamp,
} from '@fortawesome/free-solid-svg-icons';
import { Contract, ContractEvent, ContractSign, ContractSignAi, ContractValue, EventStatus, Placeholder } from '../../config/types';
import { RecipientViewContext } from './recipient-view-context';
import { addActualColors, delColorFromHtml, changeValueInTag } from '../../utils/util-for-share';
import { ResultModal } from './result-modal/result-modal';
import useSaveArrayBuffer from '../../hooks/use-save-array-buffer';
import Link from 'antd/es/typography/Link';
import { LockBlock } from './lock-block/lock-block';
import { FluentEditorBlock } from './fluent-editor-block';
import { SignModal } from './sign-modal';
import { ApproveModal } from './approve-modal';
import { Notification } from './notification';


interface DataType {
    key?: string;
    name?: string;
    status?: string;
    createdAt?: string;
    createdBy?: string;
}
export interface RecipientViewProps {
    shareLink: string;
}

export const RecipientView: FC<RecipientViewProps> = ({ shareLink }) => {
    const [notification, setNotification] = useState({});
    const [isDone, setIsDone] = useState(false);
    const [fillPlaceholderBefore, setFillPlaceholderBefore] = useState(false);
    const [placeholdersFilling, setPlaceholdersFilling] = useState(false);
    const [shareLinkView, setShareLinkView] = useState<ShareLinkView>(ShareLinkView.SIGN);
    const [shareBlockReady, setShareBlockReady] = useState(false);
    const [resultModal, setResultModal] = useState<{ open: boolean, action: ContractAction | undefined }>({ open: false, action: undefined });
    const [placeholder, setPlaceholder] = useState<Placeholder[]>([]);
    const [pdfFileLoad, setPdfFileLoad] = useState(0);
    const [spinBtn, setSpinBtn] = useState(false);
    const [signModal, setSignModal] = useState(false);
    const [approveModal, setApproveModal] = useState(false);
    const [sign, setSign] = useState('');
    const [contractSign, setContractSign] = useState<ContractSign>({});
    const [signs, setSigns] = useState<ContractSign[]>([]);
    const [signCount, setSignCount] = useState(0);
    const [renameModal, setRenameModal] = useState({ open: false, contractKey: '', name: '' });
    const [refreshContracts, setRefreshContracts] = useState(0);
    const [data, setData] = useState<DataType[]>([]);
    const [eventStatus, setEventStatus] = useState<EventStatus[]>([]);
    const [spinLoad, setSpinLoad] = useState(false);
    const [contractsLoad, setContractsLoad] = useState(false);
    const [contract, setContract] = useState<Contract>({});
    const [contractValue, setContractValue] = useState<ContractValue>({});
    const [ipInfo, setIpInfo] = useState('');
    const [contractEvent, setContractEvent] = useState<ContractEvent[]>([]);
    const currentRecord = useRef<DataType>({});
    const { Title, Text } = Typography;
    const { setArrayBuffer, getArrayBuffer, clearArrayBuffer } =
        useSaveArrayBuffer();
    const first = useRef(false);
    const [currentStep, setCurrentStep] = useState(0);

    const [steps, setSteps] = useState<
        { key: string; name: string; value: string }[]
    >([]);
    const [items, setItems] = useState<
        {
            key: string;
            title: string;
        }[]
    >([]);
    useEffect(() => {
        const fetchContract = async () => {
            let url = `${BASE_URL}${ApiEntity.RECIPIENT_CONTRACT}?shareLink=${shareLink}`;
            await axios
                .get(url, {
                    headers: {
                        Accept: 'application/vnd.api+json',
                        'Content-Type': 'application/vnd.api+json',
                    },
                    responseType: 'json',
                })
                .then((payload: any) => {
                    console.log('payload', payload);
                    first.current = true;
                    let value =
                        payload.data.contractType.toString() === ContractType.PDF.toString()
                            ? payload.data.contractValue
                            : delColorFromHtml(payload.data.contractValue);
                    if (
                        payload.data.contractType.toString() !== ContractType.PDF.toString() &&
                        !payload.data.isDone
                    ) {
                        value = addActualColors(
                            payload.data.audit,
                            payload.data.shareLink,
                            value,
                            payload.data.placeholders
                        );
                    }
                    setContract({
                        shareLink: payload.data.shareLink,
                        createTime: payload.data.createTime,
                        changeTime: payload.data.changeTime,
                        contractValue: value,
                        statusId: payload.data.statusId,
                        statusName: payload.data.statusName,
                        view: payload.data.view,
                        contractType: payload.data.contractType,
                        contractName: payload.data.contractName,
                        fullname: payload.data.fullname,
                        email: payload.data.email,
                        audit: payload.data.audit,
                        controlLink: payload.data.controlLink,
                        visiblePageBranding: payload.data.visiblePageBranding,
                        isTest: payload.data.isTest ? true : false,
                    });
                    setContractValue({
                        changeTime: payload.data.changeTime,
                        contractValue: value,
                    });
                    setIsDone(payload.data.isDone);
                    if (
                        payload.data.isDone &&
                        (payload.data.view.toString().includes(ShareLinkView.SIGN) ||
                            payload.data.view.toString().includes(ShareLinkView.APPROVE))
                    ) {
                        setResultModal({
                            open: true,
                            action: payload.data.view.toString().includes(ShareLinkView.SIGN)
                                ? ContractAction.SIGN
                                : ContractAction.APPROVE,
                        });
                    }
                    if (!payload.data.isDone && payload.data.audit) {
                        // console.log('contractData', contractData);
                        setIsDone(true);
                    }
                    if (!payload.data.isDone && !payload.data.audit) {
                        getSignIPInfo();
                        if (payload.data.placeholders && payload.data.placeholders.length > 0) {
                            setPlaceholder(payload.data.placeholders);
                            setFillPlaceholderBefore(true);
                        }
                    }
                    if (payload.data.contractType.toString() === ContractType.PDF.toString()
                    ) {
                        clearArrayBuffer();
                        axios
                            .get(payload.data.contractValue, {
                                responseType: 'arraybuffer',
                            })
                            .then(async (response) => {
                                // debugger;
                                // dispatch(setPdfFile(response.data));
                                // console.log('contractSignsData pdf', contractSignsData);
                                await setArrayBuffer('pdfFile', response.data);
                                await setArrayBuffer('pdfFileOriginal', response.data);
                                setPdfFileLoad(pdfFileLoad + 1);
                                //  setShareBlockReady(true) ;
                            });
                        if (payload.data.isDone || payload.data.audit) {
                            if (
                                payload.data.placeholders &&
                                payload.data.placeholders.length > 0
                            ) {
                                setPlaceholder(payload.data.placeholders);
                            }
                        }
                    } else {
                        setShareBlockReady(true);
                    }
                    // dispatch(setContractLink(ContractLink.SHARE));
                    if (!payload.data.audit) {
                        let body = {
                            shareLink: shareLink,
                            status: EventStatuses.SEEN,
                            name: payload.data.fullname,
                            email: payload.data.email,
                        };
                        axios
                            .post(BASE_URL + ApiEntity.CONTRACT_EVENT, body, {
                                headers: {
                                    Accept: 'application/vnd.api+json',
                                    'Content-Type': 'application/vnd.api+json',
                                },
                                responseType: 'json',
                            })
                            .catch((error) => {
                                setNotification({
                                    text:
                                        error.response &&
                                            error.response.data &&
                                            error.response.data.message
                                            ? error.response.data.message
                                            : error.message,
                                });
                            });
                    }
                })
                .catch((error) => {
                    setNotification({
                        text:
                            error.response &&
                                error.response.data &&
                                error.response.data.message
                                ? error.response.data.message
                                : error.message,
                    });
                });
            url = `${BASE_URL}${ApiEntity.RECIPIENT_CONTRACT_EVENT}?shareLink=${shareLink}`;
            await axios
                .get(url, {
                    headers: {
                        Accept: 'application/vnd.api+json',
                        'Content-Type': 'application/vnd.api+json',
                    },
                    responseType: 'json',
                })
                .then((payload) => {
                    setContractEvent(payload.data);
                });
            url = `${BASE_URL}${ApiEntity.RECIPIENT_SIGN}?shareLink=${shareLink}`;
            await axios
                .get(url, {
                    headers: {
                        Accept: 'application/vnd.api+json',
                        'Content-Type': 'application/vnd.api+json',
                    },
                    responseType: 'json',
                })
                .then((payload) => {
                    setContractSign(payload.data);
                });
        };
        if (shareLink &&
            !first.current) {
            fetchContract();
        }
    }, [shareLink]);

    useEffect(() => {
        if (placeholder && placeholder.length > 0) {
            const filter = placeholder.filter(
                (holder) =>
                    holder.externalRecipientKey === contract.shareLink &&
                    holder.view &&
                    holder.view.toString() !==
                    PlaceholderView.SIGNATURE.toString() &&
                    !holder.isSpecial
            );
            if (filter && filter.length > 0) {
                let stepsTmp: { key: string; name: string; value: string }[] = [];
                filter.forEach((holder) => {
                    stepsTmp.push({
                        key: holder.placeholderKey as string,
                        name: holder.name as string,
                        value: holder.value as string,
                    });
                });

                setItems(
                    stepsTmp.map((step) => {
                        return { key: step.key, title: '' };
                    })
                );
                setSteps(stepsTmp);
            } else {
                setFillPlaceholderBefore(false);
            }
        }
    }, [placeholder]);
    const getSignIPInfo = async () => {
        // debugger;
        await axios
            .get('https://ipapi.co/json', {
                responseType: 'json',
            })
            .then((payload: any) => {
                const ipInfoStr = JSON.stringify(payload.data);
                setIpInfo(ipInfoStr);
            });
    };

    const next = () => {
        setCurrentStep(currentStep + 1);
    };

    const prev = () => {
        setCurrentStep(currentStep - 1);
    };
    const handleBtn = async (e: any) => {
        let changed = false;
        let viewCurrent: ShareLinkView = contract.view as ShareLinkView;
        let body = {
            shareLink,
            changeTime: contract.changeTime,
            view: contract.view,
        };
        await axios
            .post(BASE_URL + ApiEntity.CHECK_CONTRACT_CHANGED, body, {
                headers: {
                    Accept: 'application/vnd.api+json',
                    'Content-Type': 'application/vnd.api+json',
                },
                responseType: 'json',
            })
            .then((payload: any) => {
                changed = payload.data.changed;
                if (payload.data.view) {
                    viewCurrent = payload.data.view;
                }
                if (!changed) {
                    if (viewCurrent.toString() === ShareLinkView.SIGN.toString()) {
                        setSignModal(true);
                    } else {
                        setApproveModal(true);
                    }
                } else {
                    if (contract.view && contract.view.toString() !== viewCurrent.toString()) {
                        setShareLinkView(viewCurrent);
                        setNotification({
                            text: 'Owner changed the permissions',
                        });
                    } else {
                        setNotification({
                            text: 'Contract updated. Please, reload your page',
                        });
                    }
                }
            })
            .catch((error) => {
                setNotification({
                    text:
                        error.response &&
                            error.response.data &&
                            error.response.data.message
                            ? error.response.data.message
                            : error.message,
                });
            });
    };
    const handleChange = (e: any, placeholderKey: string) => {
        let stepsTmp: { key: string; name: string; value: string }[] = [...steps];
        const indexPlaceholder = placeholder.findIndex(
            (holder) => holder.placeholderKey === placeholderKey
        );
        let placeholdersTmp: Placeholder[] = placeholder.map(
            (holder, index) => {
                if (indexPlaceholder === index) {
                    let placeholderTmp = { ...holder };
                    placeholderTmp.value = e.target.value;
                    return placeholderTmp;
                }
                return holder;
            }
        );
        const stepIndex = stepsTmp.findIndex((step) => step.key === placeholderKey);
        stepsTmp[stepIndex].value = e.target.value;
        setPlaceholder(placeholdersTmp);
        setSteps(stepsTmp);
    };
    const handleContinue = async () => {
        let value = contractValue.contractValue as string;
        for (let i = 0; i < placeholder.length; i++) {
            if (placeholder[i].isSpecial) {
                if (placeholder[i].specialType) {
                    let tag = '';
                    switch (placeholder[i].specialType) {
                        case SpecialType.DATE:
                            tag = Tags.DATE;
                            break;
                        case SpecialType.FULLNAME:
                            tag = Tags.FULLNAME;
                            break;
                        case SpecialType.EMAIL:
                            tag = Tags.EMAIL;
                            break;
                        case SpecialType.SIGN:
                            tag = Tags.SIGN;
                            break;
                        case SpecialType.INITIALS:
                            tag = Tags.INITIALS;
                            break;
                    }
                    value = changeValueInTag(
                        tag,
                        placeholder[i].id ? (placeholder[i].id as number) : 0,
                        placeholder[i].value
                            ? placeholder[i].specialType !== SpecialType.SIGN &&
                                placeholder[i].specialType !== SpecialType.INITIALS
                                ? (placeholder[i].value as string)
                                : `<img src='${placeholder[i].value}' alt="signature" />`
                            : `{{{${placeholder[i].name as string}}}}`,
                        value,
                        contract.audit
                            ? '#ffffff'
                            : placeholder[i].externalRecipientKey &&
                                placeholder[i].externalRecipientKey === contract.shareLink
                                ? '#a3e8f6'
                                : '#f0f0f0',
                        placeholder
                    );
                }
            } else {
                value = changeValueInTag(
                    Tags.PLACEHOLDER,
                    placeholder[i].id ? (placeholder[i].id as number) : 0,
                    placeholder[i].value
                        ? (placeholder[i].value as string)
                        : `{{{${placeholder[i].name as string}}}}`,
                    value,
                    contract.audit
                        ? '#ffffff'
                        : placeholder[i].externalRecipientKey &&
                            placeholder[i].externalRecipientKey === contract.shareLink
                            ? '#a3e8f6'
                            : '#f0f0f0',
                    placeholder
                );
            }
        }
        setContractValue({
            changeTime: contractValue.changeTime,
            contractValue: value,
        });
        setPlaceholdersFilling(true);
        setFillPlaceholderBefore(false);
        // await updatePlaceholders(placeholders);
    };
    const handleDownload = async () => {
        setSpinBtn(true);
        // debugger;
        await axios
            .get(`/api/download_pdf?shareLink=${contract.shareLink}&owner=true`, {
                responseType: 'arraybuffer',
            })
            .then((payload) => {
                const content = new Blob([payload.data], {
                    type: payload.headers['content-type'],
                });

                const encodedUri = window.URL.createObjectURL(content);
                const link = document.createElement('a');

                link.setAttribute('href', encodedUri);
                link.setAttribute(
                    'download',
                    `${contract && contract.contractName
                        ? contract.contractName
                        : 'sendforsign'
                    }.pdf`
                );

                link.click();
                setSpinBtn(false);
            });
    };
    return (
        <RecipientViewContext.Provider
            value={{
                contract,
                setContract,
                contractValue,
                setContractValue,
                notification,
                setNotification,
                isDone,
                setIsDone,
                resultModal,
                setResultModal,
                ipInfo,
                setIpInfo,
                placeholder,
                setPlaceholder,
                fillPlaceholderBefore,
                setFillPlaceholderBefore,
                pdfFileLoad,
                setPdfFileLoad,
                shareBlockReady,
                setShareBlockReady,
                contractEvent,
                setContractEvent,
                signModal,
                setSignModal,
                approveModal,
                setApproveModal,
                shareLinkView,
                setShareLinkView,
                sign,
                setSign,
                contractSign,
                setContractSign,
                signs,
                setSigns
            }}
        >
            <Row>
                <Col flex={'auto'}></Col>
                <Col flex="1200px">
                    {fillPlaceholderBefore ? (
                        <Spin spinning={!shareBlockReady} style={{ marginTop: '30px' }}>
                            <Row
                                gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
                                style={{ minHeight: '40px' }}
                            >
                                <Col span="24">
                                    {shareBlockReady && (
                                        <Card variant="outlined"  >
                                            <Space
                                                direction="vertical"
                                                size={16}
                                                style={{ display: 'flex' }}
                                            >
                                                <Space direction="vertical" size={2}>
                                                    <Title level={4} style={{ margin: '0' }}>
                                                        Answer the questions below to view your document
                                                    </Title>

                                                </Space>
                                                {steps.length > 0 && (
                                                    <>
                                                        {steps.length > 1 && (
                                                            <Steps
                                                                current={currentStep}
                                                                items={items}
                                                                size="small"
                                                            />
                                                        )}
                                                        <Card
                                                            style={{
                                                                marginTop: 16,
                                                                textAlign: 'center',
                                                            }}
                                                        >
                                                            <Space
                                                                direction="vertical"
                                                                style={{ display: 'flex' }}
                                                            >
                                                                <Title level={5} style={{ margin: '0' }}>
                                                                    {steps[currentStep].name}
                                                                </Title>
                                                                <Text type="secondary">
                                                                    Enter the value in the field below.
                                                                </Text>
                                                                <Input
                                                                    id={steps[currentStep].key}
                                                                    placeholder={`Type here`}
                                                                    value={steps[currentStep].value}
                                                                    onChange={(e) =>
                                                                        handleChange(e, steps[currentStep].key)
                                                                    }
                                                                />
                                                            </Space>
                                                        </Card>
                                                        <div style={{ marginTop: 24 }}>
                                                            {currentStep > 0 && (
                                                                <Button
                                                                    style={{ margin: '0 8px' }}
                                                                    onClick={() => prev()}
                                                                >
                                                                    Previous
                                                                </Button>
                                                            )}
                                                            {currentStep < steps.length - 1 && (
                                                                <Button
                                                                    type="primary"
                                                                    // disabled={continueDisable}
                                                                    onClick={() => next()}
                                                                >
                                                                    Next
                                                                </Button>
                                                            )}
                                                            {currentStep === steps.length - 1 && (
                                                                <Button
                                                                    type="primary"
                                                                    onClick={handleContinue}
                                                                // loading={continueLoad}
                                                                >
                                                                    Done
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </Space>
                                        </Card>
                                    )}
                                </Col>
                            </Row>
                            <Row
                                gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
                                className="SharingDocFooter"
                                style={{
                                    visibility: !contract.visiblePageBranding
                                        ? 'hidden'
                                        : 'visible',
                                }}
                            >
                                <Col span="24">
                                    <Space
                                        direction="vertical"
                                        style={{ display: 'flex', margin: '24px 0' }}
                                        align="center"
                                    >
                                        <Text type="secondary">
                                            Powered by{' '}
                                            <Link href="https://sendforsign.com" target="_blank">
                                                sendforsign.com
                                            </Link>
                                        </Text>
                                    </Space>
                                </Col>
                            </Row>
                        </Spin>
                    ) : (
                        <Spin spinning={!shareBlockReady} style={{ marginTop: '30px' }}>
                            <Row
                                gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
                                style={{ minHeight: '40px' }}
                            >
                                <Col span="24">
                                    {shareBlockReady && (
                                        <Space direction="vertical" style={{ display: 'flex' }}>
                                            {contract.view &&
                                                (contract.view.toString() ===
                                                    ShareLinkView.SIGN.toString() ||
                                                    contract.view.toString() ===
                                                    ShareLinkView.APPROVE.toString() ||
                                                    contract.view.toString() ===
                                                    ShareLinkView.VIEW.toString()) ? (
                                                <>
                                                    {contract.contractType?.toString() === ContractType.PDF.toString() ?
                                                        <></>
                                                        :
                                                        <FluentEditorBlock value={contractValue.contractValue as string} />
                                                    }
                                                </>
                                            ) : (
                                                <LockBlock />
                                            )}
                                        </Space>
                                    )}
                                </Col>
                            </Row>
                            {shareBlockReady &&
                                !isDone &&
                                (contract.view &&
                                    (contract.view.toString() === ShareLinkView.SIGN.toString() ||
                                        contract.view.toString() === ShareLinkView.APPROVE.toString())) && (
                                    <Row
                                        gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
                                        className="SharingDocFooter"
                                    >
                                        <Col span="24">
                                            <Space
                                                direction="vertical"
                                                style={{ display: 'flex', marginTop: '24px' }}
                                                align="center"
                                            >
                                                <Button
                                                    type="primary"
                                                    icon={
                                                        contract.view && contract.view.toString() ===
                                                            ShareLinkView.SIGN.toString() ? (
                                                            <FontAwesomeIcon icon={faSignature} />
                                                        ) : (
                                                            <FontAwesomeIcon icon={faStamp} />
                                                        )
                                                    }
                                                    onClick={handleBtn}
                                                >
                                                    {contract.view && contract.view.toString() ===
                                                        ShareLinkView.SIGN.toString()
                                                        ? 'Sign'
                                                        : 'Approve'}
                                                </Button>
                                            </Space>
                                        </Col>
                                    </Row>
                                )}
                            {shareBlockReady &&
                                (isDone ||
                                    (contract.view &&
                                        contract.view.toString() === ShareLinkView.VIEW.toString())) && (
                                    <Row
                                        gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
                                        className="SharingDocFooter"
                                    >
                                        <Col span="24">
                                            <Space
                                                direction="vertical"
                                                style={{ display: 'flex', marginTop: '24px' }}
                                                align="center"
                                            >
                                                <Button
                                                    type="primary"
                                                    icon={<FontAwesomeIcon icon={faDownload} />}
                                                    loading={spinBtn}
                                                    onClick={handleDownload}
                                                >
                                                    Download PDF
                                                </Button>
                                            </Space>
                                        </Col>
                                    </Row>
                                )}
                            <Row
                                gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
                                className="SharingDocFooter"
                                style={{
                                    visibility: !contract.visiblePageBranding
                                        ? 'hidden'
                                        : 'visible',
                                }}
                            >
                                <Col span="24">
                                    <Space
                                        direction="vertical"
                                        style={{ display: 'flex', margin: '24px 0' }}
                                        align="center"
                                    >
                                        <Text type="secondary">
                                            Powered by{' '}
                                            <Link href="https://sendforsign.com" target="_blank">
                                                sendforsign.com
                                            </Link>
                                        </Text>
                                    </Space>
                                </Col>
                            </Row>
                        </Spin>
                    )}
                </Col>
                <Col flex={'auto'}></Col>
            </Row>
            <ResultModal />
            <ApproveModal />
            <SignModal />
            <Notification />
        </RecipientViewContext.Provider >
    );
};
