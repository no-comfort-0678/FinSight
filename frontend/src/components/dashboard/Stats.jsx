import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { TrendingDown, HandCoins, Wallet, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const Stats = () => {
  const { user, token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardSummary = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/v1/payments/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch user transactions");

        const payments = await res.json();
        const monthlySpending = {
          total: payments.reduce((sum, p) => sum + Number(p.amount), 0),
          change: 0, // optional: calculate vs previous month
        };
        const categoryBreakdown = {};
        payments.forEach((p) => {
          const cat = p.description || "Uncategorized";
          if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { amount: 0, percent: 0 };
          categoryBreakdown[cat].amount += Number(p.amount);
        });
        const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0) || 1;
        Object.keys(categoryBreakdown).forEach((c) => {
          categoryBreakdown[c].percent = (categoryBreakdown[c].amount / totalAmount) * 100;
        });

        setSummary({
          monthlySpending,
          budgetSummary: { underBudget: 3, nearLimit: 1, overLimit: 0 }, // example
          categoryBreakdown,
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDashboardSummary();
  }, [user, token]);

  if (loading) return <p className="fs-stats-msg fs-stats-msg--loading">Loading dashboard summary...</p>;
  if (error)   return <p className="fs-stats-msg fs-stats-msg--error">Error: {error}</p>;
  if (!summary)return <p className="fs-stats-msg fs-stats-msg--loading">No dashboard data available.</p>;

  return (
    <div className="fs-stats">

      {/* ── 3 stat cards ── */}
      <div className="fs-stat-row">

        <motion.div
          className="fs-glass fs-stat-card"
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.42 }}
        >
          <div className="fs-stat-card__icon fs-icon--red">
            <TrendingDown size={18} />
          </div>
          <div className="fs-stat-card__label">Monthly Spending</div>
          <div className="fs-stat-card__value fs-stat-card__value--red">
            ₹{summary.monthlySpending.total.toLocaleString()}
          </div>
          <span className="fs-badge fs-badge--red">
            <ArrowDownRight size={11} /> This month
          </span>
        </motion.div>

        <motion.div
          className="fs-glass fs-stat-card"
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.42 }}
        >
          <div className="fs-stat-card__icon fs-icon--green">
            <HandCoins size={18} />
          </div>
          <div className="fs-stat-card__label">Total Credited</div>
          <div className="fs-stat-card__value fs-stat-card__value--green">₹—</div>
          {/* <span className="fs-badge fs-badge--green">
            <ArrowUpRight size={11} /> Add income source
          </span> */}
        </motion.div>

        <motion.div
          className="fs-glass fs-stat-card"
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.42 }}
        >
          <div className="fs-stat-card__icon fs-icon--yellow">
            <Wallet size={18} />
          </div>
          <div className="fs-stat-card__label">Net Balance</div>
          <div className="fs-stat-card__value fs-stat-card__value--gold">₹—</div>
          {/* <span className="fs-badge fs-badge--yellow">⚡ Track balance</span> */}
        </motion.div>

      </div>

      {/* ── Category breakdown ── */}
      <motion.div
        className="fs-glass fs-breakdown"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.42 }}
      >
        <h4 className="fs-breakdown__title">Category Breakdown</h4>
        <div className="fs-breakdown__grid">
          {Object.entries(summary.categoryBreakdown).map(([cat, data]) => {
            const pct = Math.round(data.percent);
            const fillClass =
              pct >= 100 ? "fs-bitem__fill--red"
            : pct >= 80  ? "fs-bitem__fill--orange"
            :               "fs-bitem__fill--green";
            return (
              <div key={cat}>
                <p className="fs-bitem__name">{cat}</p>
                <div className="fs-bitem__track">
                  <div
                    className={`fs-bitem__fill ${fillClass}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <p className="fs-bitem__pct">{pct}%</p>
              </div>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
};

export default Stats;
