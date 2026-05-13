  import React, { useEffect, useRef, useState } from "react";
  import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
  import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
  import "../components/BookReader.css";
  import { useLocation, useNavigate } from "react-router-dom";

  import defaultPdf from "../assets/Hell_Screen.pdf";

  GlobalWorkerOptions.workerSrc = pdfWorker;

  export default function BookReader({ pdfSrc = defaultPdf, title = "Buku" }) {
    const location = useLocation();
    const finalPdfSrc = location.state?.pdfSrc || pdfSrc;
    const finalTitle = location.state?.title || title || "Buku";
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const thumbsRef = useRef(null);
    const renderTaskRef = useRef(null);

    const navigate = useNavigate();

    const [pdfDoc, setPdfDoc] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1);
    const [thumbScale] = useState(0.18);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      let cancelled = false;
      let loadingTask = null;

      async function loadPdf() {
        try {
          setIsLoading(true);
          setPdfDoc(null);
          setTotalPages(0);
          setPageNumber(1);

          loadingTask = getDocument({ url: finalPdfSrc });
          const pdf = await loadingTask.promise;

          if (cancelled) return;

          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
        } catch (err) {
          if (!cancelled) {
            console.error(err);
          }
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      }

      loadPdf();

      return () => {
        cancelled = true;

        if (loadingTask) {
          loadingTask.destroy?.();
        }

        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }
      };
    }, [finalPdfSrc]);

    useEffect(() => {
      if (!pdfDoc || !canvasRef.current) return;

      let cancelled = false;

      async function renderPage() {
        try {
          if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
            renderTaskRef.current = null;
          }

          const page = await pdfDoc.getPage(pageNumber);
          if (cancelled) return;

          const viewport = page.getViewport({ scale });
          const canvas = canvasRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext("2d");
          const ratio = window.devicePixelRatio || 1;

          canvas.width = Math.floor(viewport.width * ratio);
          canvas.height = Math.floor(viewport.height * ratio);
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;

          ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
          ctx.clearRect(0, 0, viewport.width, viewport.height);

          const renderTask = page.render({
            canvasContext: ctx,
            viewport,
          });

          renderTaskRef.current = renderTask;

          await renderTask.promise;

          if (renderTaskRef.current === renderTask) {
            renderTaskRef.current = null;
          }
        } catch (err) {
          if (err?.name !== "RenderingCancelledException") {
            console.error(err);
          }
        }
      }

      renderPage();

      return () => {
        cancelled = true;

        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }
      };
    }, [pdfDoc, pageNumber, scale]);

    useEffect(() => {
      if (!pdfDoc || !thumbsRef.current) return;

      let cancelled = false;
      const container = thumbsRef.current;
      container.innerHTML = "";

      async function renderThumb(p) {
        const page = await pdfDoc.getPage(p);
        if (cancelled) return;

        const viewport = page.getViewport({ scale: thumbScale });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const ratio = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * ratio);
        canvas.height = Math.floor(viewport.height * ratio);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

        if (cancelled) return;

        const wrapper = document.createElement("button");
        wrapper.type = "button";
        wrapper.className =
          pageNumber === p ? "thumb-wrapper is-active" : "thumb-wrapper";

        wrapper.onclick = () => {
          setPageNumber(p);
          wrapper.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        };

        wrapper.appendChild(canvas);

        const label = document.createElement("div");
        label.className = "thumb-label";
        label.innerText = p;
        wrapper.appendChild(label);

        container.appendChild(wrapper);
      }

      async function renderAllThumbs() {
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          if (cancelled) return;
          await renderThumb(i);
        }
      }

      renderAllThumbs().catch((err) => {
        if (!cancelled) console.error(err);
      });

      return () => {
        cancelled = true;
        container.innerHTML = "";
      };
    }, [pdfDoc, thumbScale, pageNumber]);

    const prevPage = () => {
      setPageNumber((p) => Math.max(1, p - 1));
    };

    const nextPage = () => {
      setPageNumber((p) => Math.min(totalPages, p + 1));
    };

    const zoomIn = () => {
      setScale((s) => Math.min(3, Number((s + 0.25).toFixed(2))));
    };

    const zoomOut = () => {
      setScale((s) => Math.max(0.5, Number((s - 0.25).toFixed(2))));
    };

    const openFullscreen = async () => {
      const elem = containerRef.current;
      if (!elem) return;

      try {
        if (!document.fullscreenElement) {
          await elem.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      } catch (err) {
        console.error(err);
      }
    };

    return (
      <div className="reader-root">
        <div className="reader-topbar">
          <div className="reader-left">
            <button
              type="button"
              className="back-btn-plain"
              onClick={() => navigate(-1)}
              aria-label="Kembali"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M15 18L9 12l6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <span className="back-text">Kembali</span>
            </button>

            <span className="reader-title">{finalTitle}</span>
          </div>

          <div className="reader-controls">
            <button type="button" className="icon-btn" onClick={zoomOut}>
              -
            </button>

            <span className="zoom-label">{Math.round(scale * 100)}%</span>

            <button type="button" className="icon-btn" onClick={zoomIn}>
              +
            </button>

            <button type="button" className="icon-btn" onClick={openFullscreen}>
              ⛶
            </button>
          </div>
        </div>

        <div className="reader-body" ref={containerRef}>
          <aside className="thumb-sidebar">
            <div className="page-count">Halaman</div>
            <div className="thumbs" ref={thumbsRef} />
          </aside>

          <main className="viewer-area">
            <div className="canvas-wrap">
              {isLoading ? (
                <div className="loading">Memuat PDF...</div>
              ) : (
                <canvas ref={canvasRef} className="pdf-canvas" />
              )}
            </div>

            <div className="viewer-bottom">
              <button
                type="button"
                className="nav-btn"
                onClick={prevPage}
                disabled={pageNumber <= 1}
              >
                ◀ Sebelumnya
              </button>

              <div className="page-indicator">
                Halaman{" "}
                <strong>
                  {pageNumber}/{totalPages}
                </strong>
              </div>

              <button
                type="button"
                className="nav-btn"
                onClick={nextPage}
                disabled={pageNumber >= totalPages}
              >
                Berikutnya ▶
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }