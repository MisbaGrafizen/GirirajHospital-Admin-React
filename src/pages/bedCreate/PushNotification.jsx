import React, { useState } from "react";
import { ApiPost } from "../../helper/axios"; // ✅ Make sure this helper is correct

export default function PushNotification() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [emails, setEmails] = useState("");
  const [responseMsg, setResponseMsg] = useState("");

  // 🖼️ Handle file upload and preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file)); // show preview
    }
  };

  // 🧠 Convert to base64 if you really want to embed image (optional)
  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  // 🚀 Send notification to selected emails
  const sendNotification = async (e) => {
    e.preventDefault();
    try {
      const userEmails = emails.split(",").map((e) => e.trim());
      // Use base64 if uploading file, else use direct image URL
      const image = imageFile ? await convertToBase64(imageFile) : imageUrl || "";

      const res = await ApiPost("/notification/push", {
        title,
        body,
        image,
        userEmails,
      });

      setResponseMsg(`✅ ${res.message || "Notification sent successfully!"}`);
    } catch (err) {
      setResponseMsg(`❌ ${err.error || "Something went wrong"}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-rose-50 rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold text-center text-red-700 mb-8">
        🔔 Push Notification Admin Panel
      </h1>

      {/* Send Notification Section */}
      <div className="bg-white border border-rose-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-red-700 mb-3">
          Send Notification
        </h2>

        <form onSubmit={sendNotification} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Notification Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 border border-rose-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-400"
            required
          />

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

          {/* Image Preview */}
          {imageUrl && (
            <div className="flex justify-center mt-2">
              <img
                src={imageUrl}
                alt="Preview"
                className="max-h-40 rounded-lg border-2 border-rose-200"
              />
            </div>
          )}

          <input
            type="text"
            placeholder="User Emails (comma-separated)"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            className="p-2 border border-rose-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-400"
            required
          />

          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-semibold transition"
          >
            Send Notification
          </button>
        </form>
      </div>

      {/* Response Message */}
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
