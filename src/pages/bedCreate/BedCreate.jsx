"use client"

import React, { useEffect, useState } from "react"
import { X, Edit, Trash } from "lucide-react"
import Preloader from "../../Component/loader/Preloader"
import CubaSidebar from "../../Component/sidebar/CubaSidebar"
import Header from "../../Component/header/Header"
import { ApiDelete, ApiGet, ApiPost, ApiPut } from "../../helper/axios"

export default function BedCreate() {
  const [openModal, setOpenModal] = useState(false)
  const [boards, setBoards] = useState([])
  const [form, setForm] = useState({ name: "", start: "", end: "" })
  const [loading, setLoading] = useState(false)


  const fetchBeds = async () => {
    try {
      setLoading(true)
      const res = await ApiGet("/admin/bed")
      console.log('res', res)
      setBoards(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBeds()
  }, [])

  const handleSave = async () => {
    if (!form.name || !form.start || !form.end) return alert("Please fill all fields")

    try {
      if (form.id) {
        // update
        await ApiPut(`/admin/bed/${form.id}`, {
          wardName: form.name,
          start: form.start,
          end: form.end,
        })
      } else {
        // create
        await ApiPost("/admin/bed", {
          wardName: form.name,
          start: form.start,
          end: form.end,
        })
      }
      fetchBeds()
      setForm({ name: "", start: "", end: "" })
      setOpenModal(false)
    } catch (err) {
      console.error(err)
      alert("Error saving bed")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this ward?")) return
    try {
      await ApiDelete(`/admin/bed/${id}`)
      fetchBeds()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (bed) => {
    setForm({
      id: bed._id,        // 🔥 IMPORTANT
      name: bed.wardName,
      start: bed.start,
      end: bed.end,
    });

    setOpenModal(true);   // 🔥 opens modal
  };


  const handleCreateWardClick = () => {
    setOpenModal(true)
  }

  return (
    <>
      <section className="flex w-full h-full select-none overflow-hidden">
        <div className="flex flex-col w-full h-screen">
          <Header pageName="Bed Management" onCreateWard={handleCreateWardClick} />
          <div className="flex w-full h-full">
            <CubaSidebar />
            <div className="flex md34:!px-[20px] flex-col md11:!px-[10px] w-full relative max-h-[93%] md34:!pb-[120px] md11:!pb-[20px] pt-[20px] md11:!py-[10px] md11:!pr-[10px] overflow-y-auto gap-[10px] ">
              <Preloader />

              {/* Top Bar */}
              {/* <div className="flex justify-end px-4"> */}
              {/* <button
                                    onClick={() => setOpenModal(true)}
                                    className="px-4  flex  items-center gap-[10px] py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
                                >
                                    <i className="fa-solid fa-plus"></i> Create Ward
                                </button>
                            </div> */}

              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ">
                {boards.map((board, i) => (
                  <div
                    key={board._id || i}
                    className="relative group bg-gradient-to-br from-[#ffffff] via-[#f9f9f9] to-[#f1f1f1] hover:from-[#fff5f5] hover:to-[#ffecec] border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden"
                  >
                    {/* Header Gradient Bar */}
                    <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-[#e21e23] via-[#ff4d6d] to-[#ff8fa3]"></div>

                    {/* Content */}
                    <div className="p-[13px] flex flex-col h-full">
                      {/* Ward Icon + Name */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-[40px] h-[40px] bg-gradient-to-br from-[#e21e23] to-[#ff8fa3] text-white rounded-md flex items-center justify-center shadow-md">
                            <i className="fa-solid fa-bed text-[15px]"></i>
                          </div>
                          <div>
                            <h3 className="text-[15px] font-[600] text-gray-800">
                              {board.wardName}
                            </h3>
                            <p className="text-[11px] text-gray-500 tracking-wide uppercase">
                              Ward #{i + 1}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(board)}
                            className="p-1 text-gray-500 hover:text-[#e21e23] rounded-md hover:bg-gray-100 transition"
                            title="Edit"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(board._id)}
                            className="p-2 text-gray-500 hover:text-[#e21e23] rounded-md hover:bg-gray-100 transition"
                            title="Delete"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>

                      {/* Bed Numbers */}
                      <div className="bg-[#fff9f9] border border-[#ffd6d6] rounded-xl p-2 text-center shadow-inner">
                        <h4 className="text-[13px] text-gray-600 font-medium">
                          Bed Numbers
                        </h4>
                        <p className="text-[18px] font-semibold text-[#e21e23] mt-1">
                          {board.start} — {board.end}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-[12px] text-gray-500">
                          Total Beds:{" "}
                          <strong className="text-gray-800">
                            {Number(board.end) - Number(board.start) + 1}
                          </strong>
                        </span>

                        <span className="px-3 py-[4px] text-[12px] rounded-full font-medium bg-gradient-to-r from-[#e21e23] to-[#ff4d6d] text-white shadow-sm">
                          Active Ward
                        </span>
                      </div>
                    </div>

                    {/* Hover Glow Accent */}

                  </div>
                ))}
              </div>


              {/* Modal */}
              {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-4 relative">
                    {/* Close Button */}
                    <button
                      onClick={() => setOpenModal(false)}
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                    >
                      <X size={22} />
                    </button>

                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Create Ward</h2>

                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        placeholder="Ward Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                      <div className=" grid grid-cols-2 gap-[10px]">


                        <input
                          type="number"
                          placeholder="Bed Start Number"
                          value={form.start}
                          onChange={(e) => setForm({ ...form, start: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                        <input
                          type="number"
                          placeholder=" Bed  Last Number"
                          value={form.end}
                          onChange={(e) => setForm({ ...form, end: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-center mt-2">
                      <button
                        onClick={handleSave}
                        className="px-4 py-[5px] bg-red-600 text-white w-[120px] font-[600] rounded-lg shadow text-[17px] hover:bg-red-700 transition"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
