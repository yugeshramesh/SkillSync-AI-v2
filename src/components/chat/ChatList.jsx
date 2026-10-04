import { motion } from "framer-motion";
import "./Chat.css";

function ChatList({ chats, selectedChat, setSelectedChat }) {
  return (
    <div className="chat-sidebar">
      <div className="chat-header">
        <h2>Chats</h2>
      </div>

      <div className="chat-list">
        <div
          className={`chat-user ${selectedChat?.ai ? "active" : ""}`}
          onClick={() => setSelectedChat({ _id: "ai", name: "AI Mentor", ai: true })}
        >
          <div className="avatar ai">AI</div>
          <div className="chat-info">
            <h4>AI Mentor</h4>
            <p>Ask me anything…</p>
          </div>
          <small className="chat-time">Now</small>
        </div>

        {chats.map((chat) => (
          <motion.div
            key={chat._id}
            className={`chat-user ${selectedChat?._id === chat._id ? "active" : ""}`}
            onClick={() => setSelectedChat(chat)}
            whileHover={{ x: 2 }}
          >
            <div className="avatar">{chat.name.charAt(0).toUpperCase()}</div>
            <div className="chat-info">
              <h4>
                <span className="chat-dot" /> {chat.name}
              </h4>
              <p>{chat.lastMessage || "Start conversation"}</p>
            </div>
            <small className="chat-time">{chat.time || ""}</small>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default ChatList;
