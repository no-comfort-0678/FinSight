import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { TrendingUp, CreditCard, ChevronRight, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

const RecentTransactionsTable = ({ filterCategory }) => {
  const { user, token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) return;

    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/v1/dashboard/summary", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch transactions");

        const data = await res.json();
        setTransactions(data.recentTransactions);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user, token]);

  const filtered = filterCategory
    ? transactions.filter(t => t.category === filterCategory)
    : transactions;

  const recentTransactions = filtered.slice(0, 10);

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
                  <td key={j}><div className="fs-sk fs-sk-flex fs-sk-h14" /></td>
                ))}
              </tr>
            ))
          ) : recentTransactions.length === 0 ? (
            <tr>
              <td colSpan="4" className="fs-empty">No transactions yet.</td>
            </tr>
          ) : (
            recentTransactions.map((tx, i) => (
              <motion.tr
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.54 + i * 0.055 }}
              >
                <td>
                  {new Date(tx.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                </td>
                <td className="white">{tx.category || tx.vendor || tx.description || "—"}</td>
                <td>
                  <span className={`fs-tx-badge ${tx.amount > 0 ? "fs-tx-badge--income" : "fs-tx-badge--pay"}`}>
                    {tx.amount > 0
                      ? <><TrendingUp size={10} /> Received</>
                      : tx.type === "expense"
                        ? <><CreditCard size={10} /> Expense</>
                        : <><TrendingDown size={10} /> Payment</>
                    }
                  </span>
                </td>
                <td className={`r ${tx.amount < 0 ? "fs-tx-neg" : "fs-tx-pos"}`}>
                  {tx.amount < 0 ? "−" : "+"}₹{Math.abs(tx.amount).toLocaleString()}
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </motion.div>
  );
};

export default RecentTransactionsTable;
