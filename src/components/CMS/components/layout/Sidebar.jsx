import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { useCmsContext } from '../../contexts/CmsContext';
import { FiX, FiChevronDown } from 'react-icons/fi';
import { useFreelancer } from '../../../../../src/context/FreelancerContext';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import logoNew from '../../../../assets/img/logoNew.png';
import favicon from '../../../../assets/img/logonewww.png';
import { icon } from '@fortawesome/fontawesome-svg-core';

/* --- CUSTOM LINKS CONFIGURATION --- */
// /dashboard/superadmin/developer/property
const CUSTOM_ROLE_LINKS = {
  "0": [
    {
      title: "Properties",
      icon: "fas fa-building",
      path: "/dashboard/superadmin/properties",
      submenus: [
        {
          title: "Create Developer",
          path: "/dashboard/superadmin/developer/create"
        },
        {
          title: "Property Management",
          path: "/dashboard/superadmin/developer/property"
        },
        // {
        //   title: "Agents",
        //   path: "/dashboard/superadmin/agent-list"
        // },

        // {
        //   title: "Agencies",
        //   path: "/dashboard/superadmin/agency-list"
        // }
      ]
    },
    {
      title: "Customers",
      icon: "fas fa-users",
      path: "/dashboard/superadmin/customers",
      submenus: [
        { title: "All Customers", path: "/dashboard/superadmin/customers/list" },
      ]
    },
    {
      title: "Rental Properties", icon: "fas fa-building", path: "/dashboard/{roleSlug}/rental/properties",
      submenus: [
        { title: "Create Rental Properties", path: "/dashboard/{roleSlug}/rental/properties" },
        { title: "Rental Proprties", path: "/dashboard/{roleSlug}/rental/propertieslist" },
        { title: "Rental Lead List", path: "/dashboard/{roleSlug}/rental/leadlist" },


      ],
    },
    // {
    //   title: "Setting",
    //   icon: "fas fa-cog",
    //   path: "/dashboard/superadmin/setting",
    //   submenus: [
    //     {
    //       title: "Email Setting",
    //       path: "/dashboard/superadmin/setting/email"
    //     }
    //   ]
    // }
  ],

  "1": [

  /* ── Listings & Approvals ── */
{
  title: "Listings",
  path: "/dashboard/{roleSlug}/property-list",
  icon: "fas fa-building",
  submenus: [
    { title: "All Listings",          path: "/dashboard/{roleSlug}/admin/property" },
    { title: "Approval Queue",        path: "/dashboard/{roleSlug}/listings/approval-queue" },
    { title: "Edit Review Queue",     path: "/dashboard/{roleSlug}/listings/edit-review-queue" },
    { title: "Create Rental Properties", path: "/dashboard/{roleSlug}/rental/properties" },
  ]
},

  /* ── Enquiry Handling ── */
  {
    title: "Enquiries",
    path: "/dashboard/{roleSlug}/enquiries",
    icon: "fas fa-inbox",
    submenus: [
      { title: "Enquiry Queue",   path: "/dashboard/{roleSlug}/enquiries/queue" },
      { title: "Bulk Upload",     path: "/dashboard/{roleSlug}/enquiries/bulk-upload" },
    ]
  },

  /* ── Lead Management ── */
  {
    title: "Lead Management",
    path: "/dashboard/{roleSlug}/lead-management",
    icon: "fas fa-filter",
    submenus: [
      { title: "All Leads",       path: "/dashboard/{roleSlug}/lead-management" },
      { title: "Platform Leads",  path: "/dashboard/{roleSlug}/GridAdmin/propertyleads" },
      { title: "Agent Leads",     path: "/dashboard/{roleSlug}/leads/agent" },
      { title: "General Leads",   path: "/dashboard/{roleSlug}/leads/general" },
    ]
  },

  /* ── User Management ── */
  {
    title: "Agencies",
    path: "/dashboard/{roleSlug}/agency-list",
    icon: "fas fa-network-wired",
    submenus: [
      { title: "Agency List",      path: "/dashboard/{roleSlug}/agency-list" },
      { title: "Create Agency",    path: "/dashboard/{roleSlug}/onboarding/agency" },
    ]
  },
  {
    title: "Developers",
    path: "/dashboard/{roleSlug}/developer-list",
    icon: "fas fa-user-tie",
    submenus: [
      { title: "Developer List",    path: "/dashboard/{roleSlug}/developer-list" },
      { title: "Create Developer",  path: "/dashboard/{roleSlug}/onboarding/developer" },
    ]
  },
  {
    title: "Agents",
    path: "/dashboard/{roleSlug}/agent-list",
    icon: "fas fa-user-friends",
    submenus: [
      { title: "Agent List",        path: "/dashboard/{roleSlug}/agent-list" },
      { title: "Verification Queue",path: "/dashboard/{roleSlug}/agents/verification-queue" },
    ]
  },
  {
    title: "Xoto Advisors",
    path: "/dashboard/{roleSlug}/advisor-list",
    icon: "fas fa-user-shield",
    submenus: [
      { title: "Advisor List",      path: "/dashboard/{roleSlug}/advisors" },
      { title: "Create Advisor",    path: "/dashboard/{roleSlug}/create-advisor" },
      { title: "Leaderboard",       path: "/dashboard/{roleSlug}/advisors/leaderboard" },
    ]
  },
  {
    title: "Referral Partners",
    path: "/dashboard/{roleSlug}/referral-list",
    icon: "fas fa-handshake",
  },
  {
    title: "Customers",
    path: "/dashboard/{roleSlug}/customer-list",
    icon: "fas fa-users",
    submenus: [
      { title: "Customer List",     path: "/dashboard/{roleSlug}/customer-list" },
      { title: "Enquiry History",   path: "/dashboard/{roleSlug}/customers/enquiry-history" },
    ]
  },

  /* ── Commission Management ── */
  {
    title: "Commission",
    path: "/dashboard/{roleSlug}/commission",
    icon: "fas fa-file-invoice-dollar",
    submenus: [
      { title: "Deal Records",        path: "/dashboard/{roleSlug}/commission/deal-records" },
      { title: "Commission Ledger",   path: "/dashboard/{roleSlug}/commission/ledger" },
      { title: "Partner Agreements",  path: "/dashboard/{roleSlug}/commission/agreements" },
    ]
  },

  /* ── Content Management ── */
  {
    title: "Content Management",
    path: "/dashboard/{roleSlug}/content",
    icon: "fas fa-photo-video",
    submenus: [
      { title: "Featured Properties", path: "/dashboard/{roleSlug}/content/featured" },
      { title: "Promo Banners",       path: "/dashboard/{roleSlug}/content/banners" },
    ]
  },

  /* ── Analytics ── */
  {
    title: "Analytics",
    path: "/dashboard/{roleSlug}/analytics",
    icon: "fas fa-chart-line",
    submenus: [
      { title: "Platform Overview",   path: "/dashboard/{roleSlug}/analytics/overview" },
      { title: "Agent Metrics",       path: "/dashboard/{roleSlug}/analytics/agents" },
      { title: "Developer Metrics",   path: "/dashboard/{roleSlug}/analytics/developers" },
      { title: "Commission Metrics",  path: "/dashboard/{roleSlug}/analytics/commission" },
    ]
  },

],
  "2": [
    {
      title: "Estimates", icon: "fas fa-calendar-check", path: "/dashboard/{roleSlug}/quotations",
      submenus: [
        { title: "Submitted Estimates", path: "/dashboard/{roleSlug}/estimate/submitted" },
        { title: "Received Quotation", path: "/dashboard/{roleSlug}/quotation/received" },
        { title: "Response Submitted", path: "/dashboard/{roleSlug}/quotation/response" },

      ],
    },
    {
      title: "My Projects", icon: "fas fa-calendar-check", path: "/dashboard/{roleSlug}/projects",
      submenus: [
        { title: "Ongoing Projects", path: "/dashboard/{roleSlug}/projects/ongoing" },


      ],
    },
    {
      title: "Bills", icon: "fas fa-calendar-check", path: "/dashboard/{roleSlug}/projects",
      submenus: [
        { title: "My Bills", path: "/dashboard/{roleSlug}/projects/milestone/bills" },
        // { title: "My Invoice", path: "/dashboard/{roleSlug}/projects/invoices" },


      ],
    },
    {
      title: "View Library", icon: "fas fa-calendar-check", path: "/dashboard/{roleSlug}/ViewLibrary",



    },

  ],
  "12": [
    {
      title: "Projects", icon: "fas fa-calendar-check", path: "/dashboard/{roleSlug}/projects/view",
      submenus: [
        { title: "Manage Projects", path: "/dashboard/{roleSlug}/projects/manage" },


      ],
    }
  ],
  "4": [

  ],
  "5": [
    {
      title: "Inventory",
      icon: "fas fa-warehouse",
      path: "/dashboard/vendor-b2c/inventory",
    },
  ],
  "7": [
    {
      title: "Quotations", icon: "fas fa-calendar-check", path: "/dashboard/{roleSlug}/quotations",
      submenus: [
        { title: "Submitted Quotation", path: "/dashboard/{roleSlug}/quotation/submitted" },
        { title: "Approved Quotation", path: "/dashboard/{roleSlug}/quotation/approved" },

      ],
    },
  ],
  "8": [
    {
      title: "Property Management",
      icon: "fas fa-building",
      path: "/dashboard/developer/property-management",
      submenus: [
        { title: "All Properties", path: "/dashboard/developer/property-management/list" },
      ],
    },
  ],
  "16": [
    {
      title: "Marketplace",
      icon: "fas fa-building",
      path: "/dashboard/{roleSlug}/agent-projects",
    },

    // {
    //   title: "Leads",
    //   icon: "fas fa-user-friends",
    //   path: "/dashboard/{roleSlug}/agent-leads",
    // },
    {
      title: "Secondary Properties", icon: "fas fa-building", path: "/dashboard/{roleSlug}/create-secondary-plans",
      submenus: [
        { title: "Create Properties", path: "/dashboard/{roleSlug}/create-secondary-plans" },
        { title: "Secondary Plans", path: "/dashboard/{roleSlug}/secondary-plans" },
      ],
    },
    {
      title: "Leads", icon: "fas fa-calendar-check", path: "/dashboard/{roleSlug}/agent-leads",
      submenus: [
        { title: "Create Leads", path: "/dashboard/{roleSlug}/agent-leads/add" },
        { title: "Leads", path: "/dashboard/{roleSlug}/agent-leads" },


      ],
    },
    {
      title: "Site Visits",
      icon: "fas fa-map-marker-alt",
      path: "/dashboard/{roleSlug}/visits",
    },
    // ,    {
    //       title: "My-Chats",
    //       icon: "fas fa-comment-dots",
    //       path: "/dashboard/{roleSlug}/My-Chats",
    //     }
    {
      title: "Deals",
      icon: "fas fa-handshake",
      path: "/dashboard/{roleSlug}/deals",
    },
    {
      title: "Commission",
      icon: "fas fa-rupee-sign",
      path: "/dashboard/{roleSlug}/commission",
    },
    // {
    //   title: "Xobia AI",
    //   icon: "fas fa-credit-card",
    //   path: "/dashboard/{roleSlug}/subscription",
    // },

    // {
    //   title: "Presentations",
    //   icon: "fas fa-file-powerpoint",
    //   path: "/dashboard/{roleSlug}/presentations",
    // },



  ],
  "10": [],
  "17": [
    {
      title: "Projects",
      icon: "fas fa-building",
      path: "/dashboard/{roleSlug}/developer-projects"
    },
    //   {
    //   title: "Global Projects",
    //   icon: "fas fa-building",
    //   path: "/dashboard/{roleSlug}/property-list"
    // },
    {
      title: "Inventory / Units",
      icon: "fas fa-layer-group",
      path: "/dashboard/{roleSlug}/developerinventory",
    },
    {
      title: "Leads Tracking",
      icon: "fas fa-users",
      path: "/dashboard/{roleSlug}/developer-leads",
    },
    {
      title: "Sales Revenue",
      icon: "fas fa-chart-line",
      path: "/dashboard/{roleSlug}/revenue",
    },
    {
      title: "Bookings",
      icon: "fas fa-file-signature",
      path: "/dashboard/{roleSlug}/bookings",
    },
    // {
    //     title: "Analytics",
    //     icon: "fas fa-chart-pie",
    //     path: "/dashboard/{roleSlug}/analytics"
    //   },
    {
      title: "Commission Scheme",
      icon: "fas fa-percent",
      path: "/dashboard/{roleSlug}/commission-scheme"
    }
  ],
  "15": [
    {
      title: "Projects", icon: "fas fa-building", path: "/dashboard/{roleSlug}/agency-projects",
      submenus: [
        { title: "Properties", icon: "fas fa-building", path: "/dashboard/{roleSlug}/agency-projects" },
        { title: "Agent Properties", icon: "fas fa-building", path: "/dashboard/{roleSlug}/agency-agent-properties" },


      ],
    },

  ],

  "18": [
    {
      title: "Agents",
      icon: "fas fa-users",
      path: "/dashboard/{roleSlug}/agents",
      submenus: [
        { title: "Onboard Agent", path: "/dashboard/{roleSlug}/agent-onboard" },
        { title: "All Agents", path: "/dashboard/{roleSlug}/vault/agent-list" },
      ],
    },
    {
      title: "Leads",
      icon: "fas fa-users",
      path: "/dashboard/{roleSlug}/leads",
      submenus: [
        { title: "Leads", path: "/dashboard/{roleSlug}/vault/agent-leads" },
      ],
    },
 {
  title: "Advisors",
  icon: "fas fa-user-tie",
  path: "/dashboard/{roleSlug}/advisor",  // parent path (optional)
  submenus: [
    { 
      title: "Create Advisor", 
      path: "/dashboard/{roleSlug}/advisor/create" 
    },
    { 
      title: "All Advisors", 
      path: "/dashboard/{roleSlug}/advisor/list" 
    },
  ],
},
 {
  title: "Mortgages",
  icon: "fas fa-file-invoice-dollar",   // ✅ Distinct icon
  path: "/dashboard/{roleSlug}/mortgage-ops",
  submenus: [
    { 
      title: "Create Mortgage", 
      path: "/dashboard/{roleSlug}/mortgage-ops/create" 
    },
    { 
      title: "All Mortgages", 
      path: "/dashboard/{roleSlug}/mortgage-ops/list" 
    },
  ],
},
   
    {
      title: "Propersals",
      icon: "fas fa-folder-open",
      path: "/dashboard/{roleSlug}/cases",
      submenus: [
        { title: "Create Proposals", path: "/dashboard/{roleSlug}/proposals/create" },
        { title: "View Proposals", path: "/dashboard/{roleSlug}/proposals/view" },
        // { title: "Disbursed", path: "/dashboard/{roleSlug}/cases/disbursed" },
      ],

    },

       
    {
      title: "Case",
      icon: "fas fa-folder-open",
      path: "/dashboard/{roleSlug}/cases",
      submenus: [
        { title: "Create Cases", path: "/dashboard/{roleSlug}/case/create" },
        { title: "View Cases", path: "/dashboard/{roleSlug}/case/view" },
                { title: "Process Cases", path: "/dashboard/{roleSlug}/case/view/all" },

        // { title: "Disbursed", path: "/dashboard/{roleSlug}/cases/disbursed" },
      ],

    },
    {
      
      title: "Vault Partners",
      icon: "fas fa-handshake",
      path: "/dashboard/{roleSlug}/partners",
      submenus: [
        { title: "Onboard Partner", path: "/dashboard/{roleSlug}/partners" }, // handle query param in component
        { title: "All Partners", path: "/dashboard/{roleSlug}/partner-list" }
      ]
    },

    
    {
      title: "Bank Library",
      icon: "fas fa-university",
      path: "/dashboard/{roleSlug}/bank/products",
    }
  ],
  "22": [
    {
    title: "Leads",   
    icon: "fas fa-users",
    path: "/dashboard/{roleSlug}/leads",
    submenus: [
      {
        title: "Create Leads",
        path: "/dashboard/{roleSlug}/leads/create"
      },
      {
  title: "All Leads",
  path: "/dashboard/{roleSlug}/leads" 
}
    ]
  }
    ,
  ],
"21": [
    {
    title: "Create Lead",
    icon: "fas fa-plus-circle",
    path: "/dashboard/{roleSlug}/leads/partner/create",
    // no submenu – direct link
  },
  {
    title: "Vault Partners",
    icon: "fas fa-users",
    path: "/dashboard/{roleSlug}/vaultpartner",
    submenus: [
      { title: "Onboard Agent", path: "/dashboard/{roleSlug}/onboard-partner" },
      { title: "All Agents", path: "/dashboard/{roleSlug}/AgentVaultlisting" },
    ],
  },
  {
      title: "Bank Library",
      icon: "fas fa-university",
      path: "/dashboard/{roleSlug}/bank/products",
    },
   
  {
    title: "All Leads",
    icon: "fas fa-file-alt",
    path: "/dashboard/{roleSlug}/partner-leads",
  },
{
      title: "Propersals",
      icon: "fas fa-folder-open",
      path: "/dashboard/{roleSlug}/cases",
      submenus: [
        { title: "Create Proposals", path: "/dashboard/{roleSlug}/proposals/create" },
        { title: "View Proposals", path: "/dashboard/{roleSlug}/proposals/view" },
        // { title: "Disbursed", path: "/dashboard/{roleSlug}/cases/disbursed" },
      ],

    },
     {
      title: "Case",
      icon: "fas fa-folder-open",
      path: "/dashboard/{roleSlug}/cases",
      submenus: [
        { title: "Create Cases", path: "/dashboard/{roleSlug}/case/create" },
        { title: "View Cases", path: "/dashboard/{roleSlug}/case/view" },
                { title: "Process Cases", path: "/dashboard/{roleSlug}/case/view/all" },

        // { title: "Disbursed", path: "/dashboard/{roleSlug}/cases/disbursed" },
      ],

    },
],
'24': [
  {
    title: "My Leads",
    icon: "fas fa-users",
    path: "/dashboard/{roleSlug}/gridAdvisorLeads",
  }
],
// Baaki purane roles ke neeche ye paste karo:
  "25": [
    {
      title: "Total Leads",
      icon: "fas fa-wallet",
      path: "/dashboard/{roleSlug}/total-leads",
    },
    {
      title: "Active Leads",
      icon: "fas fa-user-cog",
      path: "/dashboard/{roleSlug}/active-leads",
    },
    {
      title: "Recent Leads",
      icon: "fas fa-user-cog",
      path: "/dashboard/{roleSlug}/recent-leads",
    }
  ],

"26": [
  {
    title: "My Leads",
    icon : "fas fa-file-alt",
    path : "/dashboard/{roleSlug}/leads",  
  },
   {
      title: "Proposals",
      icon: "fas fa-folder-open",
      path: "/dashboard/{roleSlug}/cases",
      submenus: [
        { title: "Create Proposals", path: "/dashboard/{roleSlug}/proposals/create" },
        { title: "View Proposals", path: "/dashboard/{roleSlug}/proposals/view" },
        // { title: "Disbursed", path: "/dashboard/{roleSlug}/cases/disbursed" },
      ],

    },

       
    {
      title: "Case",
      icon: "fas fa-folder-open",
      path: "/dashboard/{roleSlug}/cases",
      submenus: [
        { title: "Create Cases", path: "/dashboard/{roleSlug}/case/create" },
        { title: "View Cases", path: "/dashboard/{roleSlug}/case/view" },
                { title: "Process Cases", path: "/dashboard/{roleSlug}/case/view/all" },

        // { title: "Disbursed", path: "/dashboard/{roleSlug}/cases/disbursed" },
      ],

    },
],
"23": [
 
  

       
    {
      title: "Case",
      icon: "fas fa-folder-open",
      path: "/dashboard/{roleSlug}/cases",
      submenus: [
        { title: "Queue Cases", path: "/dashboard/{roleSlug}/case/queue/view" },
                { title: "My Assigned Cases", path: "/dashboard/{roleSlug}/case/assigned/all" },

        // { title: "Disbursed", path: "/dashboard/{roleSlug}/cases/disbursed" },
      ],

    },
],


};


