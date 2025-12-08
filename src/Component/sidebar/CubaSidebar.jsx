import React, { useState, useEffect } from "react";
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
import textlogo from "../../../public/imges/onlyText.jpeg"

import { NavLink } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faTachometerAlt,
  faUserMd,
  faStopwatch,
  faHospitalUser,
  faListAlt,
  faChartLine,
  faFileAlt,
  faUsersCog,
  faUserShield, faBed, faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons"

import { useNavigate, useLocation } from "react-router-dom";


function resolvePermissions() {
  const loginType = localStorage.getItem("loginType");
  const isAdmin = loginType === "admin";

  let permsArray = [];
  try {
    const parsed = JSON.parse(localStorage.getItem("rights"));
    if (parsed?.permissions && Array.isArray(parsed.permissions)) {
      permsArray = parsed.permissions;
    } else if (Array.isArray(parsed)) {
      permsArray = parsed;
    }
  } catch {
    permsArray = [];
  }

  return { isAdmin, permsArray };
}


const CubaSidebar = () => {
  const [expandedMenu, setExpandedMenu] = useState(["dashboards"]);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = resolvePermissions();
  let roleName = "Super Admin";
  try {
    const rights = JSON.parse(localStorage.getItem("rights"));
    if (rights?.roleName) {
      roleName = rights.roleName;
    }
  } catch {
    roleName = "Super Admin";
  }


  // Custom SVG Icons
  const HomeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  )

  const ReportsIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 3h18v18H3z" /> {/* outer box */}
      <path d="M7 8h10M7 12h6M7 16h8" /> {/* report lines */}
    </svg>
  );

  const ChevronRightIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"> <polyline points="9,18 15,12 9,6" /> </svg>)

  const ROUTE_GROUPS = {
    "/ipd-feedback": [
      "/dashboards/ipd-all-list",
      "/ipd-feedback-details",
      "/dashboards/ipd-list",
      "/dashboards/ipd-edit",
    ],
    "/opd-feedback": [
      "/dashboards/opd-all-list",
      "/dashboards/opd-list",
      "/opd-feedback-details",
    ],
    "/complaint-dashboard": [
      "/complaint-details",
      "/complain-list",
    ],
    "/reports/nps-reports": [
      "/reports/nps-all-list",
    ],

    "/internal-complint-list": [
      "/internal-complaint-details",
    ],

        "/employee-feedback": [
      "/employee-all-list",
      "/employee-feedback-details",

    ],


    


        "/consultant-feedback": [
      "/consultant-all-list",
 "/consultant-feedback-details",
     
    ],
  };



  const menuSections = [
    {
      title: roleName,
      items: [
        {
          id: "dashboards",
          label: "FeedBacks",
          icon: React.createElement(HomeIcon),
          hasSubmenu: true,
          href: "/dashboards",
submenu: [
  { id: "Super Admin", label: "Dashboard", href: "/dashboard", icon: faTachometerAlt },
  { id: "opd", label: "Opd Feedback", href: "/opd-feedback", icon: faUserMd },
  { id: "ipd", label: "Ipd Feedback", href: "/ipd-feedback", icon: faHospitalUser },
  { id: "complaints", label: "Complaint List", href: "/complaint-dashboard", icon: faListAlt },
  { id: "complaintsintern", label: "Internal Comps.. ", href: "/internal-complint-list", icon: faExclamationTriangle },

  // ADMIN-ONLY
  isAdmin && {
    id: "employeeDashboard",
    label: "Employee Dash.. ",
    href: "/employee-feedback",
    icon: faUsersCog,
  },

  isAdmin && {
    id: "consultantDashboard",
    label: "Consultant Dash.. ",
    href: "/consultant-feedback",
    icon: faUserMd,
  },
].filter(Boolean),   
        },

        {
          id: "reports",
          label: "Reports",
          icon: React.createElement(ReportsIcon),
          hasSubmenu: true,
          href: "/reports",
          submenu: [
            { id: "nps", label: "Nps Reports", href: "/reports/nps-reports", icon: faChartLine },
            { id: "executive", label: "Executive Report", href: "/reports/executive-report", icon: faFileAlt },

          ],
        },
        isAdmin && {
          id: "settings",
          label: "Settings",
          icon: React.createElement(Settings),
          hasSubmenu: true,
          href: "/settings",
          submenu: [
            { id: "bed-manage", label: "Bed Manager", href: "/settings/bed-manage", icon: faBed },
            { id: "user-manage", label: "User Management", href: "/settings/user-manage", icon: faUsersCog },
            { id: "role-manage", label: "Role Management", href: "/settings/role-manage", icon: faUserShield },
          ],
        },
      ],
    },
  ];




  const handleMenuClick = (item) => {
    if (!item.hasSubmenu) {
      navigate(item.href);
      return;
    }

    setExpandedMenu((prev) => {
      if (prev.includes(item.id)) {
        // collapse if already open
        return prev.filter((id) => id !== item.id);
      } else {
        // open new one while keeping others open
        return [...prev, item.id];
      }
    });
  };



  const handleSubmenuClick = (href, parentId) => {
    navigate(href);
    setExpandedMenu(parentId); // ✅ keep only that section open
  };

  const isActive = (href) => {
    const path = location.pathname;

    // ✅ Check direct or nested route
    if (path === href || path.startsWith(href + "/")) return true;

    // ✅ Check custom route groups
    if (ROUTE_GROUPS[href]) {
      return ROUTE_GROUPS[href].some((subPath) =>
        path.startsWith(subPath)
      );
    }

    return false;
  };







  useEffect(() => {
    const currentPath = location.pathname;
    let openMenus = ["dashboards"];
    if (currentPath.startsWith("/reports")) openMenus = ["reports"];
    else if (currentPath.startsWith("/settings")) openMenus = ["settings"];
    else if (currentPath.startsWith("/dashboards")) openMenus = ["dashboards"];
    setExpandedMenu(openMenus);
  }, [location.pathname]);

  const isSubmenuActive = (submenu) => {
    return submenu.some((item) => isActive(item.href))
  }

  const isMainMenuActive = (item) => {
    if (isActive(item.href)) return true
    if (item.submenu && isSubmenuActive(item.submenu)) return true
    return false
  }
  useEffect(() => {
    const currentPath = location.pathname;

    // start with feedbacks always open
    let openMenus = ["dashboards"];

    if (currentPath.startsWith("/reports")) {
      openMenus = ["reports"]; // only reports open
    }
    else if (currentPath.startsWith("/settings")) {
      openMenus = ["settings"]; // only settings open
    }
    else if (currentPath.startsWith("/dashboards") || currentPath.startsWith("/feedbacks")) {
      openMenus = ["dashboards"]; // keep feedbacks open
    }

    setExpandedMenu(openMenus);
  }, [location.pathname]);


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
      width: "19rem",
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




  const navItems = [
    { id: "Super Admin", label: "Dashboard", href: "/dashboard", icon: faTachometerAlt },

    { id: "nft", label: "Exe. Report", href: "/reports/executive-report", icon: faFileAlt },
    { id: "school-management", label: "Role Mana..", href: "/settings/role-manage", icon: faUserShield },
    { id: "pos", label: "User Mana..", href: "/settings/user-manage", icon: faUsersCog },
  ]

  const handleLogout = () => {
    const savedIdentifier = localStorage.getItem("savedIdentifier");
    const savedPassword = localStorage.getItem("savedPassword");
    const rememberMe = localStorage.getItem("rememberMe");

    localStorage.clear();
    sessionStorage.clear();

    if (rememberMe === "true" && savedIdentifier) {
      localStorage.setItem("savedIdentifier", savedIdentifier);
      if (savedPassword) localStorage.setItem("savedPassword", savedPassword);
      localStorage.setItem("rememberMe", "true");
    }

    navigate("/");
  };



  return (
    <>

      <div className="   md34:!hidden md11:!flex relative  h-screen bg-gray-50">
        {/* Sidebar */}
        <motion.div
          className="bg-white shadow-sm flex flex-col border-r  min-w-[190px]   border-gray-200 relative"
          // variants={sidebarVariants}
          animate={isCollapsed ? "collapsed" : "expanded"}
          initial={false}
        >
          {/* Header */}
          <div className="px-3  py-[px] border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* <img className=" w-[30px]" src={logofevicon} /> */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      className="text-xl font-bold text-gray-800 tracking-tight"
                      variants={contentVariants}

                    >
                      <img className=" w-[160px] mx-auto !ml-[7px] h-[60px] object-contain" src={textlogo} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

          <button
            onClick={() => window.open("https://internal.feedbacks.live", "_blank")} // ✅ opens in new tab
            className="w-[80%] mx-auto gap-[10px] flex justify-center items-center font-[500] mt-[6px] py-[7px] bg-red-600 text-white rounded-lg text-sm hover:opacity-90 transition"
          >
            <i className="fa-solid fa-plus"></i> Complaint
          </button>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto max-h-[75vh] pb-4 pt-[10px]">
            {menuSections.map((section, sectionIndex) => (
              <div key={section.title} className={sectionIndex > 0 ? "mt-8" : ""}>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      className="px-6 mb-2"

                    >
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{section.title}</h3>
                    </motion.div>
                  )}
                </AnimatePresence>

                <nav className="space-y-1 px-2">
                  {section.items.map((item) => {
                    const mainActive = isMainMenuActive(item)
                    const expanded = expandedMenu.includes(item.id);

                    return (
                      <div key={item.id} className="relative">
                        <button
                          onClick={() => handleMenuClick(item)}
                          className={`group w-full  flex items-center px-[13px] sha py-2.5 text-sm font-medium rounded-md transition-all duration-200 relative ${mainActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
                            className={`mr-3 flex-shrink-0 transition-colors ${mainActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-600"
                              }`}
                          >
                            {item.icon}
                          </div>

                          <AnimatePresence>
                            {!isCollapsed && (
                              <motion.div
                                className="flex-1 flex items-center flex-shrink-0 justify-between"
                              // variants={contentVariants}
                              // initial="collapsed"
                              // animate="expanded"
                              // exit="collapsed"
                              >
                                <span className="text-left flex-shrink-0">{item.label}</span>
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
                              <div className="ml-7px] mt-1 border-l border-gray-200 pl-4 space-y-1">
                                {item.submenu?.map((subItem, index) => (
                                  <div key={subItem.id} className="relative">
                                    {/* Connecting line */}
                                    <div className="absolute -left-4 top-3 w-3 h-px bg-gray-200"></div>

                                    <motion.button
                                      onClick={() => handleSubmenuClick(subItem.href, item.id)}
                                      className={`w-full flex items-center pl-[10px] gap-[8px] py-2 text-sm rounded-md transition-colors ${isActive(subItem.href)
                                        ? "bg-blue-50 text-blue-700 font-medium"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                    // initial={{ opacity: 0, x: -10 }}
                                    // animate={{ opacity: 1, x: 0 }}
                                    // transition={{ delay: index * 0.05 }}
                                    >
                                      {subItem.icon && (
                                        <FontAwesomeIcon icon={subItem.icon} className={`w-4  h-4 text-gray-400${isActive(subItem.href)
                                          ? " !text-blue-700 "
                                          : "!text-gray-200"
                                          }`} />
                                      )}
                                      <span className="flex-1 flex-shrink-0 text-[13px] text-left">{subItem.label}</span>
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


        {/* <div className="bg-gradient-to-br left-0 right-0 mx-auto  absolute md11:!bottom-[15%] cursor-pointer   w-[130px] font-[600] items-center gap-[10px] text-[16px] rounded-[8px]   h-[35px] flex  justify-center  from-purple-400 to-blue-500  text-[#fff]  "
          onClick={handleLogout}>
          <i className="fa-solid fa-left-from-bracket"></i> Log Out
        </div> */}
      </div>

{/* 
      <div className=" md11:!hidden  md34:!flex fixed gap-[20px] w-[93%] px-[20px] profile-box1 overflow-x-auto  bottom-2 z-[10000] h-[70px] rounded-[10px] mx-auto left-0 right-0 bg-white shadow-lg justify-around items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.href}
            className={({ isActive }) =>
              `flex flex-col items-center  flex-shrink-0 justify-center text-xs font-medium transition ${isActive ? "text-white font-[600] scale-[]" : "text-gray-300"
              }`
            }
          >
            <FontAwesomeIcon icon={item.icon} className="text-[20px] mb-1" />
            {item.label}
          </NavLink>
        ))}
      </div> */}
<div className="fixed bottom-3 left-1/2 -translate-x-1/2
    w-[98%] bg-white shadow-xl overflow-y-auto rounded-[50px] h-[60px]
    flex justify-around items-center px-2 z-[10000] border border-gray-200">

  {navItems.map((item) => (
    <NavLink
      key={item.id}
      to={item.href}
      className={({ isActive }) =>
        `relative flex flex-col items-center justify-center px-2 py-1
        transition-all duration-300 text-[10px]
        ${isActive ? "text-blue-600 font-semibold" : "text-gray-400"}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute -bottom-1 w-6 h-1 bg-blue-600 rounded-full"></span>
          )}
          
          <FontAwesomeIcon 
            icon={item.icon} 
            className="text-[16px] mb-[8px]"
          />
          <span className="leading-[10px]">{item.label}</span>
        </>
      )}
    </NavLink>
  ))}
</div>












    </>
  );
};

export default CubaSidebar;
