import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

// PAGES
import Dashboard from "./pages/Dashboard";
import VendorDashboard from "./pages/VendorDashboard";
import Freelancerdashboard from "./pages/Freelancerdashboard";
import Modules from "./pages/modules/Modules";
import Permission from "./pages/permission/Permission";
import Role from "./pages/role/Role";
import VendorB2C from "./pages/dashboardPages/managevendor/VendorB2C";
import VendorB2CProfile from "./pages/dashboardPages/managevendor/VendorB2CProfile";
import ProductRequestB2C from "./pages/dashboardPages/manageProducts/ProductRequestB2C";
import CategoryFreelancers from "./pages/dashboardPages/managefreelancer/freelancer/categoryandsubcategory/CategoryFreelancers";
import Freelancers from "./pages/dashboardPages/managefreelancer/freelancer/Freelancers";
import FreelancerProfile from "./pages/dashboardPages/managefreelancer/freelancer/FreelancerProfile";
import MyprofileFreelancer from "./pages/dashboardPages/managefreelancer/freelancer/MyprofileFreelancer";
import UpdateFreelncerProfile from "./pages/dashboardPages/managefreelancer/freelancer/UpdateFreelancerProfile";
import Projects from "./pages/dashboardPages/managefreelancer/freelancer/Projects/Projects";
import ViewwProject from "./pages/dashboardPages/ViewLibrary";
import MyProjects from "./pages/dashboardPages/managefreelancer/freelancer/Projects/MyProjects";
import Accountant from "./pages/dashboardPages/manageaccountant/Accountant";
import AccountantDashboard from "./pages/AccountantDashboard";
import ManageProjects from "./pages/dashboardPages/manageaccountant/ManageProjects";
import AddProjects from "./pages/dashboardPages/managefreelancer/freelancer/Projects/AddProjects";
import AddCategory from "../ecommerce/B2C/products/AddCategory";
import AddMaterial from "../ecommerce/B2C/products/AddMaterial";
import AddBrand from "../ecommerce/B2C/products/AddBrand";
import AllVendorProductB2C from "./pages/dashboardPages/manageProducts/AllVendorProductB2C";
import VendorProducts from "../ecommerce/B2C/products/VendorProducts";
import AddProducts from "../ecommerce/B2C/products/AddProducts";
import Currency from "./pages/settings/Currency";
import Tax from "./pages/settings/Tax";
import ProductReview from "./pages/dashboardPages/manageProducts/ProductReview";
import ProductProfile from "../ecommerce/B2C/products/ProductProfile";
import VendorProfile from "./pages/dashboardPages/managevendor/VendorProfile";
import UsersRoleList from "./pages/dashboardPages/users/UsersRoleList";
import LeadsList from "./pages/dashboardPages/leads/LeadsList";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import AssignedLeadsList from "./pages/dashboardPages/leads/AssignedLeadsList";
import QuatationLeadsList from "./pages/dashboardPages/leads/QuatationLeadsList";
import Myestimates from "./pages/dashboardPages/leads/Myestimates";
import Leads from "./pages/dashboardPages/leads/Leads";
import Customerdashboard from "./pages/Customerdashboard";
import MyProfileB2C from "./pages/dashboardPages/managevendor/vendorprofile/Vendorb2c-Myprofile";
import MyProfileb2b from "./pages/dashboardPages/managevendor/vendorprofile/Vendorb2b-MyProfile";
import MyProfile from "./pages/dashboardPages/Profiles/FreelancerProfile";
import UpdateFreelancerProfile from "./pages/dashboardPages/managefreelancer/freelancer/UpdateFreelancerProfile";
import Bookings from "./pages/dashboardPages/consult/Bookings";
import Packages from "./pages/packages/Packages";
import MasterCategory from "./pages/estimateMaster/MasterCategory";
import Enquiry from "./pages/dashboardPages/consult/Enquiry";
import PropertyLeads from "./pages/dashboardPages/consult/PropertyLeads";
import Meta from "./pages/dashboardPages/consult/MetaLeads";

