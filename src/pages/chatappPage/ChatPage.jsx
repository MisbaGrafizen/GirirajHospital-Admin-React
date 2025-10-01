import React, { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Paperclip } from "lucide-react"
import ContactItem from "../../../src/Component/chatApp/ContactItem"
import ChatHeader from "../../Component/chatApp/ChatHeader"
import MessageBubble from "../../Component/chatApp/MessageBubble"
import MessageInputBar from "../../Component/chatApp/MessageInputBar"
import FilePreviewModal from "../../Component/chatApp/FilePreviewModal"
import VideoPlayerModal from "../../Component/chatApp/VideoPlayerModal"
import DocumentModal from "../../Component/chatApp/DocumentModal"
import Header from "../../Component/header/Header"
import CubaSidebar from "../../Component/sidebar/CubaSidebar"
import Preloader from "../../Component/loader/Preloader"

// Seed data
const contacts = [
  { id: "1", name: "Alex Johnson", avatar: "/alex.jpg", lastMessage: "See you soon!", lastTime: "12:45" },
  { id: "2", name: "Mia Chen", avatar: "/mia.jpg", lastMessage: "Sent the file.", lastTime: "09:10" },
]

const messagesSeed = {
  "1": [
    { id: "m1", from: "them", type: "text", content: "Hey! Ready for lunch?", time: "12:22", date: "today" },
    { id: "m2", from: "me", type: "text", content: "Absolutely. Meet at 1?", time: "12:23", date: "today" },
    { id: "m3", from: "them", type: "image", url: "/cafe.jpg", name: "Cafe.png", time: "12:24", date: "today", pinned: true },
  ],
  "2": [
    { id: "m4", from: "them", type: "doc", url: "/proposal.pdf", name: "Proposal.pdf", time: "09:06", date: "today", pinned: true },
    { id: "m5", from: "me", type: "text", content: "Got it, thanks! 🙏", time: "09:08", date: "today" },
  ],
}

// Helper
const dateLabel = (k) => (k === "today" ? "Today" : k === "yesterday" ? "Yesterday" : k)

export default function ChatPage() {
  const [selectedId, setSelectedId] = useState(contacts[0].id)
  const [messagesByContact, setMessagesByContact] = useState(messagesSeed)

  const [imageOpen, setImageOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const [docOpen, setDocOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState(null)
  const [videoSrc, setVideoSrc] = useState(null)
  const [docFile, setDocFile] = useState(null)

  const [pinnedOpen, setPinnedOpen] = useState(false)
  const scrollRef = useRef(null)

  const activeContact = contacts.find((c) => c.id === selectedId)

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [selectedId, messagesByContact])

  const groupedMessages = useMemo(() => {
    const all = messagesByContact[selectedId] || []
    return all.reduce((acc, m) => {
      acc[m.date] = acc[m.date] || []
      acc[m.date].push(m)
      return acc
    }, {})
  }, [messagesByContact, selectedId])

  const pinned = useMemo(() => {
    return (messagesByContact[selectedId] || []).filter((m) => m.pinned)
  }, [messagesByContact, selectedId])

  const handleSend = (msg) => {
    const newMsg = {
      id: Date.now().toString(),
      from: "me",
      type: "text",
      content: msg,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: "today",
    }
    setMessagesByContact((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), newMsg],
    }))
  }

//   return (

//     <>

//       <section className="flex w-[100%] h-[100%] select-none   md11:pr-[15px] overflow-hidden">
//         <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
//           <Header pageName="Chat" />
//           <div className="flex  w-[100%] h-[100%]">
//             <CubaSidebar />
//             <div className="flex flex-col w-[100%] md34:!max-h-[96%] relative md11:!max-h-[90%] md34:!pb-[120px] md11:!pb-[20px] py-[10px]  overflow-y-auto gap-[10px] rounded-[10px]">

//               <Preloader />
//               <div className="flex h-screen   flex-col md:grid md:grid-cols-[300px_1fr]">
//                 {/* Sidebar */}
//                 <aside className="hidden md:flex md:flex-col border-r">
//                   <div className="p-4 font-semibold">Chats</div>
//                   <div className="flex-1 overflow-y-auto">
//                     {contacts.map((c) => (
//                       <ContactItem key={c.id} contact={c} active={c.id === selectedId} onClick={() => setSelectedId(c.id)} />
//                     ))}
//                   </div>
//                 </aside>

           
//                 <section className="flex flex-col">
//                   <ChatHeader contact={activeContact} onOpenPinned={() => setPinnedOpen(true)} />

