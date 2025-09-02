
import { useState, React, useEffect } from "react"
import { Plus, X, Save, Search, Shield } from "lucide-react"
import SideBar from '../../Component/sidebar/SideBar'
import Header from '../../Component/header/Header'
import { ApiDelete, ApiGet, ApiPost, ApiPut } from "../../helper/axios";
import { Modal as NextUIModal, ModalContent } from "@nextui-org/react";

export default function RoleManage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roleList, setRoleList] = useState([]);
    const [editingRole, setEditingRole] = useState(null);
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [isOpenModal, setModalOpen1] = useState(false);

    const fetchRoles = async () => {
        try {
            const res = await ApiGet("/admin/role");
            console.log("res", res);
            setRoleList(res.role);
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);


    const handleDelete = async () => {
        try {
            await ApiDelete(`/admin/role/${selectedRoleId}`);
            fetchRoles();
            setModalOpen1(false);
            setSelectedRoleId(null);
        } catch (error) {
            console.error("Error deleting role:", error);
            alert("Failed to delete role.");
        }
    };


    console.log("editiongRole", editingRole);

    const handleSaveRole = async (roleData) => {
        try {
            if (editingRole) {
                await ApiPut(`/admin/role/${editingRole._id}`, roleData);
            } else {
                await ApiPost("/admin/role", roleData);
            }
            fetchRoles();
            setIsModalOpen(false);
            setEditingRole(null);
        } catch (error) {
            console.error("Error saving role:", error);
        }
    };

    const openddeleteModal = (roleId) => {
        setSelectedRoleId(roleId);
        setModalOpen1(true);
    };


    const handleModalclose = () => {
        setModalOpen1(false);

    };

    return (
        <>
            <section className="flex font-Poppins w-[100%] h-[100%] select-none p-[15px] overflow-hidden">
                <div className="flex w-[100%] flex-col gap-[14px] h-[96vh]">
                    <Header pageName="  Role Management" />
                    <div className="flex gap-[10px] w-[100%] h-[100%]">
                        <SideBar />
                        <div className="flex pl-[10px] w-[100%] max-h-[90%] pb-[50px] pr-[15px] overflow-y-auto gap-[30px] rounded-[10px]">
                            <div className=' flex w-[100%] flex-col gap-[20px] py-[10px]'>
                                <div className=' flex gap-[5px]  w-[100%] flex-col'>
                                    <div className=" w-[100%] mx-auto">
                                        <div className="mb-6 flex w-[100%] justify-end  ">
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="flex items-center gap-2  bs-spj text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                                            >
                                                <Plus className="w-5 h-5" />
                                                Create New Role
                                            </button>
                                        </div>

                                        {/* Existing roles would be listed here */}
                                        <div className=" flex gap-[13px] flex-wrap">
                                            {roleList.length > 0 ? (
                                                roleList.map((role) => (
                                                    <div
                                                        key={role?._id}
                                                        className="bg-white  relative p-3  min-h-[160px] rounded-xl w-[310px] shadow-sm border  border-[#df040450]   hover:shadow-md transition-shadow"
                                                    >

                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="bg-[#df040420] p-2 rounded-lg">
                                                                <Shield className="w-5 h-5 text-[#df0404]" />
                                                            </div>
                                                            <h3 className="font-[600] text-[16px]">{role?.roleName}</h3>
                                                        </div>
                                                        <div className=" flex w-[100%] mt-[20px] flex-wrap gap-[8px]">
                                                            {role.permissions?.map((perm, idx) => (
                                                                <p
                                                                    key={idx}
                                                                    className="text-[#0099dd] border border-[#aacff3] bg-[#19b1ed3c] w-fit h-[25px] flex items-center justify-center px-[6px] rounded-[3px] text-[13px]"
                                                                >
                                                                    {perm.module}
                                                                </p>
                                                            ))}
                                                            {/* <p className="text-[#0099dd] border border-[#aacff3] bg-[#19b1ed3c] w-fit h-[25px]  flex items-center justify-center px-[6px] rounded-[3px] text-[13px] ">
                                                            Manage po
                                                        </p> */}
                                                        </div>
                                                        <div className="flex absolute bottom-0 border-t  border-l px-[10px] gap-[10px]  border-[#df040450] right-0 justify-end  rounded-tl-[8px]">
                                                            <button onClick={() => { setEditingRole(role); setIsModalOpen(true); }} className="text-blue-600"><i className="fa-regular fa-pen-to-square"></i></button>
                                                            <button
                                                                // onClick={() => handleDeleteRole(role._id)}
                                                                onClick={() => openddeleteModal(role._id)}
                                                                className="text-sm text-[#ff2828] h-[35px] rounded-r-[5px]"
                                                            >
                                                                <i className="fa-regular text-[17px] fa-trash"></i></button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-gray-500 w-full text-center py-10">No roles found.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Role Creation Modal */}
                                    {isModalOpen && (
                                        <RoleModal
                                            onClose={() => {
                                                setIsModalOpen(false);
                                                setEditingRole(null);
                                            }}
                                            onSave={handleSaveRole}
                                            editingRole={editingRole}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
              <NextUIModal isOpen={isOpenModal} onOpenChange={handleModalclose}>
                <ModalContent className="md:max-w-[350px] max-w-[333px] relative  rounded-2xl z-[700] flex justify-center !py-0 mx-auto  h-[300px]  ">
                    {(handleModalclose) => (
                        <>
                            <div className="relative w-[100%] h-[100%] ">
                                <div className="relative  w-[100%] h-[100%]">
                                    <div className="w-[100%] flex gap-7 flex-col">
                                        <div className="w-[100%] mt-[30px] p-[10px] mx-auto flex justify-center s">
                                            <i className=" text-[80px] text-[red] shadow-delete-icon rounded-full fa-solid fa-circle-xmark"></i>
                                        </div>
                                        <div className=" mx-auto justify-center flex text-[28px] font-[500]  font-Montserrat ">
                                            <p>Are you sure ?</p>
                                        </div>
                                        <div className="absolute bottom-0 flex w-[100%]">
                                            <div
                                                className="w-[50%] cursor-pointer flex justify-center items-center py-[10px]  bg-[red] rounded-bl-[10px] text-[#fff] font-[600]  font-Montserrat  text-[20px]"
                                                onClick={handleDelete}
                                            >
                                                <p>Delete</p>
                                            </div>
                                            <div
                                                className="w-[50%] cursor-pointer flex justify-center items-center py-[10px]  bg-[#0aa1ff] rounded-br-[10px] text-[#fff] font-[600]  font-Montserrat  text-[20px]"
                                                onClick={handleModalclose}
                                            >
                                                <p>Cancel</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </ModalContent>
            </NextUIModal>
        </>
    )
}

function RoleModal({ onClose, onSave, editingRole, handleModalclose }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [roleName, setRoleName] = useState(editingRole?.roleName || "");
    const [isOpenModal, setModalOpen1] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState(() => {
        const permissions = {};
        if (editingRole?.permissions) {
            editingRole.permissions.forEach((perm) => {
                permissions[perm.module] = perm.permissions || [];
            });
        }
        return permissions;
    });

    const modules = [
        {
            id: "dashboard",
            name: "Dashboard",
            permissions: ["View"],
        },
        {
            id: "po_order",
            name: "PO Order Management",
            permissions: ["Create", "Edit", "Delete", "View", "Assign", "Download", "Upload"],
        },
        {
            id: "inventory",
            name: "Inventory Management",
            permissions: ["Create", "Edit", "Delete", "View"],
        },
        {
            id: "purchase",
            name: "Purchase Management",
            permissions: ["Create", "Edit", "Delete", "View"],
        },
        {
            id: "company",
            name: "Company Management",
            permissions: ["Create", "Edit", "Delete", "View", "Share", "Download", "Upload"],
        },
        {
            id: "sales",
            name: "Sales Management",
            permissions: ["Create", "Edit", "Delete", "View"],
        },
        {
            id: "today_report",
            name: "Today Report",
            permissions: ["Create", "Edit", "Delete", "View"],
        },
        {
            id: "pgvcl_today_report",
            name: "PGVCL Today Report",
            permissions: ["Create", "Edit", "Delete", "View"],
        },
        {
            id: "payment",
            name: "Payment Management",
            permissions: ["Create", "Edit", "Delete", "View"],
        },
        {
            id: "party",
            name: "Party Management",
            permissions: ["Create", "Edit", "Delete", "View"],
        },
        {
            id: "vendor",
            name: "Vendor Management",
            permissions: ["Create", "Edit", "Delete", "View"],
        },
        {
            id: "role",
            name: "Role Management",
            permissions: ["Create", "Edit", "Delete", "View"],
        },
        {
            id: "user",
            name: "User Management",
            permissions: ["Create", "Edit", "Delete", "View"],
        },
    ];


    const filteredModules = modules.filter((module) => module.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const handleCheckboxChange = (moduleId, permission) => {
        setSelectedPermissions((prev) => ({
            ...prev,
            [moduleId]: prev[moduleId]
                ? prev[moduleId].includes(permission)
                    ? prev[moduleId].filter((perm) => perm !== permission)
                    : [...prev[moduleId], permission]
                : [permission],
        }));
    };

    const handleSave = () => {
        const newRole = {
            roleName,
            permissions: Object.keys(selectedPermissions).map((moduleId) => ({
                module: moduleId,
                permissions: selectedPermissions[moduleId],
            })),
        };

        onSave(newRole);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="relative h-20   items-center flex  px-[10px]">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4  text-[#000] rounded-full p-1 hover:bg-black/10 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-[600] text-[#df0404] mt-1">Create New Role</h2>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-5">
                    {/* Role name input */}
                    <div className="mb-6">
                        <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 mb-1">
                            Name<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="roleName"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg  text-[15px] outline-none"
                            placeholder="Enter Role Name"
                        />
                    </div>

                    {/* Search */}
                    {/* <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2  text-[14px] border border-gray-300 rounded-lg outline-none"
                            placeholder="Search modules..."
                        />
                    </div> */}

                    <h3 className="font-medium text-gray-700 mb-4">Assign General Permission to Roles</h3>

                    {/* Permissions table */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[#ff464642] border-b border-gray-200">
                                    <th className="py-3 px-4 text-left font-medium text-gray-600 w-1/3">MODULE</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-600">PERMISSIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredModules.map((module, index) => (
                                    <tr key={module.id} className={index % 2 === 0 ? "bg-white" : "bg-[#ffdede3d]"}>
                                        <td className="py-3 px-4 border-b border-gray-200">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" className="rounded accent-[#ff0505] text-emerald-500 focus:ring-emerald-500" />
                                                <span>{module.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 border-b border-gray-200">
                                            <div className="flex flex-wrap gap-4">
                                                {module.permissions.map((permission) => (
                                                    <label key={`${module.id}-${permission}`} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            onChange={() => handleCheckboxChange(module.id, permission)}
                                                            checked={selectedPermissions[module.id]?.includes(permission)}
                                                            className="rounded text-emerald-500 accent-[#ff0505] focus:ring-emerald-500"
                                                        />
                                                        <span className=" text-[14px]">{permission}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2  bs-spj text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {editingRole ? "Update" : "Create"}
                    </button>
                </div>
            </div>

          
        </div>
    )
}