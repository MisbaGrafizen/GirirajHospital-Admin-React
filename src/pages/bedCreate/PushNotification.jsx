import React, { useEffect, useState, useRef } from "react";
import { ApiGet, ApiPost } from "../../helper/axios";

export default function PushNotification() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");
  const dropdownRef = useRef(null);

  /* -----------------------------------------------------
     🧠 Fetch Admin + Role Users
  ----------------------------------------------------- */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [adminRes, roleUserRes] = await Promise.all([
          ApiGet("/auth/all-users"), // GIRIRAJUser
          ApiGet("/admin/role-user"), // GIRIRAJRoleUser
        ]);

        const adminUsers =
          (adminRes?.users || []).map((u) => ({
            id: u._id,
            name: u.name || u.email || u.mobileNumber,
            type: "GIRIRAJUser",
          })) || [];

        const roleUsers =
          (roleUserRes?.roleUser || []).map((u) => ({
            id: u._id,
            name: u.name || u.email || u.mobileNumber,
            type: "GIRIRAJRoleUser",
          })) || [];

        setUsers([...adminUsers, ...roleUsers]);
      } catch (err) {
        console.error("❌ Error loading users:", err);
      }
    };
    fetchUsers();
  }, []);

  /* -----------------------------------------------------
     🖼️ Handle Image Upload and Preview
  ----------------------------------------------------- */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  /* -----------------------------------------------------
     🚀 Send Notification
  ----------------------------------------------------- */
  const sendNotification = async (e) => {
    e.preventDefault();
    try {
      if (selectedUsers.length === 0) {
        setResponseMsg("❌ Please select at least one recipient");
        return;
      }

      const image = imageFile ? await convertToBase64(imageFile) : imageUrl || "";

      // Separate IDs by model type
      const girirajUsers = selectedUsers
        .filter((u) => u.type === "GIRIRAJUser")
        .map((u) => u.id);
      const girirajRoleUsers = selectedUsers
        .filter((u) => u.type === "GIRIRAJRoleUser")
        .map((u) => u.id);

      const userIds = [...girirajUsers, ...girirajRoleUsers];
      if (userIds.length === 0) {
        setResponseMsg("❌ No valid users selected.");
        return;
      }

      const payload = {
        title,
        body,
        image,
        userIds,
        userTypes: {
          GIRIRAJUser: girirajUsers,
          GIRIRAJRoleUser: girirajRoleUsers,
        },
      };

      const res = await ApiPost("/notification/push", payload);

      setResponseMsg(`✅ ${res?.message || "Notification sent successfully!"}`);
      setSelectedUsers([]);
      setTitle("");
      setBody("");
      setImageUrl("");
      setImageFile(null);
    } catch (err) {
      console.error("❌ Notification error:", err);
      setResponseMsg(
        `❌ ${err?.response?.data?.message || err?.message || "Something went wrong"}`
      );
    }
  };

  /* -----------------------------------------------------
     🧩 Handle Dropdown & Selection
  ----------------------------------------------------- */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleUser = (user) => {
    const alreadySelected = selectedUsers.some((u) => u.id === user.id);
    if (alreadySelected) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const removeUser = (id) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== id));
  };

  /* -----------------------------------------------------
     🧱 UI
  ----------------------------------------------------- */
  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-rose-50 rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold text-center text-red-700 mb-8">
        🔔 Push Notification Admin Panel
      </h1>

      <div className="bg-white border border-rose-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-red-700 mb-3">
          Send Notification
        </h2>

        <form onSubmit={sendNotification} className="flex flex-col gap-3">
          {/* Title */}
          <input
            type="text"
            placeholder="Notification Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 border border-rose-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-400"
            required
          />

          {/* Body */}
          <textarea
            placeholder="Notification Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="p-2 border border-rose-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-400 h-24 resize-none"
            required
          />

          {/* Image Upload */}
          <label className="text-sm font-medium text-red-700">
            Attach Image (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="border border-rose-300 rounded-md p-1 text-sm bg-white"
          />
          <input
            type="text"
            placeholder="Or paste Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="p-2 border border-rose-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-400"
          />

          {imageUrl && (
            <div className="flex justify-center mt-2">
              <img
                src={imageUrl}
                alt="Preview"
                className="max-h-40 rounded-lg border-2 border-rose-200"
              />
            </div>
          )}

          {/* Multi-select dropdown */}
          <label className="text-sm font-medium text-red-700">
            Select Recipients (Admins + Role Users)
          </label>

          <div ref={dropdownRef} className="relative">
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex flex-wrap gap-2 items-center min-h-[46px] p-2 border border-rose-300 rounded-md bg-white cursor-pointer"
            >
              {selectedUsers.length > 0 ? (
                selectedUsers.map((u) => (
                  <span
                    key={u.id}
                    className="bg-rose-100 text-rose-700 text-sm px-2 py-1 rounded-md flex items-center gap-1"
                  >
                    {u.name}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeUser(u.id);
                      }}
                      className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">
                  Select recipients...
                </span>
              )}
              <span className="ml-auto text-gray-500">▼</span>
            </div>

            {isDropdownOpen && (
              <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-rose-300 rounded-md shadow-lg">
                {users.length > 0 ? (
                  users.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => toggleUser(u)}
                      className={`p-2 text-sm cursor-pointer hover:bg-rose-100 flex justify-between items-center ${
                        selectedUsers.some((sel) => sel.id === u.id)
                          ? "bg-rose-50"
                          : ""
                      }`}
                    >
                      <span>{u.name}</span>
                      <span className="text-xs text-gray-500">
                        {u.type === "GIRIRAJUser" ? "Admin" : "Role User"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-400 text-sm">
                    Loading users...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-semibold transition"
          >
            Send Notification
          </button>
        </form>
      </div>

      {/* Response */}
      {responseMsg && (
        <div
          className={`mt-6 text-center font-semibold p-3 rounded-md ${
            responseMsg.startsWith("✅")
              ? "bg-green-100 text-green-700"
              : "bg-rose-100 text-red-700"
          }`}
        >
          {responseMsg}
        </div>
      )}
    </div>
  );
}
