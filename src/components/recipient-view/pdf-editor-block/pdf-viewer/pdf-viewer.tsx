import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialWidth, setInitialWidth] = useState<number | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isScaleStable, setIsScaleStable] = useState(false);
  const lastProcessedWidth = useRef<number | null>(null);
  const CANVAS_WIDTH = 1000;
  const PAGE_SCALE = 1.187648456057007; // Масштаб страницы PDF по умолчанию 
  
  // Сброс состояния инициализации при изменении PDF документа
  useEffect(() => {
    setIsInitialized(false);
    setInitialWidth(null);
    setScale(1);
    setIsPdfLoading(true);
    setIsScaleStable(false);
    lastProcessedWidth.current = null;
  }, [pdfData]);
  
  const handleResize = useCallback((e: any) => {
    // Игнорируем изменения размера до полной инициализации
    if (!e || e <= 0) return;
    
    // Игнорируем изменения во время загрузки PDF
    if (isPdfLoading) return;
    
    // Игнорируем повторные вызовы с тем же размером
    if (lastProcessedWidth.current === e) return;
    
          // Если это первая инициализация, сохраняем начальную ширину и устанавливаем масштаб
      if (!isInitialized) {
        const initialScale = e / (CANVAS_WIDTH * PAGE_SCALE);
        console.log('Initial resize', e, initialScale);
        setScale(initialScale);
        setInitialWidth(e);
        setIsInitialized(true);
        setIsScaleStable(true);
        lastProcessedWidth.current = e;
        return;
      }
      
      // Игнорируем изменения размера меньше чем на 10px (предотвращаем микроколебания)
      if (Math.abs(e - (initialWidth || 0)) < 10) return;
      
      // Если это изменение размера окна пользователем (не инициализация)
      if (isInitialized && e !== initialWidth) {
        setIsScaleStable(false); // Масштаб меняется
        const newScale = e / (CANVAS_WIDTH * PAGE_SCALE);
        console.log('User resize', e, newScale);
        setScale(newScale);
        setInitialWidth(e);
        lastProcessedWidth.current = e;
        
        // Устанавливаем флаг стабильности через небольшую задержку
        setTimeout(() => setIsScaleStable(true), 100);
      }
  }, [isPdfLoading, isInitialized, initialWidth, CANVAS_WIDTH, PAGE_SCALE]);

  const { width, ref } = useResizeDetector({
    // handleWidth: true,
    refreshMode: 'throttle',
    refreshRate: 500, // Увеличиваем задержку
    skipOnMount: true,
    observerOptions: {
      box: 'content-box'
    },
    onResize: handleResize
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
          setIsPdfLoading(false);
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

                // Вызываем onAdjustTextSize только при первой загрузке страницы и когда PDF не загружается
                // Также проверяем, что масштаб стабилен (не меняется в данный момент)
                if (isInitialized && !isPdfLoading && isScaleStable && scale > 0) {
                  onAdjustTextSize();
                  if (onLoad) {
                    onLoad({ pageDetails: data, docRef: ref });
                  }
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

