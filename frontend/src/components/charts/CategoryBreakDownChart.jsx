import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#F97316", "#EC4899"];

export default function CategoryBreakdownChart({ month, year }) {
  const { user, token } = useAuth();
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) return;

    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/v1/payments/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch payments");
        const payments = await res.json();
        const filtered = payments.filter((p) => {
          const date = new Date(p.createdAt);
          return (!month || date.getMonth() + 1 === month) && (!year || date.getFullYear() === year);
        });
        const breakdown = {};
        filtered.forEach((p) => {
          const category = p.description?.toUpperCase() || "UNCATEGORIZED";
          breakdown[category] = (breakdown[category] || 0) + Number(p.amount);
        });

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

    fetchPayments();
  }, [user, token, month, year]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-blue-600">₹{payload[0].value.toLocaleString()}</p>
          <p className="text-gray-500">{payload[0].payload.percent}% of total</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow w-full animate-pulse h-96" />
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="md:text-lg text-md font-semibold text-gray-800">Category Breakdown</h3>
        <p className="text-sm text-gray-500">Monthly Expenses</p>
      </div>

      <div className="flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                onClick={(entry) => setSelected({ 
                  category: entry.name, 
                  percent: entry.percent, 
                  amount: entry.value 
                })}
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

        <div className="w-full md:w-1/2 mt-6 md:mt-0 md:pl-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.map((entry, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selected?.category === entry.name ? 'border-blue-300 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'
                }`}
                onClick={() => setSelected({ 
                  category: entry.name, 
                  percent: entry.percent, 
                  amount: entry.value 
                })}
              >
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-gray-700 truncate">{entry.name}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {entry.percent}% • ₹{entry.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 font-medium">Selected Category</p>
                <p className="text-lg font-semibold text-gray-800">{selected.category}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-lg font-semibold text-blue-600">₹{selected.amount.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <p className="text-sm text-gray-600">{selected.percent}% of total expenses</p>
              <button
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                onClick={() => setSelected(null)}
              >
                Clear Selection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
