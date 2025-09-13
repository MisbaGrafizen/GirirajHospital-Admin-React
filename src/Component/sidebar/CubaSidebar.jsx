import React, { useState } from "react";
import {
  Gauge,
  Wallet,
  FileStack,
  FileText,
  ClipboardCheck,
  BriefcaseMedical,
  Settings,
  Users,
  Menu,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"
import logofevicon from "../../../public/imges/fevicon.png"
import textlogo from "../../../public/imges/onlyText.png"


import { useNavigate, useLocation } from "react-router-dom";

const CubaSidebar = () => {
const [expandedMenu, setExpandedMenu] = useState("dashboards");
const [isCollapsed, setIsCollapsed] = useState(false);
const navigate = useNavigate();
const location = useLocation();


  // Custom SVG Icons
  const HomeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  )

  const WidgetsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )

  const PageLayoutIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  )

  const ProjectsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
    </svg>
  )

  const FileManagerIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )

  const KanbanIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.78 0l-8-4a2 2 0 0 1-1.11-1.79V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z" />
    </svg>
  )

  const EcommerceIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )

  const MailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )

  const ChatIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )

  const UsersIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )

  const ReportsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
    </svg>
  )

  const BookmarksIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )

  const SupportIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )

  const CalendarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )

  const ChevronRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9,18 15,12 9,6" />
    </svg>
  )

  const GridIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )

  const MenuIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )

  const menuSections = [
    {
      title: "Super Admin",
      items: [
        {
          id: "dashboards",
          label: "FeedBacks",
          icon: React.createElement(HomeIcon),
          badge: "13",
          hasSubmenu: true,
          href: "/dashboards",
          submenu: [
            { id: "Super Admin", label: "Dashboard", href: "/dashboards/super-dashboard" },
            { id: "ecommerce", label: "Opd Feedback", href: "/dashboards/opd-feedback" },
            { id: "online-course", label: "Ipd Feedback", href: "/dashboards/ipd-feedback" },
            { id: "social", label: "Complaint List", href: "/dashboards/complaint-dashboard" },

            { id: "crypto", label: "Nps Dashboard", href: "/dashboards/nps-dashboard" },
            { id: "nft", label: "Executive Report", href: "/dashboards/executive-report" },
            { id: "school-management", label: "Role Mana..", href: "/dashboards/role-manage" },
            { id: "pos", label: "User Mana..", href: "/dashboards/user-manage" },
            // { id: "crm", label: "CRM", href: "/dashboards/crm", isNew: true },
            // { id: "analytics", label: "Analytics", href: "/dashboards/analytics", isNew: true },
            // { id: "hr", label: "HR", href: "/dashboards/hr", isNew: true },
            // { id: "projects", label: "Projects", href: "/dashboards/projects", isNew: true },
            // { id: "logistics", label: "Logistics", href: "/dashboards/logistics", isNew: true },
          ],
        },
        // {
        //   id: "widgets",
        //   label: "Widgets",
        //   icon: React.createElement(WidgetsIcon),
        //   hasSubmenu: true,
        //   href: "/widgets",
        //   submenu: [
        //     { id: "chart-widgets", label: "Chart Widgets", href: "/widgets/charts" },
        //     { id: "data-widgets", label: "Data Widgets", href: "/widgets/data" },
        //     { id: "ui-widgets", label: "UI Widgets", href: "/widgets/ui" },
        //   ],
        // },
        // {
        //   id: "page-layout",
        //   label: "Page Layout",
        //   icon: React.createElement(PageLayoutIcon),
        //   hasSubmenu: true,
        //   href: "/page-layout",
        //   submenu: [
        //     { id: "boxed", label: "Boxed Layout", href: "/page-layout/boxed" },
        //     { id: "full-width", label: "Full Width", href: "/page-layout/full-width" },
        //     { id: "sidebar-layout", label: "Sidebar Layout", href: "/page-layout/sidebar" },
        //   ],
        // },
      ],
    },
    // {
    //   title: "APPLICATIONS",
    //   items: [
    //     {
    //       id: "projects",
    //       label: "Projects",
    //       icon: React.createElement(ProjectsIcon),
    //       hasSubmenu: true,
    //       href: "/projects",
    //       submenu: [
    //         { id: "project-list", label: "Project List", href: "/projects/list" },
    //         { id: "project-details", label: "Project Details", href: "/projects/details" },
    //         { id: "create-project", label: "Create Project", href: "/projects/create" },
    //       ],
    //     },
    //     {
    //       id: "file-manager",
    //       label: "File Manager",
    //       icon: React.createElement(FileManagerIcon),
    //       href: "/file-manager",
    //     },
    //     {
    //       id: "kanban-board",
    //       label: "Kanban Board",
    //       icon: React.createElement(KanbanIcon),
    //       href: "/kanban-board",
    //     },
    //     {
    //       id: "ecommerce",
    //       label: "Ecommerce",
    //       icon: React.createElement(EcommerceIcon),
    //       hasSubmenu: true,
    //       href: "/ecommerce",
    //       submenu: [
    //         { id: "products", label: "Products", href: "/ecommerce/products" },
    //         { id: "orders", label: "Orders", href: "/ecommerce/orders" },
    //         { id: "customers", label: "Customers", href: "/ecommerce/customers" },
    //       ],
    //     },
    //     {
    //       id: "mail-box",
    //       label: "Mail Box",
    //       icon: React.createElement(MailIcon),
    //       href: "/mail-box",
    //     },
    //     {
    //       id: "chat",
    //       label: "Chat",
    //       icon: React.createElement(ChatIcon),
    //       hasSubmenu: true,
    //       href: "/chat",
    //       submenu: [
    //         { id: "private-chat", label: "Private Chat", href: "/chat/private" },
    //         { id: "group-chat", label: "Group Chat", href: "/chat/group" },
    //       ],
    //     },
    //     {
    //       id: "users",
    //       label: "Users",
    //       icon: React.createElement(UsersIcon),
    //       hasSubmenu: true,
    //       href: "/users",
    //       submenu: [
    //         { id: "user-list", label: "User List", href: "/users/list" },
    //         { id: "user-profile", label: "User Profile", href: "/users/profile" },
    //         { id: "user-settings", label: "User Settings", href: "/users/settings" },
    //       ],
    //     },
    //     {
    //       id: "reports",
    //       label: "Reports",
    //       icon: React.createElement(ReportsIcon),
    //       hasSubmenu: true,
    //       isNew: true,
    //       href: "/reports",
    //       submenu: [
    //         { id: "sales-report", label: "Sales Report", href: "/reports/sales" },
    //         { id: "user-report", label: "User Report", href: "/reports/users" },
    //         { id: "financial-report", label: "Financial Report", href: "/reports/financial" },
    //       ],
    //     },
    //     {
    //       id: "bookmarks",
    //       label: "Bookmarks",
    //       icon: React.createElement(BookmarksIcon),
    //       href: "/bookmarks",
    //     },
    //     {
    //       id: "support",
    //       label: "Support",
    //       icon: React.createElement(SupportIcon),
    //       href: "/support",
    //     },
    //     {
    //       id: "calendar",
    //       label: "Calendar",
    //       icon: React.createElement(CalendarIcon),
    //       href: "/calendar",
    //     },
    //   ],
    // },
  ]

