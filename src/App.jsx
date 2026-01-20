import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect, Suspense, lazy } from "react";
// REMOVED REDUX IMPORTS
import "./App.css";

// --- CONTEXT IMPORTS ---
import { BlogProvider } from "./context/BlogContext";
import { ProductProvider } from "./context/ProductContext"; // BASE LOGIC ADDED
// -----------------------

import Navbar from "./components/navbar/index.jsx";
import Footer from "./components/footer/footer";
import FloatingIcons from "./components/FloatingIcons";
import QuoteModal from "./components/modal/QuoteModal.jsx";
import ScrollToTop from "./components/ScrollToTop.js";
import Loader from "./components/Loader.jsx";
import FreelancerNavbar from "./components/navbar/FreelancerNavbar.jsx";
import ProductFilterPage from "./components/ecommerce/ProductFilterPage.jsx";
import Freelisting from "./components/freelancers/Listing/Free-listing.jsx";
import Category from "./components/freelancers/Category.jsx";
import CreateBusiness from "./components/freelancers/Listing/CreateBusiness.jsx";
import Businesspage from "./components/freelancers/Listing/Businesspage.jsx";
import Productdetails from "./components/ecommerce/Productdetails.jsx";
import MainEcommercePage from "./components/ecommerce/Index";
import HomeB2B from "./components/ecommerce/B2B/Home";
import HomeB2C from "./components/ecommerce/B2C/Home";
import CartPage from "./components/ecommerce/CartPage";
import CmsApp from "./components/CMS/CmsApp";
import AITool from "./components/AI/Tool/AITool";
const NotFound = lazy(() => import("./components/NotFound"));
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Login from "./components/login";
import Profile from "./components/CMS/components/Profile/Profile";
import Employeedashboard from "./components/CMS/pages/Employeedashboard";
import Customerdashboard from "./components/CMS/pages/Customerdashboard";
import AdminLogin from "./components/login/AdminLogin";
import SellerPage from "./components/ecommerce/B2C/SellerPage";
import Sellerb2b from "./components/ecommerce/B2C/Sellerb2b";
import Landspackng from "./components/homepage/Landspackng";
import Ynterior from "./components/homepage/Yniterior";
import Buy from "./components/homepage/Buy";
import Ecosystem from "./components/homepage/Ecosystem";
import About from "./components/homepage/About";
import AccountantLogin from "./components/login/AccountantLogin";
import Service from "./components/homepage/Services";
import Page2 from "./components/homepage/Page2";
import Page3 from "./components/homepage/Page3";
import Page from "./components/homepage/Page";
import AIPlanner from "./components/homepage/AiPlanner/AIPlanner";
import Interior from "./components/homepage/Interior/Interior";
import Ai from "./components/AII/Ai";
import EstimateCalculator from "./components/modal/EstimateCalculator";
import Calculator from "./components/homepage/AiPlanner/Calculator";
import OtherLogin from "./components/login/OtherLogin";
import InteriorPlanner from "./components/homepage/AiPlanner/InteriorPlanner";
import InteriorCalculator from "./components/homepage/AiPlanner/InteriorCalculator";
import MainCalculatorPage from "./components/homepage/AiPlanner/MainCalculatorPage";
import CustomerLogin from "./components/login/CustomerLogin";
import AIPlannerDemoPage from "./components/homepage/AiPlanner/AIPlannerDemoPage";
import LocationCategoryModal from "./components/modal/LocationCategoryModal";
import AITools from "./components/homepage/AiPlanner/AITools";
import ComingSoon from "./components/homepage/AiPlanner/ComingSoon";
import Casestudy from "./components/homepage/Casestudy"
import Training from "./components/homepage/Trainning";
import RegisterNowPage from "./components/RegisterNowPage";
import Mortgage from "./components/homepage/Mortgage"
import MortgagesProduct from "./components/homepage/MortgagesProduct";
import UploadDocuments from "./components/homepage/UploadDocuments";
import ProductRequirementsEdit from "./components/homepage/ProductRequirementsEdit";
import MyApplications from "./components/homepage/MyApplications";

import DeveloperDashboard from "./components/ecommerce/B2C/developerdashboard";
import DeveloperPropertyManagement from "./components/ecommerce/B2C/developerpropertymanagement";
import DeveloperRegistration from "./components/ecommerce/B2C/developerregistration";
import DeveloperSidebar from "./components/ecommerce/B2C/developersidebar";
import RegistrationAgency from "./components/ecommerce/B2C/registrationagency";

