import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect, Suspense, lazy } from "react";
// REMOVED REDUX IMPORTS
import "./App.css";

// --- CONTEXT IMPORTS ---
import { BlogProvider } from "./context/BlogContext";
import { ProductProvider } from "./context/ProductContext"; // BASE LOGIC ADDED
// -----------------------
import { FreelancerProvider } from "./context/FreelancerContext";
import { useSelector } from "react-redux";
import { AuthProvider } from "./context/ProfileContext";
// ... (All your imports remain the same) ...
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
import CartPage from "./components/ecommerce/B2C/products/CartPage.jsx";
import CmsApp from "./components/CMS/CmsApp";
import AITool from "./components/AI/Tool/AITool";
import PrivacyPolicy from "./components/homepage/PrivacyPolicy";
const NotFound = lazy(() => import("./components/NotFound"));
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import VaultPartner from "./components/CMS/pages/VaultPartnerDashboard";
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
import ImageEnhancer from "./components/homepage/AiPlanner/ImageEnhancer";
import SkyReplacement from "./components/homepage/AiPlanner/SkyReplacement";
import VirtualStaging from "./components/homepage/AiPlanner/Virtualstaggig";
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
import { CmsProvider } from "./components/CMS/contexts/CmsContext";
import DeveloperPropertyManagement from "./components/ecommerce/B2C/DeveloperPropertyManagement";
import DeveloperRegistration from "./components/ecommerce/B2C/DeveloperRegistration";
// import DeveloperSidebar from "./components/ecommerce/B2C/DeveloperSidebar";
import RegistrationAgency from "./components/ecommerce/B2C/RegistrationAgency";
import Checker from "./Checker";
import AgentRegistration from "./components/ecommerce/B2C/AgentRegistration";
import VaultRegister from "./components/ecommerce/B2C/VaultRegister";
import AgentLayout from "./components/ecommerce/B2C/AgentLayout";
import AgentDashboard from "./components/ecommerce/B2C/AgentDashboard";
import AgentList from "./components/CMS/pages/Properties/AgentList";
import AgencyDashboard from "./components/ecommerce/B2C/AgencyDashboard";
import AgencyLayout from "./components/ecommerce/B2C/AgencyLayout";
import Upcoming from "./components/footer/Upcoming";
import Finicial from "./components/footer/Finicial";
import XobiaChatbot from "./components/homepage/XobiaChatbot";
import WaitingApproval from "./components/ecommerce/B2C/WaitingApproval";
import ForgotPassword from "./components/CMS/pages/forgot-password";
import ResetPassword from "./components/CMS/pages/reset-password";
import CheckoutPage from "./components/ecommerce/B2C/products/CheckoutPage";
import PaymentSuccess from "./components/ecommerce/B2C/products/PaymentSuccess";
// import PropertyRent from "./component/Rent/SearchSection";
// import PropertyListings from "./component/Rent/Propertylistings";
import HeroRent from "./component/Rent/HeroRent";
import ResultsPage from "./component/Rent/ResultsPage";
import HeroBuy from "./component/Buy/Herobuy";
import BuyResultsPage from "./component/Buy/Buyresultspage";
import MortgageCalculator from "./components/homepage/MortgageCalculator";
import ProposalLink from "./components/ecommerce/vault/proposal/ProposalLink";
import PopupManager from "./components/homepage/PopupManager";

import AdvisorLogin from "./components/Grid/AdvisorGrid/AdvisorLogin";


