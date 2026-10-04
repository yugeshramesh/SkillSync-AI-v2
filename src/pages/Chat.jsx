import { useEffect, useState } from "react";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import { getChatList } from "../services/api";
import AppShell from "../components/layout/AppShell";
import PageTransition from "../components/ui/PageTransition";
import { connectSocket } from "../services/socket";
import "./Chat.page.css";

function Chat() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    loadChats();

    const selected = JSON.parse(localStorage.getItem("selectedChat"));
    if (selected) setSelectedChat(selected);

    // New conversations (or messages from people not yet in the sidebar)
    // should show up here instantly, not just after a manual refresh.
    const socket = connectSocket();
    if (socket) {
      socket.on("chat:message", loadChats);
    }
    return () => {
      if (socket) socket.off("chat:message", loadChats);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadChats = async () => {
    try {
      const res = await getChatList();
      let users = res.data.chats || [];

      const selected = JSON.parse(localStorage.getItem("selectedChat"));

      if (selected && !users.find((u) => u._id === selected._id)) {
        users = [selected, ...users];
      }

      setChats(users);

      if (!selected && users.length > 0) {
        setSelectedChat(users[0]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <PageTransition>
      <AppShell wide>
        <div className="chat-shell">
          <ChatList chats={chats} selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
          <ChatWindow selectedChat={selectedChat} />
        </div>
      </AppShell>
    </PageTransition>
  );
}

export default Chat;