// Lazy-loaded components
const Home = lazy(() => import("./components/homepage/Home"));
const Consult = lazy(() => import("./components/consultation/Consult"));
const Designs = lazy(() => import("./components/AI/Designs"));
const Quotation = lazy(() => import("./components/quotation/Quotation"));
const Social = lazy(() => import("./components/social/Index"));
const Howitworks = lazy(() => import("./components/How-it-works/Index"));
const Completeproductview = lazy(() => import("./components/Completeproductview"));
const Designers = lazy(() => import("./components/Designers/Designers"));
const Freelancers = lazy(() => import("./components/freelancers/index"));
const Browsecategory = lazy(() => import("./components/freelancers/Browsecategory"));
const Mainfreelancers = lazy(() => import("./components/freelancers/Mainfreelancers"));
const FreelancerProfile = lazy(() => import("./components/freelancers/FreelancerProfile"));
const LivingRoom = lazy(() => import("./components/Interiorsection/livingroom/Index"));
const Bathroom = lazy(() => import("./components/Interiorsection/bathroom/Index"));
const Kitchen = lazy(() => import("./components/Interiorsection/kitchen/Index"));
const Studyroom = lazy(() => import("./components/Interiorsection/Studyroom/Index"));
const Wardrobe = lazy(() => import("./components/Interiorsection/wardrobe/Index"));
const Bedroom = lazy(() => import("./components/Interiorsection/bedroom/Index"));
const Registration = lazy(() => import("./components/freelancers/Registeration"));
const Magazine = lazy(() => import("./components/magazines/Index"));

function PrivateRoute({ children, allowedRoles }) {
  const user = { role: { code: "1" } };
  const loading = false;
  const location = useLocation();

  if (loading) return <Loader />;
  if (!user || !user.role?.code)
    return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && !allowedRoles.includes(user.role.code))
    return <Navigate to="/" replace />;
  return children;
}

