import React, { useState } from "react";
import "./ForgotPass1.css";
import lupaImg from "../assets/forgot.png";
import { useToast } from "./Toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

export default function ForgotPass1({ onClose }) {
  const showToast = useToast();
  const navigate = useNavigate();

  const [nama, setNama] = useState("");
  const [nis, setNis] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!nis.trim() || !nama.trim()) {
      showToast?.("error", "Isi data terlebih dahulu!");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("nis", nis)
        .eq("username", nama.trim())
        .single();

      if (error || !data) {
        showToast?.("error", "Akun tidak ditemukan!");
        return;
      }

      sessionStorage.setItem("reset_nis", data.nis);
      showToast?.("success", "Akun ditemukan!");
      navigate("/reset-password");

    } catch (err) {
      console.error(err);
      showToast?.("error", err.message);
    }
  }

  return (
    <div className="forgot-overlay">
      <div className="forgot-modal">
        <button className="close-btn" onClick={onClose} aria-label="Tutup">
          ✕
        </button>

        <div className="forgot-img">
          <img src={lupaImg} alt="Forgot" />
        </div>

        <h2>Masukkan Nama dan NIS</h2>
        <p className="forgot-desc">
          Masukkan nama dan NIS yang terdaftar untuk menemukan akunmu.
        </p>

        <form onSubmit={handleSubmit}>
          <label>NIS</label>
          <input
            type="text"
            value={nis}
            onChange={(e) => setNis(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="Masukkan NIS"
            inputMode="numeric"
            maxLength={10}
          />

          <label>Nama</label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Masukkan nama"
          />

          <button type="submit" className="forgot-btn">
            Lanjut
          </button>
        </form>
      </div>
    </div>
  );
}
