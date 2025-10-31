import React from 'react'
import CubaSidebar from '../../Component/sidebar/CubaSidebar'
import Header from '../../Component/header/Header'
import Preloader from '../../Component/loader/Preloader'
import image from "../../../public/imges/main/avter.jpeg"


export default function EmployeeProfile() {
  // Sample data - replace with real data from your backend
  const employee = {
    name: "Dr. Sarah Johnson",
    position: "Senior Physician",
    department: "Cardiology",
    employeeId: "EMP-2024-001",
    email: "sarah.johnson@hospital.com",
    phone: "+1 (555) 123-4567",
    joinDate: "January 15, 2022",
    status: "Active",
    specialization: "Cardiac Surgery",
    image: image,
  }

  return (
  <>
      <section className="flex w-[100%] h-[100%] select-none  overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
          
          <Header pageName=" Profile"  />
          <div className="flex  w-[100%] h-[100%]">
            <CubaSidebar />
            <div className="flex flex-col w-[100%]  relative max-h-[93%]  md34:!pb-[100px] m md11:!pb-[20px] 2xl:pr-[10px]  overflow-y-auto gap-[10px] rounded-[10px]">
              <Preloader />
  
      <div className="max-w-4xl">
        {/* Header Section */}


        {/* Main Profile Card */}
        <div className="bg-white overflow-hidden">
          {/* Top Section with Image and Basic Info */}
          <div className="flex flex-col md:flex-row gap-8 p-4 border-b-2 border-gray-200">
            {/* Profile Image */}
            <div className="flex flex-col items-center md:items-start">
              <div className="w-[200px] h-[200px] rounded-lg overflow-hidden shadow-md mb-4 bg-gray-200">
                <img
                  src={employee.image || "/placeholder.svg"}
                  alt={employee.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-semibold">
                {employee.status}
              </span>
            </div>

            {/* Basic Information */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{employee.name}</h2>
              <p className="text-lg text-blue-600 font-semibold mb-">{employee.position}</p>
              <p className="text-gray-600 mb-6">{employee.department}</p>

              <div className="space-y-3">
                {/* Employee ID */}
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4m0 0L14 6m2-2l2 2M5 11v3m6-7h.01M9 20h6"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Employee ID</p>
                    <p className="text-gray-900 font-semibold">{employee.employeeId}</p>
                  </div>
                </div>

                {/* Join Date */}
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Join Date</p>
                    <p className="text-gray-900 font-semibold">{employee.joinDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="p-4 border-b-2 border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-50">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a
                    href={`mailto:${employee.email}`}
                    className="text-gray-900 font-semibold hover:text-blue-600 transition-colors"
                  >
                    {employee.email}
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-green-50">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <a
                    href={`tel:${employee.phone}`}
                    className="text-gray-900 font-semibold hover:text-blue-600 transition-colors"
                  >
                    {employee.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Details Section */}
          <div className="p-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Professional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department */}
              <div className="p-4 rounded-lg bg-gray-100">
                <p className="text-sm text-gray-600 mb-2">Department</p>
                <p className="text-gray-900 font-semibold">{employee.department}</p>
              </div>

              {/* Specialization */}
              <div className="p-4 rounded-lg bg-gray-100">
                <p className="text-sm text-gray-600 mb-2">Specialization</p>
                <p className="text-gray-900 font-semibold">{employee.specialization}</p>
              </div>

              {/* Position */}
              <div className="p-4 rounded-lg bg-gray-100">
                <p className="text-sm text-gray-600 mb-2">Position</p>
                <p className="text-gray-900 font-semibold">{employee.position}</p>
              </div>

              {/* Status */}
              <div className="p-4 rounded-lg bg-gray-100">
                <p className="text-sm text-gray-600 mb-2">Employment Status</p>
                <p className="text-gray-900 font-semibold">{employee.status}</p>
              </div>
            </div>
          </div>
        </div>


      </div>

        </div>
            </div>
            </div>

            </section>

</>


  )
}
