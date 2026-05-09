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
          nis: data.nis,
          email: data.email,
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
    <div className="reg-container">

      <div className="reg-left">
        <button
          type="button"
          className="reg-back"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
        >
          <ArrowLeft size={22} />
        </button>

        <h1 className="reg-title">Masuk</h1>

        <form onSubmit={handleSubmit} className="reg-form">

          <label>Email :</label>
          <input
            type="text"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Masukkan email"
          />

          <label>Kata Sandi :</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan password"
            />

            <span
              className="toggle-pass"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <p className="forgot-pass" onClick={() => setShowForgot(true)}>
            Lupa Kata Sandi Anda?
          </p>

          <button className="reg-submit" type="submit">
            Masuk
          </button>
        </form>

        <div className="reg-links">
          <p className="as-guest" onClick={() => navigate("/home")}>
            Lanjut Sebagai Tamu
          </p>

          <p className="login-text">
            Belum Punya Akun?{" "}
            <span onClick={() => navigate("/register")} className="login-link">
              Daftar Di Sini
            </span>
          </p>
        </div>
      </div>

      <img src={bookImg} alt="Books" className="book-image" />

      <div className="reg-right">
        <div className="vertical-text">WELCOME</div>
        <p className="brand-text">ASTROLITERA<br />DIGITAL LIBRARY</p>
      </div>

      {showForgot && <ForgotPass1 onClose={() => setShowForgot(false)} />}

    </div>
  );
}

export default Login;
