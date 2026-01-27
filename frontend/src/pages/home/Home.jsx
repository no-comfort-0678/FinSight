
import "./home.css";
import { useAuth } from "../../context/AuthContext";
function Home() {
  const { user } = useAuth();
  return (
   <><h1></h1></>
  );
}


export default Home;