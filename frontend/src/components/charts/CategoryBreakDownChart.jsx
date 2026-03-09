import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const COLORS = ["#e0c600","#10B981","#F97316","#3B82F6","#EF4444","#8B5CF6","#06B6D4","#EC4899"];

export default function CategoryBreakdownChart({ month, year }) {
  const { user, token } = useAuth();
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);   
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    if (!user || !token) return;

    const fetchBreakdown = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/v1/dashboard/summary", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch dashboard summary");
        const summary = await res.json();

        const breakdown = summary.breakdown || {};
        const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

        const pieData = Object.entries(breakdown).map(([name, value]) => ({
          name,
          value,
          percent: total > 0 ? ((value / total) * 100).toFixed(1) : 0,
        }));

        setData(pieData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBreakdown();
  }, [user, token, month, year]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="fs-tooltip">
          <div className="fs-tooltip__label">{payload[0].name}</div>
          <div className="fs-tooltip__gold">₹{payload[0].value.toLocaleString()}</div>
          <div className="fs-tooltip__sub">{payload[0].payload.percent}% of total</div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="fs-glass fs-chart-card">
        <div className="fs-sk fs-sk-h14 fs-sk-w50" />
        <div className="fs-sk fs-sk-h220" />
      </div>
    );
  }

  return (
    <div className="fs-glass fs-chart-card">
      <div className="fs-tx__header">
        <h3 className="fs-chart-card__title">Category Breakdown</h3>
        <p className="fs-chart-card__sub">Monthly Expenses</p>
      </div>

      <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>

        {/* Pie */}
        <div style={{ width:"100%", height:220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                onClick={(entry) => setSelected(
                  selected?.category === entry.name
                    ? null
                    : { category: entry.name, percent: entry.percent, amount: entry.value }
                )}
                labelLine={false}
              >
                {data.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={COLORS[idx % COLORS.length]}
                    cursor="pointer"
                    strokeWidth={selected?.category === entry.name ? 3 : 0}
                    stroke="#fff"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        
        <div className="fs-legend">
          {data.map((entry, idx) => (
            <div
              key={idx}
              className={`fs-legend__item${selected?.category === entry.name ? " fs-legend__item--active" : ""}`}
              onClick={() => setSelected(
                selected?.category === entry.name
                  ? null
                  : { category: entry.name, percent: entry.percent, amount: entry.value }
              )}
            >
             
              <div className="fs-legend__dot" style={{ background: COLORS[idx % COLORS.length] }} />
              <div>
                <div className="fs-legend__name">{entry.name}</div>
                <div className="fs-legend__pct">{entry.percent}% · ₹{entry.value.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>

      </div>

      
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fs-sel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <div className="fs-sel__row">
              <div>
                <div className="fs-sel__lbl">Selected Category</div>
                <div className="fs-sel__val">{selected.category}</div>
              </div>
              <div className="fs-sel__right">
                <div className="fs-sel__lbl">Amount</div>
                <div className="fs-sel__amt">₹{selected.amount.toLocaleString()}</div>
              </div>
            </div>
            <div className="fs-sel__pct">{selected.percent}% of total expenses</div>
            <button className="fs-sel__clear" onClick={() => setSelected(null)}>
              Clear Selection ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