const roleSlugMap = {
  '0': 'superadmin',
  '1': 'admin',
  '2': "customer",
  '5': 'vendor-b2c',
  '6': 'vendor-b2b',
  '7': 'freelancer',
  '11': 'accountant',
  '12': 'supervisor',
  '15': "agency",        // Agency
  '16': "agent",         // Agent
  '17': "developer",
  '18': "vault-admin", //vault
  '22': "vaultagent",
  '21': "vaultpartner",
  '24': "GridAdvisor",
  '23': "vault-advisor",
  // '26': "vault-ops",
  '25': "gridReferralPartner",
  '26': "vault-advisor",
  // '23': "vault-ops",
  
   
 


};

const ROLE_MODULE_ORDER = {
  '0': ['Dashboard', "All Estimation", "Deals", 'Xoto Partners', 'Projects', 'Customers', 'Packages', 'Estimate master', 'Consultation Bookings', 'All Users', 'Products', 'Seller B2C', 'Request', 'Payout', 'Module', 'properties', 'Permission', 'Role', 'Inventory', 'Settings'],
  '1': ['Dashboard', 'Grid Admin'],
  '5': ['Dashboard', 'Products', 'My Products', 'Inventory', 'Orders', 'Payout', 'Settings'],
  '6': ['Dashboard', 'Products', 'Projects', 'Inventory', 'Payout'],
  '7': ['Dashboard', 'My Projects', 'All Projects', 'Add Projects', 'Payout'],
  '17': ['Dashboard', 'Property Management', 'Reports', 'Settings'],
  '11': ['Dashboard', 'All accountant', 'Requested Projects', 'Payout'],
  '12': ['Dashboard', 'All accountant', 'Requested Projects', 'Payout'],
  '16': ['Dashboard', 'AgentLead Management'],
  '15': ['Dashboard', 'Projects', 'Leads', 'Subscription', 'Presentations', 'Site Visits', 'Deals', 'Commission'],
  '18': ['Dashboard', 'Clients', 'Cases', 'Commission', 'Bank Library', 'Reports', 'Partners', 'Advisors', 'Mortgages'],
  '22': ['Dashboard', 'Clients', 'Referrals', 'Commission', 'Calculator', 'Leaderboard','Leads'],
  // '21': ['Dashboard', 'Vault Partners', 'All Leads'],

  '25':['Dashboard' , 'Total leads ' , 'Active Leads' , 'Recent Leads'],
  '21': ['Dashboard','Create Lead',  'Vault Partners', 'All Leads',],
  '24': ['Dashboard', 'My Leads', 'Property Catalogue', 'Calculator', 'Leaderboard'],
  '25': ['Dashboard', 'Referrals', 'Earnings', 'Profile'],
    '26': ['Dashboard', 'All Leads','Case','Proposals'],
};


