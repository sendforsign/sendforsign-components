import React, { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useResizeDetector } from 'react-resize-detector';
import { Spin } from 'antd';
import cn from 'classnames';
import './pdf-viewer.css';
// import { PlaceholderView, ShareLinkView, SpecialType } from 'config/enums';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignature } from '@fortawesome/free-solid-svg-icons';
import useSaveArrayBuffer from '../../../hooks/use-save-array-buffer';
import { useRecipientViewContext } from '../recipient-view-context';
import { PagePlaceholder } from '../../../config/types';
import { PlaceholderView, SpecialType } from '../../../config/enum';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
type Props = {
  pagePlaceholders?: PagePlaceholder[];
  onLoad?: (data: any) => void;
  forPrint?: boolean;
};
export const PdfViewer = ({
  pagePlaceholders,
  onLoad,
  forPrint = false,
}: Props) => {
  const { contract, contractValue, pdfFileLoad, shareBlockReady } = useRecipientViewContext();
  // const shareLinkView = useSelector(shareLinkViewSelector); 
  const [pdfData, setPdfData] = useState<ArrayBuffer>();
  const [numPages, setNumPages] = useState(1);
  const [scale, setScale] = useState(1);
  const CANVAS_WIDTH = 1000;
  const PAGE_SCALE = 1.187648456057007; // Масштаб страницы PDF по умолчанию
  const [currPagePlaceholders, setCurrPagePlaceholders] = useState<
    PagePlaceholder[]
  >([]);
  const { getArrayBuffer } = useSaveArrayBuffer();
  // const [checkContractValue] = useCheckContractValueMutation();
  const { width, ref } = useResizeDetector();
  useEffect(() => {
    const getValue = async () => {
      console.log('pdfFileLoad', pdfFileLoad);
      const arrayBuffer: ArrayBuffer = (await getArrayBuffer(
        'pdfFile'
      )) as ArrayBuffer;
      return setPdfData(arrayBuffer);
    };
    getValue();
  }, [pdfFileLoad]);

  // Calculate scale based on container width
  useEffect(() => {
    if (width) {
      const newScale = width / (CANVAS_WIDTH * PAGE_SCALE);
      setScale(newScale);
    }
  }, [width]);
  const addPlaceholderToPdf = async (content: ArrayBuffer) => {
    // console.log('7');
    // const pdfDoc = await PDFDocument.load(content);
    // const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    // const pages = pdfDoc.getPages();
    // pagePlaceholders.current.sort((a, b) => {
    //   if (
    //     parseInt(a.pageId.toString(), 10) < parseInt(b.pageId.toString(), 10)
    //   ) {
    //     return -1;
    //   }
    //   if (
    //     parseInt(a.pageId.toString(), 10) > parseInt(b.pageId.toString(), 10)
    //   ) {
    //     return 1;
    //   }
    //   return 0;
    // });
    // for (let i = 0; i < pagePlaceholders.current.length; i++) {
    //   const scale = pages[pagePlaceholders.current[i].pageId].getWidth() / 1000;
    //   const y = parseInt(
    //     (
    //       parseInt(
    //         offsetHeight > 0
    //           ? offsetHeight.toString()
    //           : pages[pagePlaceholders.current[i].pageId]
    //             .getHeight()
    //             .toString(),
    //         10
    //       ) -
    //       parseInt(pagePlaceholders.current[i].positionY.toString(), 10) -
    //       parseInt(pagePlaceholders.current[i].height.toString(), 10)
    //     ).toString()
    //   );
    //   // console.log(
    //   //   'div?.offsetHeight',
    //   //   pagePlaceholders.current[i].positionY,
    //   //   pagePlaceholders.current[i].height,
    //   //   pages[pagePlaceholders.current[i].pageId].getHeight(),
    //   //   pages[pagePlaceholders.current[i].pageId].getWidth(),
    //   //   div,
    //   //   offsetHeight,
    //   //   scale,
    //   //   y
    //   // );
    //   if (
    //     pagePlaceholders.current[i].view.toString() ===
    //     PlaceholderView.SIGNATURE.toString() ||
    //     (pagePlaceholders.current[i].isSpecial &&
    //       pagePlaceholders.current[i].specialType.toString() ===
    //       SpecialType.SIGN.toString())
    //   ) {
    //     pages[pagePlaceholders.current[i].pageId].drawRectangle({
    //       x: pagePlaceholders.current[i].positionX * scale,
    //       y: y * scale,
    //       width: pagePlaceholders.current[i].width * scale,
    //       height: pagePlaceholders.current[i].height * scale,
    //       // rotate: degrees(-15),
    //       borderWidth: 1,
    //       borderColor: rgb(1, 1, 1),
    //       color: rgb(1, 1, 1),
    //       // opacity: 0.5,
    //       borderOpacity: 0.75,
    //     });
    //     if (pagePlaceholders.current[i].base64) {
    //       const pngImage = await pdfDoc.embedPng(
    //         pagePlaceholders.current[i].base64
    //       );
    //       pages[pagePlaceholders.current[i].pageId].drawImage(pngImage, {
    //         x: pagePlaceholders.current[i].positionX * scale,
    //         y: y * scale,
    //         width: pagePlaceholders.current[i].width * scale,
    //         height: pagePlaceholders.current[i].height * scale,
    //       });
    //     }
    //   } else {
    //     pages[pagePlaceholders.current[i].pageId].drawRectangle({
    //       x: pagePlaceholders.current[i].positionX * scale,
    //       y: y * scale,
    //       width: pagePlaceholders.current[i].width * scale,
    //       height: pagePlaceholders.current[i].height * scale,
    //       // rotate: degrees(-15),
    //       borderWidth: 1,
    //       borderColor: rgb(1, 1, 1),
    //       color: rgb(1, 1, 1),
    //       // opacity: 0.5,
    //       borderOpacity: 0.75,
    //     });
    //     pages[pagePlaceholders.current[i].pageId].drawText(
    //       pagePlaceholders.current[i].value
    //         ? pagePlaceholders.current[i].value
    //         : pagePlaceholders.current[i].name,
    //       {
    //         x: pagePlaceholders.current[i].positionX * scale,
    //         y:
    //           (y +
    //             parseInt(pagePlaceholders.current[i].height.toString(), 10)) *
    //           scale -
    //           12,
    //         font: helveticaFont,
    //         size: 13.5,
    //         lineHeight: 20,
    //         color: rgb(0, 0, 0),
    //         opacity: 1,
    //         maxWidth: pagePlaceholders.current[i].width * scale,
    //       }
    //     );
    //   }
    // }
    // const pdfBytes = await pdfDoc.save();
    // const merger = new PDFMerger();

    // await merger.add(pdfBytes.buffer as ArrayBuffer);

    // // debugger;
    // const auditTrail = await pdf(
    //   <PdfAuditTrail contract={contract} rows={rows.current} />
    // ).toBlob();
    // await merger.add(await auditTrail.arrayBuffer());

    // const mergedPdfBlob = await merger.saveAsBlob();
    // return await mergedPdfBlob.arrayBuffer();
  };
  const handleBtn = async () => {
    // let changed = false;
    // let viewCurrent: ShareLinkView = shareLinkView;
    // await checkContractValue({
    //   shareLink: contract.shareLink,
    //   changeTime: contractValue.changeTime,
    //   view: shareLinkView,
    // })
    //   .unwrap()
    //   .then((payload) => {
    //     changed = payload.changed;
    //     if (payload.view) {
    //       viewCurrent = payload.view;
    //     }
    //   });
    // if (!changed) {
    //   dispatch(setSignModal(true));
    // } else {
    //   if (shareLinkView.toString() !== viewCurrent.toString()) {
    //     dispatch(setShareLinkView(viewCurrent));
    //     dispatch(
    //       setNotification({
    //         text: 'Owner changed the permissions',
    //       })
    //     );
    //   } else {
    //     dispatch(
    //       setNotification({
    //         text: 'Contract updated. Please, reload your page',
    //       })
    //     );
    //   }
    // }
  };
  // console.log('pagePlaceholders', pagePlaceholders);
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
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <Document
        loading={<Spin spinning={!shareBlockReady} />}
        file={pdfData}
        onLoadSuccess={({ numPages }) => {
          // console.log('onLoadSuccess');
          setNumPages(numPages);
        }}
      >
        {new Array(numPages).fill(0).map((_, i) => {
          return (
            <Page
              renderTextLayer={false}
              width={CANVAS_WIDTH}
              pageNumber={i + 1}
              // scale={scale}
              scale={scale * PAGE_SCALE}
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
                {pagePlaceholders &&
                  pagePlaceholders.length > 0 &&
                  pagePlaceholders
                    .filter(
                      (pagePlaceholder) =>
                        pagePlaceholder.pageId && pagePlaceholder.pageId.toString() === i.toString()
                    )
                    .map((pagePlaceholder) => {
                      // console.log('pageId', i, pagePlaceholder.pageId);

                      return (
                        <div
                          id={`insertion_${pagePlaceholder?.placeholderKey?.replaceAll(
                            '-',
                            '_'
                          )}-${pagePlaceholder.pageId}-${pagePlaceholder.id}`}
                          style={{
                            width: `${pagePlaceholder.width ? (pagePlaceholder.width - 2) * scale * PAGE_SCALE : 0
                              }px`,
                            height: `${pagePlaceholder.height ? (pagePlaceholder.height - 1) * scale * PAGE_SCALE : 0
                              }px`,
                            transform: `translate3d(${pagePlaceholder.positionX ?
                              (pagePlaceholder.positionX - 2) *
                              scale *
                              PAGE_SCALE : 0
                              }px, ${pagePlaceholder.positionY ?
                                (pagePlaceholder.positionY - 1) *
                                scale *
                                PAGE_SCALE : 0
                              }px, 0)`,
                            WebkitTransform: `translate3d(${pagePlaceholder.positionX ?
                              (pagePlaceholder.positionX - 2) *
                              scale *
                              PAGE_SCALE : 0
                              }px, ${pagePlaceholder.positionY ?
                                (pagePlaceholder.positionY - 1) *
                                scale *
                                PAGE_SCALE : 0
                              }px, 0)`,
                          }}
                          className={cn(
                            forPrint
                              ? 'placeholderPrint'
                              : pagePlaceholder.owner
                                ? 'placeholderOwner'
                                : 'placeholderOther',
                            !contract.isDone &&
                              pagePlaceholder.owner &&
                              !pagePlaceholder.base64 &&
                              (pagePlaceholder.view?.toString() ===
                                PlaceholderView.SIGNATURE.toString() ||
                                (pagePlaceholder.isSpecial &&
                                  pagePlaceholder.specialType?.toString() ===
                                  SpecialType.SIGN.toString()))
                              ? 'classWithHover'
                              : ''
                          )}
                          onClick={() => {
                            if (
                              !contract.isDone &&
                              pagePlaceholder.owner &&
                              !pagePlaceholder.base64 &&
                              (pagePlaceholder.view?.toString() ===
                                PlaceholderView.SIGNATURE.toString() ||
                                (pagePlaceholder.isSpecial &&
                                  pagePlaceholder.specialType?.toString() ===
                                  SpecialType.SIGN.toString()))
                            ) {
                              handleBtn();
                            }
                          }}
                        >
                          {pagePlaceholder.view?.toString() ===
                            PlaceholderView.SIGNATURE.toString() ||
                            (pagePlaceholder.isSpecial &&
                              pagePlaceholder.specialType?.toString() ===
                              SpecialType.SIGN.toString()) ? (
                            <>
                              {pagePlaceholder.base64 ? (
                                <img
                                  alt="signature"
                                  src={pagePlaceholder.base64}
                                  width={
                                    pagePlaceholder.width ? pagePlaceholder.width * scale * PAGE_SCALE : 0
                                  }
                                  height={
                                    pagePlaceholder.height ? pagePlaceholder.height * scale * PAGE_SCALE : 0
                                  }
                                  style={{ objectFit: 'contain' }}
                                />
                              ) : (
                                <FontAwesomeIcon
                                  icon={faSignature}
                                  style={{
                                    padding: `${4 * scale * PAGE_SCALE}px`,
                                  }}
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
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                whiteSpace: 'normal',
                                maxHeight: '100%',
                                fontSize: `${14 * scale * PAGE_SCALE}px`,
                              }}
                            >
                              {pagePlaceholder.value
                                ? pagePlaceholder.value
                                : pagePlaceholder.name}
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
    </div >
  );
};
