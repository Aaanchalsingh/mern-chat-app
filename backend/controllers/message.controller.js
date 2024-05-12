import Conversation from "../models/conversation.model.js";
import OpenAI from "openai";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import User from "../models/user.model.js";
import fetch from "node-fetch";

const openai = new OpenAI({
    apiKey: "AIzaSyBELLznxMd6q5MufIGPF5819JZatmhScvA",
});

let conversationHistory = [
    { role: "system", content: "You are a helpful assistant." },
];

async function generateResponse(userMessage) {
    try {
        conversationHistory.push({ role: "user", content: userMessage });

        const completion = await openai.chat.completions.create({
            messages: conversationHistory,
            model: "gpt-3.5-turbo",
        });

        const botResponse = completion.choices[0].message.content;

        conversationHistory.push({ role: "assistant", content: botResponse });

        return botResponse;
    } catch (error) {
        console.error("Error calling OpenAI: ", error);
        throw new Error("Error generating response from OpenAI");
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message,
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }

        await Promise.all([conversation.save(), newMessage.save()]);

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: "Receiver not found." });
        }

        const response = await generateResponse(message);

        res.status(201).json({ message: newMessage, response });

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages=async (req, res) => {
	try {
		const { id: userToChatId }=req.params;
		const senderId=req.user._id;

		const conversation=await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		}).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES

		if (!conversation) return res.status(200).json([]);

		const messages=conversation.messages;

		res.status(200).json(messages);
	} catch (error) {
		console.log("Error in getMessages controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};
