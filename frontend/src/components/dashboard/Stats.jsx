import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ChartNoAxesCombined, HandCoins, Wallet, NotepadText, Logs } from "lucide-react";

const Stats = () => {
  const { user, token } = useAuth(); 
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardSummary = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/v1/payments/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user transactions");

        const payments = await res.json();

        // Transform payments data into summary structure
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

        // Convert to percentages
        const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0) || 1;
        Object.keys(categoryBreakdown).forEach((cat) => {
          categoryBreakdown[cat].percent = (categoryBreakdown[cat].amount / totalAmount) * 100;
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

  if (loading) return <p>Loading dashboard summary...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!summary) return <p>No dashboard data available.</p>;

  return (
    <div className="space-y-4">
      {/* Top stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        <div className="p-4 bg-[#E5E7EB] rounded-2xl shadow flex justify-between items-center">
          <div>
            <h3 className="md:text-lg text-sm font-semibold text-[#111827]">Monthly Spending</h3>
            <p className="md:text-2xl text-lg font-bold text-red-600">
              ₹{summary.monthlySpending.total}
            </p>
          </div>
          <div className="text-4xl text-[#2563EB] p-1 bg-white border-2 rounded-lg">
            <ChartNoAxesCombined />
          </div>
        </div>

        <div className="p-4 bg-[#E5E7EB] rounded-2xl shadow flex justify-between items-center">
          <div>
            
          </div>
          <div className="text-4xl text-[#2563EB] p-1 bg-white border-2 rounded-lg">
            <HandCoins />
          </div>
        </div>

        <div className="p-4 bg-[#E5E7EB] rounded-2xl shadow flex justify-between items-center">
          <div>
          </div>
          <div className="text-4xl text-[#2563EB] p-1 bg-white border-2 rounded-lg">
            <Wallet />
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="p-4 bg-[#E5E7EB] rounded-2xl shadow">
        <h4 className="text-md font-semibold text-[#111827] mb-2">Category Breakdown</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(summary.categoryBreakdown).map(([cat, data]) => {
            const percent = Math.round(data.percent);
            return (
              <div key={cat} className="col-span-1">
                <p className="text-sm font-medium capitalize text-[#6B7280]">{cat}</p>
                <div className="w-full bg-white rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      percent >= 100
                        ? "bg-red-500"
                        : percent >= 80
                        ? "bg-orange-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{percent}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Stats;
