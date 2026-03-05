import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RecentTransactionsTable = () => {
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
        const res = await fetch("http://localhost:5000/api/v1/payments/user", {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });

        if (!res.ok) throw new Error("Failed to fetch transactions");

        const data = await res.json();
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setTransactions(sorted);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user, token]);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="my-4">
      <h2 className="md:text-lg text-md font-semibold mb-4">Recent Transactions</h2>

      {error && <p className="text-red-500">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-[#E5E7EB] text-left text-sm font-medium uppercase text-[#2563EB]">
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Amount</th>
              <th className="py-2 px-4">Payment</th>
              <th className="py-2 px-4">Notes</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [...Array(5)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {[...Array(4)].map((__, i) => (
                      <td key={i} className="py-3 px-4">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                    ))}
                  </tr>
                ))
              : recentTransactions.length === 0
              ? (
                <tr>
                  <td colSpan="4" className="py-4 px-4 text-center text-[#6B7280]">
                    No transactions yet.
                  </td>
                </tr>
              )
              : recentTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-gray-100 text-sm capitalize text-[#6B7280] bg-[#FFFFFF]"
                  >
                    <td className="py-2 px-4">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td
                      className={`py-2 px-4 font-semibold ${
                        Number(tx.amount) < 0 ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {Number(tx.amount) < 0 ? "-" : "+"}₹{Math.abs(tx.amount)}
                    </td>
                    <td className="py-2 px-4 capitalize">Payment</td>
                    <td className="py-2 px-4 truncate max-w-[150px]">
                      {tx.description || "-"}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={() => navigate("/transactions/payments")}
          className="text-[#2563EB] hover:underline text-xs md:text-sm font-medium"
        >
          Show More →
        </button>
      </div>
    </div>
  );
};

export default RecentTransactionsTable;
