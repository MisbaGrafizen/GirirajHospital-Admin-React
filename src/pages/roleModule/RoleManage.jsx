import React, { useEffect, useState } from "react"
import { Plus, X, Save, Shield, Download } from "lucide-react"
import SideBar from "../../Component/sidebar/CubaSidebar"
import Header from "../../Component/header/Header"
import { ApiDelete, ApiGet, ApiPost, ApiPut } from "../../helper/axios"
import { Modal as NextUIModal, ModalContent } from "@nextui-org/react"
import Preloader from "../../Component/loader/Preloader"


function resolvePermissions() {
  const loginType = localStorage.getItem("loginType")
  const isAdmin = loginType === "admin"

  let permsArray = []
  try {
    const parsed = JSON.parse(localStorage.getItem("rights"))
    if (parsed?.permissions && Array.isArray(parsed.permissions)) {
      permsArray = parsed.permissions
    } else if (Array.isArray(parsed)) {
      permsArray = parsed
    }
  } catch {
    permsArray = []
  }

  const findPerm = (mod) =>
    Array.isArray(permsArray) && permsArray.find((p) => p?.module === mod)

  const modulePerm =
    findPerm("role_management") ||
    findPerm("admin") ||
    findPerm("dashboard") ||
    null

  const has = (perm) => isAdmin || modulePerm?.permissions?.includes(perm)

  return {
    isAdmin,
    canView: has("View"),
    canCreate: has("Create"),
    canUpdate: has("Update"),
    canDelete: has("Delete"),
  }
}

function PermissionDenied() {
  return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="bg-white border rounded-xl p-8 shadow-sm text-center max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Permission required
        </h2>
        <p className="text-gray-600">
          You don’t have access to view Role Management. Please contact an
          administrator.
        </p>
      </div>
    </div>
  )
}


/* ---------------------------------- */
/* Pretty names for chips/cards       */
/* ---------------------------------- */
const MODULE_NAME_BY_ID = {
  // Core apps (CRUD)
  dashboard: "Dashboard",
  ipd: "IPD",
  opd: "OPD",
  complaints: "Complaints",

  // Departments
  medical_admin: "Medical Admin",
  nursing: "Nursing",
  dietitian: "Dietetics",
  maintenance: "Maintenance",
  security: "Security",
  front_desk: "Front Desk",
  housekeeping: "Housekeeping",
  pgro: "PGRO",
}


const CORE_APPS = [
  { id: "dashboard", name: "Dashboard", permissions: ["View", "Create", "Read", "Update", "Delete"] },
  { id: "ipd", name: "IPD", permissions: ["View", "Create", "Read", "Update", "Delete", "Download"] },
  { id: "opd", name: "OPD", permissions: ["View", "Create", "Read", "Update", "Delete", "Download"] },
  { id: "complaints", name: "Complaints", permissions: ["View", "Create", "Read", "Update", "Delete", "Download"] },
]

// Departments from your note (we include CRUD + View to be flexible)
const DEPARTMENT_MODULES = [
  { id: "doctor_service", name: "Doctor Services", permissions: ["View", "Forward", "Escalate", "Resolve"] },
  { id: "nursing", name: "Nursing", permissions: ["View", "Forward", "Escalate", "Resolve"] },
  { id: "dietitian", name: "Dietetics", permissions: ["View", "Forward", "Escalate", "Resolve"] },
  { id: "maintenance", name: "Maintenance", permissions: ["View", "Forward", "Escalate", "Resolve"] },
  { id: "security", name: "Security", permissions: ["View", "Forward", "Escalate", "Resolve"] },
  { id: "billing_service", name: "Billing Services", permissions: ["View", "Forward", "Escalate", "Resolve"] },
  { id: "housekeeping", name: "Housekeeping (Cleanliness)", permissions: ["View", "Forward", "Escalate", "Resolve"] },
  { id: "diagnostic_service", name: "Diagnostic Services", permissions: ["View", "Forward", "Escalate", "Resolve"] },
  { id: "tat", name: "TAT", permissions: ["View"] },
]

