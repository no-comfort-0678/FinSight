
import { useState } from "react";
import PaymentForm from "../../components/payments/paymentForm";
import UploadBill from "../../components/dashboard/uploadbill";
import { useAuth } from '../../context/AuthContext';
export default function Payments() {
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(false);

  const handleSuccess = () => {
    setRefresh(!refresh);
  };

  return (
    <div style={{ paddingTop: "15vh" }} className="flex flex-col md:flex-row justify-center items-start gap-8 px-4">
      <PaymentForm onSuccess={handleSuccess} />
      <UploadBill onSuccess={handleSuccess} />
    </div>
  );
}