import EmployeeLogin from "./components/ecommerce/vault/EmployeeLogin";
import ReferralPartnerLogin from "./components/GridReferralPartner/ReferralPartnerLogin";
import ReferralPartnerRegister from "./components/GridReferralPartner/ReferralPartnerRegister";
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
  // ... (Code remains the same)
  const { user, token, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) return <Loader />;

  if (!user || !token || !user.role?.code) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user.role.code.toString();
  const userRoleName = user.role.name?.toLowerCase();
  if (allowedRoles && !allowedRoles.includes(userRole) && !allowedRoles.includes(userRoleName)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function LayoutWrapper({ children }) {
  // ... (Code remains the same)
  const location = useLocation();
  const { user, token } = useSelector((state) => state.auth);
  const hideNavbarPaths = [
    "/login", "/quotation", "/freelancer/browse-category", "/freelancer/category",
    "/freelancer/free-listing", "/ecommerce", "/freelancer/create-business",
    "/designs/Tool", "/dashboard", "/customer/dashboard", "/admin/login",
    "/user/login", "/other/login", "/aiPlanner", "/aiPlanner/interior","/proposal/view/link",
    "/aiPlanner/landscape", "/estimate/calculator",
    "/accountant/login", "/ecommerce/seller","/aiPlanner/enhance","/aiPlanner/sky","/aiPlanner/virtual" ,
  ];
  const isDashboard = location.pathname.startsWith("/dashboard");
const hideNavbar =
  hideNavbarPaths.includes(location.pathname) ||
  location.pathname.startsWith("/proposal/view/link") ||
  isDashboard;

  if (isDashboard && (!user || !token)) {
    return <div className="min-h-screen">{children}</div>;
  }

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
     "/accountant/login", "/ecommerce/seller",
    "/freelancer/registration","/aiPlanner/enhance","/aiPlanner/sky","/aiPlanner/virtual" ,
  ];
// Chatbot sirf in pages par dikhega (jo path chahiye yaha add kar lena)
  const allowedChatbotPaths = [
    "/",
    "/mortgage/services",
    "/properties",
    "/services/interior",
    "/landscaping",
    "/ecommerce/b2c",
    "/Blogs",
    "/case-studies",
    "/training",
    "/ecosystem",
    "/aiPlanner",
    "/Property",
    "/ecommerce",
    "/about",
    "/contact",
    "/consultation",
   "/estimate/calculator/interior"
  ];
const hideFooter =
  hideFooterPaths.includes(location.pathname) ||
  location.pathname.startsWith("/proposal/view/link") ||
  isDashboard ||
  location.pathname.startsWith("/profile/");

  const hidePopup =
  isDashboard ||
  location.pathname.includes("login") ||
  location.pathname.includes("register") ||
  location.pathname.includes("/freelancer/registration") ||
  location.pathname.includes("/ecommerce/seller") ||
  location.pathname.includes("/admin/login") ||
  location.pathname.startsWith("/dashboard")||
    location.pathname.startsWith("/proposal/view/link"); // ✅ ADD THIS


  
  const showChatbot = allowedChatbotPaths.includes(location.pathname);
  return (
    <div className="min-h-screen relative">
      {!hideNavbar && <Navbar />}
      {showFreelancerNavbar && <FreelancerNavbar />}
      {!hidePopup && <PopupManager />}
      
      {children}
      {!hideFooter && <Footer />}
      {showChatbot && <XobiaChatbot />}
    </div>
  );
}



