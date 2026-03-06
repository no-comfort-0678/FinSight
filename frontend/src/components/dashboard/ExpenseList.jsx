import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, Calendar, Store, CreditCard } from "lucide-react";

const API_BASE = "http://localhost:5000/api/v1/dashboard/transactions";

const ExpenseList = ({ refresh }) => {
    const { token } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, [refresh]);

    const fetchTransactions = async () => {
        try {
            const res = await fetch(API_BASE, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setTransactions(data);
            }
        } catch (err) {
            console.error("Failed to fetch transactions:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-gray-400 text-center py-10">Loading transaction history...</div>;

    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                Ledger Activity
            </h3>
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {transactions.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400"
                        >
                            No transactions recorded yet.
                        </motion.div>
                    ) : (
                        transactions.map((tx) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${tx.amount < 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {tx.type === 'expense' ? <Receipt className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{tx.vendor || "Unknown"}</h4>
                                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(tx.date).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1 uppercase text-[10px] font-bold">
                                                {tx.type} • {tx.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-bold ${tx.amount < 0 ? 'text-gray-900' : 'text-emerald-600'}`}>
                                        {tx.amount < 0 ? '-' : '+'}₹{Math.abs(tx.amount).toFixed(2)}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ExpenseList;
