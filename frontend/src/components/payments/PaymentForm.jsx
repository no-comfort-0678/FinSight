import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const API = "http://localhost:5000/api/v1/payments/send";

export default function PaymentForm({ onSuccess }) {
  const { user, token } = useAuth();
  const [receiverId, setReceiverId] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSend = async () => {
    const senderAccountId = user?.accountId;

    if (!senderAccountId || !receiverId || !amount || !category) {
      return alert("Receiver, amount, and category are required");
    }

    setLoading(true);

    try {
      const idempotencyKey = uuidv4();

      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "idempotency-key": idempotencyKey,
        },
        body: JSON.stringify({
          senderAccountId: Number(senderAccountId),
          receiverAccountId: Number(receiverId),
          amount: Number(amount),
          description: description || "",
          category: category,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Payment failed");

      alert(`Payment successful! Transaction ID: ${data.transactionId}`);

      setReceiverId("");
      setAmount("");
      setDescription("");
      setCategory("");

      onSuccess?.(data);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Food & Dining",
    "Shopping",
    "Utilities",
    "Salary",
    "Rent",
    "Transportation",
    "Entertainment",
    "Other"
  ];

  return (
    <div className="fs-glass fs-form-card">
      <h1 className="fs-form-card__title">Make a Payment</h1>

      {/* Sender Account ID — Read Only */}
      <div className="fs-field">
        <label className="fs-field__label">Sender Account ID</label>
        <input
          type="number"
          className="fs-field__input"
          value={user.accountId || ""}
          disabled
        />
      </div>

      {/* Receiver Account ID */}
      <div className="fs-field">
        <label className="fs-field__label">Receiver Account ID</label>
        <input
          type="number"
          className="fs-field__input"
          placeholder="Receiver account ID"
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
        />
      </div>

      {/* Amount */}
      <div className="fs-field">
        <label className="fs-field__label">Amount</label>
        <div className="fs-field__amount-wrap">
          <span className="fs-field__prefix">₹</span>
          <input
            type="number"
            className="fs-field__amount-input"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>

      {/* Category Dropdown */}
      <div className="fs-field">
        <label className="fs-field__label">Category</label>
        <select
          className="fs-field__input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Description / Notes (Optional) */}


      <button
        onClick={handleSend}
        disabled={loading}
        className="fs-btn-submit"
      >
        {loading ? "Sending..." : "Send Payment"}
      </button>
    </div>
  );
}
