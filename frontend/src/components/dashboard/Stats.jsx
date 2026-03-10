import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { TrendingDown, HandCoins, Wallet, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const Stats = ({ onCategoryClick, selectedCategory }) => {
  const { user, token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardSummary = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/v1/dashboard/summary", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch dashboard summary");

        const data = await res.json();

        setSummary({
          stats: data.stats,
          breakdown: data.breakdown,
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
  if (error) return <p className="fs-stats-msg fs-stats-msg--error">Error: {error}</p>;
  if (!summary) return <p className="fs-stats-msg fs-stats-msg--loading">No dashboard data available.</p>;

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
            ₹{Number(summary.stats.totalSpent).toLocaleString()}
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
          <div className="fs-stat-card__value fs-stat-card__value--green">
            ₹{Number(summary.stats.totalReceived).toLocaleString()}
          </div>
          <span className="fs-badge fs-badge--green">
            Income
          </span>
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
          <div className="fs-stat-card__value fs-stat-card__value--gold">
            ₹{Number(summary.stats.balance).toLocaleString()}
          </div>
          <span className="fs-badge fs-badge--yellow">⚡ Total Funds</span>
        </motion.div>

      </div>

    </div>
  );
};

export default Stats;