// final ordered list shown in modal: core first, then departments
const ALL_MODULES = [...CORE_APPS, ...DEPARTMENT_MODULES]

/* ====================================================================== */
/*                               MAIN PAGE                                */
/* ====================================================================== */
export default function RoleManage() {
    const { canView, canCreate, canUpdate, canDelete } = resolvePermissions()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [roleList, setRoleList] = useState([])
  const [editingRole, setEditingRole] = useState(null)

  const [isOpenModal, setModalOpen1] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState(null)

  const fetchRoles = async () => {
    try {
      const res = await ApiGet("/admin/role")
      setRoleList(res.role || [])
    } catch (error) {
      console.error("Error fetching roles:", error)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const handleSaveRole = async (roleData) => {
    try {
      if (editingRole?._id) {
        await ApiPut(`/admin/role/${editingRole._id}`, roleData)
      } else {
        await ApiPost("/admin/role", roleData)
      }
      await fetchRoles()
      setIsModalOpen(false)
      setEditingRole(null)
    } catch (error) {
      console.error("Error saving role:", error)
      alert("Failed to save role.")
    }
  }

  const openDeleteModal = (roleId) => {
    setSelectedRoleId(roleId)
    setModalOpen1(true)
  }

  const handleDelete = async () => {
    try {
      if (!selectedRoleId) return
      await ApiDelete(`/admin/role/${selectedRoleId}`)
      await fetchRoles()
      setModalOpen1(false)
      setSelectedRoleId(null)
    } catch (error) {
      console.error("Error deleting role:", error)
      alert("Failed to delete role.")
    }
  }
const handleCreateRole = () => {
    setIsModalOpen(true)
  }




  const closeDeleteModal = () => setModalOpen1(false)
    if (!canView) {
    return (
      <section className="flex font-Poppins w-full min-h-screen select-none overflow-hidden">
        <div className="flex w-full flex-col h-[96vh]">
          <Header pageName="Role Management"  onCreateNewRole={handleCreateRole}/>
          <div className="flex w-full h-full">
            <SideBar />
            <div className="flex w-full bg-[#fff] p-10">
              <PermissionDenied />
            </div>
          </div>
        </div>
      </section>

    )
  }


  return (
    <>
      <section className="flex font-Poppins w-[100%] min-h-screen select-none  overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
          <Header pageName="Role Management" onCreateNewRole={handleCreateRole} />
          <div className="flex  w-[100%] h-[100%]">
            <SideBar />
 <div className="flex flex-col w-[100%] max-h-[90%]  relative  py-[10px] px-[10px] bg-[#fff] overflow-y-auto gap-[10px] ">
              <Preloader />
              <div className="flex w-[100%] flex-col md34:!mb-[100px] md34!:mb-[0px] gap-[20px] py-[10px]">
                <div className="w-[100%] mx-auto">
                   {canCreate && (

                    <>
                    {/* <div className="mb-6 flex w-full justify-end">
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bs-spj text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <Plus className="w-5 h-5" />
                        Create New Role
                      </button>
                    </div> */}
                    </>
                  )}

                  {/* Roles grid */}
                  <div className="flex gap-[13px]  mx-auto md11:!justify-start md34:!justify-center flex-wrap">
                    {roleList.length > 0 ? (
                      roleList.map((role) => (
                        <div
                          key={role?._id}
                          className="bg-white relative p-3 min-h-[160px] rounded-xl w-[310px] shadow-sm border border-[#df040450] hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-[#df040420] p-2 rounded-lg">
                              <Shield className="w-5 h-5 text-[#df0404]" />
                            </div>
                            <h3 className="font-[600] text-[16px]">{role?.roleName}</h3>
                          </div>

                          <div className="flex w-[100%] mt-[10px] flex-wrap gap-[8px]">
                            {(role.permissions || []).map((perm, i) => (
                              <span
                                key={`${perm.module}-${i}`}
                                className="text-[#0099dd] border border-[#aacff3] bg-[#19b1ed3c] w-fit h-[25px] flex items-center justify-center px-[6px] rounded-[3px] text-[12px]"
                                title={(perm.permissions || []).join(", ")}
                              >
                                {MODULE_NAME_BY_ID[perm.module] || perm.module}
                              </span>
                            ))}
                          </div>
                          <div className="flex absolute bottom-0 border-t border-l px-[10px] gap-[10px] border-[#df040450] right-0 justify-end rounded-tl-[8px]">
                           {canUpdate && (
                              <button
                              onClick={() => {
                                setEditingRole(role)
                                setIsModalOpen(true)
                              }}
                              className="text-blue-600"
                            >
                              <i className="fa-regular fa-pen-to-square"></i>
                            </button>

                            )}
                            {canDelete && (
                              <button onClick={() => openDeleteModal(role._id)} className="text-sm text-[#ff2828] h-[35px] rounded-r-[5px]">
                              <i className="fa-regular text-[17px] fa-trash"></i>
                            </button>
                            )}
                            </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 w-full text-center py-10">No roles found.</div>
                    )}
                  </div>
                </div>

                {/* Role Modal */}
                {isModalOpen && (
                  <RoleModal
                    onClose={() => {
                      setIsModalOpen(false)
                      setEditingRole(null)
                    }}
                    onSave={handleSaveRole}
                    editingRole={editingRole}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Delete confirm modal */}
      <NextUIModal isOpen={isOpenModal} onOpenChange={closeDeleteModal}>
        <ModalContent className="md:max-w-[350px] max-w-[333px] relative rounded-2xl z-[700] flex justify-center !py-0 mx-auto h-[300px]">
          {(closeDeleteModal) => (
            <>
              <div className="relative w-[100%] h-[100%]">
                <div className="w-[100%] flex gap-7 flex-col">
                  <div className="w-[100%] mt-[30px] p-[10px] mx-auto flex justify-center">
                    <i className="text-[80px] text-[red] shadow-delete-icon rounded-full fa-solid fa-circle-xmark"></i>
                  </div>
                  <div className="mx-auto justify-center flex text-[28px] font-[500] font-Montserrat">
                    <p>Are you sure ?</p>
                  </div>
                  <div className="absolute bottom-0 flex w-[100%]">
                    <div
                      className="w-[50%] cursor-pointer flex justify-center items-center py-[10px] bg-[red] rounded-bl-[10px] text-[#fff] font-[600] font-Montserrat text-[20px]"
                      onClick={handleDelete}
                    >
                      <p>Delete</p>
                    </div>
                    <div
                      className="w-[50%] cursor-pointer flex justify-center items-center py-[10px] bg-[#0aa1ff] rounded-br-[10px] text-[#fff] font-[600] font-Montserrat text-[20px]"
                      onClick={closeDeleteModal}
                    >
                      <p>Cancel</p>
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

/* ====================================================================== */
/*                              ROLE MODAL                                 */
/* ====================================================================== */

function RoleModal({ onClose, onSave, editingRole }) {
  const [roleName, setRoleName] = useState(editingRole?.roleName || "")
  // { [moduleId]: string[] }
  const [selectedPermissions, setSelectedPermissions] = useState(() => {
    const map = {}
    if (Array.isArray(editingRole?.permissions)) {
      editingRole.permissions.forEach((p) => {
        map[p.module] = Array.isArray(p.permissions) ? [...p.permissions] : []
      })
    }
    return map
  })

  // helpers
  const getModulePerms = (moduleId) => selectedPermissions[moduleId] || []

  const setModulePerms = (moduleId, perms) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [moduleId]: perms,
    }))
  }

  const handlePermissionToggle = (moduleId, perm) => {
    setSelectedPermissions((prev) => {
      const current = new Set(prev[moduleId] || [])
      if (current.has(perm)) current.delete(perm)
      else current.add(perm)
      return { ...prev, [moduleId]: Array.from(current) }
    })
  }

  // TRUE if all perms of that module are selected
  const isModuleChecked = (module) => {
    const current = new Set(getModulePerms(module.id))
    return module.permissions.every((p) => current.has(p))
  }

  // Toggle whole module; if turning OFF, keep first permission only
  const handleModuleToggle = (module) => {
    const currentAll = isModuleChecked(module)
    if (currentAll) {
      // turning OFF: keep FIRST permission only (as requested)
      const first = module.permissions[0]
      setModulePerms(module.id, first ? [first] : [])
    } else {
      // turning ON: select all, preserving any already selected
      setModulePerms(module.id, Array.from(new Set([...(getModulePerms(module.id)), ...module.permissions])))
    }
  }

  const handleSave = () => {
    const payload = {
      roleName,
      permissions: Object.keys(selectedPermissions).map((moduleId) => ({
        module: moduleId,
        permissions: selectedPermissions[moduleId],
      })),
    }
    onSave(payload)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[10000]">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative h-16 flex items-center px-4 py-[10px] border-b">
          <h2 className="text-xl font-[600] text-[#df0404]">{editingRole ? "Edit Role" : "Create New Role"}</h2>
          <button onClick={onClose} className="absolute right-4 text-[#000] rounded-full p-1 hover:bg-black/10 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-3 md11:!p-5">
          {/* Role name */}
          <div className="mb-6">
            <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="roleName"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-[15px] outline-none"
              placeholder="Enter Role Name"
            />
          </div>

          <h3 className="font-medium text-gray-700 mb-3">Assign Permissions</h3>

          {/* Core apps */}
          {/* <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
            <div className="px-4 py-2 bg-[#f9fafb] border-b text-sm font-semibold text-gray-700">All</div>
            <table className="w-full">
              <thead>
                <tr className="bg-[#ff464642] border-b border-gray-200">
                  <th className="py-3 px-4 text-left font-medium text-gray-600 w-1/3">MODULE</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-600">PERMISSIONS</th>
                </tr>
              </thead>
              <tbody>
                {CORE_APPS.map((module, idx) => (
                  <tr key={module.id} className={idx % 2 === 0 ? "bg-white" : "bg-[#ffdede3d]"}>
                    <td className="py-3 px-4 border-b border-gray-200">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded accent-[#ff0505]"
                          checked={isModuleChecked(module)}
                          onChange={() => handleModuleToggle(module)}
                        />
                        <span>{module.name}</span>
                      </label>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200">
                      <div className="flex flex-wrap gap-4">
                        {module.permissions.map((perm) => {
                          const checked = (selectedPermissions[module.id] || []).includes(perm)
                          return (
                            <label key={`${module.id}-${perm}`} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                className="rounded accent-[#ff0505]"
                                checked={checked}
                                onChange={() => handlePermissionToggle(module.id, perm)}
                              />
                              <span className="text-[14px]">{perm}</span>
                            </label>
                          )
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> */}

          {/* Departments */}
          <div className="border border-gray-200 rounded-xl  md34:!overflow-scroll md11:!overflow-hidden">
            <div className="px-4 py-2 bg-[#f9fafb] border-b text-sm font-semibold text-gray-700">Departments</div>
            <table className="w-full">
              <thead>
                <tr className="bg-[#ff464642] border-b border-gray-200">
                  <th className="py-3 px-4 text-left font-medium text-gray-600 w-1/3">MODULE</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-600">PERMISSIONS</th>
                </tr>
              </thead>
              <tbody>
                {DEPARTMENT_MODULES.map((module, idx) => (
                  <tr key={module.id} className={idx % 2 === 0 ? "bg-white" : "bg-[#ffdede3d]"}>
                    <td className="py-3 px-4 border-b border-gray-200">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded accent-[#ff0505]"
                          checked={isModuleChecked(module)}
                          onChange={() => handleModuleToggle(module)}
                        />
                        <span>{module.name}</span>
                      </label>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200">
                      <div className="flex flex-wrap gap-4">
                        {module.permissions.map((perm) => {
                          const checked = (selectedPermissions[module.id] || []).includes(perm)
                          return (
                            <label key={`${module.id}-${perm}`} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                className="rounded accent-[#ff0505]"
                                checked={checked}
                                onChange={() => handlePermissionToggle(module.id, perm)}
                              />
                              <span className="text-[14px]">{perm}</span>
                            </label>
                          )
                        })}
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
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bs-spj text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
            <Save className="w-4 h-4" />
            {editingRole ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  )
}
