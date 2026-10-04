import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getConversation, sendMessage, aiChat } from "../../services/api";
import { connectSocket } from "../../services/socket";
import "./Chat.css";

function ChatWindow({ selectedChat }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const bottomRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("user") || "null") || {};
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (!selectedChat) return;

    if (selectedChat.ai) {
      setMessages([
        {
          sender: "ai",
          message:
            "Hello! I'm your AI Mentor.\n\nAsk me anything about coding, projects, career guidance, interview prep, or learning strategies.",
        },
      ]);
      return;
    }

    loadConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  // Instant messaging: listen for realtime events pushed by the backend
  // (whether the message was sent from here or from another tab/device).
  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;

    const onMessage = (msg) => {
      if (selectedChat?.ai) return;

      const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
      const receiverId = typeof msg.receiver === "string" ? msg.receiver : msg.receiver?._id;
      const otherId = selectedChat?._id;

      const belongsToOpenChat =
        (senderId === otherId && receiverId === currentUser.id) ||
        (senderId === currentUser.id && receiverId === otherId);

      if (belongsToOpenChat) {
        setMessages((prev) => {
          // avoid duplicating a message we already appended optimistically
          if (prev.some((m) => m._id && m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    const onTyping = ({ from }) => {
      if (from === selectedChat?._id) {
        setTyping(true);
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setTyping(false), 2000);
      }
    };

    socket.on("chat:message", onMessage);
    socket.on("chat:typing", onTyping);

    return () => {
      socket.off("chat:message", onMessage);
      socket.off("chat:typing", onTyping);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversation = async () => {
    try {
      const res = await getConversation(selectedChat._id);
      setMessages(res.data.messages || []);
    } catch (error) {
      console.log(error);
    }
  };

  const notifyTyping = () => {
    const socket = connectSocket();
    if (socket && selectedChat && !selectedChat.ai) {
      socket.emit("chat:typing", { receiver: selectedChat._id });
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (selectedChat.ai) {
      const question = input;
      setMessages((prev) => [...prev, { sender: { id: currentUser.id }, message: question }]);
      setInput("");

      try {
        const res = await aiChat(question);
        setMessages((prev) => [...prev, { sender: "ai", message: res.data.reply }]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", message: "Sorry, I couldn't generate a response right now." },
        ]);
        console.log(error);
      }
      return;
    }

    const text = input;
    setInput("");

    const socket = connectSocket();

    if (socket && socket.connected) {
      // Instant path: server saves + broadcasts to both sides over the
      // socket, so the message shows up immediately in every open tab.
      socket.emit(
        "chat:send",
        { receiver: selectedChat._id, message: text },
        (ack) => {
          if (!ack?.success) {
            console.log(ack?.message || "Send failed");
          }
        }
      );
    } else {
      // Fallback for when the socket hasn't connected yet.
      try {
        await sendMessage({ receiver: selectedChat._id, message: text });
        loadConversation();
      } catch (error) {
        console.log(error);
      }
    }
  };

  if (!selectedChat) {
    return (
      <div className="chat-window-empty">
        <h2>Select a chat to begin.</h2>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-top">
        <div className={`avatar ${selectedChat.ai ? "ai" : ""}`}>
          {selectedChat.ai ? "AI" : selectedChat.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3>{selectedChat.name}</h3>
          <small className="chat-status">
            {selectedChat.ai ? "AI Mentor" : typing ? "Typing…" : "Online"}
          </small>
        </div>
      </div>

      <div className="messages">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id || msg.sender?.id;
            const isMine = senderId === currentUser.id;
            const time = msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "";
            return (
              <motion.div
                key={msg._id || index}
                className={`bubble ${isMine ? "right" : "left"}`}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                <div>{msg.message}</div>
                <small className="msg-time">
                  {time}
                  {isMine && " · sent"}
                </small>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef}></div>
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message…"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            notifyTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleSend}>
          Send
        </motion.button>
      </div>
    </div>
  );
}

export default ChatWindow;
