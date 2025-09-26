import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Mail,
  MailOpen,
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  MoreHorizontal,
  Paperclip,
} from "lucide-react";
import Header from "../Component/header/Header";
import SideBar from "../Component/sidebar/SideBar";
import CubaSidebar from "../Component/sidebar/CubaSideBar";
import { ApiGet } from "../helper/axios";
import Preloader from "../Component/loader/Preloader";

const mockEmails = [
  {
    id: "1",
    sender: "GitHub",
    senderEmail: "noreply@github.com",
    subject: "[GitHub] Your Dependabot alerts for the week of Sep 16 - Sep 23",
    preview:
      "To protect your privacy remote resources have been blocked. Security vulnerabilities detected in your repository.",
    content: `
      <div class="email-content">
        <div class="security-alert">
          <h2>🔒 Security Alert Digest</h2>
          <p><strong>MisbaGrafizen's</strong> repository security updates from the week of <strong>Sep 16 - Sep 23</strong></p>
          <div class="repository-info">
            <h3>📁 MisbaGrafizen's personal account</h3>
            <p><strong>🔗 MisbaGrafizen / Ecommerce-web-reactjs</strong></p>
            <p>⚠️ Known security vulnerabilities detected</p>
            <table class="vulnerability-table">
              <thead>
                <tr>
                  <th>Dependency</th>
                  <th>Current Version</th>
                  <th>Upgrade to</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>vite</code></td>
                  <td><span class="version-current">>= 5.4.0</span></td>
                  <td><span class="version-upgrade">>> 5.4.6</span></td>
                  <td><span class="severity-high">High</span></td>
                </tr>
                <tr>
                  <td><code>react-dom</code></td>
                  <td><span class="version-current"><= 5.4.5</span></td>
                  <td><span class="version-upgrade">>> 5.4.8</span></td>
                  <td><span class="severity-medium">Medium</span></td>
                </tr>
              </tbody>
            </table>
            <div class="action-buttons">
              <button class="btn-primary">Review Security Updates</button>
              <button class="btn-secondary">View Repository</button>
            </div>
          </div>
        </div>
      </div>
    `,
    timestamp: "Today 10:02",
    isRead: false,
    isStarred: false,
    isNew: true,
    priority: "high",
    hasAttachment: false,
  },
  {
    id: "2",
    sender: "ClickUp Team",
    senderEmail: "team@clickup.com",
    subject: "Gather data and guide users with ClickUp Forms",
    preview:
      "Create custom forms to collect information and streamline your workflow. Perfect for customer feedback and project requests.",
    content: `
      <div class="email-content">
        <h2>🚀 Introducing ClickUp Forms</h2>
        <p>Create custom forms to collect information and streamline your workflow. Perfect for:</p>
        <ul>
          <li>📝 Customer feedback collection</li>
          <li>📋 Project request submissions</li>
          <li>🐛 Bug report tracking</li>
          <li>📊 Survey responses and analytics</li>
          <li>📞 Contact form management</li>
        </ul>
        <div class="feature-highlight">
          <h3>✨ Key Features:</h3>
          <ul>
            <li>Drag-and-drop form builder</li>
            <li>Custom field types and validation</li>
            <li>Automated workflow triggers</li>
            <li>Real-time response tracking</li>
          </ul>
        </div>
        <p><strong>Get started today and improve your data collection process!</strong></p>
        <div class="action-buttons">
          <button class="btn-primary">Create Your First Form</button>
          <button class="btn-secondary">Watch Demo</button>
        </div>
      </div>
    `,
    timestamp: "Today 03:30",
    isRead: true,
    isStarred: true,
    isNew: false,
    priority: "normal",
    hasAttachment: true,
  },
  // ... keep rest of emails same as your original
];

