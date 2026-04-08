import "./transaction.css";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import {
  TrendingUp,
  CreditCard,
  TrendingDown,
  ChevronRight,
} from "lucide-react";
import PaymentForm from "../../components/payments/PaymentForm";
import UploadBill from "../../components/dashboard/uploadbill";

const CATEGORIES = [
  "All",
  "Food & Dining",
  "Shopping",
  "Utilities",
  "Transportation",
  "Entertainment",
  "Rent",
  "Salary",
  "Other",
];

const getNotes = (tx) => {
  if (tx.items?.length > 0) {
    const cats = [...new Set(tx.items.map((i) => i.category))];
    return cats.length > 1 ? "Supermarket / Multiple" : cats[0];
  }
  return tx.category || tx.vendor || "—";
};

const txMatchesCategory = (tx, cat) => {
  if (cat === "All") return true;
  if (tx.items?.length > 0) return tx.items.some((i) => i.category === cat);
  return tx.category === cat;
};

function TransactionHistory({ refresh }) {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const fetchTx = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "http://localhost:5000/api/v1/dashboard/transactions",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, [refresh, token]);

  const filtered = transactions.filter((tx) =>
    txMatchesCategory(tx, activeFilter)
  );
  const toggleRow = (id) => setExpandedId(expandedId === id ? null : id);

  return (
    <div className="tx-history">
      <div
        style={{
          display: "inline-block",
          background: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.10)",
          borderRadius: "12px",
          padding: "10px 20px",
          marginBottom: "1.2rem",
        }}
      >
        <h2 className="tx-history__title" style={{ margin: 0 }}>
          Transaction History
        </h2>
      </div>
      <div className="tx-filter-row">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`tx-filter-pill ${
              activeFilter === cat ? "tx-filter-pill--active" : ""
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && <p className="tx-error">{error}</p>}

      <div className="tx-table-wrap">
        <table className="fs-tx__table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Notes</th>
              <th>Type</th>
              <th className="r">Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  {[...Array(4)].map((__, j) => (
                    <td key={j}>
                      <div className="fs-sk fs-sk-h14" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="4" className="fs-empty">
                  No transactions found.
                </td>
              </tr>
            ) : (
              filtered.map((tx, i) => {
                const hasItems = tx.items?.length > 0;
                const isOpen = expandedId === tx.id;

                return (
                  <React.Fragment key={tx.id}>
                    <motion.tr
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => hasItems && toggleRow(tx.id)}
                      style={{ cursor: hasItems ? "pointer" : "default" }}
                    >
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          {hasItems && (
                            <motion.span
                              animate={{ rotate: isOpen ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                              style={{
                                display: "inline-flex",
                                color: "#e0c600",
                              }}
                            >
                              <ChevronRight size={13} />
                            </motion.span>
                          )}
                          {new Date(tx.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>

                      <td className="white">{getNotes(tx)}</td>

                      <td>
                        <span
                          className={`fs-tx-badge ${
                            tx.amount > 0
                              ? "fs-tx-badge--income"
                              : "fs-tx-badge--pay"
                          }`}
                        >
                          {tx.amount > 0 ? (
                            <>
                              <TrendingUp size={10} /> Received
                            </>
                          ) : tx.type === "expense" ? (
                            <>
                              <CreditCard size={10} /> Expense
                            </>
                          ) : (
                            <>
                              <TrendingDown size={10} /> Payment
                            </>
                          )}
                        </span>
                      </td>

                      <td
                        className={`r ${
                          tx.amount < 0 ? "fs-tx-neg" : "fs-tx-pos"
                        }`}
                      >
                        {tx.amount < 0 ? "−" : "+"}₹
                        {Math.abs(tx.amount).toLocaleString()}
                      </td>
                    </motion.tr>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <td colSpan="4" style={{ padding: "0 0 10px 0" }}>
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              style={{ overflow: "hidden" }}
                            >
                              <div className="tx-expand-inner">
                                {(() => {
                                  const grouped = tx.items.reduce(
                                    (acc, item) => {
                                      const cat = item.category || "Other";
                                      if (!acc[cat])
                                        acc[cat] = { names: [], total: 0 };
                                      acc[cat].names.push(item.name);
                                      acc[cat].total += Number(item.amount);
                                      return acc;
                                    },
                                    {}
                                  );

                                  return Object.entries(grouped).map(
                                    ([cat, { names, total }]) => (
                                      <div key={cat} className="tx-expand-row">
                                        <div className="tx-expand-cat">
                                          <span className="tx-expand-badge">
                                            {cat}
                                          </span>
                                          <span className="tx-expand-names">
                                            {names.join(", ")}
                                          </span>
                                        </div>
                                        <span className="tx-expand-amount">
                                          ₹
                                          {total.toLocaleString("en-IN", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                        </span>
                                      </div>
                                    )
                                  );
                                })()}
                              </div>
                            </motion.div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentsPage({ onSuccess }) {
  return (
    <div className="fs-tx-page">
      <PaymentForm onSuccess={onSuccess} />
      <UploadBill onSuccess={onSuccess} />
    </div>
  );
}

export default function Transaction({ page }) {
  const [refresh, setRefresh] = useState(false);
  const handleSuccess = () => setRefresh((r) => !r);

  if (page === "payments") return <PaymentsPage onSuccess={handleSuccess} />;

  if (page === "entry") return <PaymentsPage onSuccess={handleSuccess} />;

  // default: history
  return (
    <div style={{ paddingTop: "15vh", padding: "15vh 24px 60px" }}>
      <TransactionHistory refresh={refresh} />
    </div>
  );
}
