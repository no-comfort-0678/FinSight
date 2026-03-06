import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api/receipts/upload";

const UploadBill = ({ onSuccess }) => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Upload failed");
      }

      const dataResp = await res.json();
      setStatus("Bill uploaded and processed!");

      onSuccess?.(dataResp);

      // Navigate to dashboard after a short delay to show success
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (err) {
      console.error(err);
      setStatus(err.message || "Failed to process bill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 space-y-4">
      <h2 className="text-2xl font-semibold mb-2">Upload Bill</h2>
      <p className="text-sm text-gray-500 mb-4">
        Upload an image of your receipt to automatically extract expense details.
      </p>

      {!file && !loading ? (
        <div
          onClick={() => fileInputRef.current.click()}
          className="cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all group"
        >
          <input
            type="file"
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,application/pdf"
          />
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 text-gray-400 group-hover:text-blue-500 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="font-medium text-gray-600 group-hover:text-blue-600">
              Click to upload or drag & drop
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG or PDF up to 10MB</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-blue-500 bg-blue-50 rounded-xl">
          {loading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-blue-700 font-medium">{status}</p>
            </div>
          ) : (
            <div className="text-center">
              <p className={`font-medium ${status.includes("failed") ? "text-red-600" : "text-green-600"}`}>
                {status}
              </p>
              <button
                onClick={() => {
                  setFile(null);
                  setStatus("");
                }}
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                Upload another
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadBill;