const handleMenuClick = (item) => {
  if (item.hasSubmenu) {
    setExpandedMenu(item.id); // always switch, never null
  } else {
    navigate(item.href);
    setExpandedMenu("dashboards"); // fallback stays expanded
  }
};


  const handleSubmenuClick = (href) => {
    navigate(href)
  }

  const isActive = (href) => {
return location.pathname === href || location.pathname.startsWith(href + "/");
  }

  const isSubmenuActive = (submenu) => {
    return submenu.some((item) => isActive(item.href))
  }

  const isMainMenuActive = (item) => {
    if (isActive(item.href)) return true
    if (item.submenu && isSubmenuActive(item.submenu)) return true
    return false
  }

const toggleSidebar = () => {
  setIsCollapsed((prev) => !prev);
  if (isCollapsed) {
    // when reopening, restore default expanded menu
    setExpandedMenu("dashboards");
  }
};


  // Framer Motion variants
  const sidebarVariants = {
    expanded: {
      width: "13rem",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    collapsed: {
      width: "4rem",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  }

  const contentVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        delay: 0.1,
        ease: "easeOut",
      },
    },
    collapsed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  }

  const submenuVariants = {
    expanded: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    collapsed: {
      height: 0,
      opacity: 0,
      // transition: {
      //   duration: 0.3,
      //   ease: "easeInOut",
      // },
    },
  }


  return (
<>

      <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div
        className="bg-white shadow-sm flex flex-col border-r border-gray-200 relative"
        // variants={sidebarVariants}
        animate={isCollapsed ? "collapsed" : "expanded"}
        initial={false}
      >
        {/* Header */}
        <div className="px-3  py-[10px] border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
            <img className=" w-[30px]" src={logofevicon} />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    className="text-xl font-bold text-gray-800 tracking-tight"
                    variants={contentVariants}
                    // initial="collapsed"
                    // animate="expanded"
                    // exit="collapsed"
                  >
<img className=" w-[100px]" src={textlogo} />
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <button onClick={toggleSidebar} className="p-1.5 rounded-md  hover:bg-gray-100 transition-colors">
              {isCollapsed ? React.createElement(MenuIcon) : React.createElement(GridIcon)}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          {menuSections.map((section, sectionIndex) => (
            <div key={section.title} className={sectionIndex > 0 ? "mt-8" : ""}>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    className="px-6 mb-2"
                    // variants={contentVariants}
                    // initial="collapsed"
                    // animate="expanded"
                    // exit="collapsed"
                  >
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{section.title}</h3>
                  </motion.div>
                )}
              </AnimatePresence>

              <nav className="space-y-1 px-2">
                {section.items.map((item) => {
                  const mainActive = isMainMenuActive(item)
                  const expanded = expandedMenu === item.id

                  return (
                    <div key={item.id} className="relative">
                      <button
                        onClick={() => handleMenuClick(item)}
                        className={`group w-full  flex items-center px-[13px] sha py-2.5 text-sm font-medium rounded-md transition-all duration-200 relative ${
                          mainActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        {/* Blue rounded indicator on the left */}
                        {mainActive && (
                          <motion.div
                            className="absolute right-[1px] top-[7px] transform -translate-y-1/2 w-1 h-7 bg-blue-600 rounded-l-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}

                        <div
                          className={`mr-3 flex-shrink-0 transition-colors ${
                            mainActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-600"
                          }`}
                        >
                          {item.icon}
                        </div>

                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.div
                              className="flex-1 flex items-center justify-between"
                              // variants={contentVariants}
                              // initial="collapsed"
                              // animate="expanded"
                              // exit="collapsed"
                            >
                              <span className="text-left">{item.label}</span>
                              <div className="flex items-center space-x-2">
                                {item.badge && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                    {item.badge}
                                  </span>
                                )}
                                {item.isNew && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    New
                                  </span>
                                )}
                                {item.hasSubmenu && (
                                  <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                                    {React.createElement(ChevronRightIcon)}
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>

                      {/* Submenu - expands below with animation */}
                      <AnimatePresence>
                        {item.hasSubmenu && !isCollapsed && expanded && (
                          <motion.div
                            // variants={submenuVariants}
                            // initial="collapsed"
                            // animate="expanded"
                            // exit="collapsed"
                            className="overflow-hidden"
                          >
                            <div className="ml-6 mt-1 border-l border-gray-200 pl-4 space-y-1">
                              {item.submenu?.map((subItem, index) => (
                                <div key={subItem.id} className="relative">
                                  {/* Connecting line */}
                                  <div className="absolute -left-4 top-3 w-3 h-px bg-gray-200"></div>

                                  <motion.button
                                    onClick={() => handleSubmenuClick(subItem.href)}
                                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                                      isActive(subItem.href)
                                        ? "bg-blue-50 text-blue-700 font-medium"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                                    // initial={{ opacity: 0, x: -10 }}
                                    // animate={{ opacity: 1, x: 0 }}
                                    // transition={{ delay: index * 0.05 }}
                                  >
                                    <span className="flex-1 text-left">{subItem.label}</span>
                                    {subItem.isNew && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 ml-2">
                                        New
                                      </span>
                                    )}
                                  </motion.button>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>
      </motion.div>

 
    </div>
</>
  );
};

export default CubaSidebar;
