import { useEffect, useState } from "react";
import { CometChat } from "@cometchat-pro/chat";
import { initCometChat } from "../../config/comet.config";
import { ApiPost } from "../../helper/axios";
import UserList from "../../Component/chatApp/UserList";
import ChatBox from "../../Component/chatApp/ChatBox";

export default function InternalChat() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeUser, setActiveUser] = useState(null);

  /* ---------------------------------------------------
     1️⃣  Initialize CometChat once
  --------------------------------------------------- */
  useEffect(() => {
    async function connectComet() {
      try {
        await initCometChat();

        const loggedIn = await CometChat.getLoggedinUser();
        if (loggedIn) {
          console.log("🟢 Already logged in:", loggedIn.uid);
          setCurrentUser(loggedIn);
          return;
        }

        // ---------------------------------------------------
        // 2️⃣  Get token from localStorage (or request new one)
        // ---------------------------------------------------
        let token = localStorage.getItem("cometToken");
        const userId = localStorage.getItem("userId");
        const userType = localStorage.getItem("userType");
        const name =
          JSON.parse(localStorage.getItem("user"))?.name || "Giriraj User";
        const avatar =
          JSON.parse(localStorage.getItem("user"))?.avatar || "";

        if (!token && userId && userType) {
          console.log("🔁 Fetching new CometChat token from backend...");
          const res = await ApiPost("/api/cometchat/get-token", {
            userId,
            userType,
            name,
            avatar,
          });
          token = res.data?.token;
          if (token) localStorage.setItem("cometToken", token);
        }

        if (!token) throw new Error("CometChat token missing!");

        // ---------------------------------------------------
        // 3️⃣  Log in silently with token
        // ---------------------------------------------------
        const user = await CometChat.login(token);
        console.log("✅ Logged in to CometChat as:", user.name);
        setCurrentUser(user);
      } catch (err) {
        console.error("❌ CometChat login error:", err);
      }
    }

    connectComet();
  }, []);

  /* ---------------------------------------------------
     4️⃣  If still connecting, show loader
  --------------------------------------------------- */
  if (!currentUser)
    return (
      <div className="flex items-center justify-center h-screen text-gray-700">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-500 rounded-full mx-auto" />
          <p>Connecting to Internal Chat...</p>
        </div>
      </div>
    );

  /* ---------------------------------------------------
     5️⃣  Show chat UI
  --------------------------------------------------- */
  return (
    <div className="flex h-screen bg-gray-100">
      <UserList onSelectUser={setActiveUser} currentUser={currentUser} />
      <ChatBox activeUser={activeUser} currentUser={currentUser} />
    </div>
  );
}
