import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/HomePage";
import Tentang from "./pages/Tentang";
import Kontak from "./pages/Kontak";
import Kebijakan from "./pages/Kebijakan";
import Favorit from "./pages/Favorit";
import Pengaturan from "./pages/Pengaturan";
import Aktivitas from "./pages/Aktivitas";
import DetailBuku from "./pages/DetailBuku";
import KategoriPage from "./pages/KategoriPage";
import HalamanBaca from "./pages/HalamanBaca";
import SearchResult from "./pages/searchResult";
import ViewAllPage from "./pages/ViewAllPage";
import ResetPassword from "./pages/ResetPassword";
import Toast, { ToastProvider } from "./components/Toast";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage";
import AdminUserDataPage from "./pages/Admin/AdminUserDataPage";
import AdminBookDataPage_v2 from "./pages/Admin/AdminBookDataPage_v2";
import AdminAccessRequestPage from "./pages/Admin/AdminAccessRequestPage";
import AdminUserActivityReportPage from "./pages/Admin/AdminUserActivityReportPage";

function App() {
  const [toast, setToast] = useState(null);
  const hideTimerRef = useRef(null);

  function showToast(type, message) {
    setToast({ type, message });

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setToast(null), 3500);
  }

  const closeToast = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
    setToast(null);
  };

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  return (
    <BrowserRouter>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={closeToast}
        />
      )}

      <ToastProvider showToast={showToast}>
        <Routes>
          {/* halaman awal */}
          <Route path="/" element={<Home />} />

          {/* halaman auth */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* reset password */}
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* halaman admin */}
          <Route path="/adminDashboard" element={<AdminDashboardPage />} />
          <Route path="/adminUserData" element={<AdminUserDataPage />} />
          <Route path="/adminBookData" element={<AdminBookDataPage_v2 />} />
          <Route path="/adminAccessRequest" element={<AdminAccessRequestPage />} />
          <Route path="/adminUserActivity" element={<AdminUserActivityReportPage />} />
          {/* halaman utama */}
          <Route path="/home" element={<Home />} />

          {/* halaman dari footer */}
          <Route path="/about" element={<Tentang />} />
          <Route path="/contact" element={<Kontak />} />
          <Route path="/privacyPolicy" element={<Kebijakan />} />

          {/* halaman dari sidebar */}
          <Route path="/favorite" element={<Favorit />} />
          <Route path="/settings" element={<Pengaturan />} />
          <Route path="/pengaturan" element={<Pengaturan />} />
          <Route path="/aktivitas" element={<Aktivitas />} />
          <Route path="/favorit" element={<Favorit />} />
          <Route path="/search" element={<SearchResult />} />
          <Route path="/book/:id" element={<DetailBuku />} />
          <Route path="/kategori/:name" element={<KategoriPage />} />
          <Route path="/baca/:id" element={<HalamanBaca />} />
          <Route path="/view-all" element={<ViewAllPage />} />

          {/* fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