import UpdateProfilePage from "./pages/dashboardPages/updates/UpdateProfilepage";
import Inventory from "../ecommerce/B2C/products/Inventory";
import ManageWarehouses from "../ecommerce/setting/ManageWareHouses";
import AddAttributes from "../ecommerce/B2C/products/AddAttributes";
import AddTags from "../ecommerce/B2C/products/AddTags";
import UpdateProduct from "../ecommerce/B2C/products/UpdateProduct";
import ViewProject from "./pages/dashboardPages/managefreelancer/freelancer/Projects/ViewProjects";
import TypesGallery from "./pages/estimateMaster/TypesGallery";
import Questions from "./pages/estimateMaster/Questions";
import CreateDeveloper from "./pages/Properties/createDeveloper";
import Propertymanagement from "./pages/Properties/Propertymanagement";
import Blog from "./pages/Blog/CreateBlog";
import SubmittedQuotation from "./pages/dashboardPages/leads/quotation/SubmittedQuotation";
import ApprovedQuotation from "./pages/dashboardPages/leads/quotation/ApprovedQuotation";
import ReceivedQuotation from "./pages/dashboardPages/leads/quotation/Customer/ReceivedQuotation";
import CustomerSubmittedQuotation from "./pages/dashboardPages/leads/quotation/Customer/CustomerSubmittedQuotation";
import EmailSetting from "./pages/settings/EmailSetting";
import Notifications from "./pages/dashboardPages/notification/Notifications";
import ManageProjectsSupervisor from "./pages/dashboardPages/managefreelancer/freelancer/Projects/ManageProjectsSupervisor";
import ManageProjectFreelancer from "./pages/dashboardPages/managefreelancer/freelancer/Projects/ManageProjectFreelancer";
import CustomerProjects from "./pages/dashboardPages/managefreelancer/freelancer/Projects/CustomerProjects";
import CustomerBillsview from "./pages/dashboardPages/Bills/CustomerBillsview";
import CustomerInvoicesview from "./pages/dashboardPages/Bills/CustomerInvoicesview";
import Profile from "./pages/dashboardPages/Profiles/Profile";
import AgentList from "./pages/Properties/AgentList";
import AgencyList from "./pages/Properties/AgencyList";
import DeveloperDashboard from "../ecommerce/B2C/DeveloperDashboard";
import AgentDashboard from "../ecommerce/B2C/AgentDashboard";
import AgentLayout from "../ecommerce/B2C/AgentLayout";
import Addleaddetails from "../ecommerce/B2C/AgentLeadDetails"
import AgentLeadDashboard from "../ecommerce/B2C/AgentLeadCreated";   
import AgentSubscription from "../ecommerce/B2C/AgentSubscription";
import AgentProjects from "../ecommerce/B2C/AgentProjects";
import AgentProjectDetails from "../ecommerce/B2C/AgentProjectDetails";
import AgentPresentations from "../ecommerce/B2C/AgentPresentations";
import AgentSiteVisits from "../ecommerce/B2C/AgentSiteVisits";
import AgentDeals from "../ecommerce/B2C/AgentDeals";
import AgentCommission from "../ecommerce/B2C/AgentCommission";
// import AgentLeadDetails from "../ecommerce/B2C/AgentLeadDetails";
import AgentCreateDeal from "../ecommerce/B2C/AgentCreateDeal";
import AgentDealDetails from "../ecommerce/B2C/AgentDealDetails";
import AgentSiteVisitDetails from "../ecommerce/B2C/AgentSiteVisitDetails";
import AgentCommissionDetails from "../ecommerce/B2C/AgentCommissionDetails";
import AgentCreateVisit from "../ecommerce/B2C/AgentCreateVisit";
import DeveloperProjects from "../ecommerce/B2C/DeveloperProjects";
import DeveloperInventory from "../ecommerce/B2C/DeveloperInventory";
import DeveloperLeads from "../ecommerce/B2C/DeveloperLeads";
import DeveloperRevenue from "../ecommerce/B2C/DeveloperRevenue";
import DeveloperProjectDetails from "../ecommerce/B2C/DeveloperProjectDetails";
import DeveloperAddProject from "../ecommerce/B2C/DeveloperAddProject";
import DeveloperAddUnit from "../ecommerce/B2C/DeveloperAddUnit";
import DeveloperUnitDetails from "../ecommerce/B2C/DeveloperUnitDetails";
import DeveloperEditUnit from "../ecommerce/B2C/DeveloperEditUnit";
import DeveloperLeadDetails from "../ecommerce/B2C/DeveloperLeadDetails";
import DeveloperCreateBooking from "../ecommerce/B2C/DeveloperCreateBooking";
import DeveloperBookings from "../ecommerce/B2C/DeveloperBookings";
import DeveloperBookingDetails from "../ecommerce/B2C/DeveloperBookingDetails";
import DeveloperList from "./pages/DeveloperList";
import DeveloperAnalytics from "../ecommerce/B2C/DeveloperAnalytics";
import DeveloperCommissionScheme from "../ecommerce/B2C/DeveloperCommisionScheme"; 
import DealCommissionManager from "./pages/DealCommissionManager";
import BankProductManagement from "../homepage/BankProductManagement";