const Sidebar = () => {
  const {
    sidebarCollapsed,
    mobileSidebarCollapsed,
    toggleMobileSidebar,
    setMobileSidebarCollapsed
  } = useCmsContext();

  const location = useLocation();
  const { freelancer } = useFreelancer();
  const { user, token, permissions } = useSelector((s) => s.auth);
  const [openModule, setOpenModule] = useState(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (!mobileSidebarCollapsed) {
      setMobileSidebarCollapsed(true);
    }
  }, [location.pathname, setMobileSidebarCollapsed]);

  // --- ROLE DETECTION LOGIC ---
  let roleCode = '0';
  let displayRoleName = 'User';

  if (user && user.role) {
    if (typeof user.role === 'string') {
      roleCode = user.role;
      displayRoleName = user.role;
    } else {
      roleCode = user.role.code ? user.role.code.toString() : '0';
      displayRoleName = user.role.name || 'User';
    }
  }



  const roleSlug = roleSlugMap[roleCode] ?? 'dashboard';
  const basePath = `/dashboard/${roleSlug}`;
const [partnerCategory, setPartnerCategory] = useState(null);

useEffect(() => {
  if (roleCode !== '21' || !token) return;

  const loadPartnerProfile = async () => {
    try {
      const response = await apiService.get('/profile/get-profile-data');

          console.log('FULL RESPONSE:', JSON.stringify(response, null, 2));

      const category = response?.data?.partnerCategory
        ?.toString()
        .trim()
        .toLowerCase();
      console.log('partnerCategory:', category);
      setPartnerCategory(category || null);
    } catch (error) {
      console.error('partner profile fetch failed:', error);
      setPartnerCategory(null);
    }
  };

  loadPartnerProfile();
}, [roleCode, token]);

  const isFreelancer = roleCode === '7';
  const isPendingApproval = isFreelancer && freelancer && freelancer.status_info?.status !== 1;

  const navTree = useMemo(() => {
    // Default Tree already includes "Dashboard" link
    const tree = [{ title: 'Dashboard', icon: 'fas fa-home', to: basePath, exact: true, submenus: [] }];
    if (isPendingApproval) return tree;

    const modulesMap = {};

    // 1. Dynamic Permissions from Backend
    Object.entries(permissions ?? {}).forEach(([key, p]) => {
      if (!p?.canView || !p?.route) return;
      const [module, sub] = key.split('→').map(s => s.trim());
      const fullPath = `${basePath}/${p.route.replace(/^\/+/, '')}`;
      if (!modulesMap[module]) {
        modulesMap[module] = { title: module, icon: p.icon || 'fas fa-cube', to: null, submenus: [] };
      }
      if (!sub) modulesMap[module].to = fullPath;
      else modulesMap[module].submenus.push({ title: sub, to: fullPath, icon: p.icon || 'fas fa-circle' });
    });

    // 2. Custom Links
    const customLinks = CUSTOM_ROLE_LINKS[roleCode] || [];
    customLinks.forEach(link => {
      const processedPath = link.path.replace('{roleSlug}', roleSlug);
      const processedSubmenus = link.submenus?.map(sub => ({
        ...sub,
        to: sub.path.replace('{roleSlug}', roleSlug)
      })) || [];

      modulesMap[link.title] = {
        title: link.title,
        icon: link.icon,
        to: link.submenus ? null : processedPath,
        submenus: processedSubmenus
      };
    });
if (roleCode === '21' && partnerCategory !== 'individual') {
  delete modulesMap['Create Lead'];
}

    // 3. Sorting
    const ordered = [];
    const customOrder = ROLE_MODULE_ORDER[roleCode] || [];
    customOrder.forEach(t => {
      if (modulesMap[t]) {
        ordered.push(modulesMap[t]);
        delete modulesMap[t];
      }
    });

    // ordered.push(...Object.values(modulesMap));
    // return [...tree, ...ordered];
    const HIDE_MODULES = ['Permission'];

    ordered.push(
      ...Object.values(modulesMap).filter(
        m => !HIDE_MODULES.includes(m.title)
      )
    );

    return [...tree, ...ordered.filter(
      m => !HIDE_MODULES.includes(m.title)
    )];
  },  [permissions, basePath, isPendingApproval, roleCode, user, token, roleSlug, partnerCategory]);

  // --- RENDER ---
  const toggleModule = (mod) => setOpenModule(openModule === mod ? null : mod);
  const isParentActive = (item) => item.submenus && item.submenus.some(s => location.pathname.startsWith(s.to));
  const handleNavClick = () => !mobileSidebarCollapsed && setMobileSidebarCollapsed(true);

  const mobileOpen = !mobileSidebarCollapsed;
  const sidebarClasses = `
    fixed top-0 left-0 h-full z-50 flex flex-col
    bg-gradient-to-b from-[#1a0b2e] via-[#2a1247] to-[#14051f]
    border-r border-purple-800/40 shadow-2xl
    transition-all duration-300 ease-in-out overflow-hidden
    ${mobileOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'}
    ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
  `;

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileSidebarCollapsed(true)} />
      )}

      <aside ref={sidebarRef} className={sidebarClasses}>
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        <div className={`flex items-center p-4 border-b border-purple-800/50 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex flex-col items-center gap-3 flex-1 overflow-hidden">
            <div className="flex flex-col items-center flex-shrink-0">
              <img
                src={sidebarCollapsed ? favicon : logoNew}
                alt="Logo"
                className={`transition-all duration-300 ${sidebarCollapsed ? 'h-8 w-8' : 'h-10 sm:h-12 lg:h-14 w-auto'}`}
              />
              {!sidebarCollapsed && (
                <span className="text-white text-[8px] sm:text-[10px] whitespace-nowrap mt-1">
                  Powered by AI. Inspired by you.
                </span>
              )}
            </div>

            {!sidebarCollapsed && (
              <div className="text-center">
                <div className="text-xs uppercase tracking-widest text-purple-300/80">Welcome</div>
                <div className="text-sm font-bold text-purple-200 capitalize">{displayRoleName}</div>
              </div>
            )}
          </div>

          {mobileOpen && (
            <button onClick={toggleMobileSidebar} className="p-2 text-purple-300 hover:text-white lg:hidden">
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
          {navTree.map((item) => {
            const hasSub = item.submenus && item.submenus.length > 0;
            const active = location.pathname === item.to || (hasSub && isParentActive(item));
            const expanded = openModule === item.title;

            return (
              <div key={item.title}>
                {!hasSub ? (
                  <NavLink
                    to={item.to}
                    onClick={handleNavClick}
                    title={sidebarCollapsed ? item.title : ""}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${isActive ? 'bg-purple-600/50 text-white shadow-lg' : 'text-purple-300 hover:bg-purple-800/30'}
                      ${sidebarCollapsed ? 'justify-center px-0' : ''}
                    `}
                  >
                    <i className={`${item.icon} w-5 text-center`} />
                    {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
                  </NavLink>
                ) : (
                  <div>
                    <button
                      onClick={() => toggleModule(item.title)}
                      title={sidebarCollapsed ? item.title : ""}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium
                        ${active || expanded ? 'text-white bg-purple-800/30' : 'text-purple-300 hover:bg-purple-800/20'}
                        ${sidebarCollapsed ? 'justify-center px-0' : ''}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <i className={`${item.icon} w-5 text-center`} />
                        {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
                      </div>
                      {!sidebarCollapsed && <FiChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />}
                    </button>
                    {expanded && !sidebarCollapsed && (
                      <div className="mt-1 ml-8 space-y-1 border-l border-purple-700/30 pl-4">
                        {item.submenus.map(sub => (
                          <NavLink key={sub.to} to={sub.to} onClick={handleNavClick}
                            className={({ isActive }) => `block py-2 px-3 rounded-lg text-sm ${isActive ? 'text-purple-100' : 'text-purple-300 hover:text-white'}`}
                          >
                            {sub.title}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-purple-900/40 text-center text-xs text-purple-400">
          {!sidebarCollapsed ? <span>v2.0.0</span> : <span title="Version 2.0.0">v2</span>}
        </div>
      </aside>
    </>
  );
};

export default Sidebar; 