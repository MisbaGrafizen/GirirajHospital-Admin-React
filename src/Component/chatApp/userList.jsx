import { useEffect, useState } from "react";
import CometChat from "../config/comet.config";

export default function UserList({ onSelectUser }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const limit = 50;
    const usersRequest = new CometChat.UsersRequestBuilder().setLimit(limit).build();

    usersRequest.fetchNext().then(
      (userList) => setUsers(userList),
      (error) => console.error("User fetch failed:", error)
    );
  }, []);

  return (
    <div className="border-r w-1/3 bg-white p-3 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-2">👥 Users</h3>
      {users.map((u) => (
        <div
          key={u.uid}
          onClick={() => onSelectUser(u)}
          className="p-2 rounded cursor-pointer hover:bg-blue-50 flex items-center justify-between"
        >
          <span>{u.name}</span>
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              u.status === "online" ? "bg-green-500" : "bg-gray-400"
            }`}
          ></span>
        </div>
      ))}
    </div>
  );
}
