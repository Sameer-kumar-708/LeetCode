import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, User, Bot } from "lucide-react";

function ChatAi({ problem }) {
  const [messages, setMessages] = useState([
    {
      role: "model",
      parts: [{ text: "Hi, how can I help you with this problem?" }],
    },
    { role: "user", parts: [{ text: "I am trying to understand the logic." }] },
  ]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = async (data) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", parts: [{ text: data.message }] },
    ]);
    reset();

    try {
      const response = await axiosClient.post("/ai/chat", {
        messages,
        title: problem.title,
        description: problem.description,
        testCases: problem.visibleTestCases,
        startCode: problem.startCode,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          parts: [{ text: response.data.message }],
        },
      ]);
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          parts: [{ text: "Error from AI Chatbot" }],
        },
      ]);
    }
  };

  return (
    <div>
      <h1 className="h-6 flex justify-center text-2xl mb-5">ChatAi</h1>
      <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px] bg-gray-900 text-gray-100 rounded-xl shadow-md border border-gray-700">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat ${
                msg.role === "user" ? "chat-end" : "chat-start"
              }`}
            >
              <div className="chat-image avatar">
                <div className="w-8 rounded-full bg-gray-800 p-1">
                  {msg.role === "user" ? (
                    <User className="text-blue-400" size={18} />
                  ) : (
                    <Bot className="text-green-400" size={18} />
                  )}
                </div>
              </div>
              <div
                className={`chat-bubble ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-green-700 text-white"
                }`}
              >
                {msg.parts[0].text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-4 bg-gray-800 border-t border-gray-700"
        >
          <div className="flex items-center gap-2">
            <input
              placeholder="Ask your question..."
              className="input input-bordered w-full bg-gray-700 text-white border-gray-600 placeholder-gray-400"
              {...register("message", { required: true, minLength: 2 })}
            />
            <button
              type="submit"
              className="btn btn-primary bg-blue-600 hover:bg-blue-500 border-none"
              disabled={errors.message}
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatAi;
