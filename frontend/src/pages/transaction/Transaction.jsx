
import  { useState } from "react";
import PaymentForm from "../../components/payments/paymentForm";
import UploadBill from "../../components/dashboard/uploadbill";
import {useAuth} from '../../context/AuthContext';
export default function Payments() {
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(false);

  const handleSuccess = () => {
    setRefresh(!refresh);
  };

  return (
   <div style={{ paddingTop: "15vh" }} className="flex justify-center">
  <PaymentForm onSuccess={handleSuccess} />
 
</div>
  );
}

