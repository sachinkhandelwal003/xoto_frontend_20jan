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

// 🔥 PDF GENERATOR IMPORTS
import { pdf, Document, Page, Text as PdfText, View, Image as PdfImage, StyleSheet, Font } from '@react-pdf/renderer';

// 🛠️ FIX: BUFFER IS NOT DEFINED ERROR
import { Buffer } from 'buffer';
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

// 🛠️ FIX: TYPOGRAPHY COMPONENTS
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// 🔥 OPENAI API KEY FROM ENV
const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;

// 🔥 TRANSLATION FUNCTION USING OPENAI
const translateText = async (text, targetLang) => {
  if (targetLang === 'EN' || targetLang === 'English') return text;
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a professional real estate translator. Translate the following text to ${targetLang} language. Return ONLY the translated text, no explanations.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
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
      paymentPlanOption: "Payment Plan Option All options",
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

// 🔥 PROFESSIONAL LUXURY PDF STYLESHEET 🔥
const pdfStyles = StyleSheet.create({
  page: { 
    padding: 0, 
    backgroundColor: '#ffffff', 
    fontFamily: 'Helvetica',
    position: 'relative' 
  },

  // 🔥 GLOBAL HEADER & FOOTER FOR ALL PAGES 🔥
  globalHeader: {
    position: 'absolute', top: 15, right: 40, zIndex: 10
  },
  globalHeaderLogo: {
    width: 70, height: 25, objectFit: 'contain'
  },
  globalFooter: {
    position: 'absolute', bottom: 15, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: '#e5e5e5', paddingTop: 8, zIndex: 10
  },
  globalFooterText: {
    fontSize: 9, color: '#888', textTransform: 'uppercase', letterSpacing: 1
  },
  globalFooterBrand: {
    fontSize: 9, color: '#c9a05e', fontWeight: 'bold', letterSpacing: 1
  },

  // COVER PAGE 
  coverContainer: {
    height: '100%', position: 'relative', backgroundColor: '#000'
  },
  coverBackground: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.9
  },
  coverOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 2
  },
  coverContent: {
    position: 'relative', zIndex: 3, height: '100%', padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
  },
  
  // TOP BAR WITH LOGO, LINE AND DEVELOPER NAME
  coverTopBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10,
  },
  topLeftContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 15,
  },
  xotoLogoCover: {
    width: 80, height: 30, objectFit: 'contain'
  },
  verticalLine: {
    width: 1, height: 30, backgroundColor: '#c9a05e', marginHorizontal: 10,
  },
  developerNameCover: {
    fontSize: 16, fontWeight: 'bold', color: '#fff', textTransform: 'uppercase', letterSpacing: 1,
  },
  coverFoundText: {
    fontSize: 12, color: '#fff', textTransform: 'uppercase', letterSpacing: 2, opacity: 0.9
  },

  // CENTER TITLE SECTION
  coverCenterContent: {
    alignItems: 'center', marginTop: 'auto', marginBottom: 'auto',
  },
  coverPreTitle: {
    fontSize: 14, color: '#fff', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 15, opacity: 0.8
  },
  coverTitle: {
    fontSize: 56, fontWeight: 'bold', color: '#fff', textAlign: 'center', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 2
  },
  coverSubTitle: {
    fontSize: 24, color: '#fff', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 4, opacity: 0.9, marginBottom: 20,
  },
  coverDate: {
    fontSize: 11, color: '#fff', opacity: 0.6, marginTop: 10,
  },

  // BOTTOM AGENT BAR 
  coverBottomBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingBottom: 10,
  },
  bottomLeftSection: {
    flexDirection: 'row', alignItems: 'center', gap: 15,
  },
  agentCircleImg: {
    width: 65, height: 65, borderRadius: 32.5, objectFit: 'cover', borderWidth: 2, borderColor: '#c9a05e'
  },
  agentDetailsCol: {
    flexDirection: 'column',
  },
  agentNameCover: {
    fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 2,
  },
  agentRoleCover: {
    fontSize: 10, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4,
  },
  agentEmail: {
    fontSize: 10, color: 'rgba(255,255,255,0.9)', marginBottom: 2,
  },
  agentPhone: {
    fontSize: 10, color: 'rgba(255,255,255,0.9)',
  },
  bottomRightSection: {
    alignItems: 'flex-end', justifyContent: 'flex-end',
  },
  agentWebsite: {
    fontSize: 14, fontWeight: 'bold', color: '#c9a05e', textTransform: 'uppercase', letterSpacing: 1,
  },

  // PAGE 2 - PROJECT OVERVIEW
  page2Container: {
    flexDirection: 'row', height: '100%', backgroundColor: '#fff'
  },
  page2Left: {
    flex: 1, padding: 40, backgroundColor: '#faf9f7'
  },
  page2Right: {
    flex: 1, padding: 40
  },
  developerTag: {
    fontSize: 12, color: '#c9a05e', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 15, fontWeight: 'bold'
  },
  projectTitle: {
    fontSize: 36, fontWeight: 'bold', color: '#111', marginBottom: 30
  },
  infoCard: {
    backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 20, shadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 10
  },
  infoLabel: {
    fontSize: 11, color: '#888', textTransform: 'uppercase'
  },
  infoValue: {
    fontSize: 14, fontWeight: 'bold', color: '#111'
  },
  
  // LUXURY TABLE DESIGN
  tableContainer: {
    marginTop: 20, borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12, overflow: 'hidden'
  },
  tableHeader: {
    flexDirection: 'row', backgroundColor: '#111', padding: 15
  },
  tableHeaderCell: {
    flex: 1, fontSize: 10, fontWeight: 'bold', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5
  },
  tableRow: {
    flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', backgroundColor: '#fff'
  },
  tableCell: {
    flex: 1, fontSize: 11, color: '#444'
  },
  tableCellBold: {
    flex: 1, fontSize: 12, fontWeight: 'bold', color: '#c9a05e'
  },

  // PAGE 3 - DESCRIPTION WITH ELEGANT TYPOGRAPHY
  page3Image: {
    width: '100%', height: 250, objectFit: 'cover', marginBottom: 30
  },
  sectionTitle: {
    fontSize: 28, fontWeight: 'bold', color: '#111', marginBottom: 20, borderBottomWidth: 2, borderBottomColor: '#c9a05e', paddingBottom: 10
  },
  descriptionText: {
    fontSize: 11, lineHeight: 1.8, color: '#444', marginBottom: 20, textAlign: 'justify'
  },
  subHeading: {
    fontSize: 16, fontWeight: 'bold', color: '#111', marginTop: 20, marginBottom: 10
  },

  // PAGE 4 - ARCHITECTURE GRID
  archGrid: {
    flexDirection: 'row', gap: 2, height: '50%'
  },
  archImage: {
    flex: 1, height: '100%', objectFit: 'cover'
  },
  archFullImage: {
    width: '100%', height: '48%', objectFit: 'cover', marginTop: 2
  },

  // PAGE 5 - AMENITIES
  amenitiesContainer: {
    padding: 40
  },
  amenitiesGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginTop: 30, marginBottom: 40
  },
  amenityItem: {
    width: '30%', padding: 20, backgroundColor: '#f8f8f8', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#f0f0f0'
  },
  amenityText: {
    fontSize: 11, color: '#333', textAlign: 'center', fontWeight: '500'
  },
  amenitiesImage: {
    width: '100%', height: 350, objectFit: 'cover', borderRadius: 20
  },

  // PAGE 6 - MASTERPLAN (LOCATION)
  masterplanContainer: {
    padding: 40
  },
  masterplanImage: {
    width: '100%', height: 500, objectFit: 'cover', borderRadius: 16, marginTop: 10
  },

  // PAGE 7 - PAYMENT PLAN
  paymentContainer: {
    padding: 40
  },
  paymentCard: {
    backgroundColor: '#111', padding: 40, borderRadius: 20, marginTop: 30, marginBottom: 30
  },
  paymentRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  paymentLabel: {
    fontSize: 14, color: '#fff', textTransform: 'uppercase', letterSpacing: 1
  },
  paymentValue: {
    fontSize: 24, fontWeight: 'bold', color: '#c9a05e'
  },
  paymentTotal: {
    fontSize: 48, fontWeight: 'bold', color: '#c9a05e', textAlign: 'center', marginTop: 30
  },

  // PAGE 8-9 - UNITS SHOWCASE (NEW LIST UI)
  unitsContainer: { padding: 40 },
  unitListContainer: { marginTop: 20, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, overflow: 'hidden' },
  unitListRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', backgroundColor: '#fff' },
  unitListText: { fontSize: 12, color: '#374151' },
  unitListBold: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  unitListPrice: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  unitsImage: { width: '100%', height: 300, objectFit: 'cover', borderRadius: 20, marginTop: 40 },

  // PAGE 10 - DEVELOPER (WHITE BG, BIG LOGO)
  developerContainer: {
    padding: 40, backgroundColor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column'
  },
  developerTitle: {
    fontSize: 32, fontWeight: 'bold', color: '#111', marginBottom: 20, borderBottomWidth: 2, borderBottomColor: '#c9a05e', paddingBottom: 10, width: '100%'
  },
  developerLogoContainer: {
    width: '100%', height: '45%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 30, backgroundColor: '#faf9f7', borderRadius: 12
  },
  developerLogo: {
    width: '80%', height: '80%', objectFit: 'contain'
  },
  developerText: {
    fontSize: 12, lineHeight: 1.8, color: '#444', textAlign: 'justify', width: '100%'
  },
});

