
import Navbar from "../components/navbar/navbar";


const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
     
      <div className="w-full flex-shrink-0">
        <Navbar />
      </div>


      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
};


export default AppLayout;