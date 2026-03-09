import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api/receipts/upload";

const UploadBill = ({ onSuccess }) => {
  const { user, token } = useAuth();
  const navigate        = useNavigate();
  const [file,    setFile]    = useState(null);
  const [status,  setStatus]  = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const uploaded = e.target.files[0];
    if (!uploaded) return;

    setFile(uploaded);
    setStatus("Processing bill...");
    setLoading(true);

    const formData = new FormData();
    formData.append("receipt", uploaded);
    formData.append("userId", user.id);

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Upload failed");
      }

      const dataResp = await res.json();
      setStatus("Bill uploaded and processed!");

      onSuccess?.(dataResp);

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Failed to process bill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fs-glass fs-form-card">
      <h2 className="fs-form-card__title">Upload Bill</h2>
      <p className="fs-form-card__desc">
        Upload an image of your receipt to automatically extract expense details.
      </p>

      {!file && !loading ? (
        /* ── Drop zone ── */
        <div className="fs-dropzone" onClick={() => fileInputRef.current.click()}>
          <input
            type="file"
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,application/pdf"
          />
          <svg
            className="fs-dropzone__icon"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
              d="7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="fs-dropzone__text">Click to upload or drag &amp; drop</p>
          <p className="fs-dropzone__hint">PNG, JPG or PDF up to 10MB</p>
        </div>
      ) : (
        /* ── Status panel ── */
        <div className="fs-upload-status">
          {loading && <div className="fs-upload-spinner" />}
          <p className={`fs-upload-status__text ${
            loading
              ? "fs-upload-status__text--proc"
              : status.includes("failed") || status.includes("Failed")
              ? "fs-upload-status__text--error"
              : "fs-upload-status__text--success"
          }`}>
            {status}
          </p>
          {!loading && (
            <button
              className="fs-upload-again"
              onClick={() => { setFile(null); setStatus(""); }}
            >
              Upload another
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadBill;