export default function EmailManagement() {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileDetail, setIsMobileDetail] = useState(false);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setLoading(true);
        const data = await ApiGet("/admin/notifications");
        console.log('data', data)
        const mapped = (data?.notifications || []).map((n) => ({
          id: n._id,
          sender: "New Notification",
          senderEmail: "noreply@system.com",
          subject: n.title,
          preview: n.body,
          content: `
    <div class="space-y-4">
      <p class="text-gray-800 text-base">${n.body}</p>
      ${n.data
              ? `<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
              <h4 class="text-blue-600 font-semibold mb-3 flex items-center gap-2">
                📋 Patient Details
              </h4>
              <div class="divide-y divide-gray-200">
                ${Object.entries(n.data)
                .map(
                  ([key, value]) => `
                    <div class="flex items-start py-2">
                      <div class="w-40 font-medium text-gray-900 capitalize">${formatKey(
                    key
                  )}</div>
                      <div class="flex-1 text-gray-700 break-words">${value}</div>
                    </div>`
                )
                .join("")}
              </div>
            </div>`
              : ""
            }
    </div>
  `,
          timestamp: new Date(n.createdAt).toLocaleString(),
          isRead: false,
          isStarred: false,
          isNew: true,
          priority: "normal",
          hasAttachment: false,
        }));

        // Helper function
        function formatKey(key) {
          return key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (s) => s.toUpperCase());
        }



        setEmails(mapped);
        if (mapped.length > 0) setSelectedEmail(mapped[0]);
      } catch (error) {
        console.error("❌ Error fetching emails:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);


  const filteredEmails = useMemo(() => {
    if (!searchQuery) return emails;
    return emails.filter(
      (email) =>
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.preview.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [emails, searchQuery]);

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      setEmails((prev) =>
        prev.map((e) =>
          e.id === email.id ? { ...e, isRead: true, isNew: false } : e
        )
      );
    }
  };

  const toggleStar = (emailId, e) => {
    e.stopPropagation();
    setEmails((prev) =>
      prev.map((email) =>
        email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
      )
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-blue-500";
    }
  };

  return (
    <>


      <section className="flex w-[100%] h-[100%] select-none   md11:pr-[15px] overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
          <Header pageName="Notification Management" />
          <div className="flex  w-[100%] h-[100%]">
            <CubaSidebar />
            <div className="flex w-[100%] pl-[10px] max-h-[96%] pb-[50px]  relative    gap-[10px] rounded-[10px]">
              <Preloader />
              <div className="flex w-[100%] h-screen bg-gray-50">
                {/* Left Sidebar */}
                <div className=" md11:w-[30%] 2xl:!w-[20%] md34:!hidden md11:!flex  max-w-[400px] pr-[10px] border-r border-gray-200  flex-col">
                  {/* Header */}
                  <div className=" py-[10px] gap-[10px] border-b flex  border-gray-200 bg-gray-50">

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search emails..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-[] pl-10  pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div className=" border  flex justify-center items-center rounded-[8px] w-[40px] h-[40px]">
                      <i class="fa-regular text-[#787777] fa-filter"></i>
                    </div>
                  </div>

                  {/* Email List */}
                  <div className="flex-1 overflow-y-auto max-h-[82%]">
                    {filteredEmails.map((email) => (
                      <div
                        key={email.id}
                        onClick={() => handleEmailClick(email)}
                        className={`
                p-2 border-b border-gray-100 relative cursor-pointer transition-all mb-[5px]   rounded-[10px] duration-200
                ${selectedEmail?.id === email.id
                            ? "bg-red-50  border-[1px]  !border-red-600   rounded-l-[10px] shadow-sm"
                            : " border-[1px]  !border-blue-800 " +
                            getPriorityColor(email.priority)
                          }
                ${!email.isRead ? "bg-blue-25" : ""}
              `}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            {email.isRead ? (
                              <MailOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            ) : (
                              <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            )}
                            <div className="flex  items-center min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span
                                  className={`font-medium truncate ${!email.isRead ? "text-gray-900" : "text-gray-700"
                                    }`}
                                >
                                  {email.sender}
                                </span>
                                {/* {email.isNew && (
                                  <span className="bg-red-500 text-white  absolute text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                                    New 
                                  </span>
                                )} */}
                                {email.hasAttachment && (
                                  <Paperclip className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                )}
                              </div>
                              <span className="text-[8px] absolute right-0  pt-[5px] px-[10px] rounded-b-sm  top-[-1px] flex-shrink-0 text-gray-500">
                                {email.timestamp}
                              </span>
                            </div>
                          </div>

                        </div>

                        <h3
                          className={`text-sm mb-2 line-clamp-2 ${!email.isRead
                            ? "font-semibold text-gray-900"
                            : "font-medium text-gray-800"
                            }`}
                        >
                          {email.subject}
                          {email.data?.type && (
                            <span className="ml-2 text-xs text-blue-500">[{email.data.type}]</span>
                          )}
                        </h3>
                        {/* 
                                                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                                    {email.preview}
                                                </p> */}
                      </div>
                    ))}
                  </div>


                </div>

                {/* Right Panel */}
                <div className="w-[100%] md34:!hidden md11:!flex flex-col bg-white">
                  {selectedEmail ? (
                    <>
                      {/* Header */}
                      <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h1 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
                              {selectedEmail.subject}
                            </h1>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-medium text-sm">
                                    {selectedEmail.sender.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {selectedEmail.sender}
                                  </span>
                                  <span className="text-gray-500">
                                    {" "}
                                    &lt;{selectedEmail.senderEmail}&gt;
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              Received on {selectedEmail.timestamp}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                              <Reply className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                              <Forward className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                              <Archive className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                              <Trash2 className="w-5 h-5 text-gray-600" />
                            </button>
                            {/* <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                                                            <MoreHorizontal className="w-5 h-5 text-gray-600" />
                                                        </button> */}
                          </div>
                        </div>


                      </div>

                      {/* Privacy Banner */}
                      {selectedEmail.sender === "GitHub" && (
                        <div className="mx-6 mt-1 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">!</span>
                            </div>
                            <span className="text-sm text-gray-700">
                              To protect your privacy remote resources have been blocked.
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                              Allow
                            </button>
                            <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                              Always allow from {selectedEmail.senderEmail}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 overflow-y-auto p-6">
                        <div
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: selectedEmail.content }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No Email Selected
                        </h3>
                        <p className="text-gray-500">
                          Select an email from the list to view its contents
                        </p>
                      </div>
                    </div>
                  )}
                </div>



                {/* 📱 Mobile / Tablet */}
                <div className="flex w-full lg:hidden bg-gray-50">
                  {!isMobileDetail ? (
                    // Email List (Cards)
                    <div className="w-full p-3 overflow-y-auto">

                      <div className=" py-[10px] mb-[5px] gap-[10px] border-b flex w-[100%]  border-gray-200 bg-gray-50">

                        <div className="relative w-[100%]">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search emails..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-[100%] pl-10  pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>

                        <div className=" border  flex justify-center items-center rounded-[8px] w-[40px] h-[40px]">
                          <i className="fa-regular text-[#787777] fa-filter"></i>
                        </div>
                      </div>

                      {filteredEmails.map((email) => (
                        <div
                          key={email.id}
                          onClick={() => {
                            handleEmailClick(email);
                            setIsMobileDetail(true);
                          }}
                          className="bg-white shadow-sm rounded-lg p-4 mb-3 border-[1.2px] cursor-pointer hover:bg-gray-50"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-semibold text-gray-900">
                              {email.sender}
                            </h3>
                            <span className="text-xs text-gray-500">{email.timestamp}</span>
                          </div>
                          <p className="text-sm font-medium text-gray-800">{email.subject}</p>
                          <p className="text-xs text-gray-500 line-clamp-2">{email.preview}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Detail View
                    <div className="w-full flex flex-col bg-white h-screen">
                      <button
                        onClick={() => setIsMobileDetail(false)}
                        className="p-3 text-blue-600 flex items-center gap-2 border-b bg-gray-50"
                      >
                        <i className="fa-solid fa-arrow-left"></i> Back to Notfications
                      </button>
                      {selectedEmail && (
                        <div className="flex-1 overflow-y-auto p-4">
                          <h1 className="text-lg font-semibold text-gray-900 mb-2">
                            {selectedEmail.subject}
                          </h1>
                          <p className="text-sm text-gray-600 mb-1">
                            {selectedEmail.sender} &lt;{selectedEmail.senderEmail}&gt;
                          </p>
                          <p className="text-xs text-gray-500 mb-3">
                            {selectedEmail.timestamp}
                          </p>
                          <div
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: selectedEmail.content }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>


                {/* Styles */}
                <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .email-content {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
          line-height: 1.6;
          color: #374151;
        }
        .email-content h2 {
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }
        .email-content h3 {
          color: #374151;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1.5rem 0 1rem 0;
        }
        .email-content p {
          margin-bottom: 1rem;
        }
        .email-content ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        .email-content li {
          margin-bottom: 0.5rem;
        }
        .security-alert {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1px solid #f59e0b;
          border-radius: 12px;
          padding: 2rem;
          margin: 1rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .repository-info {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1.5rem;
          margin-top: 1.5rem;
          box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
        }
        .feature-highlight {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 8px;
          padding: 1.5rem;
          margin: 1.5rem 0;
        }
        .deployment-info {
          background: #f0fdf4;
          border: 1px solid #22c55e;
          border-radius: 8px;
          padding: 1.5rem;
          margin: 1.5rem 0;
        }
        .vulnerability-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .vulnerability-table th,
        .vulnerability-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        .vulnerability-table th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
        }
        .vulnerability-table td {
          color: #6b7280;
        }
        .vulnerability-table code {
          background: #f3f4

          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.875rem;
        }
        
        .version-current {
          color: #dc2626;
          font-weight: 600;
        }
        
        .version-upgrade {
          color: #16a34a;
          font-weight: 600;
        }
        
        .severity-high {
          background: #fecaca;
          color: #dc2626;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .severity-medium {
          background: #fed7aa;
          color: #ea580c;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .action-buttons {
          margin-top: 2rem;
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .btn-primary {
          background: #3b82f6;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .btn-primary:hover {
          background: #2563eb;
        }
        
        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .btn-secondary:hover {
          background: #e5e7eb;
        }
      `}</style>
              </div>
            </div>

          </div>
        </div>
      </section>

    </>
  )
}
