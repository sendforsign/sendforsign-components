import React, { useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import useSaveArrayBuffer from '../../../hooks/use-save-array-buffer';
import { useRecipientViewContext } from '../recipient-view-context';
import { ContractEvent, ContractSign, PagePlaceholder, Row } from '../../../config/types';
import { ApiEntity, ContractType, EventStatuses, PlaceholderView, ShareLinkView, SpecialType } from '../../../config/enum';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import axios from 'axios';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { BASE_URL } from '../../../config/config';
import PDFMerger from 'pdf-merger-js/browser';
import { pdf } from '@react-pdf/renderer';
import { PdfViewer } from './pdf-viewer/pdf-viewer';
import { PdfViewerPrint } from './pdf-viewer-print/pdf-viewer-print';
import { PdfSign } from './pdf-viewer/pdf-sign';
import { PdfAuditTrail } from './pdf-viewer/pdf-audit-trail/pdf-audit-trail';

dayjs.extend(utc);
type Props = {
    onLoad?: (data: any) => void;
};
export const PdfEditorBlock = ({
    onLoad,
}: Props) => {
    const {
        contract,
        placeholder,
        contractSign,
        pdfFileLoad,
        setSignModal,
        setApproveModal,
        setShareLinkView,
        setNotification,
        sign,
        setSign,
        contractEvent,
        signs,
        refreshSigns,
        setRefreshSigns,
        setPdfFileLoad
    } = useRecipientViewContext();
    // const shareLinkView = useSelector(shareLinkViewSelector); 
    const [pdfData, setPdfData] = useState<ArrayBuffer>();
    const [offsetHeight, setOffsetHeight] = useState(0);
    const CANVAS_WIDTH = 1000;
    const PAGE_SCALE = 1.187648456057007; // Масштаб страницы PDF по умолчанию

    const rows = useRef<Row[]>([]);
    const [currPagePlaceholders, setCurrPagePlaceholders] = useState<
        PagePlaceholder[]
    >([]);
    const pagePlaceholders = useRef<PagePlaceholder[]>([]);
    const { getArrayBuffer, setArrayBuffer } = useSaveArrayBuffer();
    const div = document.getElementById(`page_0`);
    const divFill = useRef(false);

    useEffect(() => {
        const getValue = async () => {
            const arrayBuffer: ArrayBuffer = (await getArrayBuffer(
                'pdfFile'
            )) as ArrayBuffer;
            // console.log('pdfFileLoad', pdfFileLoad, arrayBuffer);
            return setPdfData(arrayBuffer);
        };
        getValue();
    }, [pdfFileLoad]);
    useEffect(() => {
        if (div && !divFill.current) {
            // console.log('divFill.current', divFill.current);
            setOffsetHeight(div?.offsetHeight as number);
            divFill.current = true;
            if (contract.audit) {
                setRefreshSigns(refreshSigns + 1);
            }
        }
    }, [div]);
    // Calculate scale based on container width
    // useEffect(() => {
    //   if (width) {
    //     const newScale = width / (CANVAS_WIDTH * PAGE_SCALE);
    //     console.log('newScale', newScale, width);
    //     setScale(newScale);
    //   }
    // }, [width]);

    useEffect(() => {
        if (placeholder && placeholder.length > 0 && signs) {
            let pagePlaceholdersTmp: PagePlaceholder[] = [];
            for (let i = 0; i < placeholder.length; i++) {
                const currentPlaceholder = placeholder[i];
                if (currentPlaceholder?.insertion && currentPlaceholder.insertion.length > 0) {
                    for (let j = 0; j < currentPlaceholder.insertion.length; j++) {
                        const insertion = currentPlaceholder.insertion[j];
                        if (!insertion) continue;
                        let base64 = '';
                        let value = '';
                        let findSign: ContractSign | undefined;

                        if (Array.isArray(signs) && signs.length > 0) {
                            findSign = signs.find(
                                (contractSignData: ContractSign) =>
                                    contractSignData.shareLink ===
                                    currentPlaceholder.externalRecipientKey
                            );
                        }

                        if (
                            currentPlaceholder.view?.toString() ===
                            PlaceholderView.SIGNATURE.toString() &&
                            findSign?.base64
                        ) {
                            base64 = findSign.base64;
                        }

                        if (
                            currentPlaceholder.isSpecial &&
                            currentPlaceholder.specialType &&
                            currentPlaceholder.externalRecipientKey
                        ) {
                            switch (currentPlaceholder.specialType) {
                                case SpecialType.DATE:
                                    if (findSign?.createTime) {
                                        value = `${dayjs(findSign.createTime)
                                            .utc()
                                            .format('YYYY-MM-DD HH:mm:ss')} GMT`;
                                    } else if (currentPlaceholder.value) {
                                        value = `${dayjs(currentPlaceholder.value).format(
                                            'YYYY-MM-DD @ HH:mm:ss'
                                        )} GMT`;
                                    } else {
                                        value = currentPlaceholder.name || '';
                                    }
                                    break;
                                case SpecialType.FULLNAME:
                                    if (findSign?.fullName) {
                                        value = findSign.fullName;
                                    } else if (currentPlaceholder.value) {
                                        value = currentPlaceholder.value;
                                    } else {
                                        value = currentPlaceholder.name || '';
                                    }
                                    break;
                                case SpecialType.EMAIL:
                                    if (findSign?.email) {
                                        value = findSign.email;
                                    } else if (currentPlaceholder.value) {
                                        value = currentPlaceholder.value;
                                    } else {
                                        value = currentPlaceholder.name || '';
                                    }
                                    break;
                                case SpecialType.SIGN:
                                    if (findSign?.base64) {
                                        base64 = findSign.base64;
                                    } else if (currentPlaceholder.value) {
                                        base64 = currentPlaceholder.value;
                                    }
                                    break;
                            }
                        } else {
                            value = currentPlaceholder.value || '';
                        }

                        let owner = false;
                        if (currentPlaceholder.externalRecipientKey === contract.shareLink) {
                            owner = true;
                        }

                        pagePlaceholdersTmp.push({
                            pageId: insertion.pageId,
                            id: insertion.id,
                            placeholderKey: currentPlaceholder.placeholderKey,
                            value: value,
                            name: currentPlaceholder.name || '',
                            positionX: parseInt(insertion.positionX?.toString() || '0', 10),
                            positionY: parseInt(insertion.positionY?.toString() || '0', 10),
                            width: parseInt(insertion.width?.toString() || '0', 10),
                            height: parseInt(insertion.height?.toString() || '0', 10),
                            view: currentPlaceholder.view,
                            base64: base64,
                            owner: owner,
                            isSpecial: currentPlaceholder.isSpecial,
                            specialType: currentPlaceholder.specialType,
                        });
                    }
                }
            }
            setCurrPagePlaceholders(pagePlaceholdersTmp);
            pagePlaceholders.current = pagePlaceholdersTmp;
        }
    }, [placeholder, signs]);
    useEffect(() => {
        if (contractEvent && signs) {
            let rowsTmp: Row[] = contractEvent
                .filter(
                    (contractEventData: ContractEvent) =>
                        contractEventData.status?.toString() ===
                        EventStatuses.SIGNED.toString()
                )
                ?.map((contractEventData: ContractEvent) => {
                    let row: Row = {};
                    if (contractEventData.ipInfo) {
                        const json = JSON.parse(contractEventData.ipInfo);
                        if (json) {
                            row.json = json;
                        }
                    }
                    const signFind = signs.find(
                        (signData) =>
                            signData.email === contractEventData.email &&
                            signData.fullName === contractEventData.name
                    );
                    if (signFind) {
                        row.base64 = signFind.base64;
                    }
                    row.email = contractEventData.email;
                    row.name = contractEventData.name;
                    row.createTime = `${dayjs(contractEventData.createTime).format(
                        'YYYY-MM-DD @ HH:mm:ss'
                    )} GMT`;
                    return row;
                });
            rows.current = rowsTmp;
        }
    }, [contractEvent, signs]);
    useEffect(() => {
        if (
            sign &&
            contractSign &&
            contract.contractType?.toString() === ContractType.PDF.toString()
        ) {
            setRefreshSigns(refreshSigns + 1);
        }
    }, [sign]);
    useEffect(() => {
        const render = async () => {
            // console.log('5');
            // debugger;
            let merger = new PDFMerger();
            let arrayBuffer: ArrayBuffer = (await getArrayBuffer(
                'pdfFileOriginal'
            )) as ArrayBuffer;
            await merger.add(arrayBuffer);

            let blob = await pdf(<PdfSign signs={signs} />).toBlob();
            arrayBuffer = await blob.arrayBuffer();
            await merger.add(arrayBuffer);

            if (contract.audit) {
                const auditTrail = await pdf(
                    <PdfAuditTrail contract={contract} rows={rows.current} />
                ).toBlob();
                await merger.add(await auditTrail.arrayBuffer());
                //   mergedPdf = await addPlaceholderToPdf(mergedPdf);
                //   // const blob = new Blob([mergedPdf], { type: 'application/pdf' });
            }

            let mergedPdfBlob = await merger.saveAsBlob();
            let mergedPdf = await mergedPdfBlob.arrayBuffer();
            await setArrayBuffer('pdfFile', mergedPdf);

            setPdfFileLoad(pdfFileLoad + 1);
            if (sign) {
                sendPdf();
                setSign('');
            }
        };
        if (
            signs &&
            signs.length > 0 &&
            contract.contractType?.toString() === ContractType.PDF.toString()
        ) {
            // console.log('contractSignsData1', signs);
            render();
        }
    }, [signs]);
    const addPlaceholderToPdf = async (content: ArrayBuffer) => {
        // console.log('7');
        const pdfDoc = await PDFDocument.load(content);
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();
        pagePlaceholders.current.sort((a, b) => {
            if (a.pageId && b.pageId && parseInt(a.pageId.toString(), 10) < parseInt(b.pageId.toString(), 10)) {
                return -1;
            }
            if (a.pageId && b.pageId && parseInt(a.pageId.toString(), 10) > parseInt(b.pageId.toString(), 10)) {
                return 1;
            }
            return 0;
        });
        for (let i = 0; i < pagePlaceholders.current.length; i++) {
            const placeholder = pagePlaceholders.current[i];
            if (!placeholder.pageId) continue; // Skip if pageId is undefined
            const scale = pages[placeholder.pageId].getWidth() / 1000;
            const y = parseInt(
                (
                    parseInt(
                        offsetHeight > 0
                            ? offsetHeight.toString()
                            : pages[placeholder.pageId]
                                .getHeight()
                                .toString(),
                        10
                    ) -
                    (placeholder.positionY ? parseInt(placeholder.positionY.toString(), 10) : 0) -
                    (placeholder.height ? parseInt(placeholder.height.toString(), 10) : 0)
                ).toString()
            );
            if (
                placeholder.view?.toString() ===
                PlaceholderView.SIGNATURE.toString() ||
                (placeholder.isSpecial &&
                    placeholder.specialType?.toString() ===
                    SpecialType.SIGN.toString())
            ) {
                if (placeholder.positionX && placeholder.width && placeholder.height) {
                    pages[placeholder.pageId].drawRectangle({
                        x: placeholder.positionX * scale,
                        y: y * scale,
                        width: placeholder.width * scale,
                        height: placeholder.height * scale,
                        // rotate: degrees(-15),
                        borderWidth: 1,
                        borderColor: rgb(1, 1, 1),
                        color: rgb(1, 1, 1),
                        // opacity: 0.5,
                        borderOpacity: 0.75,
                    });
                    if (placeholder.base64) {
                        const pngImage = await pdfDoc.embedPng(
                            placeholder.base64
                        );
                        pages[placeholder.pageId].drawImage(pngImage, {
                            x: placeholder.positionX * scale,
                            y: y * scale,
                            width: placeholder.width * scale,
                            height: placeholder.height * scale,
                        });
                    }
                } else {
                    if (placeholder.positionX && placeholder.width && placeholder.height) {
                        pages[placeholder.pageId].drawRectangle({
                            x: placeholder.positionX * scale,
                            y: y * scale,
                            width: placeholder.width * scale,
                            height: placeholder.height * scale,
                            // rotate: degrees(-15),
                            borderWidth: 1,
                            borderColor: rgb(1, 1, 1),
                            color: rgb(1, 1, 1),
                            // opacity: 0.5,
                            borderOpacity: 0.75,
                        });
                        pages[placeholder.pageId].drawText(
                            placeholder.value
                                ? placeholder.value as string
                                : placeholder.name as string,
                            {
                                x: placeholder.positionX * scale,
                                y:
                                    (y +
                                        parseInt(placeholder.height.toString(), 10)) *
                                    scale -
                                    12,
                                font: helveticaFont,
                                size: 13.5,
                                lineHeight: 20,
                                color: rgb(0, 0, 0),
                                opacity: 1,
                                maxWidth: placeholder.width * scale,
                            }
                        );
                    }
                }
                const pdfBytes = await pdfDoc.save();
                const merger = new PDFMerger();

                await merger.add(pdfBytes.buffer as ArrayBuffer);

                // debugger;
                const auditTrail = await pdf(
                    <PdfAuditTrail contract={contract} rows={rows.current} />
                ).toBlob();
                await merger.add(await auditTrail.arrayBuffer());

                const mergedPdfBlob = await merger.saveAsBlob();
                return await mergedPdfBlob.arrayBuffer();
            };
        }
    };
    // const sendPdf = async () => {
    //     const formData = new FormData();
    //     const pdfFile = (await getArrayBuffer('pdfFile')) as ArrayBuffer;
    //     console.log('pdfFile', pdfFile);
    //     const mergedPdf = (await addPlaceholderToPdf(pdfFile)) as ArrayBuffer;
    //     console.log('mergedPdf', mergedPdf);
    //     const blob = new Blob([mergedPdf], { type: 'application/pdf' });
    //     formData.append('pdf', blob);

    //     let url = `${BASE_URL}${ApiEntity.RECIPIENT_EMAIL_SIGN_PDF}?shareLink=${contract.shareLink}`;

    //     const response = await axios
    //         .post(url, formData, {
    //             responseType: 'json',
    //         })
    //         .catch((error) => {
    //             setNotification({
    //                 text:
    //                     error.response &&
    //                         error.response.data &&
    //                         error.response.data.message
    //                         ? error.response.data.message
    //                         : error.message,
    //             });
    //         });
    // };
    const sendPdf = async () => {
        let body = {
            shareLink: contract.shareLink,
        };
        await axios
            .post(BASE_URL + ApiEntity.RECIPIENT_SIGN_EMAIL, body, {
                headers: {
                    Accept: 'application/vnd.api+json',
                    'Content-Type': 'application/vnd.api+json',
                },
                responseType: 'json',
            })
            .then((payload: any) => {
                //console.log('editor read', payload);
            })
            .catch((error) => {
                setNotification({
                    text:
                        error.response && error.response.data && error.response.data.message
                            ? error.response.data.message
                            : error.message,
                });
            });
    };
    const handleBtn = async () => {
        let changed = false;
        let viewCurrent: ShareLinkView = contract.view as ShareLinkView;
        let body = {
            shareLink: contract.shareLink,
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
    //   // console.log('pagePlaceholders', pagePlaceholders);
    const adjustTextSize = () => {
        const divs = document.getElementsByClassName('hola'); // Получаем все элементы с классом 'hola'
        if (divs.length === 0) return; // Проверяем, существуют ли элементы
        // console.log('adjustTextSize');
        Array.from(divs).forEach((div) => {
            // Применяем логику к каждому элементу
            const element = div as HTMLElement; // Cast to HTMLElement
            element.style.fontFamily = 'sans-serif';
            const fontSize = 14;
            let currentFontSize = fontSize;

            // Проверяем, помещается ли текст
            while (element.scrollHeight > element.clientHeight) {
                currentFontSize -= 1;
                element.style.fontSize = `${currentFontSize}px`; // Use the casted element
                if (currentFontSize <= 1) {
                    break; // Предотвращаем бесконечный цикл
                }
            }
        });
    };

    // Если текст может изменяться динамически, наблюдаем за изменениями
    useEffect(() => {
        const observer = new MutationObserver(adjustTextSize);
        const targetNodes = document.getElementsByClassName('hola'); // Получаем все элементы с классом 'hola'
        Array.from(targetNodes).forEach((node) => {
            observer.observe(node, {
                childList: true,
                characterData: true,
                subtree: true,
            });
        });
        return () => {
            observer.disconnect();
        };
    }, []);
    return (
        <>  {contract.audit ? (
            <PdfViewerPrint
                pdfData={pdfData as ArrayBuffer}
                pagePlaceholders={pagePlaceholders.current}
                onBtnClick={handleBtn}
                onAdjustTextSize={adjustTextSize}
                onLoad={(data) => {
                    // console.log(
                    //     'PdfViewerPrint',
                    //     data,
                    // );
                }}
            />
        ) : (
            <PdfViewer
                pdfData={pdfData as ArrayBuffer}
                pagePlaceholders={pagePlaceholders.current}
                onBtnClick={handleBtn}
                onAdjustTextSize={adjustTextSize}
            />
        )}</>

    );
};

