import { useEffect, useState } from "react";
import "./dashboard.css";
import { motion } from "framer-motion";
import Stats from "../../components/dashboard/Stats";
import SpendingTrendChart from "../../components/charts/SpendingTrendChart";
import CategoryBreakdownChart from "../../components/charts/CategoryBreakDownChart";
import RecentTransactionsTable from "../../components/dashboard/RecentTransactions";
import ChatBox from "../../components/ChatBox";
import { useAuth } from "../../context/AuthContext";

function Dashboard() {
  const { user, authLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const today = new Date();

  if (authLoading) {
    return <div className="fs-guard fs-guard--loading">Restoring session...</div>;
  }
  if (!user) {
    return <div className="fs-guard fs-guard--error">Session expired. Please login.</div>;
  }

  const hour = today.getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  return (
    <div className="fs-dash">

      {/* Greeting */}
      <motion.div
        className="fs-greeting"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38 }}
      >
        <h1 className="fs-greeting__title">{greet}, {user.name} 👋</h1>
        <p className="fs-greeting__sub">
          Here's your financial overview for{" "}
          {today.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </p>
      </motion.div>

      {/* Stats cards*/}
      <Stats
        userId={user.id}
        onCategoryClick={(cat) => setSelectedCategory(prev => prev === cat ? null : cat)}
        selectedCategory={selectedCategory}
      />

      {/* Charts */}
      <div className="fs-chart-grid">
        <SpendingTrendChart userId={user.id} month={month} year={year} />
        <CategoryBreakdownChart
          month={month}
          year={year}
          onCategoryClick={(cat) => setSelectedCategory(prev => prev === cat ? null : cat)}
          selectedCategory={selectedCategory}
        />
      </div>

      {/* Recent Transactions */}
      <RecentTransactionsTable filterCategory={selectedCategory} />
      <ChatBox selectedCategory={selectedCategory}
        month={month}
        year={year} />
    </div>
  );
}

export default Dashboard;
