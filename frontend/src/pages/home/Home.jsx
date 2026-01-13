import React,{useState} from "react";
import "./home.css";
function Home({ user }) {
  const [popupType, setPopupType] = useState(null);


  const recentActivity = [
    { title: "Grocery", amount: 450 },
    { title: "Electricity Bill", amount: 1200 },
    { title: "Internet Bill", amount: 999 },
  ];


  const bills = [
    { title: "Electricity Bill", amount: 1200 },
    { title: "Water Bill", amount: 350 },
  ];



  return (
    <div className="home-page">


      <div className="home-top">
        <h1>
          Welcome back, <span className="username">{user?.username}</span> 👋
        </h1>
        <p className="subtitle">Here's a quick look at your finances today.</p>
      </div>


      <div className="summary-cards">
        <div className="card">
          <p>Total Balance</p>
          <h2>₹75,500</h2>
        </div>
        <div className="card clickable" onClick={() => setPopupType("spending")}>
          <p>This Month's Spending</p>
          <h2>₹18,200</h2>
        </div>


        <div className="card alert clickable" onClick={() => setPopupType("bills")}>
          <p>Pending Bills</p>
          <h2>2 Bills Due</h2>
        </div>
      </div>


      <div className="actions">
        <button className="primary">+ Add Transaction</button>
        <button className="success">+ Split an Expense</button>
      </div>


      {/* RECENT ACTIVITY */}
      <div className="bottom-section">
        <div className="recent clickable" onClick={() => setPopupType("recent")}>
          <h3>Recent Activity</h3>
          <ul>
            <li>🛒 Grocery - ₹450</li>
            <li>💡 Electricity Bill - ₹1,200</li>
            {/* <li>🍣 food - 5000</li> */}
          </ul>
        </div>
        <div className="insights">
          <h3>Quick Insights</h3>
          <div className="insight-card">
            💡 You spent 12% more this month compared to last month.
          </div>
         
        </div>
      </div>
     


     
      {popupType && (
        <div className="modal-overlay" onClick={() => setPopupType(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>
              {popupType === "recent" && "All Recent Activity"}
              {popupType === "spending" && "This Month's Spending"}
              {popupType === "bills" && "Pending Bills"}
            </h3>


            {(popupType === "recent" || popupType === "spending") &&
              recentActivity.map((item, i) => (
                <div key={i} className="modal-item">
                  <span>{item.title}</span>
                  <span>₹{item.amount}</span>
                </div>
              ))}


            {popupType === "bills" &&
              bills.map((bill, i) => (
                <div key={i} className="modal-item">
                  <span>{bill.title}</span>
                  <span>₹{bill.amount}</span>
                  <button className="pay-btn">Pay</button>
                </div>
              ))}


            <button className="close-btn" onClick={() => setPopupType(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


export default Home;