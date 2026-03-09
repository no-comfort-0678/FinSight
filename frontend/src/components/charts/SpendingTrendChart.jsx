import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
export default function SpendingTrendChart({ month, year }) {
  const { user, token } = useAuth();
  const [data, setData] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null); // kept original variable name
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/v1/dashboard/trend", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch dashboard trend");
        const trend = await res.json();

        const chartData = trend.map((t) => ({
          name: t.month,
          expense: t.expense,
          income: t.income,
        }));
        setData(chartData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, month, year]);

  if (loading) {
    return (
      <div className="fs-glass fs-chart-card">
        <div className="fs-sk fs-sk-h14 fs-sk-w40" />
        <div className="fs-sk fs-sk-h220" />
        <div className="fs-sk fs-sk-h44" />
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="fs-glass fs-tooltip">
          <div className="fs-tooltip__label">{label}</div>
          <div className="fs-tooltip__red">Spent: ₹{payload[0].value}</div>
        </div>
      );
    }
    return null;
  };

  const renderCustomDot = (props) => {
    const { cx, cy, payload, index } = props;
    return (
      <circle
        key={`dot-${index}`}
        cx={cx}
        cy={cy}
        r={6}
        fill="#34d399"
        stroke="rgba(0,0,0,.45)"
        strokeWidth={2}
        style={{ cursor: "pointer", pointerEvents: "auto" }}
        onClick={() => setSelectedPoint(
          selectedPoint?.month === payload.name
            ? null
            : { month: payload.name, expense: payload.expense }
        )}
      />
    );
  };

  return (
    <motion.div
      className="fs-glass fs-chart-card"
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.36, duration: 0.42 }}
    >
      <div className="fs-tx__header">
        <h3 className="fs-chart-card__title">Spending Trend</h3>
        <p className="fs-chart-card__sub">Last 6 months</p>
      </div>

      
      <div className="fs-trend__wrap">
        <div className="fs-trend__inner">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "rgba(255,255,255,.42)" }}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "rgba(255,255,255,.42)" }}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,.08)" }} />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#34d399"
                strokeWidth={3}
                dot={(props) => renderCustomDot({ ...props, pointerEvents: true })}
                activeDot={{ r: 8, fill: "#34d399", style: { pointerEvents: "none" } }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      
      <AnimatePresence>
        {selectedPoint && (
          <motion.div
            className="fs-sel"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <div className="fs-sel__row">
              <div>
                <div className="fs-sel__lbl">Month</div>
                <div className="fs-sel__val">{selectedPoint.month}</div>
              </div>
              <div className="fs-sel__right">
                <div className="fs-sel__lbl">You spent</div>
                <div className="fs-sel__amt">₹{selectedPoint.expense}</div>
              </div>
            </div>
            <button className="fs-sel__clear" onClick={() => setSelectedPoint(null)}>
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