//                   {/* Pinned Banner */}
//                   {pinned.length > 0 && (
//                     <div className="flex items-center gap-2 border-b px-3 py-2 bg-gray-50">
//                       <div>
//                         <Paperclip className="mr-1 h-4 w-4" /> {pinned.length} pinned
//                       </div>
//                       <button variant="link" onClick={() => setPinnedOpen(true)}>View all</button>
//                     </div>
//                   )}

//                   {/* Messages */}
//                   <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-background">
//                     {Object.entries(groupedMessages).map(([day, msgs]) => (
//                       <div key={day}>
//                         <div className="flex justify-center my-2">
//                           <span className="bg-gray-200 px-3 py-1 rounded-full text-xs">{dateLabel(day)}</span>
//                         </div>
//                         {msgs.map((m) => (
//                           <MessageBubble
//                             key={m.id}
//                             message={m}
//                             isOwn={m.from === "me"}
//                             onOpenImage={(src) => { setImageSrc(src); setImageOpen(true) }}
//                             onOpenVideo={(src) => { setVideoSrc(src); setVideoOpen(true) }}
//                             onOpenDoc={(file) => { setDocFile(file); setDocOpen(true) }}
//                           />
//                         ))}
//                       </div>
//                     ))}
//                   </div>

//                   {/* Input */}
//                   <MessageInputBar onSend={handleSend} />
//                 </section>

//                 {/* Modals */}
//                 <FilePreviewModal open={imageOpen} onOpenChange={setImageOpen} src={imageSrc} />
//                 <VideoPlayerModal open={videoOpen} onOpenChange={setVideoOpen} src={videoSrc} />
//                 <DocumentModal open={docOpen} onOpenChange={setDocOpen} file={docFile} />
//               </div>
//             </div>

//           </div>
//         </div>
//       </section>
//     </>

//   )
// }



 return (
    <section className="flex w-screen h-screen overflow-hidden select-none">
      <div className="flex flex-col w-full h-full">
        <Header pageName="Chat" />

        <div className="flex w-full h-full">
          <CubaSidebar />

          <div className="flex flex-col w-full h-full bg-white">
            <Preloader />

            <div className="grid md:grid-cols-[300px_1fr] h-full">
              {/* Sidebar */}
              <aside className="hidden md:flex md:flex-col border-r h-full">
                <div className="p-4 font-semibold">Chats</div>
                <div className="flex-1 overflow-y-auto">
                  {contacts.map((c) => (
                    <ContactItem
                      key={c.id}
                      contact={c}
                      active={c.id === selectedId}
                      onClick={() => setSelectedId(c.id)}
                    />
                  ))}
                </div>
              </aside>

              {/* Chat Section */}
              <section className="flex flex-col h-full">
                <ChatHeader
                  contact={activeContact}
                  onOpenPinned={() => setPinnedOpen(true)}
                />

                {/* Pinned Banner */}
                {pinned.length > 0 && (
                  <div className="flex items-center gap-2 border-b px-3 py-2 bg-gray-50">
                    <Paperclip className="mr-1 h-4 w-4" />
                    {pinned.length} pinned
                    <button onClick={() => setPinnedOpen(true)} className="text-blue-600 text-sm">
                      View all
                    </button>
                  </div>
                )}

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {Object.entries(groupedMessages).map(([day, msgs]) => (
                    <div key={day}>
                      <div className="flex justify-center my-2">
                        <span className="bg-gray-200 px-3 py-1 rounded-full text-xs">
                          {dateLabel(day)}
                        </span>
                      </div>
                      {msgs.map((m) => (
                        <MessageBubble
                          key={m.id}
                          message={m}
                          isOwn={m.from === "me"}
                          onOpenImage={(src) => { setImageSrc(src); setImageOpen(true) }}
                          onOpenVideo={(src) => { setVideoSrc(src); setVideoOpen(true) }}
                          onOpenDoc={(file) => { setDocFile(file); setDocOpen(true) }}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Input */}
                <MessageInput Bar onSend={handleSend} />
              </section>
            </div>
          </div>
        </div>
      </div>

      <FilePreviewModal open={imageOpen} onOpenChange={setImageOpen} src={imageSrc} />
      <VideoPlayerModal open={videoOpen} onOpenChange={setVideoOpen} src={videoSrc} />
      <DocumentModal open={docOpen} onOpenChange={setDocOpen} file={docFile} />
    </section>
  )
}
