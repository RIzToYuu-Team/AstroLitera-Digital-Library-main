import React, { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
import { useNavigate } from "react-router-dom";
import "../components/BookReader.css";

import defaultPdf from "../assets/Hell_Screen.pdf";

GlobalWorkerOptions.workerSrc = pdfWorker;

export default function BookReader({ pdfSrc = defaultPdf, title }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const thumbsRef = useRef(null);

  const navigate = useNavigate();

  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  // Scale default 100%
  const [scale, setScale] = useState(1);
  const [thumbScale] = useState(0.18);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load PDF
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      const loadingTask = getDocument({ url: pdfSrc });
      const pdf = await loadingTask.promise;
      if (!mounted) return;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setIsLoading(false);
    };
    load();

    return () => { mounted = false };
  }, [pdfSrc]);

  // Render main canvas
  useEffect(() => {
    if (!pdfDoc) return;

    const renderPage = async (num) => {
      const page = await pdfDoc.getPage(num);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport }).promise;
    };

    renderPage(pageNumber).catch(console.error);
  }, [pdfDoc, pageNumber, scale]);

  // Render thumbnails
  useEffect(() => {
    if (!pdfDoc || !thumbsRef.current) return;

    const container = thumbsRef.current;
    container.innerHTML = "";

    const renderThumb = async (p) => {
      const page = await pdfDoc.getPage(p);
      const viewport = page.getViewport({ scale: thumbScale });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      await page.render({ canvasContext: ctx, viewport }).promise;

      const wrapper = document.createElement("div");
      wrapper.className = "thumb-wrapper";
      wrapper.appendChild(canvas);

      const label = document.createElement("div");
      label.className = "thumb-label";
      label.innerText = p;
      wrapper.appendChild(label);

      wrapper.onclick = () => {
        setPageNumber(p);
        wrapper.scrollIntoView({ behavior: "smooth", block: "nearest" });
      };

      container.appendChild(wrapper);
    };

    (async () => {
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        await renderThumb(i);
      }
    })();
  }, [pdfDoc, thumbScale]);

  // Navigation
  const prevPage = () => setPageNumber((p) => Math.max(1, p - 1));
  const nextPage = () => setPageNumber((p) => Math.min(totalPages, p + 1));

  const zoomIn = () => setScale((s) => Math.min(3, +(s + 0.25).toFixed(2)));
  const zoomOut = () => setScale((s) => Math.max(0.5, +(s - 0.25).toFixed(2)));

  const openFullscreen = async () => {
    const elem = containerRef.current;
    if (!elem) return;
    if (elem.requestFullscreen) await elem.requestFullscreen();
  };

  return (
    <div className="reader-root">
      {/* TOP BAR */}
      <div className="reader-topbar">

        <div className="reader-left">
          <button className="back-btn-plain" onClick={() => navigate(-1)} aria-label="Kembali">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M15 18L9 12l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="back-text">Kembali</span>
          </button>
          <span className="back-left"></span>
        </div>

        <div className="reader-controls">
          <button className="icon-btn" onClick={zoomOut}>-</button>
          <span className="zoom-label">{Math.round(scale * 100)}%</span>
          <button className="icon-btn" onClick={zoomIn}>+</button>

          <button className="icon-btn" onClick={openFullscreen}>⛶</button>

          <a className="icon-btn download-btn" href={pdfSrc} download aria-label="Download PDF">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 11l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 21H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>

      {/* MAIN BODY */}
      <div className="reader-body" ref={containerRef}>

        {/* SIDEBAR */}
        <aside className="thumb-sidebar">
          <div className="page-count">Halaman</div>
          <div className="thumbs" ref={thumbsRef} />
        </aside>

        {/* VIEWER */}
        <main className="viewer-area">
          <div className="canvas-wrap">
            {isLoading ? (
              <div className="loading">Memuat PDF...</div>
            ) : (
              <canvas ref={canvasRef} className="pdf-canvas" />
            )}
          </div>

          <div className="viewer-bottom">
            <button className="nav-btn" onClick={prevPage}>◀ Sebelumnya</button>
            <div className="page-indicator">
              Halaman <strong>{pageNumber}/{totalPages}</strong>
            </div>
            <button className="nav-btn" onClick={nextPage}>Berikutnya ▶</button>
          </div>
        </main>

      </div>
    </div>
  );
}
