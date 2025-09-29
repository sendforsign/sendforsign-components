import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useResizeDetector } from 'react-resize-detector';
import { Spin } from 'antd';
import cn from 'classnames';
import './pdf-viewer-print.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignature } from '@fortawesome/free-solid-svg-icons';
import { useRecipientViewContext } from '../../recipient-view-context';
import { PagePlaceholder, Row } from '../../../../config/types';
import { PlaceholderView, SpecialType } from '../../../../config/enum';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
type Props = {
  onLoad?: (data: any) => void;
  onBtnClick: () => void;
  onAdjustTextSize: () => void;
  pdfData: ArrayBuffer,
  pagePlaceholders: PagePlaceholder[],
};
export const PdfViewerPrint = ({
  onLoad,
  onBtnClick,
  onAdjustTextSize,
  pdfData,
  pagePlaceholders,
}: Props) => {
  const {
    contract,
    shareBlockReady,
  } = useRecipientViewContext();
  const [numPages, setNumPages] = useState(1);
  const { ref } = useResizeDetector();

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
          // console.log('PdfViewer onSourceError');
        }}
        onLoadError={() => {
          // console.log('PdfViewer onLoadError');
        }}
        onError={() => {
          // console.log('PdfViewer error');
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
                // console.log('onLoadSuccess', new Date().getMilliseconds());

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

