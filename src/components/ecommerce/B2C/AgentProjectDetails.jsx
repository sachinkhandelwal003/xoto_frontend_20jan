import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row, Col, Typography, Button, Tag, Spin, message,
  Card, Divider, Collapse, Avatar, Space, Modal, Image, Select, Checkbox, Input
} from "antd";
import {
  EnvironmentOutlined, PictureOutlined, FilePdfOutlined,
  TagOutlined, WalletOutlined, BankOutlined,
  ShareAltOutlined, ExportOutlined, MessageOutlined,
  AppstoreOutlined, ArrowLeftOutlined, EditOutlined, RobotOutlined, MoneyCollectOutlined,
  EyeOutlined, DownloadOutlined, RightOutlined
} from "@ant-design/icons";
import axios from "axios";

// 🔥 TUMHARI API SERVICE IMPORT 🔥 (Path apne folder ke hisaab se set kar lena)
import {apiService} from "../../../manageApi/utils/custom.apiservice"; 

// 🔥 HTML TO PDF GENERATOR IMPORTS
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// 🛠️ FIX: BUFFER IS NOT DEFINED ERROR
import { Buffer } from 'buffer';
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

// 🛠️ FIX: TYPOGRAPHY COMPONENTS
const { Title, Text, Paragraph } = Typography;

// 🔥 TRANSLATION FUNCTION USING YOUR API SERVICE 🔥
const translateText = async (text, targetLang) => {
  if (targetLang === 'EN' || targetLang === 'English') return text;
  
  try {
    // 🚀 Using apiService instead of axios
    const response = await apiService.post("aiii/translate", {
      text: text,
      targetLang: targetLang
    });
    
    if (response.data?.success && response.data?.translatedText) {
      return response.data.translatedText;
    }
    return text;
  } catch (error) {
    console.error("Translation error:", error);
    return text; 
  }
};

// 🔥 TRANSLATION HOOK
const useTranslation = () => {
  const [translations, setTranslations] = useState({
    EN: {
      lookWhatWeFound: "Look what we found for you",
      developer: "Developer",
      aboutProject: "ABOUT THE PROJECT",
      priceFrom: "Price from",
      paymentPlan: "Payment Plan",
      location: "Location description and benefits",
      amenities: "Features & Amenities",
      theVisionaryBehind: "The Visionary Behind",
      luxuryLiving: "Luxury Living",
      typicalUnits: "Typical Units",
      pricingAvailability: "Project general facts",
      primeLocation: "PRIME LOCATION",
      unitType: "Unit type",
      bedrooms: "Bedrooms",
      amount: "Amount",
      area: "Area, sqft",
      priceFromTable: "Price from",
      onBooking: "On booking",
      duringConstruction: "During construction",
      uponHandover: "Upon Handover",
      handover: "Handover",
      paymentPlanOption: "Payment Plan Option",
      allOptions: "All options",
      dateOfCreation: "Date of creation",
      finishing: "Finishing and materials",
      architecture: "ARCHITECTURE",
      advisor: "XOTO Real Estate Advisor"
    }
  });

  const [currentLang, setCurrentLang] = useState('EN');
  const [isTranslating, setIsTranslating] = useState(false);

  const translateAll = async (langCode) => {
    if (langCode === 'EN') {
      setCurrentLang('EN');
      return;
    }
    if (translations[langCode]) {
      setCurrentLang(langCode);
      return;
    }

    setIsTranslating(true);
    try {
      const translated = {};
      for (const [key, value] of Object.entries(translations.EN)) {
        translated[key] = await translateText(value, langCode);
      }
      setTranslations(prev => ({ ...prev, [langCode]: translated }));
      setCurrentLang(langCode);
      message.success(`Content translated to ${langCode}`);
    } catch (error) {
      console.error("Bulk translation error:", error);
      message.error(`Translation failed for ${langCode}. Using English.`);
    } finally {
      setIsTranslating(false);
    }
  };

  const t = (key) => translations[currentLang]?.[key] || translations.EN[key];
  return { t, translateAll, currentLang, isTranslating, translations };
};

// 🚀 DIRECT S3 URL HANDLER
const getSafeUrl = (url) => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1773392643245-15.jpg"; 
  }
  if (url.includes('unsplash.com')) return url.split('?')[0]; 
  if (url.includes('amazonaws.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}cb=${new Date().getTime()}`;
  }
  return url; 
};

const exchangeRates = { AED: 1, USD: 0.272, EUR: 0.25, GBP: 0.21, INR: 22.6 };

// 🔥 SMART AMENITY IMAGE MATCHER 🔥
const getAmenityImage = (amenityName) => {
  const name = amenityName.toLowerCase();
  if (name.includes('pool') || name.includes('water lounge') || name.includes('water')) return "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=800&auto=format&fit=crop";
  if (name.includes('gym') || name.includes('fitness')) return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop";
  if (name.includes('cinema') || name.includes('theater')) return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop";
  if (name.includes('bbq') || name.includes('barbecue') || name.includes('grill')) return "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=800&auto=format&fit=crop";
  if (name.includes('spa') || name.includes('sauna') || name.includes('massage')) return "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop";
  if (name.includes('lounge') || name.includes('club house') || name.includes('club')) return "https://images.unsplash.com/photo-1574643033501-1b0780287f3b?q=80&w=800&auto=format&fit=crop";
  if (name.includes('work') || name.includes('office') || name.includes('business') || name.includes('co-working')) return "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop";
  if (name.includes('terrace') || name.includes('roof') || name.includes('deck')) return "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop";
  if (name.includes('garden') || name.includes('park') || name.includes('green')) return "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop";
  if (name.includes('kids') || name.includes('play')) return "https://images.unsplash.com/photo-1598346762291-aee88549193f?q=80&w=800&auto=format&fit=crop";
  if (name.includes('yoga') || name.includes('zen')) return "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop";
  if (name.includes('parking') || name.includes('valet')) return "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=800&auto=format&fit=crop";
  
  return "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=800&auto=format&fit=crop"; 
};


