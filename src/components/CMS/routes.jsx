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
import MyProfile from "./pages/dashboardPages/Profiles/MyProfile";
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
// import AddBrand from "../ecommerce/B2C/products/AddBrand"
const roleSlugMap = {
  0: "superadmin",
  1: "admin",
    2: "customer",
  5: "vendor-b2c",
  6: "vendor-b2b",
  7: "freelancer",
  11: "accountant",
    12: "supervisor",

};

const dashboardMap = {
  0: <Dashboard />,
  1: <Dashboard />,
  2:<Customerdashboard/>,
  5: <VendorDashboard />,
  6: <VendorDashboard />,
  7: <Freelancerdashboard />,
  11: <AccountantDashboard />,
    12: <SupervisorDashboard />,

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
"products/brands":<AddBrand/>
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

      <Route path="myprofile" element={<MyProfile />} />
            <Route path="products" element={<ProductReview />} />
      <Route path="attributes/add" element={<AddAttributes />} />
      <Route path="tags/add" element={<AddTags />} />
 {/* <Route path="/create" element={<Blog />} /> */}
      <Route path="products/view" element={<ProductProfile />} />
             <Route path="products/edit/:id" element={<UpdateProduct />} />

       <Route path="product/inventory/:id" element={<Inventory />} />
      <Route path="seller/:id" element={<VendorB2CProfile />} />
            <Route path="projects/:id" element={<ViewProject/>} />

            <Route path="seller/product/:id" element={<ProductRequestB2C />} />
<Route path="freelancer" element={<FreelancerProfile />} />

      <Route path="freelancer/myprofile" element={<MyprofileFreelancer />} />
      <Route path="/update" element={<UpdateProfilePage />} />


      {/* Catch-all fallback */}
    </Routes>
  );
};

export default CmsRoutes;