function App() {
  return (
    <AuthProvider>
    <CmsProvider>
    <BlogProvider>
      <FreelancerProvider><ProductProvider>
        <LayoutWrapper>
          <ScrollToTop />
        
          <Suspense fallback={<Loader />}>
            <Routes>
              {/* --- ADDED REDIRECT HERE --- */}
              <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
              {/* --------------------------- */}
             

              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/" element={<Home />} />
              <Route path="/landscaping" element={<Landspackng />} />
              <Route path="/aiPlanner" element={<AITools />} />
              <Route path="/aiPlanner/demo" element={<AIPlannerDemoPage />} />
              <Route path="/mortgages" element={<Mortgage />} />
                            <Route path="/mortgages/calculator" element={<MortgageCalculator/>} />

              <Route path="/mortgages-product" element={<MortgagesProduct />} />
              <Route path="/mortgages-product-upload-document" element={<UploadDocuments />} />
              <Route path="/product-requirements-edit" element={<ProductRequirementsEdit />} />
              <Route path="/my-applications" element={<MyApplications />} />
              <Route path="/aiPlanner/interior" element={<InteriorPlanner />} />
              <Route path="/aiPlanner/enhance" element={<ImageEnhancer />} />
              <Route path="/aiPlanner/sky" element={<SkyReplacement />} />
              <Route path="/aiPlanner/virtual" element={<VirtualStaging />} />
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
              <Route path="/Property" element={<Buy />} />
              <Route path="/ecosystem" element={<Ecosystem />} />
              <Route path="/about" element={<About />} />
              <Route path="/aiInterior" element={<Interior />} />
              <Route path="/other/login" element={<OtherLogin />} />
              <Route path="/case-studies" element={<Casestudy />} />
              <Route path="/training" element={<Training />} />



              {/* secure links */}
                            <Route path="/proposal/view/link/:id" element={<ProposalLink />} />

              <Route path="/login" element={<Login />} />
              <Route path="/grid/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/user/login" element={<CustomerLogin />} />
              <Route path="/consultation" element={<Consult />} />
              <Route path="/designs" element={<Designs />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                            <Route path="/ecommerce/cart" element={<CartPage />} />
                            <Route path="/ecommerce/checkout" element={<CheckoutPage />} />
                            <Route path="/ecommerce/payment/success" element={<PaymentSuccess />} />
<Route path="/vault/vault-register" element={<VaultRegister />} />
<Route path="/Grid/advisor/login" element={<AdvisorLogin />} />
              
{/* <Route path="/vaultpartner" element={<VaultPartner />} /> */}
              <Route
                path="/designs/Tool"
                element={
                  <DndProvider backend={HTML5Backend}>
                    <AITool />
                  </DndProvider>
                }
              />
              <Route path="/Blog" element={<Ai />} />
              <Route path="/mortgage/services" element={<Service />} />
              <Route path="/properties" element={<Page2 />} />
              <Route path="/Blogs" element={<Page3 />} />
              <Route path="/contact" element={<Page />} />
              <Route path="/quotation" element={<Quotation />} />
              <Route path="/ecommerce" element={<MainEcommercePage />} />
              <Route path="/ecommerce/b2c" element={<HomeB2C />} />

            
  <Route path="/referral-partner/login" element={<ReferralPartnerLogin />} />
<Route path="/referral-partner/register" element={<ReferralPartnerRegister />} />
              <Route path="/developer/registration" element={<DeveloperRegistration />} />
              {/* <Route path="/developer/sidebar" element={<DeveloperSidebar />} /> */}

              {/* ✅ Agency Route */}
              <Route path="/agency/registration" element={<RegistrationAgency />} />

              {/* ✅ Agent Registration Route */}
                <Route path="/agent/registration" element={<AgentRegistration />} />

               {/* ✅ Rent Search */}
         {/* <Route path="/rent/search" element={<PropertyRent />} />
         <Route path="/rent/listings" element={<PropertyListings />} /> */}
         <Route path="/rent/search" element={<HeroRent />} />
         <Route path="/results" element={<ResultsPage />} />
         <Route path="/search/buy" element={<HeroBuy />} />
         <Route path="/buy-results" element={<BuyResultsPage />} />


              <Route path="/ecommerce/seller" element={<SellerPage />} />
              <Route path="/ecommerce/seller/b2b" element={<Sellerb2b />} />
              <Route path="/ecommerce/b2b" element={<HomeB2B />} />
              
              <Route path="/ecommerce/filter" element={<ProductFilterPage />} />
              <Route path="/ecommerce/product/:id" element={<Productdetails />} />
              <Route path="/social" element={<Social />} />
              <Route path="/how-it-works" element={<Howitworks />} />
              <Route path="/project-view" element={<Completeproductview />} />
              <Route path="/designers" element={<Designers />} />
              {/* <Route path="/freelancer" element={<Freelancers />} /> */}
              <Route path="/freelancer/browse-subcategory/:id" element={<Browsecategory />} />
              <Route path="/services/landscaping/:id" element={<Category />} />
              {/* <Route path="/freelancer/home" element={<Mainfreelancers />} /> */}
              {/* <Route path="/freelancer/profile" element={<FreelancerProfile />} /> */}
              {/* <Route path="/freelancer/free-listing" element={<Freelisting />} /> */}
              {/* <Route path="/freelancer/create-business" element={<CreateBusiness />} /> */}
              {/* <Route path="/freelancer/business" element={<Businesspage />} /> */}
              <Route path="/freelancer/registration" element={<Registration />} />
              {/* <Route path="/interior/living-room" element={<LivingRoom />} /> */}
              {/* <Route path="/interior/bathroom" element={<Bathroom />} /> */}
              {/* <Route path="/interior/bedroom" element={<Bedroom />} /> */}
              {/* <Route path="/interior/modular-kitchen" element={<Kitchen />} /> */}
              {/* <Route path="/interior/study-room" element={<Studyroom />} /> */}
              {/* <Route path="/interior/wardrobe" element={<Wardrobe />} /> */}
              {/* <Route path="/magazines" element={<Magazine />} /> */}
              {/* <Route path="/profile" element={<Profile />} /> */}
              {/* <Route path="/customer/dashboard" element={<Customerdashboard />} /> */}
              <Route path="/check" element={<Checker />} />
              <Route path="/upcoming-soon" element={<Upcoming />} />
              <Route path="/finance-soon" element={<Finicial />} />
               <Route path="/waiting-approval" element={<WaitingApproval />} />
               <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
  
                <Route path="/Vault/testing/login" element={<EmployeeLogin />} />

              <Route
                path="/dashboard/:roleSlug/*"
                element={
                  <PrivateRoute allowedRoles={["0", "1", "2", "3", "6", "5", "8", "7", "11", "12","9","10","15","16","17","18","21", "22","23","26","24", "25"]}>
                    <CmsApp />
                  </PrivateRoute>
                }
              />
             
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </LayoutWrapper>
      </ProductProvider>
      </FreelancerProvider>

    </BlogProvider>
    </CmsProvider>
    </AuthProvider>
  );
}

export default App;