// 🔥 PROFESSIONAL LUXURY HTML TEMPLATE FOR PDF 🔥
const generateHTMLTemplate = (property, agent, preferences, translations, currentLang, customDescription) => {
  const xotoLogo = "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1773403122746-image_109-removebg-preview.png";
  
  const gallery = property?.photos || [];
  const safeImages = gallery.length > 0 ? gallery.map(img => getSafeUrl(img)).filter(Boolean) : [getSafeUrl("")];

  const devName = property?.developer?.name || "Prescott";
  const propertyName = property?.propertyName || "The Caden";

  const unitTypesArray = property?.unitType?.length > 0 ? property.unitType : ["1 Bedroom", "2 Bedrooms", "3 Bedrooms"];
  const fullAddress = `${property?.country || "AE"}, ${property?.city || "Dubai"}, ${property?.area || "Area"}`;

  const dynamicAmenities = property?.amenities?.length > 0 ? property.amenities : ["Infinity Pool", "Outdoor Gym", "BBQ Area", "Rooftop Terraces", "Co-working Space", "Water Lounges", "Spa", "Cinema", "Club House"];

  const displayPrice = (basePrice) => {
    let p = Number(basePrice || 0);
    const rate = exchangeRates[preferences.currency] || 1;
    return Math.round(p * rate).toLocaleString();
  };

  const agentPhoto = getSafeUrl(agent?.photo) || "https://via.placeholder.com/150";
  const slidesToShow = preferences.slides || [];
  const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.');

  const t = (key) => translations[currentLang]?.[key] || translations.EN[key];

  let slidesHTML = '';

  // 1. Cover Slide
  if (slidesToShow.includes('Cover slide')) {
    slidesHTML += `
      <div class="page cover-page" style="background-image: url('${safeImages[0]}');">
        <div class="cover-gradient"></div>
        <div class="absolute-top-left large-cover-logo-container">
           <img src="${xotoLogo}" class="xoto-logo-cover" />
        </div>
        <div class="cover-content-bottom">
          <div class="cover-text-left">
            <div class="pre-title">${t('lookWhatWeFound') || 'Look what we found for you'}</div>
            <h1 class="main-title">${propertyName} by<br/>${devName}</h1>
            <div class="date-text">Date of creation ${currentDate}</div>
          </div>
          <div class="agent-glass-card">
            <img src="${agentPhoto}" class="agent-card-img" />
            <div class="agent-card-name">${agent?.name || "Ayush Rajpalani"}</div>
            <div class="agent-card-brand">ats.com</div>
            <div class="agent-card-contact">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
               <span>${agent?.phone || "+971503747474"}</span>
            </div>
            <div class="agent-card-contact">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
               <span>${agent?.email || "ayush2222@yopmail.com"}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Common Header Generator
  const generateGeneralHeader = () => `
    <div class="general-breadcrumb-header">
       <div class="header-left">
         <img src="${xotoLogo}" class="header-logo" />
       </div>
       <span class="brand-accent">ATS.COM</span>
    </div>
  `;

  // 2. Project Overview / Table
  if (slidesToShow.includes('Project description')) {
    slidesHTML += `
      <div class="page full-image-page">
        <img src="${safeImages[1] || safeImages[0]}" class="page-bg-image" />
        
        <div class="page-absolute-top">
           ${generateGeneralHeader()}
        </div>
        
        <div class="floating-info-card">
          <div class="info-header bold-info-header">${t('aboutProject') || 'ABOUT THE PROJECT'}</div>
          <div class="info-title">${propertyName} by ${devName}</div>
          <div class="info-grid">
            <div class="info-col">
              <span class="info-label">Developer</span>
              <span class="info-value">${devName}</span>
            </div>
            <div class="info-col">
              <span class="info-label">Building start</span>
              <span class="info-value">${property?.buildingStart || "Q4 2025"}</span>
            </div>
            <div class="info-col">
              <span class="info-label">Handover</span>
              <span class="info-value">${property?.handover || "Q3 2028"}</span>
            </div>
          </div>
        </div>

        <div class="floating-table-card">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Unit type</th>
                <th>Bedrooms</th>
                <th>Amount</th>
                <th>Area, ${preferences.measureUnit === 'm2' ? 'm²' : 'sq.ft'}</th>
                <th>Price from</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Apartments</td>
                <td>1 Bedroom</td>
                <td>19/32</td>
                <td>${preferences.measureUnit === 'm2' ? '72-79' : '775-850'}</td>
                <td class="price-highlight">${preferences.currency} 1,800,000</td>
              </tr>
              <tr>
                <td>Apartments</td>
                <td>2 Bedrooms</td>
                <td>2/8</td>
                <td>${preferences.measureUnit === 'm2' ? '113-129' : '1,216-1,389'}</td>
                <td class="price-highlight">${preferences.currency} 2,845,000</td>
              </tr>
              <tr>
                <td>Apartments</td>
                <td>3 Bedrooms</td>
                <td>6/9</td>
                <td>${preferences.measureUnit === 'm2' ? '188-197' : '2,024-2,120'}</td>
                <td class="price-highlight">${preferences.currency} 4,241,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="page text-page">
        ${generateGeneralHeader()}

        <div class="content-wrapper mt-40">
          <div class="page-header-text bold-info-header">${t('aboutProject') || 'ABOUT THE PROJECT'}</div>
          <h1 class="page-main-title">${propertyName} by ${devName}</h1>
          <div class="page-sub-title">Developer ${devName}</div>
          
          <h2 class="section-heading mt-40">Description</h2>
          <h3 class="section-subheading">Project general facts</h3>
          
          <div class="body-text">
            ${customDescription || property?.description || `The Caden by Prescott Real Estate Development rises at the meeting point of city energy and natural calm within Meydan Horizon, one of Dubai's most forward-looking communities.<br><br>
            Its design captures the duality of urban vitality and serene living modern architecture opening toward tranquil lagoon views, with interiors that emphasize light, balance, and intelligent comfort.`}
          </div>

          <h3 class="section-subheading mt-30">Finishing and materials</h3>
          <div class="body-text">Modern finishing with high-quality materials.</div>
          
          <h3 class="section-subheading mt-20">Kitchen and appliances</h3>
          <div class="body-text">Fully fitted kitchens with premium appliances.</div>
          
          <h3 class="section-subheading mt-20">Furnishing</h3>
          <div class="body-text">Yes.</div>
        </div>
      </div>
    `;

    // 🔥 AMENITIES WITH DYNAMIC IMAGES 🔥
    slidesHTML += `
      <div class="page text-page bg-light">
        ${generateGeneralHeader()}

        <div class="content-wrapper mt-40">
          <h2 class="section-heading mb-30">${t('amenities') || 'Features & Amenities'}</h2>
          
          <div class="amenities-rich-grid">
            ${dynamicAmenities.map(item => `
              <div class="amenity-rich-card">
                <img src="${getAmenityImage(item)}" alt="${item}" class="amenity-rich-img" />
                <div class="amenity-rich-title">${item}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // 3. Architecture Slides
  if (slidesToShow.includes('Project description')) {
    slidesHTML += `
      <div class="page dark-page">
        ${generateGeneralHeader()}
        <div class="full-center-image mt-40">
          <img src="${safeImages[2] || safeImages[0]}" class="rounded-image" style="max-height: 80vh; width: auto; object-fit: contain;" />
        </div>
        <div class="arch-footer">#${devName}</div>
      </div>

      <div class="page text-page">
        ${generateGeneralHeader()}
        <div class="split-image-grid mt-40">
          <img src="${safeImages[3] || safeImages[0]}" class="rounded-image h-full" />
          <img src="${safeImages[4] || safeImages[0]}" class="rounded-image h-full" />
        </div>
        <div class="arch-footer dark-text">#${devName}</div>
      </div>
    `;
  }

  // 4. Location Page
  if (slidesToShow.includes('Location')) {
    slidesHTML += `
      <div class="page text-page">
        ${generateGeneralHeader()}
        <div class="content-wrapper mt-40">
          <h2 class="section-heading mb-30">${t('primeLocation') || 'Prime Location'}</h2>
          
          <div class="body-text mb-30">
            <strong><span style="color: #D4B886; margin-right: 5px;">📍</span>${fullAddress}</strong><br/><br/>
            ${property?.locationDescription || "Meydan City is an extraordinary community situated in the heart of Dubai, known for its blend of luxury, sophistication, and world-class amenities. Spanning over a vast area, it offers a unique living experience that combines urban convenience with a tranquil and scenic environment."}
          </div>

          <div class="location-map-wrapper" style="width: 100%; height: 500px; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
             <iframe
                width="100%"
                height="100%"
                style="border: 0;"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://maps.google.com/maps?q=${encodeURIComponent(propertyName + ' ' + fullAddress)}&t=m&z=14&ie=UTF8&iwloc=&output=embed"
              ></iframe>
          </div>
        </div>
      </div>
    `;
  }

  // 5. Payment Plan
  if (slidesToShow.includes('Payment plans')) {
    slidesHTML += `
      <div class="page text-page bg-light">
        ${generateGeneralHeader()}
        
        <div class="payment-split-container mt-40">
           <div class="payment-left-card">
              <div>
                <div class="pay-sub">${t('paymentPlanOption') || 'Payment Plan Option'}</div>
                <div class="pay-main">${t('paymentPlan') || 'Payment Plan'}</div>
              </div>
              <div class="pay-footer">
                <div class="pay-footer-title">${t('allOptions') || 'All options'}</div>
                <div class="pay-footer-action">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
                  <span>${t('paymentPlan') || 'Payment Plan'}</span>
                </div>
              </div>
           </div>

           <div class="payment-right-card">
             <div class="pay-row">
               <span>${t('onBooking') || 'On booking'}</span>
               <strong>${property?.paymentPlan_initialPercentage || "20"}%</strong>
             </div>
             <div class="pay-row">
               <span>${t('duringConstruction') || 'During construction'}</span>
               <strong>${property?.paymentPlan_duringPercentage || "40"}%</strong>
             </div>
             <div class="pay-row border-0">
               <span>${t('uponHandover') || 'Upon Handover'}</span>
               <strong>${property?.paymentPlan_laterPercentage || "40"}%</strong>
             </div>
           </div>
        </div>
      </div>
    `;
  }

  // 6. Typical Units
  if (slidesToShow.includes('Unit prices')) {
    slidesHTML += `
      <div class="page text-page">
        ${generateGeneralHeader()}
        
        <div class="content-wrapper mt-40" style="max-width: 100%;">
          <h2 class="section-heading">${t('typicalUnits') || 'Typical Units'}</h2>
          <div class="availability-info mt-20">
             <strong>Number of available units:</strong><br>
             Apartments: 1 Bedroom - 19 | Apartments: 2 Bedrooms - 2 | Apartments: 3 Bedrooms - 6
          </div>
          
          <div class="floorplan-layout mt-40">
             <div class="fp-images">
                <img src="${safeImages[0]}" class="rounded-image" style="height: 400px; object-fit: contain;" />
             </div>
             <div class="fp-details">
                <div class="unit-block">
                   <div class="unit-title">Apartments: 1 Bedroom</div>
                   <div class="unit-specs">from AED 1,800,000 to AED 2,238,000</div>
                   <div class="unit-specs text-grey">from 72 m² to 79 m²</div>
                   <div class="unit-specs text-light-grey">from AED 23,795/m² to AED 28,956/m²</div>
                </div>
                <div class="unit-block mt-30">
                   <div class="unit-title">Apartments: 2 Bedrooms</div>
                   <div class="unit-specs">from AED 2,845,000 to AED 3,233,000</div>
                   <div class="unit-specs text-grey">from 113 m² to 129 m²</div>
                   <div class="unit-specs text-light-grey">from AED 23,798/m² to AED 26,136/m²</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    `;
  }

  // 7. Developer Slide
  if (slidesToShow.includes('Developer') || slidesToShow.includes('Project description')) {
    const devDesc = property?.developer?.description || `At Prescott, they don't just build structures; they craft modern lifestyles. Their team of experts is dedicated to pushing the boundaries of design, integrating the latest technologies to create spaces that adapt to the needs of tomorrow. Driven by a commitment to sustainability, Prescott infuse eco-conscious practices into every aspect of their development process, ensuring a greener, more sustainable future for generations to come.`;
    
    slidesHTML += `
      <div class="page dark-page flex-col-between">
        ${generateGeneralHeader()}

        <div class="developer-content mt-40">
           <h1 class="developer-massive-title">${devName}</h1>

           <div class="developer-logo-wrapper">
              <img src="${property?.developer?.logo || safeImages[0]}" alt="${devName}" class="developer-fullscreen-logo" />
           </div>

           <div class="developer-description-box">
              <p>${devDesc}</p>
           </div>
        </div>

        <div class="arch-footer">#${devName}</div>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${propertyName} - Brochure</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        :root {
          --dark-bg: #1A1A1A;
          --mid-grey: #828282;
          --light-bg: #FAFAFA;
          --accent-sand: #D4B886;
          --text-main: #333333;
          --text-light: #666666;
          --border-radius: 16px;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'Inter', sans-serif;
          background: #E5E5E5;
          -webkit-print-color-adjust: exact;
          overflow-x: hidden;
        }

        .page {
          width: 100%;
          min-height: 100vh;
          position: relative;
          page-break-after: always;
          background: white;
          overflow: hidden;
          margin: 0; 
          padding: 60px 40px 40px 40px; 
        }

        .mt-20 { margin-top: 20px; }
        .mt-30 { margin-top: 30px; }
        .mt-40 { margin-top: 40px; }
        .mb-30 { margin-bottom: 30px; }
        .text-grey { color: var(--text-light); }
        .text-light-grey { color: #999; font-size: 12px; }
        .rounded-image { border-radius: var(--border-radius); object-fit: cover; width: 100%; }
        .h-full { height: 100%; }
        .flex-center { display: flex; flex-direction: column; justify-content: center; align-items: center; }
        .flex-col-between { display: flex; flex-direction: column; justify-content: space-between; }
        .absolute-top { position: absolute; top: 40px; left: 40px; right: 40px; width: calc(100% - 80px); }
        .page-absolute-top { position: absolute; top: 0; left: 0; right: 0; padding: 60px 40px 0 40px; z-index: 10; }
        .bg-light { background: var(--light-bg); }

        /* Universal General Breadcrumb Header with Logo */
        .general-breadcrumb-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          font-size: 12px;
          letter-spacing: 1px;
          font-weight: 500;
          color: #000;
          margin-bottom: 0;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .header-logo {
          width: 60px;
          height: auto;
          object-fit: contain;
        }
        
        .brand-accent { color: var(--accent-sand); font-weight: 600; }

        /* COVER PAGE STYLES */
        .cover-page {
          background-size: cover;
          background-position: center;
          position: relative;
          padding: 0; 
        }
        
        .cover-gradient {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 50%;
          background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%);
          z-index: 1;
        }

        .absolute-top-left {
          position: absolute;
          top: 40px;
          left: 40px;
          z-index: 2;
        }
        
        .large-cover-logo-container {
          top: 60px;
        }

        .xoto-logo-cover {
          width: 140px;
          height: auto;
          object-fit: contain;
        }

        .cover-content-bottom {
          position: absolute;
          bottom: 40px;
          left: 40px;
          right: 40px;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .cover-text-left {
          color: white;
          max-width: 60%;
        }

        .pre-title {
          font-size: 22px;
          font-weight: 400;
          margin-bottom: 10px;
          color: rgba(255,255,255,0.9);
        }

        .main-title {
          font-size: 72px;
          font-weight: 600;
          line-height: 1.05;
          margin-bottom: 15px;
          color: white;
        }

        .date-text {
          font-size: 16px;
          color: rgba(255,255,255,0.6);
          font-weight: 400;
        }

        .agent-glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 25px;
          width: 320px;
          color: white;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .agent-card-img {
          width: 100px;
          height: 100px;
          border-radius: 16px;
          object-fit: cover;
          margin-bottom: 15px;
        }

        .agent-card-name {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .agent-card-brand {
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          margin-bottom: 25px;
        }

        .agent-card-contact {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          margin-bottom: 12px;
          color: rgba(255,255,255,0.9);
        }
        
        .agent-card-contact:last-child {
          margin-bottom: 0;
        }

        .agent-card-contact svg {
          opacity: 0.7;
          flex-shrink: 0;
        }

        /* PAGE 2: FULL IMAGE + FLOATING WIDGETS */
        .full-image-page {
          position: relative;
          padding: 0; 
        }
        
        .page-bg-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          top: 0;
          left: 0;
        }

        .floating-info-card {
          position: absolute;
          bottom: 220px;
          left: 40px;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(10px);
          padding: 24px;
          border-radius: 12px;
          width: 350px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .bold-info-header { font-size: 10px; font-weight: 700; color: #111; letter-spacing: 1px; margin-bottom: 5px; text-transform: uppercase; }
        .info-header { font-size: 10px; font-weight: 600; color: var(--text-light); letter-spacing: 1px; margin-bottom: 5px; }
        .info-title { font-size: 20px; font-weight: 600; color: #000; margin-bottom: 20px; }
        
        .info-grid { display: flex; flex-direction: column; gap: 15px; }
        .info-col { display: flex; flex-direction: column; }
        .info-label { font-size: 11px; color: var(--text-light); margin-bottom: 2px; }
        .info-value { font-size: 14px; font-weight: 600; color: #000; }

        .floating-table-card {
          position: absolute;
          bottom: 40px;
          left: 40px;
          right: 40px;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .custom-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        
        .custom-table th {
          text-align: left;
          color: var(--text-light);
          font-weight: 500;
          padding-bottom: 15px;
          border-bottom: 1px solid #EAEAEA;
        }
        
        .custom-table td {
          padding: 15px 0;
          border-bottom: 1px solid #EAEAEA;
          color: var(--text-main);
        }
        
        .custom-table tr:last-child td { border-bottom: none; padding-bottom: 0; }
        .price-highlight { font-weight: 600; color: #000; }

        /* TEXT PAGES */
        .text-page {
          background: white;
          display: flex;
          flex-direction: column;
        }

        .content-wrapper {
          max-width: 1200px; 
          margin: 0 auto;
          width: 100%;
        }

        .page-header-text { font-size: 12px; color: #111; font-weight: 700; letter-spacing: 1px; margin-bottom: 10px; text-transform: uppercase;}
        
        .page-main-title { font-size: 36px; font-weight: 600; color: #000; margin-bottom: 5px; }
        .page-sub-title { font-size: 16px; color: var(--text-light); font-weight: 400; }
        
        .section-heading { font-size: 28px; font-weight: 600; color: #000; margin-bottom: 15px; }
        .section-subheading { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 8px; }
        
        .body-text {
          font-size: 16px; 
          line-height: 1.6;
          color: var(--text-light);
          text-align: justify;
        }

        /* ARCHITECTURE PAGES */
        .dark-page {
          background: #000;
          display: flex;
          flex-direction: column;
          color: white;
        }

        .full-center-image {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0;
          width: 100%;
        }

        .split-image-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          height: 75vh;
          width: 100%;
        }

        .arch-footer {
          text-align: right;
          font-size: 12px;
          font-weight: 500;
          opacity: 0.7;
          width: 100%;
          position: absolute;
          bottom: 40px;
          right: 40px;
        }

        /* AMENITIES NEW GRID WITH IMAGES */
        .amenities-rich-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          width: 100%;
        }
        
        .amenity-rich-card {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          border: 1px solid #EAEAEA;
          display: flex;
          flex-direction: column;
        }

        .amenity-rich-img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .amenity-rich-title {
          padding: 16px;
          font-size: 16px;
          font-weight: 600;
          color: #000;
          text-align: center;
        }

        /* PAYMENT PLAN STYLES (SPLIT CARD DESIGN) */
        .payment-split-container {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 30px;
          height: 60vh;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .payment-left-card {
          background: #F9FAFB;
          border-radius: 16px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid #EAEAEA;
        }

        .pay-sub {
          font-size: 16px;
          color: #4B5563;
          margin-bottom: 12px;
        }

        .pay-main {
          font-size: 32px;
          font-weight: 700;
          color: #000;
        }

        .pay-footer-title {
          font-size: 16px;
          font-weight: 700;
          color: #000;
          margin-bottom: 8px;
        }

        .pay-footer-action {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #4B5563;
        }

        .payment-right-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 40px 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 50px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          border: 1px solid #EAEAEA;
        }

        .pay-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 20px;
          color: #111827;
          font-weight: 600;
        }

        .pay-row strong {
          font-size: 24px;
          font-weight: 700;
        }

        /* TYPICAL UNITS */
        .availability-info { font-size: 15px; color: var(--text-light); line-height: 1.6; }
        .floorplan-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; align-items: start; width: 100%; }
        .fp-images img { width: 100%; background: var(--light-bg); padding: 30px; border-radius: 16px; }
        
        .unit-title { font-size: 22px; font-weight: 600; color: #000; margin-bottom: 10px; }
        .unit-specs { font-size: 16px; margin-bottom: 6px; color: var(--text-main); }

        /* DEVELOPER PAGE STYLES */
        .developer-content {
          display: flex;
          flex-direction: column;
          flex: 1;
          justify-content: center;
          position: relative;
        }

        .developer-massive-title {
          font-size: 56px;
          font-weight: 400;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-bottom: 30px;
          text-align: center;
          color: white;
        }

        .developer-logo-wrapper {
          width: 100%;
          height: 60vh;
          border-radius: var(--border-radius);
          overflow: hidden;
          margin: 0 auto;
        }

        .developer-fullscreen-logo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(20%) brightness(0.9); 
        }

        .developer-description-box {
          margin-top: -80px; 
          padding: 40px;
          background: rgba(26, 26, 26, 0.7);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border-left: 4px solid var(--accent-sand);
          border-radius: 0 16px 16px 0;
          max-width: 900px;
          margin-left: auto;
          margin-right: auto;
          z-index: 10;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          position: relative;
        }

        .developer-description-box p {
          font-size: 16px;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.95);
          text-align: justify;
          margin: 0;
        }

        @media print {
          body { background: white; }
          .page { box-shadow: none; margin: 0; min-height: auto; height: 100vh; }
        }
      </style>
    </head>
    <body>
      ${slidesHTML}
    </body>
    </html>
  `;
};

// 🔥 MAIN COMPONENT 
export default function AgentProjectDetails() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const [customDescription, setCustomDescription] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isImprovingAI, setIsImprovingAI] = useState(false);

  const [pdfPreferences, setPdfPreferences] = useState({
    language: 'EN',
    currency: 'AED',
    measureUnit: 'sqft',
    slides: ['Cover slide', 'Project description', 'Developer', 'Unit prices', 'Payment plans', 'Location']
  });

  const { t, translateAll, currentLang, isTranslating, translations } = useTranslation();

  // 🔥 EVENT: TRANSLATE DESCRIPTION WHEN LANGUAGE CHANGES 🔥
  useEffect(() => {
    const handleLangChange = async () => {
      if (pdfPreferences.language !== currentLang) {
        
        // 1. Translate Basic Interface Text
        await translateAll(pdfPreferences.language);
        
        // 2. Translate Main Description
        if (customDescription && customDescription.trim() !== "") {
          try {
            const res = await apiService.post("aiii/translate", {
              text: customDescription,
              targetLang: pdfPreferences.language === 'EN' ? 'English' : pdfPreferences.language
            });
            if (res.data?.success) {
              setCustomDescription(res.data.translatedText);
            }
          } catch (e) {
            console.error("Description translation failed.");
          }
        }
      }
    };
    handleLangChange();
  }, [pdfPreferences.language]);

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`https://xoto.ae/api/property/get-property-by-id?id=${id}`);
      if (res.data?.success) {
        setProperty(res.data.data);
        setCustomDescription(res.data.data.description || "Detailed description for this property is not available yet.");
      } else {
        message.error("Failed to load property details");
      }
    } catch (err) {
      console.error(err);
      message.error("API error while fetching property");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 CALL CUSTOM BACKEND AI IMPROVEMENT 🔥
// 🔥 CALL CUSTOM BACKEND AI IMPROVEMENT 🔥
// 🔥 CALL CUSTOM BACKEND AI IMPROVEMENT 🔥
// 🔥 CALL CUSTOM BACKEND AI IMPROVEMENT 🔥
const handleImproveWithAI = async () => {
  if (!customDescription || customDescription.trim() === "") {
    message.warning("Please enter some description first!");
    return;
  }

  setIsImprovingAI(true);
  message.loading({ content: "XOTO AI is enhancing the description...", key: "ai_load" });

  try {
    // 🚀 Calling API
    const response = await apiService.post("aiii/improve-description", {
      description: customDescription 
    });

    // 🛠️ THE FIX: Check if apiService returns data directly or inside .data
    const responseData = response.data ? response.data : response;
    
    console.log("🔥 BACKEND RESPONSE:", responseData); // Ab ye undefined nahi aayega

    // Flexible checks
    const isSuccess = responseData?.success === true || responseData?.responsse?.success === true || responseData?.status === "success";
    const improvedText = responseData?.improvedDescription || responseData?.data || responseData?.text || responseData?.responsse?.improvedDescription;

    if (isSuccess && improvedText) {
      setCustomDescription(improvedText);
      message.success({ 
        content: "Description perfectly enhanced!", 
        key: "ai_load", 
        duration: 2 
      });
    } else {
      console.error("Format mismatch in response:", responseData);
      message.error({ 
        content: "AI responded, but format was wrong. Check console.", 
        key: "ai_load" 
      });
    }
  } catch (error) {
    console.error("AI Improvement error:", error);
    message.error({ 
      content: "Backend error. Make sure server is running locally!", 
      key: "ai_load", 
      duration: 5 
    });
  } finally {
    setIsImprovingAI(false); 
  }
};

 const handleGenerateOffer = async (actionType = 'download') => { 
  setIsGenerating(true);
  const key = "updatable";
  
  const langMap = { HI: 'Hindi', AR: 'Arabic', RU: 'Russian', ZH: 'Chinese', FA: 'Persian', EN: 'English', FR: 'French', ES: 'Spanish', DE: 'German', IT: 'Italian' };
  const targetLang = langMap[pdfPreferences.language] || 'English';

  if (targetLang !== 'English' && pdfPreferences.language !== currentLang) {
    message.loading({ content: `Translating content to ${targetLang}...`, key });
  } else {
    if (actionType === 'view') message.loading({ content: "Opening Preview...", key });
    else message.loading({ content: "Generating PDF for download...", key });
  }

  try {
    const rawData = localStorage.getItem("user_data") || localStorage.getItem("user") || localStorage.getItem("full_agent_profile");
    const storedUser = rawData ? JSON.parse(rawData) : null;
    const agentId = storedUser?.id || storedUser?._id;

    let agentInfo = {
      name: storedUser?.first_name ? `${storedUser.first_name} ${storedUser.last_name || ''}`.trim() : "DEMO AGENT",
      email: storedUser?.email || "agent@xoto.ae",
      phone: storedUser?.phone_number ? `${storedUser.country_code || '+971'} ${storedUser.phone_number}` : "+971 50 000 0000",
      photo: storedUser?.profile_photo || ""
    };

    if (agentId) {
      try {
        const res = await axios.get(`https://xoto.ae/api/agent/${agentId}`); 
        if (res.data && res.data.data) {
          const dbAgent = res.data.data;
          agentInfo = { 
            ...agentInfo, 
            name: `${dbAgent.first_name || ''} ${dbAgent.last_name || ''}`.trim(), 
            email: dbAgent.email, 
            phone: `${dbAgent.country_code || '+971'} ${dbAgent.phone_number || ''}`.trim(), 
            photo: dbAgent.profile_photo || agentInfo.photo 
          };
        }
      } catch (err) {
        console.warn("API error, using local storage fallback for agent");
      }
    }

    const updatedProperty = { ...property, description: customDescription };
    
    const activeLang = pdfPreferences.language;
    const currentTranslations = {
      EN: translations.EN,
      [activeLang]: translations[activeLang] || translations.EN 
    };
    
    // Generate HTML content
    const htmlContent = generateHTMLTemplate(updatedProperty, agentInfo, pdfPreferences, currentTranslations, activeLang, customDescription);

    if (actionType === 'view') {
      // PREVIEW - Open in new tab
      const previewWindow = window.open('', '_blank');
      previewWindow.document.write(htmlContent);
      previewWindow.document.close();
      message.success({ content: "Preview opened in new tab!", key });
    } else {
      // DOWNLOAD - Generate PDF and download
      
      // Create a container for the HTML content
      const container = document.createElement('div');
      container.innerHTML = htmlContent;
      
      // Style the container for proper rendering
      container.style.position = 'fixed';
      container.style.top = '-10000px'; // Hide off-screen
      container.style.left = '0';
      container.style.width = '1200px';
      container.style.zIndex = '-9999';
      container.style.backgroundColor = '#ffffff';
      document.body.appendChild(container);

      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      const pages = container.querySelectorAll('.page');
      const pdf = new jsPDF({ 
        orientation: 'portrait', 
        unit: 'mm', 
        format: 'a4',
        compress: true
      });

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();
        
        // Set page dimensions for A4 ratio
        pages[i].style.height = '1697px'; 
        pages[i].style.minHeight = '1697px'; 
        pages[i].style.maxHeight = '1697px';
        pages[i].style.overflow = 'hidden';

        try {
          // Render page to canvas
          const canvas = await html2canvas(pages[i], { 
            scale: 2,
            logging: false, 
            useCORS: true, 
            allowTaint: true,
            windowWidth: 1200,
            backgroundColor: '#ffffff',
            onclone: (clonedDoc) => {
              // Ensure all images are loaded in clone
              const images = clonedDoc.querySelectorAll('img');
              return Promise.all(Array.from(images).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => {
                  img.onload = resolve;
                  img.onerror = resolve;
                });
              }));
            }
          });
          
          // Convert to image and add to PDF
          const imgData = canvas.toDataURL('image/jpeg', 0.95); 
          const imgWidth = 210;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
        } catch (pageError) {
          console.error(`Error rendering page ${i}:`, pageError);
        }
      }

      // Remove container
      document.body.removeChild(container);

      // Save the PDF
      const fileName = `${updatedProperty.propertyName?.replace(/\s+/g, '_') || 'Sales_Offer'}_${Date.now()}.pdf`;
      pdf.save(fileName);
      
      message.success({ content: "PDF Downloaded Successfully!", key });
      setIsOfferModalOpen(false);
    }

  } catch (error) {
    console.error("PDF Generation Error: ", error);
    message.error({ content: "Failed to generate PDF. Please try again.", key });
  } finally {
    setIsGenerating(false);
  }
};
  if (loading) return <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}><Spin size="large" /></div>;
  if (!property) return <div style={{ padding: 40, textAlign: "center" }}><Title level={4}>Project not found!</Title></div>;

  const getImage = () => property?.photos?.[0] || property?.mainLogo || "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1773392643245-15.jpg";
  const allPhotos = property?.photos?.length > 0 ? property.photos : [getImage()];
  const getPaymentPlan = () => (property.paymentPlan_initialPercentage && property.paymentPlan_laterPercentage) ? `${property.paymentPlan_initialPercentage}/${property.paymentPlan_laterPercentage}%` : "20/40/40%";
  const getCommissionText = () => {
    if (!property?.commissionType) return "Not specified";
    const val = property.commissionValue || 0;
    const stage = property.commissionStage ? ` (on ${property.commissionStage})` : "";
    return property.commissionType === "percentage" ? `${val}%${stage}` : `${property.currency || "AED"} ${val.toLocaleString()}${stage}`;
  };
  const developerName = property?.developer?.name || "Unknown Developer";

  const languages = [ 
    { code: 'EN', name: 'English' }, { code: 'HI', name: 'Hindi' }, 
    { code: 'AR', name: 'Arabic' }, { code: 'RU', name: 'Russian' }, 
    { code: 'ZH', name: 'Chinese' }, { code: 'FA', name: 'Persian' },
    { code: 'FR', name: 'French' }, { code: 'ES', name: 'Spanish' },
    { code: 'DE', name: 'German' }, { code: 'IT', name: 'Italian' }
  ];
  
  const currencies = [ { code: 'AED', name: 'United Arab Emirates Dirham' }, { code: 'USD', name: 'US Dollar' }, { code: 'EUR', name: 'Euro' }, { code: 'GBP', name: 'British Pound' }, { code: 'INR', name: 'Indian Rupee' } ];

  const fullAddress = `${property?.country || "AE"}, ${property?.city || "Dubai"}, ${property?.area || "Area"}`;

  const displayAmenitiesUI = property?.amenities?.length > 0 ? property.amenities : ["Infinity Pool", "Outdoor Gym", "BBQ Area", "Rooftop Terraces", "Co-working Space", "Water Lounges", "Cinema", "Club House", "Spa"];

  return (
    <div style={{ padding: "24px 40px", background: "#fff", minHeight: "100vh" }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ paddingLeft: 0, marginBottom: 16, color: "#555" }}>Back to Projects</Button>

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16}>
          <div style={{ position: "relative", height: 500, borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
            <img src={getImage()} alt={property.propertyName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", top: 20, left: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Tag color="blue" style={{ padding: "4px 12px", borderRadius: 8, fontSize: 14, fontWeight: "bold", background: "#eef2ff", color: "#4338ca", border: "none" }}>{property.propertySubType === "off_plan" ? "Off-Plan / Presale" : "Ready"}</Tag>
              {property.handover && <Tag style={{ padding: "4px 12px", borderRadius: 8, fontSize: 14, fontWeight: "bold", background: "#fff", color: "#333", border: "none" }}>Handover: {property.handover}</Tag>}
              <Tag style={{ padding: "4px 12px", borderRadius: 8, fontSize: 14, fontWeight: "bold", background: "#000", color: "#fff", border: "none" }}>By {developerName}</Tag>
            </div>
            <div style={{ position: "absolute", bottom: 20, left: 20, display: "flex", gap: 12 }}>
              <Button icon={<PictureOutlined />} onClick={() => setIsPhotoModalOpen(true)} style={{ borderRadius: 8, fontWeight: 500, border: "none" }}>{allPhotos.length} Photos</Button>
              {property.brochure && <Button icon={<FilePdfOutlined />} href={property.brochure} target="_blank" style={{ borderRadius: 8, fontWeight: 500, border: "none" }}>Brochure</Button>}
            </div>
          </div>

          <div style={{ background: "#fefce8", border: "1px solid #fef08a", padding: "16px 20px", borderRadius: 12, marginBottom: 32 }}>
            <Text strong style={{ display: "block", fontSize: 16, color: "#854d0e", marginBottom: 4 }}>The project is in the process of being filled with information</Text>
            <Text style={{ color: "#a16207" }}>This is an upcoming launch project, information is being added and updated gradually according to the developer's announcements.</Text>
          </div>

          <Title level={3} style={{ marginBottom: 16 }}>Description</Title>
          <Text type="secondary" strong style={{ display: "block", marginBottom: 12 }}>Project general facts</Text>
          <Paragraph ellipsis={{ rows: 4, expandable: true, symbol: 'Read More' }} style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.8 }}>{property.description || "Detailed description for this property is not available yet."}</Paragraph>

          <Divider style={{ margin: "40px 0" }} />

          <Title level={3} style={{ marginBottom: 24 }}>Amenities</Title>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {displayAmenitiesUI.map((amenity, index) => (
              <div key={index} style={{
                padding: "10px 16px", 
                border: "1px solid #e5e7eb", 
                borderRadius: "8px", 
                background: "#fff",
                fontSize: "14px",
                fontWeight: 500,
                color: "#374151",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
              }}>
                <span style={{ color: "#6366f1", fontSize: "16px", fontWeight: "bold" }}>✓</span>
                {amenity}
              </div>
            ))}
          </div>

          <Divider style={{ margin: "40px 0" }} />

          <Title level={3} style={{ marginBottom: 24 }}>Units & Availability</Title>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {property?.unitType?.length > 0 ? (
              property.unitType.map((unit, index) => (
                <div key={index} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "16px 20px", background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb",
                  cursor: "pointer", transition: "all 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
                >
                  <div style={{ flex: 1.5 }}><Text strong style={{ fontSize: 15, color: "#111827" }}>{unit}</Text></div>
                  <div style={{ flex: 1 }}><Text style={{ color: "#374151", fontWeight: 500 }}>1 Unit</Text></div>
                  <div style={{ flex: 1.5 }}><Text style={{ color: "#374151", fontWeight: 500 }}>{property.builtUpArea_min || 0} {property.builtUpAreaUnit || "sqft"}</Text></div>
                  <div style={{ flex: 1.5, textAlign: "right", paddingRight: 16 }}><Text strong style={{ fontSize: 15, color: "#111827" }}>{Number(property.price_min || property.price || 0).toLocaleString()} {property.currency || "AED"}</Text></div>
                  <div><Button shape="default" icon={<RightOutlined />} size="small" style={{ borderRadius: 6, borderColor: "#d1d5db", color: "#6b7280" }} /></div>
                </div>
              ))
            ) : (
              <div style={{ padding: "16px", background: "#f9fafb", borderRadius: 8 }}><Text type="secondary">Unit details not available</Text></div>
            )}
          </div>

          <Divider style={{ margin: "40px 0" }} />

          <Title level={3} style={{ marginBottom: 16 }}>Location</Title>
          <div style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, color: "#374151", fontWeight: 500 }}>
              <EnvironmentOutlined style={{ color: "#6366f1", marginRight: 8, fontSize: 18 }} />
              {fullAddress}
            </Text>
          </div>
          <div style={{ width: "100%", height: 400, borderRadius: 16, overflow: "hidden", border: "1px solid #e5e7eb", position: "relative" }}>
             <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent((property?.propertyName || '') + ' ' + (property?.area || '') + ' ' + (property?.city || ''))}&t=m&z=15&ie=UTF8&iwloc=&output=embed`}
              ></iframe>
          </div>

        </Col>

        <Col xs={24} lg={8}>
          <div style={{ position: "sticky", top: 24 }}>
            <Text type="secondary" style={{ fontSize: 14 }}><EnvironmentOutlined /> {property.city}, {property.country || "UAE"}</Text>
            <Title level={2} style={{ marginTop: 8, marginBottom: 24 }}>{property.propertyName} by {developerName}</Title>

            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}><TagOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} /><div><Text type="secondary" style={{ fontSize: 13, display: "block" }}>Price from:</Text><Text strong style={{ fontSize: 18 }}>{Number(property.price || 0).toLocaleString()} {property.currency || "AED"}</Text></div></div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}><AppstoreOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} /><div><Text strong style={{ fontSize: 16, display: "block" }}>Available Units</Text><Text type="secondary" style={{ fontSize: 13 }}>Ask for inventory</Text></div></div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}><WalletOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} /><div><Text type="secondary" style={{ fontSize: 13, display: "block" }}>Payment plan:</Text><Text strong style={{ fontSize: 16 }}>{getPaymentPlan()}</Text></div></div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}><BankOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} /><div><Text type="secondary" style={{ fontSize: 13, display: "block" }}>Developer:</Text><Text strong style={{ fontSize: 16 }}>{developerName}</Text></div></div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <MoneyCollectOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Agent Commission:</Text>
                  <Text strong style={{ fontSize: 16, color: "#16a34a" }}>{getCommissionText()}</Text>
                  {property.commissionNotes && <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 2 }}>* {property.commissionNotes}</Text>}
                </div>
              </div>
            </div>

            <div style={{ background: "#fffbe6", border: "1px solid #ffe58f", padding: "8px", borderRadius: "8px 8px 0 0", textAlign: "center" }}><Text strong style={{ fontSize: 13 }}>🔑 Your customised personal offer. Try it!</Text></div>
            <div style={{ display: "flex", width: "100%", marginBottom: 12 }}>
              <Button type="primary" onClick={() => setIsOfferModalOpen(true)} style={{ flex: 1, height: 48, borderRadius: "0 0 0 8px", background: "#5b45ff", fontWeight: 600, fontSize: 16, border: "none" }}>Generate Sales Offer</Button>
              <Button style={{ width: 48, height: 48, borderRadius: "0 0 8px 0", background: "#4f39f6", color: "#fff", border: "none" }} icon={<ShareAltOutlined />} />
            </div>
            <Button block style={{ height: 48, borderRadius: 8, background: "#1f1f1f", color: "#fff", fontWeight: 600, fontSize: 16, border: "none", marginBottom: 24 }} icon={<ExportOutlined />}>Transfer client</Button>

            <Card style={{ borderRadius: 12, border: "1px solid #e5e7eb" }} styles={{ body: { padding: "16px 20px" } }}>
              <div style={{ textAlign: "center", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f3f4f6" }}><Text strong>Sales Office</Text></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Space>
                  <Avatar size={48} src={property.developer?.logo} style={{ background: "#f3f4f6" }}>{!property.developer?.logo && property.developer?.name?.charAt(0)}</Avatar>
                  <div><Text strong style={{ display: "block" }}>{developerName} Team</Text><Text type="secondary" style={{ fontSize: 12 }}>English • Arabic</Text></div>
                </Space>
                <Button shape="round" icon={<MessageOutlined />} style={{ background: "#d9f99d", color: "#3f6212", border: "none", fontWeight: 600 }}>Support</Button>
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      <Modal title={<Title level={5} style={{ margin: 0 }}>Property Gallery</Title>} open={isPhotoModalOpen} onCancel={() => setIsPhotoModalOpen(false)} footer={null} width={900} centered>
        <div style={{ marginTop: 20 }}>
          <Image.PreviewGroup>
            <Row gutter={[16, 16]}>
              {allPhotos.map((photo, index) => (
                <Col xs={12} sm={8} md={6} key={index}><Image src={photo} alt={`Photo ${index + 1}`} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8, cursor: "pointer", border: "1px solid #f0f0f0" }} /></Col>
              ))}
            </Row>
          </Image.PreviewGroup>
        </div>
      </Modal>

      <Modal title={<div style={{ textAlign: 'center', width: '100%', fontSize: '18px', fontWeight: 'bold' }}>Generate Sales Offer</div>} open={isOfferModalOpen} onCancel={() => setIsOfferModalOpen(false)} footer={null} width={750} centered styles={{ body: { padding: '10px 24px 24px' } }}>
        <div style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: '5px' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>PDF Preferences</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Configure your presentation before generation</div>
          
          <div style={{ marginTop: 20 }}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>Language</Text>
            <Select value={pdfPreferences.language} style={{ width: '100%' }} size="large" onChange={(val) => setPdfPreferences({...pdfPreferences, language: val})} loading={isTranslating}>
              {languages.map(lang => <Select.Option key={lang.code} value={lang.code}><strong style={{marginRight: 8}}>{lang.code}</strong> {lang.name}</Select.Option>)}
            </Select>
            {isTranslating && <Text type="secondary" style={{ marginTop: 4 }}>Translating content...</Text>}
          </div>

          <div style={{ marginTop: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>Currency</Text>
            <Select value={pdfPreferences.currency} style={{ width: '100%' }} size="large" showSearch optionFilterProp="children" onChange={(val) => setPdfPreferences({...pdfPreferences, currency: val})}>
              {currencies.map(curr => <Select.Option key={curr.code} value={curr.code}><strong style={{marginRight: 8}}>{curr.code}</strong> {curr.name}</Select.Option>)}
            </Select>
          </div>

          <div style={{ marginTop: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>Measure units</Text>
            <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 4 }}>
               <div onClick={() => setPdfPreferences({...pdfPreferences, measureUnit: 'ft2'})} style={{ flex: 1, textAlign: 'center', padding: '6px 0', cursor: 'pointer', borderRadius: 6, background: pdfPreferences.measureUnit === 'ft2' ? '#fff' : 'transparent', fontWeight: pdfPreferences.measureUnit === 'ft2' ? 'bold' : 'normal', color: pdfPreferences.measureUnit === 'ft2' ? '#5C039B' : '#6b7280', boxShadow: pdfPreferences.measureUnit === 'ft2' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>ft²</div>
               <div onClick={() => setPdfPreferences({...pdfPreferences, measureUnit: 'm2'})} style={{ flex: 1, textAlign: 'center', padding: '6px 0', cursor: 'pointer', borderRadius: 6, background: pdfPreferences.measureUnit === 'm2' ? '#fff' : 'transparent', fontWeight: pdfPreferences.measureUnit === 'm2' ? 'bold' : 'normal', color: pdfPreferences.measureUnit === 'm2' ? '#5C039B' : '#6b7280', boxShadow: pdfPreferences.measureUnit === 'm2' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>m²</div>
            </div>
          </div>

          <Divider />

          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>Display Settings</div>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Cover slide', 'Project description', 'Developer', 'Unit prices', 'Payment plans', 'Location'].map(item => (
              <Checkbox key={item} defaultChecked={pdfPreferences.slides.includes(item)} onChange={(e) => {
                    let newSlides = [...pdfPreferences.slides];
                    if(e.target.checked) { if(!newSlides.includes(item)) newSlides.push(item); } 
                    else { newSlides = newSlides.filter(s => s !== item); }
                    setPdfPreferences({...pdfPreferences, slides: newSlides});
                }}>{item}</Checkbox>
            ))}
          </div>

          <Divider />

          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>Personalised description</div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>Adapt the project description yourself or with the help of XOTO AI.</div>
          
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
            <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 'bold' }}>Description</Text>
            {isEditingDesc ? (
              <Input.TextArea rows={4} value={customDescription} onChange={(e) => setCustomDescription(e.target.value)} style={{ borderRadius: 8, marginBottom: 12, marginTop: 8 }} />
            ) : (
              <div style={{ maxHeight: 100, overflowY: 'auto', fontSize: 13, color: '#4b5563', marginBottom: 12, marginTop: 8 }}>{customDescription}</div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <Button style={{ flex: 1 }} icon={<EditOutlined />} onClick={() => setIsEditingDesc(!isEditingDesc)}>{isEditingDesc ? 'Save' : 'Edit'}</Button>
              {/* <Button type="primary" style={{ flex: 1, background: 'linear-gradient(90deg, #5C039B 0%, #a855f7 100%)', border: 'none' }} icon={<RobotOutlined />} loading={isImprovingAI} onClick={handleImproveWithAI}>Improve with AI</Button> */}
            <Button 
  type="primary" 
  style={{ flex: 1, background: 'linear-gradient(90deg, #5C039B 0%, #a855f7 100%)', border: 'none' }} 
  icon={<RobotOutlined />} 
  loading={isImprovingAI} // 👈 Ye loader spinner dikhayega
  onClick={handleImproveWithAI}
>
  Improve with AI
</Button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 15, marginTop: 24 }}>
            <Button size="large" icon={<EyeOutlined />} loading={isGenerating} onClick={() => handleGenerateOffer('view')} style={{ flex: 1, height: 50, borderRadius: 10, fontWeight: 'bold' }}>Preview</Button>
            {/* <Button size="large" icon={<ShareAltOutlined />} loading={isGenerating} onClick={() => handleGenerateOffer('link')} style={{ flex: 1, height: 50, borderRadius: 10, background: '#f3f4f6', fontWeight: 'bold' }}>Get Link</Button> */}
            <Button type="primary" size="large" icon={<DownloadOutlined />} loading={isGenerating} onClick={() => handleGenerateOffer('download')} style={{ flex: 1, height: 50, borderRadius: 10, background: '#1f1f1f', fontWeight: 'bold', color: '#fff' }}>Download</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}