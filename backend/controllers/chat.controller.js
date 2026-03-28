import { handleChat } from "../services/ai/ai.service.js";

export const chatController = async (req, res) => {
    try {
        const response = await handleChat(req);
        res.json({ response });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Chat failed" });
    }
};