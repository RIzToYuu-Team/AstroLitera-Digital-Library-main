import React, { useEffect, useMemo, useState } from "react";
import "./ResetPassword.css";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import bookImg from "../assets/resetpw.png";

export default function ResetPassword() {
  const navigate = useNavigate();
  const showToast = useToast();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const nis = useMemo(() => {
    try {
      return sessionStorage.getItem("reset_nis") || "";
    } catch {
      return "";
    }
  }, []);

  useEffect(() => {
    if (!nis) navigate("/login");
  }, [nis, navigate]);

  const rules = {
    minLen: password.length >= 8,
    hasLetter: /[A-Za-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const hasLetterAndNumber = rules.hasLetter && rules.hasNumber;

  const canSubmit =
    rules.minLen && hasLetterAndNumber && rules.hasSpecial && confirm === password;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const idx = users.findIndex((u) => u.nis === nis);
    if (idx === -1) {
      showToast?.("error", "Akun tidak ditemukan!");
      navigate("/login");
      return;
    }

    users[idx] = { ...users[idx], password };
    localStorage.setItem("users", JSON.stringify(users));

    try {
      sessionStorage.removeItem("reset_nis");
    } catch {}

    showToast?.("success", "Kata sandi berhasil di ganti, silahkan login ulang");
    navigate("/login");
  };

  return (
    <div className="rp-container">
      <div className="rp-left">
        <button
          type="button"
          className="rp-back"
          onClick={() => navigate("/login")}
          aria-label="Kembali ke login"
        >
          <ArrowLeft size={22} />
        </button>

        <h1 className="rp-title">Reset Kata Sandi</h1>

        <form className="rp-form" onSubmit={handleSubmit}>
          <label>Kata Sandi Baru :</label>
          <div className="rp-input-wrap">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
            />
            <button
              type="button"
              className="rp-eye"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="rp-rules">
            <div className={rules.minLen ? "ok" : "bad"}>Minimal 8 karakter</div>
            <div className={hasLetterAndNumber ? "ok" : "bad"}>
              Mengandung huruf dan angka
            </div>
            <div className={rules.hasSpecial ? "ok" : "bad"}>
              Mengandung karakter khusus (!@#$%)
            </div>
          </div>

          <label>Konfirmasi Kata Sandi Baru:</label>
          <div className="rp-input-wrap">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Masukkan kembali kata sandi"
            />
            <button
              type="button"
              className="rp-eye"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={
                showConfirm ? "Sembunyikan konfirmasi" : "Tampilkan konfirmasi"
              }
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {confirm.length > 0 && confirm !== password && (
            <div className="rp-mismatch">Konfirmasi kata sandi harus sama.</div>
          )}

          <button type="submit" className={`rp-save ${canSubmit ? "active" : ""}`} disabled={!canSubmit}>
            Simpan
          </button>
        </form>
      </div>

      <div className="rp-right">
        <img src={bookImg} alt="Ilustrasi" />
      </div>
    </div>
  );
}
