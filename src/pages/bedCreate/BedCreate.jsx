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

    // Edit
    const handleEdit = (bed) => {
        setForm({ name: bed.wardName, start: bed.start, end: bed.end })
        setOpenModal(true)
    }

    return (
        <>
            <section className="flex w-full h-full select-none md11:pr-[15px] overflow-hidden">
                <div className="flex flex-col w-full h-screen">
                    <Header pageName="Bed Management" />
                    <div className="flex w-full h-full">
                        <CubaSidebar />
                        <div className="flex flex-col w-full relative max-h-[93%] md34:!pb-[120px] md11:!pb-[20px] py-[10px] pr-[10px] overflow-y-auto gap-[10px] rounded-[10px]">
                            <Preloader />

                            {/* Top Bar */}
                            <div className="flex justify-end px-4">
                                <button
                                    onClick={() => setOpenModal(true)}
                                    className="px-4  flex  items-center gap-[10px] py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
                                >
                                    <i className="fa-solid fa-plus"></i> Create Ward
                                </button>
                            </div>

                            {/* Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 py-6">
                                {boards.map((board) => (
                                    <div
                                        key={board.id}
                                        className="p-4 rounded-xl shadow-md border bg-white flex flex-col gap-2 relative"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-700">{board.wardName}</h3>
                                        <p className="text-sm text-gray-500">
                                            Bed No: {board.start} - {board.end}
                                        </p>

                                        {/* Actions */}
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            <button
                                                onClick={() => handleEdit(board._id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(board._id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </div>
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
