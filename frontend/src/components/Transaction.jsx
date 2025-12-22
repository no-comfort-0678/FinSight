import React, { useState, useRef} from "react";
import tesseract from "tesseract.js";
import "./transaction.css";

const ManualForm = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [file, setFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [prog, setProg] = useState(null);
  const [data, setData] = useState({ to: "", amt: 0 });
  const upRef = useRef(null);
  const categories = [
    "Food",
    "Transport",
    "Entertainment",
    "Shopping",
    "Bills",
    "Health",
    "Investment",
    "Other",
  ];

  const parse = (text) => {
    const lines = text.split("\n");
    const shop = lines[0] || "Unknown Shop";
    let mx = 0;
    const format = /(\d+[,.]\d{2})/g;
    const found = text.match(format);
    if (found) {
      const nums = found.map((p) => parseFloat(p.replace(/,/g, "")));
      const best = Math.max(...nums);
      mx = best.toFixed(2);
    }
    return { to : shop,amt : mx };
  };

  const upload = (e) => {
    const uploaded = e.target.files[0];
    if (!uploaded) return null;
    setFile(uploaded);
    setIsScanning(true);
    setProg(0);

    tesseract
      .recognize(uploaded, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") setProg(Math.floor(m.progress * 100));
        },
      })
      .then(({ data: { text } }) => {
        console.log(`Raw Data: ${text}`);
        const extract = parse(text);
        setIsScanning(false);
        setData(extract);
      })
      .catch((err) => {
        console.log("OCR error: ", err);
        setIsScanning(false);
        alert("Failed to scan. Check if uploaded data is image and try again.");
      });
  };

  return (
    <div className="form-content">
      <h1 className="page-title">New Transaction</h1>
      <div className="tab-switcher">
        <button
          className={`tab-btn ${activeTab === "upload" ? "active" : ""}`}
          onClick={() => setActiveTab("upload")}
        >
          Upload Bill
        </button>
        <button
          className={`tab-btn ${activeTab === "manual" ? "active" : ""}`}
          onClick={() => setActiveTab("manual")}
        >
          Manual Entry
        </button>
      </div>

      {activeTab === "manual" && (
        <div className="main-div">
          <div className="form">
            <label>Whom / Where?</label>
            <input type="text" placeholder="e.g. Starbucks" />
          </div>
          <div className="form">
            <label>Amount</label>
            <div className="amount-wrapper">
              <span className="currency-symbol">₹</span>
              <input type="number" placeholder="0.00" />
            </div>
          </div>
          <div className="form">
            <label>
              Category <span className="required">*</span>
            </label>
            <div className="category-grid">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`cat-btn ${
                    selectedCategory === cat ? "selected" : ""
                  }`}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === cat ? null : cat)
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <button className="submit-btn">Add Transaction</button>
        </div>
      )}

      {activeTab === "upload" && (
        <div className="main-div">
          {!file ? (
            <div className="drop-zone" onClick={() => upRef.current.click()}>
              <input type="file" id="billUpload" onChange={upload} hidden ref={upRef} />
                <span style={{ fontSize: "3rem" }}>☁️</span>
                <p>Click to Upload Bill</p>
            </div>
          ) :
          isScanning ? (
            <div className="scanning-container">
              <p className="scanning-text">Analyzing Receipt...</p>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${prog}%` }}
                ></div>
              </div>
              <p className="progress-text">{prog}%</p>
            </div>
          ) : (
            <div className="manual-mimic">
              <div className="scan-success-header">
                <span>Scan Complete! Verify Details Below</span>
                <button
                  className="reset-upload"
                  onClick={() => {
                    setFile(null);
                    setData({ to: "", amt: 0 });
                  }}
                >
                  ✖
                </button>
              </div>

              <div className="form">
                <label>Detected Source</label>
                <input type="text" defaultValue={data.to} />
              </div>
              <div className="form">
                <label>Detected Amount</label>
                <div className="amount-wrapper">
                  <span className="currency-symbol">₹</span>
                  <input type="number" defaultValue={data.amt} />
                </div>
              </div>
              <div className="form">
                <label>
                  Select Category <span className="required">*</span>
                </label>
                <div className="category-grid">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`cat-btn ${
                        selectedCategory === cat ? "selected" : ""
                      }`}
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === cat ? null : cat
                        )
                      }
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <button className="submit-btn">Confirm & Save</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PaymentForm = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const categories = [
    "Food",
    "Transport",
    "Entertainment",
    "Shopping",
    "Bills",
    "Health",
    "Investment",
    "Other",
  ];

  return (
    <div className="main-div">
      <h1 className="page-title">Make a Payment</h1>

      <div className="form">
        <label>Pay To (User ID or Name)</label>
        <input type="text" placeholder="Recipient..." />
      </div>

      <div className="form">
        <label>Amount</label>
        <div className="amount-wrapper">
          <span className="currency-symbol">₹</span>
          <input type="number" placeholder="0.00" />
        </div>
      </div>

      <div className="form">
        <label>
          Category <span className="required">*</span>
        </label>
        <div className="category-grid">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-btn ${
                selectedCategory === cat ? "selected" : ""
              }`}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat ? null : cat)
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="form">
        <label>Note (Optional)</label>
        <input type="text" placeholder="What is this for?" />
      </div>

      <button className="submit-btn">Pay Now</button>
    </div>
  );
};

function Transaction({ page }) {
  const [history] = useState([
    { id: 1, to: "Starbucks", amount: 550, type: "expense" },
    { id: 2, to: "Client Payment", amount: 12000, type: "income" },
    { id: 3, to: "Netflix", amount: 499, type: "expense" },
  ]);

  return (
    <div className="trans-layout">
      <div className="input-pane">
        {page === "entry" && <ManualForm />}
        {page === "payments" && <PaymentForm />}
      </div>
      <div className="history-sidebar">
        <div className="sidebar-header">
          <h3>Recent Activity</h3>
        </div>
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className="history-card">
              <div className="h-left">
                <div className={`status-dot ${item.type}`}></div>
                <span>{item.to}</span>
              </div>
              <span className={`h-amount ${item.type}`}>₹{item.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Transaction;