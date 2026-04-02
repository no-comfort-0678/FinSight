import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { TrendingUp, CreditCard, ChevronRight, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

const RecentTransactionsTable = ({ filterCategory }) => {
  const { user, token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) return;
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/v1/dashboard/summary", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch transactions");
        const data = await res.json();
        setTransactions(data.recentTransactions);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user, token]);

  const filtered = filterCategory
    ? transactions.filter((t) => t.category === filterCategory)
    : transactions;
  const recentTransactions = filtered.slice(0, 10);

  const toggleRow = (id) => setExpandedId(expandedId === id ? null : id);

  const getNotes = (tx) => {
    if (tx.items?.length > 0) {
      const cats = [...new Set(tx.items.map((i) => i.category))];
      return cats.length > 1 ? "Supermarket / Multiple" : cats[0];
    }
    return tx.category || tx.vendor || "—";
  };

  return (
    <motion.div
      className="fs-glass fs-tx"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.42 }}
    >
      <div className="fs-tx__header">
        <h3 className="fs-tx__title">
          {filterCategory ? `Transactions: ${filterCategory}` : "Recent Transactions"}
        </h3>
        <button className="fs-tx__more" onClick={() => navigate("/transactions")}>
          Show More <ChevronRight size={13} />
        </button>
      </div>

      {error && <p className="fs-tx__error">{error}</p>}

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
            [...Array(5)].map((_, i) => (
              <tr key={i}>
                {[...Array(4)].map((__, j) => (
                  <td key={j}>
                    <div className="fs-sk fs-sk-flex fs-sk-h14" />
                  </td>
                ))}
              </tr>
            ))
          ) : recentTransactions.length === 0 ? (
            <tr>
              <td colSpan="4" className="fs-empty">No transactions yet.</td>
            </tr>
          ) : (
            recentTransactions.map((tx, i) => {
              const hasItems = tx.items?.length > 0;
              const isOpen = expandedId === tx.id;

              return (
                <React.Fragment key={tx.id}>
                  <motion.tr
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.54 + i * 0.055 }}
                    onClick={() => hasItems && toggleRow(tx.id)}
                    style={{ cursor: hasItems ? "pointer" : "default" }}
                  >
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {hasItems && (
                          <motion.span
                            animate={{ rotate: isOpen ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ display: "inline-flex", color: "#6366f1" }}
                          >
                            <ChevronRight size={13} />
                          </motion.span>
                        )}
                        {new Date(tx.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </div>
                    </td>

                    <td className="white">{getNotes(tx)}</td>

                    <td>
                      <span className={`fs-tx-badge ${tx.amount > 0 ? "fs-tx-badge--income" : "fs-tx-badge--pay"}`}>
                        {tx.amount > 0 ? (
                          <><TrendingUp size={10} /> Received</>
                        ) : tx.type === "expense" ? (
                          <><CreditCard size={10} /> Expense</>
                        ) : (
                          <><TrendingDown size={10} /> Payment</>
                        )}
                      </span>
                    </td>

                    <td className={`r ${tx.amount < 0 ? "fs-tx-neg" : "fs-tx-pos"}`}>
                      {tx.amount < 0 ? "−" : "+"}₹{Math.abs(tx.amount).toLocaleString()}
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
                        <td colSpan="4" style={{ padding: "0 0 8px 0" }}>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            style={{ overflow: "hidden" }}
                          >
                            <div style={{
                              marginLeft: "28px",
                              borderLeft: "2px solid #e0e7ff",
                              paddingLeft: "12px",
                              paddingTop: "6px",
                              paddingBottom: "6px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}>
                              {(() => {
                                const grouped = tx.items.reduce((acc, item) => {
                                  const cat = item.category || "Other";
                                  if (!acc[cat]) acc[cat] = { names: [], total: 0 };
                                  acc[cat].names.push(item.name);
                                  acc[cat].total += Number(item.amount);
                                  return acc;
                                }, {});

                                return Object.entries(grouped).map(([cat, { names, total }]) => (
                                  <div key={cat} style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    gap: "12px",
                                  }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                      <span
                                        className="fs-tx-badge fs-tx-badge--pay"
                                        style={{ fontSize: "11px", alignSelf: "flex-start" }}
                                      >
                                        {cat}
                                      </span>
                                      <span style={{ fontSize: "12px" }}>
                                        {names.join(", ")}
                                      </span>
                                    </div>
                                    <span
                                      className="fs-tx-neg"
                                      style={{ fontWeight: 500, fontSize: "12px", minWidth: "60px", textAlign: "right" }}
                                    >
                                      ₹{total.toLocaleString("en-IN", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </span>
                                  </div>
                                ));
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
    </motion.div>
  );
};

export default RecentTransactionsTable;