import AgencyManageAgents from "../ecommerce/B2C/AgencyManageAgents";
import AgencyPerformance from "../ecommerce/B2C/AgencyPerformance";
import AgencyAgentDetails from "../ecommerce/B2C/AgencyAgentDetails";
import AgencyCommission from "../ecommerce/B2C/AgencyCommission";
import AgencyLeadManagement from "../ecommerce/B2C/AgencyLeadManagement";
// import AgencyTargets from "../ecommerce/B2C/AgencyTargets";
// import AgencyLeaderboard from "../ecommerce/B2C/AgencyLeaderboard"; 
// import AgencyIncentives from "../ecommerce/B2C/AgencyIncentives";
// import AgencyBranches from "../ecommerce/B2C/AgencyBranches";
// import AgencyRoles from "../ecommerce/B2C/AgencyRoles";
// import AgencyAdvancedAnalytics from "../ecommerce/B2C/AgencyAdvancedAnalytics";
// import AgencyProfitEngine from "../ecommerce/B2C/AgencyProfitEngine";
import AgencySubscription from "../ecommerce/B2C/AgencySubscription";
import AgencyProjects from "../ecommerce/B2C/AgencyProjects";
import AgencyDeals from "../ecommerce/B2C/AgencyDeals";
// import AgencyAssignProjects from "../ecommerce/B2C/AgencyAssignProjects";

// import RegistrationAgency from "./pages/Properties/RegistrationAgency";
// import AddBrand from "../ecommerce/B2C/products/AddBrand"
import AdminDashboard from "./pages/AdminDashboard";
import AdminPropertyGrid from "./pages/AdminPropertyGrid";
import LeadManagement from "./pages/LeadManagement";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import VerificationQueue from "./pages/VerificationQueue";
import AgencyDashboard from "../ecommerce/B2C/AgencyDashboard";
import XobiaTrainingAdmin from "./pages/XobiaTrainingAdmin";
import GlobalSettings from "./pages/GlobalSettings";
import XotoBlitzCampaigns from "./pages/XotoBlitzCampaigns";
const roleSlugMap = {
  0: "superadmin",
  1: "admin",
    2: "customer",
  5: "vendor-b2c",
  6: "vendor-b2b",
  7: "freelancer",
  11: "accountant",
    12: "supervisor",
     15: "agency",        // Agency
  16: "agent",         // Agent
  17: "developer",

};

const dashboardMap = {
  0: <Dashboard />,
  1: <AdminDashboard />,
  2:<Customerdashboard/>,
  5: <VendorDashboard />,
  6: <VendorDashboard />,
  7: <Freelancerdashboard />,
  11: <AccountantDashboard />,
    12: <SupervisorDashboard />,
    16:<AgentDashboard/>,
    17:<DeveloperDashboard/>,
    15:<AgencyDashboard/>


};

const componentMap = {
  "products/list": <ProductRequestB2C />,
  "modules/list": <Modules />,
  permission: <Permission />,
  roles: <Role />,
  "seller/list": <VendorB2C />,
  "freelancer/category": <CategoryFreelancers />,
  "freelancer/list": <Freelancers />,
  "request/projects": <ManageProjects />,
  "sellers/list": <VendorB2C />,
  projects: <Projects />,
  myProjects: <MyProjects />,
  accountant: <Accountant />,
    users: <UsersRoleList />,

  addProjects: <AddProjects />,
  categories: <AddCategory />,
  material: <AddMaterial />,
  currency: <Currency />,
  tax: <Tax />,
  brands: <AddBrand />,
  "products/my": <VendorProducts />,
  "products/add": <AddProducts />,
  "leads/requested":<LeadsList/>,
  "leads/assigned":<AssignedLeadsList/>,
    "request/quatation":<QuatationLeadsList/>,
  "estimates/my":<Myestimates/>,
  "estimate/master/categories":<MasterCategory/>,
    "master/types/gallery":<TypesGallery/>,
    "estimate/questions":<Questions/>,
  deals: <Leads />,
bookings:<Bookings/>,
warehouse:<ManageWarehouses/>,

  "property/leads":<PropertyLeads/>,
"meta/leads":<Meta/>,
enquiries:<Enquiry/>,
packages:<Packages/>,
"developer/create":<CreateDeveloper/>,
"developer/property":<Propertymanagement/>
,"create":<Blog/>,
"products/brands":<AddBrand/>,
"create-mortgages":<BankProductManagement />
};


