import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useResizeDetector } from 'react-resize-detector';
import { Spin } from 'antd';
import cn from 'classnames';
import './pdf-viewer-print.css';
// import { PlaceholderView, ShareLinkView, SpecialType } from 'config/enums';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignature } from '@fortawesome/free-solid-svg-icons';
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

dayjs.extend(utc);
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
type Props = {
  onLoad?: (data: any) => void;
};
export const PdfViewerPrint = ({
  onLoad,
}: Props) => {
  const {
    contract,
    placeholder,
    contractSign,
    pdfFileLoad,
    shareBlockReady,
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
  const [numPages, setNumPages] = useState(1);
  const [offsetHeight, setOffsetHeight] = useState(0);// Масштаб страницы PDF по умолчанию

  const rows = useRef<Row[]>([]);
  const pagePlaceholders = useRef<PagePlaceholder[]>([]);
  const { getArrayBuffer, setArrayBuffer } = useSaveArrayBuffer();
  // const [checkContractValue] = useCheckContractValueMutation();
  const { width, ref } = useResizeDetector();

  useEffect(() => {
    const getValue = async () => {
      const arrayBuffer: ArrayBuffer = (await getArrayBuffer(
        'pdfFile'
      )) as ArrayBuffer;
      console.log('pdfFileLoad', pdfFileLoad, arrayBuffer);
      return setPdfData(arrayBuffer);
    };
    getValue();
  }, [pdfFileLoad]);

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
    console.log('adjustTextSize');
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
  console.log('pdfData', pdfData);
  return (
    <div ref={ref}>
      <Document
        loading={<Spin spinning={!shareBlockReady} />}
        file={pdfData}
        onLoadSuccess={({ numPages }) => {
          // console.log('onLoadSuccess');
          setNumPages(numPages);
        }}
        onSourceError={() => {
          console.log('PdfViewer onSourceError');
        }}
        onLoadError={() => {
          console.log('PdfViewer onLoadError');
        }}
        onError={() => {
          console.log('PdfViewer error');
        }}
      >
        {new Array(numPages).fill(0).map((_, i) => {
          return (
            <Page
              renderTextLayer={false}
              width={1000}
              // height={1.4 * width}
              pageNumber={i + 1}
              // scale={scale}
              onLoadSuccess={(data) => {
                console.log('onLoadSuccess', new Date().getMilliseconds());

                adjustTextSize();
                if (onLoad) {
                  onLoad({ pageDetails: data, docRef: ref });
                }
              }}
            >
              <div
                id={`page_${i}`}
                style={{
                  position: 'absolute',
                  margin: 0,
                  padding: 0,
                  zIndex: 1,
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: '100%',
                }}
              >
                {pagePlaceholders.current &&
                  pagePlaceholders.current.length > 0 &&
                  pagePlaceholders.current
                    .filter(
                      (pagePlacehold: PagePlaceholder) =>
                        pagePlacehold.pageId && pagePlacehold.pageId.toString() === i.toString()
                    )
                    .map((pagePlacehold: PagePlaceholder) => {
                      // console.log('pageId', i, pagePlaceholder.pageId);

                      return (
                        <div
                          id={`insertion_${pagePlacehold?.placeholderKey?.replaceAll(
                            '-',
                            '_'
                          )}-${pagePlacehold.pageId}-${pagePlacehold.id}`}
                          style={{
                            width: `${pagePlacehold.width ? pagePlacehold.width - 2 : 0}px`,
                            height: `${pagePlacehold.height ? pagePlacehold.height - 1 : 0}px`,
                            transform: `translate3d(${pagePlacehold.positionX ? pagePlacehold.positionX - 2 : 0}px, ${pagePlacehold.positionY ? pagePlacehold.positionY - 1 : 0}px, 0)`,
                            WebkitTransform: `translate3d(${pagePlacehold.positionX ? pagePlacehold.positionX - 2 : 0}px, ${pagePlacehold.positionY ? pagePlacehold.positionY - 1 : 0}px, 0)`,
                          }}
                          className={cn(
                            pagePlacehold.owner
                              ? 'placeholderOwner'
                              : 'placeholderOther',
                            !contract.isDone &&
                              pagePlacehold.owner &&
                              !pagePlacehold.base64 &&
                              (pagePlacehold.view?.toString() ===
                                PlaceholderView.SIGNATURE.toString() ||
                                (pagePlacehold.isSpecial &&
                                  pagePlacehold.specialType?.toString() ===
                                  SpecialType.SIGN.toString()))
                              ? 'classWithHover'
                              : ''
                          )}
                          onClick={() => {
                            if (
                              !contract.isDone &&
                              pagePlacehold.owner &&
                              !pagePlacehold.base64 &&
                              (pagePlacehold.view?.toString() ===
                                PlaceholderView.SIGNATURE.toString() ||
                                (pagePlacehold.isSpecial &&
                                  pagePlacehold.specialType?.toString() ===
                                  SpecialType.SIGN.toString()))
                            ) {
                              handleBtn();
                            }
                          }}
                        >
                          {pagePlacehold.view?.toString() ===
                            PlaceholderView.SIGNATURE.toString() ||
                            (pagePlacehold.isSpecial &&
                              pagePlacehold.specialType?.toString() ===
                              SpecialType.SIGN.toString()) ? (
                            <>
                              {pagePlacehold.base64 ? (
                                <img
                                  alt="signature"
                                  src={pagePlacehold.base64}
                                  width={pagePlacehold.width}
                                  height={pagePlacehold.height}
                                  style={{ objectFit: 'contain' }}
                                />
                              ) : (
                                <FontAwesomeIcon
                                  icon={faSignature}
                                  style={{ padding: '4px' }}
                                />
                              )}
                            </>
                          ) : (
                            <div
                              className="hola"
                              style={{
                                fontFamily: 'Inter!important',
                                fontWeight: 500,
                                color: 'black',
                                wordBreak: 'break-word', // Break long words onto the next line
                                overflowWrap: 'break-word',
                                whiteSpace: 'normal', // Allow text to wrap
                                maxHeight: '100%', // Ensure it doesn't exceed the container
                              }}
                            >
                              {pagePlacehold.value
                                ? pagePlacehold.value
                                : pagePlacehold.name}
                            </div>
                          )}
                        </div>
                      );
                    })}
              </div>
            </Page>
          );
        })}
      </Document>
    </div>
  );
};