function LayoutWrapper({ children }) {
  const location = useLocation();
  const hideNavbarPaths = [
    "/login", "/quotation", "/freelancer/browse-category", "/freelancer/category",
    "/freelancer/free-listing", "/ecommerce", "/freelancer/create-business",
    "/designs/Tool", "/dashboard", "/customer/dashboard", "/admin/login",
    "/user/login", "/other/login", "/aiPlanner", "/aiPlanner/interior",
    "/aiPlanner/landscape", "/estimate/calculator", "/estimate/calculator/interior",
    "/accountant/login", "/ecommerce/seller", "/ecommerce/cart",
  ];

  const hideNavbar = hideNavbarPaths.includes(location.pathname) || location.pathname.startsWith("/dashboard/");
  const showFreelancerNavbar =
    location.pathname === "/freelancer/browse-category" ||
    location.pathname === "/freelancer/free-listing" ||
    location.pathname === "/freelancer/category" ||
    location.pathname === "/freelancer/create-business";

  const showEcommerceNavbar =
    location.pathname === "/ecommerce" ||
    location.pathname === "/ecommerce/cart";

  const hideFooterPaths = [
    "/login", "/quotation", "/designs/Tool", "/dashboard", "/customer/dashboard",
    "/profile", "/admin/login", "/user/login", "/other/login", "/aiPlanner",
    "/aiPlanner/interior", "/aiPlanner/landscape", "/estimate/calculator",
    "/estimate/calculator/interior", "/accountant/login", "/ecommerce/seller",
    "/freelancer/registration",
  ];

  const hideFooter =
    hideFooterPaths.includes(location.pathname) ||
    location.pathname.startsWith("/dashboard/") ||
    location.pathname.startsWith("/profile/");

  return (
    <div className="min-h-screen relative">
      {!hideNavbar && <Navbar />}
      {showFreelancerNavbar && <FreelancerNavbar />}
      {children}
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BlogProvider>
      <ProductProvider>
        <LayoutWrapper>
          <ScrollToTop />
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/" element={<Home />} />
              <Route path="/landscaping" element={<Landspackng />} />
              <Route path="/aiPlanner" element={<AITools />} />
              <Route path="/aiPlanner/demo" element={<AIPlannerDemoPage />} />
              <Route path="/mortgages" element={<Mortgage />} />
              <Route path="/mortgages-product" element={<MortgagesProduct />} />
              <Route path="/mortgages-product-upload-document" element={<UploadDocuments />} />
              <Route path="/product-requirements-edit" element={<ProductRequirementsEdit />} />
              <Route path="/my-applications" element={<MyApplications />} />
              <Route path="/aiPlanner/interior" element={<ComingSoon />} />
              <Route path="/aiPlanner/landscape" element={<AIPlanner />} />
              <Route path="/register" element={<RegisterNowPage />} />
              <Route path="/aiPlanner/exterior" element={<ComingSoon />} />
              <Route path="/aiPlanner/furniture" element={<ComingSoon />} />
              <Route path="/aiPlanner/image" element={<ComingSoon />} />
              <Route path="/aiPlanner/virtual" element={<ComingSoon />} />
              <Route path="/estimate/calculator" element={<Calculator />} />
              <Route path="/estimate/calculator/interior" element={<InteriorCalculator />} />
              <Route path="/services/interior" element={<Ynterior />} />
              <Route path="/schedule/estimate" element={<MainCalculatorPage />} />
              <Route path="/marketplace" element={<Buy />} />
              <Route path="/ecosystem" element={<Ecosystem />} />
              <Route path="/about" element={<About />} />
              <Route path="/aiInterior" element={<Interior />} />
              <Route path="/other/login" element={<OtherLogin />} />
              <Route path="/case-studies" element={<Casestudy />} />
              <Route path="/training" element={<Training />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/user/login" element={<CustomerLogin />} />
              <Route path="/accountant/login" element={<AccountantLogin />} />
              <Route path="/consultation" element={<Consult />} />
              <Route path="/designs" element={<Designs />} />
              <Route
                path="/designs/Tool"
                element={
                  <DndProvider backend={HTML5Backend}>
                    <AITool />
                  </DndProvider>
                }
              />
              <Route path="/ai" element={<Ai />} />
              <Route path="/mortgage/services" element={<Service />} />
              <Route path="/properties" element={<Page2 />} />
              <Route path="/explore" element={<Page3 />} />
              <Route path="/contact" element={<Page />} />
              <Route path="/quotation" element={<Quotation />} />
           <Route path="/ecommerce" element={<MainEcommercePage />} />
<Route path="/ecommerce/b2c" element={<HomeB2C />} />

{/* ✅ Developer Routes */}
<Route path="/developer/dashboard" element={<DeveloperDashboard />} />
<Route
  path="/developer/property-management"
  element={<DeveloperPropertyManagement />}
/>
<Route path="/developer/registration" element={<DeveloperRegistration />} />
<Route path="/developer/sidebar" element={<DeveloperSidebar />} />

{/* ✅ Agency Route */}
<Route path="/agency/registration" element={<RegistrationAgency />} />

<Route path="/ecommerce/seller" element={<SellerPage />} />
<Route path="/ecommerce/seller/b2b" element={<Sellerb2b />} />
<Route path="/ecommerce/b2b" element={<HomeB2B />} />
              <Route path="/ecommerce/cart" element={<CartPage />} />
              <Route path="/ecommerce/filter" element={<ProductFilterPage />} />
              <Route path="/ecommerce/product/:id" element={<Productdetails />} />
              <Route path="/social" element={<Social />} />
              <Route path="/how-it-works" element={<Howitworks />} />
              <Route path="/project-view" element={<Completeproductview />} />
              <Route path="/designers" element={<Designers />} />
              <Route path="/freelancer" element={<Freelancers />} />
              <Route path="/freelancer/browse-subcategory/:id" element={<Browsecategory />} />
              <Route path="/services/landscaping/:id" element={<Category />} />
              <Route path="/freelancer/home" element={<Mainfreelancers />} />
              <Route path="/freelancer/profile" element={<FreelancerProfile />} />
              <Route path="/freelancer/free-listing" element={<Freelisting />} />
              <Route path="/freelancer/create-business" element={<CreateBusiness />} />
              <Route path="/freelancer/business" element={<Businesspage />} />
              <Route path="/freelancer/registration" element={<Registration />} />
              <Route path="/interior/living-room" element={<LivingRoom />} />
              <Route path="/interior/bathroom" element={<Bathroom />} />
              <Route path="/interior/bedroom" element={<Bedroom />} />
              <Route path="/interior/modular-kitchen" element={<Kitchen />} />
              <Route path="/interior/study-room" element={<Studyroom />} />
              <Route path="/interior/wardrobe" element={<Wardrobe />} />
              <Route path="/magazines" element={<Magazine />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/customer/dashboard" element={<Customerdashboard />} />
              <Route
                path="/dashboard/:roleSlug/*"
                element={
                  <PrivateRoute allowedRoles={["0", "1", "2", "3", "6", "5", "8", "7", "11", "12"]}>
                    <CmsApp />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </LayoutWrapper>
      </ProductProvider>
    </BlogProvider>
  );
}

export default App;