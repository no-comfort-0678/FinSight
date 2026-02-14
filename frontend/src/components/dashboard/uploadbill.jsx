import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import Tesseract from "tesseract.js";

const API_BASE = "http://localhost:5000/api/v1/expenses";

const UploadBill = ({ onSuccess }) => {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const uploaded = e.target.files[0];
    if (!uploaded) return;

    setFile(uploaded);
    setStatus("Scanning bill...");
    setProgress(0);

    try {
      const { data } = await Tesseract.recognize(uploaded, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") setProgress(Math.floor(m.progress * 100));
        },
      });

      const ocrText = data.text || "";
      setStatus("Uploading OCR text...");

      // send OCR text to backend
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ocrText,
          fileUrl: "",    // optional
          fileBuffer: "", // optional
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Upload failed");
      }

      const dataResp = await res.json();
      setStatus("Bill uploaded successfully!");
      setFile(null);
      setProgress(0);
      onSuccess?.(dataResp);

    } catch (err) {
      console.error(err);
      setStatus(err.message || "Failed to process bill");
      setProgress(0);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "20px auto" }}>
      <h3>Upload Bill</h3>
      {!file ? (
        <div
          onClick={() => fileInputRef.current.click()}
          style={{ cursor: "pointer", padding: "20px", border: "1px dashed gray", textAlign: "center" }}
        >
          <input
            type="file"
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,application/pdf"
          />
          <p>Click to Upload Bill</p>
        </div>
      ) : (
        <div style={{ padding: "10px" }}>
          <p>{status}</p>
          {progress > 0 && progress < 100 && <p>Progress: {progress}%</p>}
        </div>
      )}
    </div>
  );
};

export default UploadBill;
