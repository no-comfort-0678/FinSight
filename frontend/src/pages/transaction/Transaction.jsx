import React, { useState, useEffect, useRef } from "react";
import tesseract from "tesseract.js";
import "./transaction.css";

const API_BASE = "http://localhost:5000/api/v1/transactions";

const ManualForm = ({ user, onSuccess }) => {
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [file, setFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [prog, setProg] = useState(null);
  const [data, setData] = useState({ to: "", amt: 0 });
  
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

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
    return { to : shop, amt : mx };
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
        const extract = parse(text);
        setIsScanning(false);
        setData(extract);
        setDescription(extract.to);
        setAmount(extract.amt);
      })
      .catch((err) => {
        console.log("OCR error: ", err);
        setIsScanning(false);
        alert("Failed to scan. Check if uploaded data is image and try again.");
      });
  };

  const handleSubmit = async () => {
    const finalDesc = activeTab === "upload" ? description : data.to; 
    const finalAmt = activeTab === "upload" ? amount : data.amt;
    
    const descToSend = activeTab === "manual" ? description : finalDesc;
    const amtToSend = activeTab === "manual" ? amount : finalAmt;

    if (!amtToSend || !descToSend) return alert("Please fill details");
    if (!selectedCategory) return alert("Please select a category");

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          amount: parseFloat(amtToSend),
          description: descToSend,
          category: selectedCategory,
          source: activeTab === "upload" ? "ocr" : "manual"
        }),
      });

      if (res.ok) {
        alert("Transaction Saved!");
        setDescription("");
        setAmount("");
        setData({ to: "", amt: 0 });
        setFile(null);
        setSelectedCategory(null);
        onSuccess();
      } else {
        alert("Failed to save.");
      }
    } catch (err) {
      console.error(err);
      alert("Server Error");
    }
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
          onClick={() => {
            setActiveTab("manual");
            setDescription("");
            setAmount("");
          }}
        >
          Manual Entry
        </button>
      </div>

      {activeTab === "manual" && (
        <div className="main-div">
          <div className="form">
            <label>Whom / Where?</label>
            <input 
              type="text" 
              placeholder="e.g. Starbucks" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form">
            <label>Amount</label>
            <div className="amount-wrapper">
              <span className="currency-symbol">₹</span>
              <input 
                type="number" 
                placeholder="0.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
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
          <button className="submit-btn" onClick={handleSubmit}>Add Transaction</button>
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
                    setDescription("");
                    setAmount("");
                  }}
                >
                  ✖
                </button>
              </div>

              <div className="form">
                <label>Detected Source</label>
                <input 
                  type="text" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                />
              </div>
              <div className="form">
                <label>Detected Amount</label>
                <div className="amount-wrapper">
                  <span className="currency-symbol">₹</span>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                  />
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
              <button className="submit-btn" onClick={handleSubmit}>Confirm & Save</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PaymentForm = ({ user, onSuccess }) => {
  const [recipientName, setRecipientName] = useState(""); 
  const [recipientEmail, setRecipientEmail] = useState(""); 
  const [searchResults, setSearchResults] = useState([]); 
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const wrapperRef = useRef(null);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setRecipientName(value);
    
    if (value.length === 0) {
      setSearchResults([]);
      setRecipientEmail("");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/search?query=${value}&current_user_id=${user.id}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search failed");
    }
  };

  const selectUser = (selectedUser) => {
    setRecipientName(selectedUser.name); 
    setRecipientEmail(selectedUser.email); 
    setSearchResults([]); 
  };

  const handlePay = async () => {
    if (!recipientEmail || !amount) return alert("Please select a valid user and amount");
    if (!selectedCategory) return alert("Please select a category");

    try {
      const res = await fetch(`${API_BASE}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          amount: parseFloat(amount),
          recipient_email: recipientEmail, 
          description: note || "Payment",
          category: selectedCategory
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        alert("Payment Successful!");
        setRecipientName("");
        setRecipientEmail("");
        setAmount("");
        setNote("");
        setSelectedCategory(null);
        onSuccess();
      } else {
        alert(data.message || "Payment Failed");
      }
    } catch (err) {
      alert("Server connection failed");
    }
  };

  return (
    <div className="main-div">
      <h1 className="page-title">Make a Payment</h1>

      <div className="form" style={{ position: "relative" }} ref={wrapperRef}>
        <label>Pay To (Search Name)</label>
        <input 
          type="text" 
          placeholder="Recipient..." 
          value={recipientName}
          onChange={handleSearchChange}
          autoComplete="off"
        />
         {searchResults.length > 0 && (
          <ul className="search-dropdown">
            {searchResults.map((person) => (
              <li key={person.email} onClick={() => selectUser(person)}>
                <span className="search-name">{person.name}</span>
                <span className="search-email">{person.email}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="form">
        <label>Selected Email</label>
        <input type="text" value={recipientEmail} disabled />
      </div>

      <div className="form">
        <label>Amount</label>
        <div className="amount-wrapper">
          <span className="currency-symbol">₹</span>
          <input 
            type="number" 
            placeholder="0.00" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
          />
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
        <input 
          type="text" 
          placeholder="What is this for?" 
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <button className="submit-btn" onClick={handlePay}>Pay Now</button>
    </div>
  );
};

function Transaction({ user, page }) {
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}?user_id=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  return (
    <div className="trans-layout">
      <div className="input-pane">
        {page === "entry" && <ManualForm user={user} onSuccess={fetchHistory} />}
        {page === "payments" && <PaymentForm user={user} onSuccess={fetchHistory} />}
      </div>
      <div className="history-sidebar">
        <div className="sidebar-header">
          <h3>Recent Activity</h3>
        </div>
        <div className="history-list">
          {history.length === 0 ? <p style={{padding:"20px", color:"#888"}}>No recent transactions</p> : history.map((item) => (
            <div key={item.id} className="history-card">
              <div className="h-left">
                <div className={`status-dot ${item.type}`}></div>
                <span>{item.to}</span>
              </div>
              <span className={`h-amount ${item.type}`}>
                {item.type === 'income' ? '+' : '-'} ₹{item.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Transaction;