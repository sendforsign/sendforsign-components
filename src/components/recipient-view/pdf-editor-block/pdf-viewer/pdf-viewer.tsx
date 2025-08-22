import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useResizeDetector } from 'react-resize-detector';
import { Spin } from 'antd';
import cn from 'classnames';
import './pdf-viewer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignature } from '@fortawesome/free-solid-svg-icons';
import { useRecipientViewContext } from '../../recipient-view-context';
import { PagePlaceholder } from '../../../../config/types';
import { PlaceholderView, SpecialType } from '../../../../config/enum';


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
type Props = {
  onLoad?: (data: any) => void;
  onBtnClick: () => void;
  onAdjustTextSize: () => void;
  pdfData: ArrayBuffer,
  pagePlaceholders: PagePlaceholder[],
};
export const PdfViewer = ({
  onLoad,
  onBtnClick,
  onAdjustTextSize,
  pdfData,
  pagePlaceholders
}: Props) => {
  const {
    contract,
    shareBlockReady,
  } = useRecipientViewContext();
  const [numPages, setNumPages] = useState(1);
  const [scale, setScale] = useState(1);
  const CANVAS_WIDTH = 1000;
  const PAGE_SCALE = 1.187648456057007; // Масштаб страницы PDF по умолчанию 
  const { width, ref } = useResizeDetector({
    // handleWidth: true,
    // refreshMode: 'throttle',
    skipOnMount: true,
    observerOptions: {
      box: 'content-box'
    },
    onResize: (e: any) => {
      const newScale = e / (CANVAS_WIDTH * PAGE_SCALE);
      console.log('onResize', e, newScale);
      setScale(newScale);
    }
  });
  return (
    // <Spin spinning={!pdfData || pdfData?.byteLength === 0} style={{ marginTop: '30px' }}>
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
                console.log('onLoadSuccess', data, scale);

                onAdjustTextSize();
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
                            width: `${pagePlacehold.width ? (pagePlacehold.width - 2) * scale * PAGE_SCALE : 0
                              }px`,
                            height: `${pagePlacehold.height ? (pagePlacehold.height - 1) * scale * PAGE_SCALE : 0
                              }px`,
                            transform: `translate3d(${pagePlacehold.positionX ?
                              (pagePlacehold.positionX - 2) *
                              scale *
                              PAGE_SCALE : 0
                              }px, ${pagePlacehold.positionY ?
                                (pagePlacehold.positionY - 1) *
                                scale *
                                PAGE_SCALE : 0
                              }px, 0)`,
                            WebkitTransform: `translate3d(${pagePlacehold.positionX ?
                              (pagePlacehold.positionX - 2) *
                              scale *
                              PAGE_SCALE : 0
                              }px, ${pagePlacehold.positionY ?
                                (pagePlacehold.positionY - 1) *
                                scale *
                                PAGE_SCALE : 0
                              }px, 0)`,
                          }}
                          className={cn(contract.audit
                            ? 'placeholderPrint'
                            : pagePlacehold.owner
                              ? 'placeholderOwner'
                              : 'placeholderOther',
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
                              onBtnClick();
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
                                  width={
                                    pagePlacehold.width ? pagePlacehold.width * scale * PAGE_SCALE : 0
                                  }
                                  height={
                                    pagePlacehold.height ? pagePlacehold.height * scale * PAGE_SCALE : 0
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
    // </Spin>
  );
};

