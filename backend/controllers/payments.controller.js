import { sendPaymentService, getUserPaymentsService } from "../services/payments.services.js";
export const sendPayment = async (req, res) => {
  try {
    const {
      senderAccountId,
      receiverAccountId,
      amount,
      description,
      category,
    } = req.body;

    if (!senderAccountId || !receiverAccountId || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await sendPaymentService({
      senderAccountId: Number(senderAccountId),
      receiverAccountId: Number(receiverAccountId),
      amount: Number(amount),
      description,
      category,
      idempotencyKey: req.headers["idempotency-key"],
    });

    res.status(200).json({
      message: "Payment successful",
      transactionId: result.transactionId,
    });
  } catch (err) {
    console.error(err);

    if (err.message === "Insufficient funds") {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: "Payment failed" });
  }
};


export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await getUserPaymentsService(userId);
    res.json(payments);
  } catch (err) {
    console.error("GET USER PAYMENTS ERROR:", err);
    res.status(500).json({ message: err.message || "Failed to fetch payments" });
  }
};