import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid"; // browser-compatible UUID

const API = "http://localhost:5000/api/v1/payments/send";

export default function PaymentForm({ onSuccess }) {
  const { user, token } = useAuth(); 
  const [receiverId, setReceiverId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSend = async () => {
    const senderAccountId = user?.accountId;

    if (!senderAccountId || !receiverId || !amount) {
      return alert("Receiver and amount are required");
    }

    setLoading(true);

    try {
      const idempotencyKey = uuidv4(); // generate unique key

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
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Payment failed");

      alert(`Payment successful! Transaction ID: ${data.transactionId}`);

      setReceiverId("");
      setAmount("");
      setDescription("");

      onSuccess?.(data);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center pt-24">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Make a Payment</h1>

        {/* Sender Account ID - Read Only */}
        <div>
          <label className="block text-sm font-medium mb-1">Sender Account ID</label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
            value={user.accountId || ""}
            disabled
          />
        </div>

        {/* Receiver Account ID */}
        <div>
          <label className="block text-sm font-medium mb-1">Receiver Account ID</label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
            placeholder="Receiver account ID"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <div className="flex items-center border rounded-lg px-3">
            <span className="mr-2 text-gray-500">₹</span>
            <input
              type="number"
              className="w-full py-2 focus:outline-none"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description (optional)</label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
            placeholder="What is this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Payment"}
        </button>
      </div>
    </div>
  );
}
