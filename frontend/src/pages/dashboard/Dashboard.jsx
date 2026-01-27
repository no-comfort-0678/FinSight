
import './dashboard.css';
import Stats from "../../components/dashboard/Stats";
import SpendingTrendChart from "../../components/charts/SpendingTrendChart";
import CategoryBreakdownChart from "../../components/charts/CategoryBreakDownChart";
import RecentTransactionsTable from "../../components/dashboard/RecentTransactions";
import { useAuth } from "../../context/AuthContext";

function Dashboard() {
 
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const { user, authLoading } = useAuth();

if (authLoading) {
  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      Restoring session...
    </div>
  );
}

if (!user) {
  return (
    <div className="h-full flex items-center justify-center text-red-500">
      Session expired. Please login.
    </div>
  );
}

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <div className="md:px-16 px-2 py-6">
        {/* Stats cards */}
        <Stats userId={user.id} />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <SpendingTrendChart userId={user.id} month={month} year={year} />
          <CategoryBreakdownChart month={month} year={year} />
        </div>

        {/* Recent transactions */}
        <div className="mt-6">
          <RecentTransactionsTable />
        </div>
      </div>
    </div>
  );
}
export default Dashboard;