// Placeholder for missing components
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-full p-10 text-center text-gray-400">
    <div>
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p>No component is assigned for this module yet.</p>
    </div>
  </div>
);

const CmsRoutes = () => {
  const { user, permissions } = useSelector((s) => s.auth);
  const location = useLocation();

  if (!user?.role?.code) {
    return <div className="p-8 text-center">Loading user...</div>;
  }

  const roleSlug = roleSlugMap[user.role.code] ?? "dashboard";
  const base = `/dashboard/${roleSlug}`; // REMOVED /sawtar


  // Redirect root dashboard to role-specific
  if (
    // location.pathname === "/dashboard" ||
    location.pathname === "/dashboard/"
  ) {
    return <Navigate to={base} replace />;
  }

  return (
    <Routes>
      {/* Dashboard */}
      <Route path="/" element={dashboardMap[user.role.code] ?? <Dashboard />} />

      {/* Dynamic Routes from Permissions */}
      {Object.entries(permissions ?? {}).map(([key, p]) => {
        if (!p?.canView || !p?.route) return null;

        const clean = p.route.replace(/^\/+/, "");
        const Component = componentMap[clean];

        const [moduleName] = key.split("→").map((s) => s.trim());

        return (
          <Route
            key={clean}
            path={clean}
            element={Component ?? <Placeholder title={moduleName} />}
          />
        );
      })}

      {/* Static Routes */}
      <Route
        path="seller/:id/product-request"
        element={
          permissions?.["Vendor B2C→All Vendors"]?.canView ? (
            <ProductRequestB2C />
          ) : (
            <Navigate to="/seller/list" replace />
          )
        }
      />
      <Route path="quotation/submitted" element={<SubmittedQuotation />} />
      <Route path="quotation/approved" element={<ApprovedQuotation />} />
      <Route path="projects/manage" element={<ManageProjectsSupervisor />} />
      <Route path="projects/manage/:projectId" element={<ManageProjectFreelancer />} />
      <Route path="projects/ongoing" element={<CustomerProjects />} />
        <Route path="ViewLibrary" element={<ViewwProject />} />
      <Route path="myprofile" element={<Profile />} />
            <Route path="products" element={<ProductReview />} />
      <Route path="attributes/add" element={<AddAttributes />} />
      <Route path="tags/add" element={<AddTags />} />
 {/* <Route path="/create" element={<Blog />} /> */}
      <Route path="products/view" element={<ProductProfile />} />
             <Route path="products/edit/:id" element={<UpdateProduct />} />
             <Route path="products/edit/:id" element={<UpdateProduct />} />

       <Route path="product/inventory/:id" element={<Inventory />} />
       
      <Route path="seller/:id" element={<VendorB2CProfile />} />

            {/* <Route path="projects/:id" element={<ViewProject/>} /> */}
            <Route path="quotation/received" element={<ReceivedQuotation />} />
            <Route path="estimate/submitted" element={<CustomerSubmittedQuotation />} />
            <Route path="quotation/response" element={<Myestimates />} />
            <Route path="setting/email" element={<EmailSetting />} />
            <Route path="projects/milestone/bills" element={<CustomerBillsview />} />
            <Route path="projects/invoices" element={<CustomerInvoicesview />} />

            <Route path="seller/product/:id" element={<ProductRequestB2C />} />
<Route path="freelancer/view" element={<FreelancerProfile />} />
<Route path="notifications/view" element={<Notifications />} />
      <Route path="freelancer/myprofile" element={<MyprofileFreelancer />} />
      <Route path="/update" element={<UpdateProfilePage />} />
{/* Agents */}
{/* <Route index element={<AgentDashboard />} /> */}

  {/* Leads */}
  <Route path="agent-leads" element={<AgentLeadDashboard />} />
  <Route path="agent-lead/:id" element={<Addleaddetails/>} />
  {/* <Route path="/dashboard/agent/lead/adds" element={<Addleaddetails />} /> */}
        
  {/* Projects */}
  <Route path="projects" element={<AgentProjects />} />
  <Route 
     path="projects/:id" 
     element={(user?.role?.code == 16 || user?.role?.code == 1) ? <AgentProjectDetails /> : <ViewProject />} 
  />

  {/* Deals */}
  <Route path="deals" element={<AgentDeals />} />
  <Route path="deals/create" element={<AgentCreateDeal />} />
  <Route path="deals/:id" element={<AgentDealDetails />} />

  {/* Site Visits */}
  <Route path="visits" element={<AgentSiteVisits />} />
  <Route path="visits/create" element={<AgentCreateVisit />} />
  <Route path="site-visits/:id" element={<AgentSiteVisitDetails />} />

  {/* Commission */}
  <Route path="commission" element={<AgentCommission />} />
  <Route path="commission/:id" element={<AgentCommissionDetails />} />

  {/* Subscription */}
  <Route path="subscription" element={<AgentSubscription />} />

  {/* Presentations */}
  <Route path="presentations" element={<AgentPresentations />} />



      {/* admin */}
      <Route path="/agent-list" element={<AgentList />} />
      <Route path="/agency-list" element={<AgencyList />} />    
      {/* <Route path="/agent-registration" element={<AgentRegistration />} /> */}
      <Route path="/developer-list" element={<DeveloperList />} />
      <Route path="/property-list" element={<AdminPropertyGrid />} />
      <Route path="/DealCommissionManager" element={<DealCommissionManager />} />
      <Route path="/lead-management" element={<LeadManagement />} />
      <Route path="/subscription-plans" element={<SubscriptionPlans />} />
      <Route path="/verification-queue" element={<VerificationQueue />} />
      <Route path="/ai-training" element={<XobiaTrainingAdmin />} />
      <Route path="/global-settings" element={<GlobalSettings />} />
      <Route path="/marketing-hub" element={<XotoBlitzCampaigns />} />
      
{/* Agency */}
<Route path="manage-agents" element={<AgencyManageAgents />} />
<Route path="manage-agents/:id" element={<AgencyAgentDetails />} />
<Route path="performance" element={<AgencyPerformance />} />
<Route path="commission" element={<AgencyCommission />} />
<Route path="lead-management" element={<AgencyLeadManagement />} />
{/* <Route path="targets" element={<AgencyTargets />} /> */}
{/* <Route path="leaderboard" element={<AgencyLeaderboard />} /> */}
{/* <Route path="incentives" element={<AgencyIncentives />} /> */}
{/* <Route path="branches" element={<AgencyBranches />} /> */}
{/* <Route path="internal-roles" element={<AgencyRoles />} /> */}
{/* <Route path="advanced-analytics" element={<AgencyAdvancedAnalytics />} /> */}
{/* <Route path="profit-engine" element={<AgencyProfitEngine />} /> */}
<Route path="subscription" element={<AgencySubscription />} />
<Route path="/agency/projects" element={<AgencyProjects />} />
<Route path="/agency/deals" element={<AgencyDeals />} />
{/* <Route path="assign-projects" element={<AgencyAssignProjects />} /> */}
{/* Developer */}
<Route path="developer-projects" element={<DeveloperProjects/>}/>
<Route path="developer-projects/add" element={<DeveloperAddProject/>}/>
<Route path="developer-projects/:id" element={<DeveloperProjectDetails/>}/>
<Route path="inventory" element={<DeveloperInventory/>}/>
<Route path="/inventory/add" element={<DeveloperAddUnit/>}/>
<Route path="/inventory/:id" element={<DeveloperUnitDetails/>}/>
<Route path="/inventory/:id/edit" element={<DeveloperEditUnit/>}/>
<Route path="developer-leads" element={<DeveloperLeads />} />
<Route path="developer-leads/:id" element={<DeveloperLeadDetails />} />
<Route path="/leads/:id/booking" element={<DeveloperCreateBooking/>}/>
<Route path="/bookings" element={<DeveloperBookings/>}/>
<Route path="/bookings/:id" element={<DeveloperBookingDetails/>}/>
<Route path="revenue" element={<DeveloperRevenue/>}/>
<Route path="analytics" element={<DeveloperAnalytics/>}/>
  <Route path="commission-scheme" element={<DeveloperCommissionScheme/>}/>
  {/* <Route path="notifications" element={<DeveloperNotifications/>}/> */}
  {/* <Route path="team" element={<DeveloperTeam/>}/> */}

      {/* Catch-all fallback */}
    </Routes>
  );
};

export default CmsRoutes;