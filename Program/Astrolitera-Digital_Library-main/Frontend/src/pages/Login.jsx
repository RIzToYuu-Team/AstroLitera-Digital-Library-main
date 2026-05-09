import React, { useState } from "react";
import "./Login.css";
import ForgotPass1 from "../components/ForgotPass1.jsx";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import bookImg from "../assets/book.png";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient.jsx";
import { useToast } from "../components/Toast";

function Login() {
  const navigate = useNavigate();
  const showToast = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.email || !form.password) {
      showToast?.("error", "Isi Data Terlebih Dahulu!");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", form.email)
        .in("role", ["Siswa", "Admin"])
        .single();

      if (error || !data) {
        showToast?.("error", "Akun tidak ditemukan!");
        return;
      }

      if (data.password !== form.password) {
        showToast?.("error", "Password salah!");
        return;
      }

      if (data.status !== "Diterima") {
        showToast?.("error", "Akun anda belum disetujui, mohon hubungi admin/");
        return;
      }
      showToast?.("success", "Berhasil Masuk!");

      localStorage.setItem(
        "sessionUser",
        JSON.stringify({
          id: data.id,
          username: data.username,
          role: data.role,
          status: data.status,
        })
      );
      
      setTimeout(() => navigate("/home"), 500);

    } catch (err) {
      console.error(err);
      showToast?.("error", err.message);
    }
  }

  return (
    <div className="log-container">

      <div className="log-left">
        <button
          type="button"
          className="log-back"
          onClick={() => navigate("/home")}
          aria-label="Kembali"
        >
          <ArrowLeft size={22} />
        </button>

        <h1 className="log-title">Masuk</h1>

        <form onSubmit={handleSubmit} className="log-form">

          <label>Email :</label>
          <input
            type="text"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Masukkan email"
          />

          <label>Kata Sandi :</label>
          <div className="log-password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan password"
            />

            <span
              className="log-toggle-pass"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <p className="log-forgot-pass" onClick={() => setShowForgot(true)}>
            Lupa Kata Sandi Anda?
          </p>

          <button className="log-submit" type="submit">
            Masuk
          </button>
        </form>

        <div className="log-links">
          <p className="log-as-guest" onClick={() => navigate("/home")}>
            Lanjut Sebagai Tamu
          </p>

          <p className="log-login-text">
            Belum Punya Akun?{" "}
            <span onClick={() => navigate("/register")} className="login-link">
              Daftar Di Sini
            </span>
          </p>
        </div>
      </div>

      <img src={bookImg} alt="Books" className="log-book-image" />

      <div className="log-right">
        <div className="log-vertical-text">WELCOME</div>
        <p className="log-brand-text">ASTROLITERA<br />DIGITAL LIBRARY</p>
      </div>

      {showForgot && <ForgotPass1 onClose={() => setShowForgot(false)} />}

    </div>
  );
}

export default Login;