// 🔥 PROPERTY BROCHURE TEMPLATE 🔥
const PropertyBrochure = ({ property, preferences, agent, translations, currentLang }) => {
  const xotoLogo = getSafeUrl("https://xotostaging.s3.me-central-1.amazonaws.com/properties/1773403122746-image_109-removebg-preview.png");
  
  const gallery = property?.photos || [];
  const safeImages = gallery.length > 0 ? gallery.map(img => getSafeUrl(img)) : [getSafeUrl("")];
  const devName = property?.developer?.name || "PRESCOTT";
  const propertyName = property?.propertyName || "THE CADEN";

  const unitTypesArray = property?.unitType?.length > 0 ? property.unitType : ["1 Bedroom", "2 Bedrooms", "3 Bedrooms"];
  const fullAddress = `${property?.country || "AE"}, ${property?.city || "Dubai"}, ${property?.area || "Area"}`;
  
  const dynamicAmenities = property?.amenities?.length > 0 ? property.amenities : ["Infinity Pool", "Outdoor Gym", "BBQ Area", "Rooftop Terraces", "Co-working Space", "Water Lounges", "Cinema", "Club House", "Spa"];

  const t = (key) => translations[currentLang]?.[key] || translations.EN[key];

  const displayPrice = (basePrice) => {
    let p = Number(basePrice || 0);
    const rate = exchangeRates[preferences.currency] || 1;
    return Math.round(p * rate).toLocaleString();
  };

  const displayArea = (baseArea) => {
    let a = Number(baseArea || 0);
    if (preferences.measureUnit === 'm2') return Math.round(a / 10.7639);
    return Math.round(a);
  };

  const agentPhoto = getSafeUrl(agent?.photo);
  const slidesToShow = preferences.slides || [];
  const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.');

  // 🔥 SHARED HEADER & FOOTER COMPONENT FOR ALL INNER PAGES 🔥
  const HeaderFooter = () => (
    <>
      <View style={pdfStyles.globalHeader} fixed>
        <PdfImage src={xotoLogo} style={pdfStyles.globalHeaderLogo} />
      </View>
      <View style={pdfStyles.globalFooter} fixed>
        <PdfText style={pdfStyles.globalFooterText}>{propertyName}</PdfText>
        <PdfText style={pdfStyles.globalFooterBrand}>XOTO.AE</PdfText>
      </View>
    </>
  );

  return (
    <Document>
      {/* PAGE 1: COVER */}
      {slidesToShow.includes('Cover slide') && (
        <Page size="A4" style={pdfStyles.coverContainer}>
          <PdfImage src={safeImages[0]} style={pdfStyles.coverBackground} />
          <View style={pdfStyles.coverOverlay} />
          
          <View style={pdfStyles.coverContent}>
            <View style={pdfStyles.coverTopBar}>
              <View style={pdfStyles.topLeftContainer}>
                <PdfImage src={xotoLogo} style={pdfStyles.xotoLogoCover} />
                <View style={pdfStyles.verticalLine} />
                <PdfText style={pdfStyles.developerNameCover}>{devName}</PdfText>
              </View>
              <PdfText style={pdfStyles.coverFoundText}>{t('lookWhatWeFound')}</PdfText>
            </View>

            <View style={pdfStyles.coverCenterContent}>
              <PdfText style={pdfStyles.coverPreTitle}>PRESENTING</PdfText>
              <PdfText style={pdfStyles.coverTitle}>{propertyName}</PdfText>
              <PdfText style={pdfStyles.coverSubTitle}>BY {devName}</PdfText>
              <PdfText style={pdfStyles.coverDate}>{t('dateOfCreation')} {currentDate}</PdfText>
            </View>

            <View style={pdfStyles.coverBottomBar}>
              <View style={pdfStyles.bottomLeftSection}>
                <PdfImage src={agentPhoto} style={pdfStyles.agentCircleImg} />
                <View style={pdfStyles.agentDetailsCol}>
                  <PdfText style={pdfStyles.agentNameCover}>{agent?.name || "AyuSh Rajpalani"}</PdfText>
                  <PdfText style={pdfStyles.agentRoleCover}>{t('advisor')}</PdfText>
                  <PdfText style={pdfStyles.agentEmail}>{agent?.email || "ayush2222@yopmail.com"}</PdfText>
                  <PdfText style={pdfStyles.agentPhone}>{agent?.phone || "+971503747474"}</PdfText>
                </View>
              </View>
              <View style={pdfStyles.bottomRightSection}>
                <PdfText style={pdfStyles.agentWebsite}>XOTO.AE</PdfText>
              </View>
            </View>
          </View>
        </Page>
      )}

      {/* PAGE 2: PROJECT OVERVIEW */}
      {slidesToShow.includes('Project description') && (
        <Page size="A4" style={pdfStyles.page}>
          <HeaderFooter />
          <View style={pdfStyles.page2Container}>
            <View style={pdfStyles.page2Left}>
              <PdfText style={pdfStyles.developerTag}>DEVELOPER</PdfText>
              <PdfText style={pdfStyles.projectTitle}>{devName}</PdfText>
              
              <View style={pdfStyles.infoCard}>
                <View style={pdfStyles.infoRow}>
                  <PdfText style={pdfStyles.infoLabel}>Handover Status</PdfText>
                  <PdfText style={pdfStyles.infoValue}>{property?.handover || "TBA"}</PdfText>
                </View>
              </View>

              <PdfImage src={safeImages[1] || safeImages[0]} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 12 }} />
            </View>

            <View style={pdfStyles.page2Right}>
              <View style={pdfStyles.tableContainer}>
                <View style={pdfStyles.tableHeader}>
                  <PdfText style={pdfStyles.tableHeaderCell}>Unit Type</PdfText>
                  <PdfText style={pdfStyles.tableHeaderCell}>Bedrooms</PdfText>
                  <PdfText style={pdfStyles.tableHeaderCell}>Amount</PdfText>
                  <PdfText style={pdfStyles.tableHeaderCell}>Area (m²)</PdfText>
                  <PdfText style={pdfStyles.tableHeaderCell}>Price From</PdfText>
                </View>
                <View style={pdfStyles.tableRow}>
                  <PdfText style={pdfStyles.tableCell}>Apartments</PdfText>
                  <PdfText style={pdfStyles.tableCell}>1 Bedroom</PdfText>
                  <PdfText style={pdfStyles.tableCell}>19/32</PdfText>
                  <PdfText style={pdfStyles.tableCell}>72-79</PdfText>
                  <PdfText style={pdfStyles.tableCellBold}>{preferences.currency} 1,800,000</PdfText>
                </View>
                <View style={pdfStyles.tableRow}>
                  <PdfText style={pdfStyles.tableCell}>Apartments</PdfText>
                  <PdfText style={pdfStyles.tableCell}>2 Bedrooms</PdfText>
                  <PdfText style={pdfStyles.tableCell}>2/8</PdfText>
                  <PdfText style={pdfStyles.tableCell}>113-129</PdfText>
                  <PdfText style={pdfStyles.tableCellBold}>{preferences.currency} 2,845,000</PdfText>
                </View>
                <View style={[pdfStyles.tableRow, { borderBottomWidth: 0 }]}>
                  <PdfText style={pdfStyles.tableCell}>Apartments</PdfText>
                  <PdfText style={pdfStyles.tableCell}>3 Bedrooms</PdfText>
                  <PdfText style={pdfStyles.tableCell}>6/9</PdfText>
                  <PdfText style={pdfStyles.tableCell}>188-197</PdfText>
                  <PdfText style={pdfStyles.tableCellBold}>{preferences.currency} 4,241,000</PdfText>
                </View>
              </View>
            </View>
          </View>
        </Page>
      )}

      {/* PAGE 3: DESCRIPTION */}
      {slidesToShow.includes('Project description') && (
        <Page size="A4" style={pdfStyles.page}>
          <HeaderFooter />
          <View style={{ padding: 40 }}>
            <PdfText style={pdfStyles.sectionTitle}>Description</PdfText>
            
            <PdfText style={pdfStyles.subHeading}>Project General Facts</PdfText>
            <PdfText style={pdfStyles.descriptionText}>
              {property?.description || "Detailed description for this property is not available yet."}
            </PdfText>
            
            <PdfImage src={safeImages[2] || safeImages[1]} style={pdfStyles.page3Image} />
            
            <PdfText style={pdfStyles.subHeading}>Finishing and Materials</PdfText>
            <PdfText style={pdfStyles.descriptionText}>
              Modern finishing with high-quality materials. Fully fitted kitchens with premium appliances and smart home automation.
            </PdfText>
          </View>
        </Page>
      )}

      {/* PAGE 4: ARCHITECTURE (Added padding to accommodate header/footer) */}
      {(safeImages.length > 3 && slidesToShow.includes('Project description')) && (
        <Page size="A4" style={[pdfStyles.page, { padding: 40 }]}>
          <HeaderFooter />
          <View style={pdfStyles.archGrid}>
            <PdfImage src={safeImages[3]} style={pdfStyles.archImage} />
            <PdfImage src={safeImages[4] || safeImages[3]} style={pdfStyles.archImage} />
          </View>
          <PdfImage src={safeImages[5] || safeImages[0]} style={pdfStyles.archFullImage} />
        </Page>
      )}

      {/* PAGE 5: FEATURES & AMENITIES */}
      {slidesToShow.includes('Location') && (
        <Page size="A4" style={pdfStyles.page}>
          <HeaderFooter />
          <View style={pdfStyles.amenitiesContainer}>
            <PdfText style={pdfStyles.sectionTitle}>Features & Amenities</PdfText>
            <View style={pdfStyles.amenitiesGrid}>
              {dynamicAmenities.slice(0, 9).map((item, i) => (
                <View key={i} style={pdfStyles.amenityItem}>
                  <PdfText style={pdfStyles.amenityText}>{item}</PdfText>
                </View>
              ))}
            </View>
            <PdfImage src={safeImages[6] || safeImages[0]} style={pdfStyles.amenitiesImage} />
          </View>
        </Page>
      )}

      {/* PAGE 6: MASTERPLAN / LOCATION */}
      {slidesToShow.includes('Location') && (
        <Page size="A4" style={pdfStyles.page}>
          <HeaderFooter />
          <View style={pdfStyles.masterplanContainer}>
            <PdfText style={pdfStyles.sectionTitle}>Location</PdfText>
            <PdfText style={{ fontSize: 16, color: '#374151', fontWeight: 'bold', marginBottom: 20 }}>📍 {fullAddress}</PdfText>
            <PdfImage src={safeImages[7] || safeImages[0]} style={pdfStyles.masterplanImage} />
          </View>
        </Page>
      )}

      {/* PAGE 7: PAYMENT PLAN */}
      {slidesToShow.includes('Payment plans') && (
        <Page size="A4" style={pdfStyles.page}>
          <HeaderFooter />
          <View style={pdfStyles.paymentContainer}>
            <PdfText style={pdfStyles.sectionTitle}>Payment Plan</PdfText>
            <View style={pdfStyles.paymentCard}>
              <View style={pdfStyles.paymentRow}>
                <PdfText style={pdfStyles.paymentLabel}>On Booking</PdfText>
                <PdfText style={pdfStyles.paymentValue}>20%</PdfText>
              </View>
              <View style={pdfStyles.paymentRow}>
                <PdfText style={pdfStyles.paymentLabel}>During Construction</PdfText>
                <PdfText style={pdfStyles.paymentValue}>40%</PdfText>
              </View>
              <View style={[pdfStyles.paymentRow, { borderBottomWidth: 0 }]}>
                <PdfText style={pdfStyles.paymentLabel}>Upon Handover</PdfText>
                <PdfText style={pdfStyles.paymentValue}>40%</PdfText>
              </View>
            </View>
            <PdfText style={pdfStyles.paymentTotal}>20/40/40%</PdfText>
          </View>
        </Page>
      )}

      {/* PAGE 8: TYPICAL UNITS */}
      {slidesToShow.includes('Unit prices') && (
        <Page size="A4" style={pdfStyles.page}>
          <HeaderFooter />
          <View style={pdfStyles.unitsContainer}>
            <PdfText style={pdfStyles.sectionTitle}>Units & Availability</PdfText>

            <View style={pdfStyles.unitListContainer}>
              {unitTypesArray.map((unit, index, arr) => (
                <View style={[pdfStyles.unitListRow, index === arr.length - 1 ? { borderBottomWidth: 0 } : {}]} key={index}>
                  <View style={{ flex: 1.5 }}><PdfText style={pdfStyles.unitListBold}>{unit}</PdfText></View>
                  <View style={{ flex: 1 }}><PdfText style={pdfStyles.unitListText}>1 Unit</PdfText></View>
                  <View style={{ flex: 1.5 }}><PdfText style={pdfStyles.unitListText}>{property?.builtUpArea_min ? displayArea(property.builtUpArea_min) : "TBA"} {preferences.measureUnit}</PdfText></View>
                  <View style={{ flex: 1.5, alignItems: 'flex-end' }}><PdfText style={pdfStyles.unitListPrice}>{preferences.currency} {displayPrice(property?.price_min || property?.price)}</PdfText></View>
                </View>
              ))}
            </View>

            <PdfImage src={safeImages[8] || safeImages[0]} style={pdfStyles.unitsImage} />
          </View>
        </Page>
      )}

      {/* PAGE 9: DEVELOPER */}
      {slidesToShow.includes('Developer') && (
        <Page size="A4" style={pdfStyles.page}>
          <HeaderFooter />
          <View style={pdfStyles.developerContainer}>
            <PdfText style={pdfStyles.developerTitle}>The Developer</PdfText>
            
            {property?.developer?.logo && (
              <View style={pdfStyles.developerLogoContainer}>
                <PdfImage src={getSafeUrl(property.developer.logo)} style={pdfStyles.developerLogo} />
              </View>
            )}

            <PdfText style={pdfStyles.developerText}>
              {property?.about_developer || property?.developer?.description || `At ${devName}, they don't just build structures; they craft modern lifestyles. Their team of experts is dedicated to pushing the boundaries of design, integrating the latest technologies to create spaces that adapt to the needs of tomorrow. Driven by a commitment to sustainability, they infuse eco-conscious practices into every aspect of their development process, ensuring a greener, more sustainable future for generations to come.`}
            </PdfText>
          </View>
        </Page>
      )}
    </Document>
  );
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

  useEffect(() => {
    if (pdfPreferences.language !== currentLang) {
      translateAll(pdfPreferences.language);
    }
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

  const handleImproveWithAI = async () => {
    if (!customDescription || customDescription.trim() === "") {
      message.warning("Please enter some description first!");
      return;
    }

    setIsImprovingAI(true);
    message.loading({ content: "XOTO AI is enhancing the description...", key: "ai_load" });

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY;

      if (!apiKey) {
        throw new Error("API Key nahi mili! Please check your .env file.");
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo", 
          messages: [
            {
              role: "system",
              content: "You are an expert luxury real estate copywriter. Improve the following property description to make it highly appealing, professional, and persuasive for high-net-worth buyers. Make it sound premium but keep it factual based on the provided text. Return ONLY the improved description paragraph, without any extra conversation, quotes, or formatting."
            },
            {
              role: "user",
              content: customDescription 
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        console.error("OpenAI Error Details:", errData);
        throw new Error(errData.error?.message || `API fail ho gayi (Error code: ${response.status})`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        const improvedText = data.choices[0].message.content;
        
        setCustomDescription(improvedText);
        message.success({ content: "Description perfectly enhanced!", key: "ai_load", duration: 2 });
      } else {
        throw new Error("OpenAI se response nahi aaya");
      }
    } catch (error) {
      console.error("AI Improvement error:", error);
      message.error({ content: "AI Error: " + error.message, key: "ai_load", duration: 5 });
    } finally {
      setIsImprovingAI(false); 
    }
  };

  const handleGenerateOffer = async (actionType = 'download') => { 
    setIsGenerating(true);
    const key = "updatable";
    
    const langMap = { HI: 'Hindi', AR: 'Arabic', RU: 'Russian', ZH: 'Chinese', FA: 'Persian', EN: 'English' };
    const targetLang = langMap[pdfPreferences.language] || 'English';

    if (targetLang !== 'English') {
      message.loading({ content: `Translating content to ${targetLang}...`, key });
    } else {
      message.loading({ content: actionType === 'view' ? "Opening Preview..." : "Generating PDF...", key });
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
      
      const blob = await pdf(
        <PropertyBrochure 
          property={updatedProperty} 
          agent={agentInfo} 
          preferences={pdfPreferences}
          translations={currentTranslations} 
          currentLang={activeLang}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      
      if (actionType === 'view') {
        window.open(url, '_blank'); 
        message.success({ content: "Preview opened in new tab!", key });
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${updatedProperty.propertyName || 'Sales_Offer'}.pdf`;
        link.click();
        message.success({ content: "PDF Downloaded Successfully!", key });
        setIsOfferModalOpen(false);
      }
      
      setTimeout(() => URL.revokeObjectURL(url), 5000); 

    } catch (error) {
      console.error("PDF Crash Error: ", error);
      message.error({ content: "Failed to generate PDF.", key });
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

  const languages = [ { code: 'EN', name: 'English' }, { code: 'HI', name: 'Hindi' }, { code: 'AR', name: 'Arabic' }, { code: 'RU', name: 'Russian' }, { code: 'ZH', name: 'Chinese' }, { code: 'FA', name: 'Persian' } ];
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

          {/* AMENITIES PROPER BOX UI */}
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

          {/* UNITS & AVAILABILITY - NEW UI BLOCK */}
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

          {/* LOCATION MAP - NEW UI BLOCK */}
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
                src={`https://maps.google.com/maps?q=${encodeURIComponent((property?.propertyName || '') + ' ' + (property?.area || '') + ' ' + (property?.city || ''))}&t=k&z=15&ie=UTF8&iwloc=&output=embed`}
              ></iframe>
          </div>

        </Col>

        {/* ORIGINAL RIGHT SIDE COLUMN (UNCHANGED) */}
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
              <Button type="primary" style={{ flex: 1, background: 'linear-gradient(90deg, #5C039B 0%, #a855f7 100%)', border: 'none' }} icon={<RobotOutlined />} loading={isImprovingAI} onClick={handleImproveWithAI}>Improve with AI</Button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 15, marginTop: 24 }}>
            <Button size="large" icon={<EyeOutlined />} loading={isGenerating} onClick={() => handleGenerateOffer('view')} style={{ flex: 1, height: 50, borderRadius: 10, fontWeight: 'bold' }}>Preview</Button>
            <Button type="primary" size="large" icon={<DownloadOutlined />} loading={isGenerating} onClick={() => handleGenerateOffer('download')} style={{ flex: 1, height: 50, borderRadius: 10, background: '#1f1f1f', fontWeight: 'bold', color: '#fff' }}>Download</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}