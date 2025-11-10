import { useEffect, useState } from "react";
import { sendMessage, listenForMessages } from "../../helper/cometService";
import CometChat from "../../config/comet.config";

export default function ChatBox({ activeUser, currentUser }) {
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!activeUser) return;
    setChat([]); // reset on user switch

    // Load past messages
    const limit = 50;
    const messagesReq = new CometChat.MessagesRequestBuilder()
      .setLimit(limit)
      .setUID(activeUser.uid)
      .build();

    messagesReq.fetchPrevious().then(
      (msgs) => setChat(msgs.reverse()),
      (err) => console.error("Message fetch error:", err)
    );

    listenForMessages((msg) => {
      if (msg.sender.uid === activeUser.uid || msg.receiverId === activeUser.uid)
        setChat((prev) => [...prev, msg]);
    });
  }, [activeUser]);

  const handleSend = async () => {
    if (!message.trim()) return;
    const sent = await sendMessage(activeUser.uid, message);
    setChat((prev) => [...prev, sent]);
    setMessage("");
  };

  if (!activeUser)
    return (
      <div className="flex flex-1 items-center justify-center text-gray-500">
        Select a user to chat
      </div>
    );

  return (
    <div className="flex flex-col w-2/3 bg-gray-50">
      <div className="p-3 bg-blue-600 text-white font-semibold">
        {activeUser.name}
      </div>

      <div className="flex-1 p-3 overflow-y-auto">
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`my-2 p-2 rounded-lg max-w-xs ${
              msg.sender.uid === currentUser.uid
                ? "ml-auto bg-blue-100"
                : "mr-auto bg-gray-200"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="p-3 border-t flex gap-2 bg-white">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="border flex-1 rounded p-2"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          className="bg-green-600 text-white px-4 rounded hover:bg-green-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
