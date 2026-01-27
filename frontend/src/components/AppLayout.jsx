import Navbar from "../components/navbar/navbar";

const AppLayout = ({ children }) => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      
      {/* Navbar slot */}
      <div className="relative h-[14vh] min-h-[90px] flex-shrink-0">
        <Navbar />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;


