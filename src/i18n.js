import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";


/* =========================
   AR - Arabic
========================= */
import arcontact4 from "./locales/ar/contact4.json";
import arcontact1 from "./locales/ar/contact1.json";
import arcontact3 from "./locales/ar/contact3.json";
import arcontact from "./locales/ar/contact.json";
import arCommon from "./locales/ar/common.json";
import arhome from "./locales/ar/home.json";
import arhome1 from "./locales/ar/home1.json";
import arhome2 from "./locales/ar/home2.json";
import arhome3 from "./locales/ar/home3.json";
import arhome4 from "./locales/ar/home4.json";
import arhome5 from "./locales/ar/home5.json";
import arfooter from "./locales/ar/footer.json";
import arInterior1 from "./locales/ar/interior1.json";
import arInterior2 from "./locales/ar/interior2.json";
import arInterior3 from "./locales/ar/interior3.json";
import arInterior4 from "./locales/ar/interior4.json";
import arInterior7 from "./locales/ar/interior7.json";
import arbook from "./locales/ar/book.json";


import arbuy1 from "./locales/Ar/buy1.json";
import arbuy2 from "./locales/Ar/buy2.json";
import arbuy3 from "./locales/Ar/buy3.json";
import arbuy4 from "./locales/Ar/buy4.json";
import arbuy5 from "./locales/Ar/buy5.json";
import arbuy6 from "./locales/Ar/buy6.json";
import arbuy7 from "./locales/Ar/buy7.json";
import ararticle1 from "./locales/ar/article1.json";
import ararticle2 from "./locales/Ar/article2.json";
import ararticle3 from "./locales/Ar/article3.json";
import ararticle4 from "./locales/Ar/article4.json";
import ararticle5 from "./locales/Ar/article5.json";
import arlandhero from "./locales/Ar/landhero.json";
import arinteractive from "./locales/Ar/interactive.json";
import arconsultation from "./locales/Ar/consultation.json";
import arscape2 from "./locales/Ar/scape2.json";
import arscape1 from "./locales/Ar/scape1.json";
import arinterior5 from "./locales/Ar/interior5.json";
import arinterior6 from "./locales/Ar/interior6.json";
import arpage3 from "./locales/Ar/page3.json";
import arecosystem from "./locales/Ar/ecosystem.json";
import arwhypartner from "./locales/Ar/whyPartner.json";
import arstakeholders from "./locales/Ar/stakeholders.json";
import arpartnerForm from "./locales/Ar/partnerForm.json";
import arbuiltForEveryone from "./locales/Ar/builtForEveryone.json";
import arCta from "./locales/Ar/cta.json";

import arMort1 from "./locales/ar/mort1.json";
import arMort2 from "./locales/ar/mort2.json";
import arMort3 from "./locales/ar/mort3.json";
import arMort6 from "./locales/ar/mort6.json";
import arEcommerce from "./locales/ar/ecommerce.json";


/* =========================
   EN - English
========================= */
import encontact4 from "./locales/en/contact4.json";
import encontact1 from "./locales/en/contact1.json";
import encontact3 from "./locales/en/contact3.json";
import encontact from "./locales/en/contact.json";
import enCommon from "./locales/en/common.json";
import enHome from "./locales/en/home.json";
import enHome1 from "./locales/en/home1.json";
import enHome2 from "./locales/en/home2.json";
import enHome3 from "./locales/en/home3.json";
import enHome4 from "./locales/en/home4.json";
import enHome5 from "./locales/en/home5.json";
import enFooter from "./locales/en/footer.json";
import enInterior1 from "./locales/en/interior1.json";
import enInterior2 from "./locales/en/interior2.json";
import enInterior3 from "./locales/en/interior3.json";
import enInterior4 from "./locales/en/interior4.json";
import enInterior5 from "./locales/en/interior5.json";
import enInterior6 from "./locales/en/interior6.json";
import enInterior7 from "./locales/en/interior7.json";
import enScape1 from "./locales/en/scape1.json";
import enScape2 from "./locales/en/scape2.json";
import enbuy1 from "./locales/en/buy1.json";
import enbuy2 from "./locales/en/buy2.json";
import enbuy3 from "./locales/en/buy3.json";
import enbuy4 from "./locales/en/buy4.json";
import enbuy5 from "./locales/en/buy5.json";
import enbuy6 from "./locales/en/buy6.json";
import enbuy7 from "./locales/en/buy7.json";
import enpage3 from "./locales/en/page3.json";
import enecosystem from "./locales/en/ecosystem.json";
import enwhyPartner from "./locales/en/whyPartner.json";
import enstakeholders from "./locales/en/stakeholders.json";
import enpartnerForm from "./locales/en/partnerForm.json";
import enbuiltForEveryone from "./locales/en/builtForEveryone.json";
import enCta from "./locales/en/cta.json";
import enMort1 from "./locales/en/mort1.json";
import enMort2 from "./locales/en/mort2.json";
import enMort3 from "./locales/en/mort3.json";
import enMort6 from "./locales/en/mort6.json";
import enbook from "./locales/en/book.json";
import enlandhero from "./locales/en/landhero.json";
import enconsultation from "./locales/en/consultation.json";
import enarticle1 from "./locales/en/article1.json";
import enarticle2 from "./locales/en/article2.json";
import enarticle3 from "./locales/en/article3.json";
import enarticle4 from "./locales/en/article4.json";
import enarticle5 from "./locales/en/article5.json";
import eninteractive from "./locales/en/interactive.json";
import en from "./locales/en/ecommerce.json";

/* =========================
   HI - Hindi
========================= */
import hicontact4 from "./locales/hi/contact4.json";
import hicontact1 from "./locales/hi/contact1.json";
import hicontact3 from "./locales/hi/contact3.json";
import hicontact from "./locales/hi/contact.json";
import hiCommon from "./locales/hi/common.json";
import hiHome from "./locales/hi/home.json";
import hiHome1 from "./locales/hi/home1.json";
import hiHome2 from "./locales/hi/home2.json";
import hiHome3 from "./locales/hi/home3.json";
import hiHome4 from "./locales/hi/home4.json";
import hiHome5 from "./locales/hi/home5.json";
import hiFooter from "./locales/hi/footer.json";
import hiInterior1 from "./locales/hi/interior1.json";
import hiInterior2 from "./locales/hi/interior2.json";
import hiInterior3 from "./locales/hi/interior3.json";
import hiInterior4 from "./locales/hi/interior4.json";
import hiInterior5 from "./locales/hi/interior5.json";
import hiInterior6 from "./locales/hi/interior6.json";
import hiInterior7 from "./locales/hi/interior7.json";
import hiScape1 from "./locales/hi/scape1.json";
import hiScape2 from "./locales/hi/scape2.json";
import hibuy1 from "./locales/hi/buy1.json";
import hibuy2 from "./locales/hi/buy2.json";
import hibuy3 from "./locales/hi/buy3.json";
import hibuy4 from "./locales/hi/buy4.json";
import hibuy5 from "./locales/hi/buy5.json";
import hibuy6 from "./locales/hi/buy6.json";
import hibuy7 from "./locales/hi/buy7.json";
import hipage3 from "./locales/hi/page3.json";
import hiecosystem from "./locales/hi/ecosystem.json";
import hiwhyPartner from "./locales/hi/whyPartner.json";
import histakeholders from "./locales/hi/stakeholders.json";
import hipartnerForm from "./locales/hi/partnerForm.json";
import hibuiltForEveryone from "./locales/hi/builtForEveryone.json";
import hiCta from "./locales/hi/cta.json";
import hiMort1 from "./locales/hi/mort1.json";
import hiMort2 from "./locales/hi/mort2.json";
import hiMort3 from "./locales/hi/mort3.json";
import hiMort6 from "./locales/hi/mort6.json";
import hibook from "./locales/hi/book.json";
import hiconsultation from "./locales/hi/consultation.json";
import hiarticle1 from "./locales/hi/article1.json";
import hiarticle2 from "./locales/hi/article2.json";
import hiarticle3 from "./locales/hi/article3.json";
import hiarticle4 from "./locales/hi/article4.json";
import hiarticle5 from "./locales/hi/article5.json";
import hilandhero from "./locales/hi/landhero.json";
import hiinteractive from "./locales/hi/interactive.json";
import hi from "./locales/hi/ecommerce.json";

/* =========================
   DE - German
========================= */
import decontact4 from "./locales/de/contact4.json";
import decontact1 from "./locales/de/contact1.json";
import decontact3 from "./locales/de/contact3.json";
import decontact from "./locales/de/contact.json";
import deCommon from "./locales/de/common.json";
import deHome from "./locales/de/home.json";
import deHome1 from "./locales/de/home1.json";
import deHome2 from "./locales/de/home2.json";
import deHome3 from "./locales/de/home3.json";
import deHome4 from "./locales/de/home4.json";
import deHome5 from "./locales/de/home5.json";
import deFooter from "./locales/de/footer.json";
import deInterior1 from "./locales/de/interior1.json";
import deInterior2 from "./locales/de/interior2.json";
import deInterior3 from "./locales/de/interior3.json";
import deInterior4 from "./locales/de/interior4.json";
import deInterior5 from "./locales/de/interior5.json";
import deInterior6 from "./locales/de/interior6.json";
import deInterior7 from "./locales/de/interior7.json";
import deScape1 from "./locales/de/scape1.json";
import deScape2 from "./locales/de/scape2.json";
import debuy1 from "./locales/de/buy1.json";
import debuy2 from "./locales/de/buy2.json";
import debuy3 from "./locales/de/buy3.json";
import debuy4 from "./locales/de/buy4.json";
import debuy5 from "./locales/de/buy5.json";
import debuy6 from "./locales/de/buy6.json";
import debuy7 from "./locales/de/buy7.json";
import depage3 from "./locales/de/page3.json";
import deecosystem from "./locales/de/ecosystem.json";
import dewhyPartner from "./locales/de/whyPartner.json";
import destakeholders from "./locales/de/stakeholders.json";
import departnerForm from "./locales/de/partnerForm.json";
import debuiltForEveryone from "./locales/de/builtForEveryone.json";
import deCta from "./locales/de/cta.json";
import deMort1 from "./locales/de/mort1.json";
import deMort2 from "./locales/de/mort2.json";
import deMort3 from "./locales/de/mort3.json";
import deMort6 from "./locales/de/mort6.json";
import debook from "./locales/de/book.json";
import deconsultation from "./locales/de/consultation.json";
import dearticle1 from "./locales/de/article1.json";
import dearticle2 from "./locales/de/article2.json";
import dearticle3 from "./locales/de/article3.json";
import dearticle4 from "./locales/de/article4.json";
import dearticle5 from "./locales/de/article5.json";
import delandhero from "./locales/de/landhero.json";
import deinteractive from "./locales/de/interactive.json";
import de from "./locales/de/ecommerce.json";


/* =========================
   ES - Spanish
========================= */
import escontact4 from "./locales/es/contact4.json";
import escontact3 from "./locales/es/contact3.json";
import escontact1 from "./locales/es/contact1.json";
import escontact from "./locales/es/contact.json";
import esCommon from "./locales/es/common.json";
import esHome from "./locales/es/home.json";
import esHome1 from "./locales/es/home1.json";
import esHome2 from "./locales/es/home2.json";
import esHome3 from "./locales/es/home3.json";
import esHome4 from "./locales/es/home4.json";
import esHome5 from "./locales/es/home5.json";
import esFooter from "./locales/es/footer.json";
import esInterior1 from "./locales/es/interior1.json";
import esInterior2 from "./locales/es/interior2.json";
import esInterior3 from "./locales/es/interior3.json";
import esInterior4 from "./locales/es/interior4.json";
import esInterior5 from "./locales/es/interior5.json";
import esInterior6 from "./locales/es/interior6.json";
import esInterior7 from "./locales/es/interior7.json";
import esScape1 from "./locales/es/scape1.json";
import esScape2 from "./locales/es/scape2.json";
import esbuy1 from "./locales/es/buy1.json";
import esbuy2 from "./locales/es/buy2.json";
import esbuy3 from "./locales/es/buy3.json";
import esbuy4 from "./locales/es/buy4.json";
import esbuy5 from "./locales/es/buy5.json";
import esbuy6 from "./locales/es/buy6.json";
import esbuy7 from "./locales/es/buy7.json";
import espage3 from "./locales/es/page3.json";
import esecosystem from "./locales/es/ecosystem.json";
import eswhyPartner from "./locales/es/whyPartner.json";
import esstakeholders from "./locales/es/stakeholders.json";
import espartnerForm from "./locales/es/partnerForm.json";
import esbuiltForEveryone from "./locales/es/builtForEveryone.json";
import esCta from "./locales/es/cta.json";
import esMort1 from "./locales/es/mort1.json";
import esMort2 from "./locales/es/mort2.json";
import esMort3 from "./locales/es/mort3.json";
import esMort6 from "./locales/es/mort6.json";
import esbook from "./locales/es/book.json";
import esconsultation from "./locales/es/consultation.json";
import esarticle1 from "./locales/es/article1.json";
import esarticle2 from "./locales/es/article2.json";
import esarticle3 from "./locales/es/article3.json";
import esarticle4 from "./locales/es/article4.json";
import esarticle5 from "./locales/es/article5.json";
import eslandhero from "./locales/es/landhero.json";
import esinteractive from "./locales/es/interactive.json";
import es from "./locales/es/ecommerce.json";


/* =========================
   FR - French
========================= */
import frcontact4 from "./locales/fr/contact4.json";
import frcontact3 from "./locales/fr/contact3.json";
import frcontact1 from "./locales/fr/contact1.json";
import frcontact from "./locales/fr/contact.json";
import frCommon from "./locales/fr/common.json";
import frHome from "./locales/fr/home.json";
import frHome1 from "./locales/fr/home1.json";
import frHome2 from "./locales/fr/home2.json";
import frHome3 from "./locales/fr/home3.json";
import frHome4 from "./locales/fr/home4.json";
import frHome5 from "./locales/fr/home5.json";
import frFooter from "./locales/fr/footer.json";
import frInterior1 from "./locales/fr/interior1.json";
import frInterior2 from "./locales/fr/interior2.json";
import frInterior3 from "./locales/fr/interior3.json";
import frInterior4 from "./locales/fr/interior4.json";
import frInterior5 from "./locales/fr/interior5.json";
import frInterior6 from "./locales/fr/interior6.json";
import frInterior7 from "./locales/fr/interior7.json";
import frScape1 from "./locales/fr/scape1.json";
import frScape2 from "./locales/fr/scape2.json";
import frbuy1 from "./locales/fr/buy1.json";
import frbuy2 from "./locales/fr/buy2.json";
import frbuy3 from "./locales/fr/buy3.json";
import frbuy4 from "./locales/fr/buy4.json";
import frbuy5 from "./locales/fr/buy5.json";
import frbuy6 from "./locales/fr/buy6.json";
import frbuy7 from "./locales/fr/buy7.json";
import frpage3 from "./locales/fr/page3.json";
import frecosystem from "./locales/fr/ecosystem.json";
import frwhyPartner from "./locales/fr/whyPartner.json";
import frstakeholders from "./locales/fr/stakeholders.json";
import frpartnerForm from "./locales/fr/partnerForm.json";
import frbuiltForEveryone from "./locales/fr/builtForEveryone.json";
import frCta from "./locales/fr/cta.json";
import frMort1 from "./locales/fr/mort1.json";
import frMort2 from "./locales/fr/mort2.json";
import frMort3 from "./locales/fr/mort3.json";
import frMort6 from "./locales/fr/mort6.json";
import frbook from "./locales/fr/book.json";
import frconsultation from "./locales/fr/consultation.json";
import frarticle1 from "./locales/fr/article1.json";
import frarticle2 from "./locales/fr/article2.json";
import frarticle3 from "./locales/fr/article3.json";
import frarticle4 from "./locales/fr/article4.json";
import frarticle5 from "./locales/fr/article5.json";
import frlandhero from "./locales/fr/landhero.json";
import frinteractive from "./locales/fr/interactive.json";
import fr from "./locales/fr/ecommerce.json";


/* =========================
   RU - Russian
========================= */
import rucontact1 from "./locales/ru/contact1.json";
import rucontact4 from "./locales/ru/contact4.json";
import rucontact3 from "./locales/ru/contact3.json";
import rucontact from "./locales/ru/contact.json";
import ruCommon from "./locales/ru/common.json";
import ruHome from "./locales/ru/home.json";
import ruHome1 from "./locales/ru/home1.json";
import ruHome2 from "./locales/ru/home2.json";
import ruHome3 from "./locales/ru/home3.json";
import ruHome4 from "./locales/ru/home4.json";
import ruHome5 from "./locales/ru/home5.json";
import ruFooter from "./locales/ru/footer.json";
import ruInterior1 from "./locales/ru/interior1.json";
import ruInterior2 from "./locales/ru/interior2.json";
import ruInterior3 from "./locales/ru/interior3.json";
import ruInterior4 from "./locales/ru/interior4.json";
import ruInterior5 from "./locales/ru/interior5.json";
import ruInterior6 from "./locales/ru/interior6.json";
import ruInterior7 from "./locales/ru/interior7.json";
import ruScape1 from "./locales/ru/scape1.json";
import ruScape2 from "./locales/ru/scape2.json";
import rubuy1 from "./locales/ru/buy1.json";
import rubuy2 from "./locales/ru/buy2.json";
import rubuy3 from "./locales/ru/buy3.json";
import rubuy4 from "./locales/ru/buy4.json";
import rubuy5 from "./locales/ru/buy5.json";
import rubuy6 from "./locales/ru/buy6.json";
import rubuy7 from "./locales/ru/buy7.json";
import rupage3 from "./locales/ru/page3.json";
import ruecosystem from "./locales/ru/ecosystem.json";
import ruwhyPartner from "./locales/ru/whyPartner.json";
import rustakeholders from "./locales/ru/stakeholders.json";
import rupartnerForm from "./locales/ru/partnerForm.json";
import rubuiltForEveryone from "./locales/ru/builtForEveryone.json";
import ruCta from "./locales/ru/cta.json";
import ruMort1 from "./locales/ru/mort1.json";
import ruMort2 from "./locales/ru/mort2.json";
import ruMort3 from "./locales/ru/mort3.json";
import ruMort6 from "./locales/ru/mort6.json";
import rubook from "./locales/ru/book.json";
import ruconsultation from "./locales/ru/consultation.json";
import ruarticle1 from "./locales/ru/article1.json";
import ruarticle2 from "./locales/ru/article2.json";
import ruarticle3 from "./locales/ru/article3.json";
import ruarticle4 from "./locales/ru/article4.json";
import ruarticle5 from "./locales/ru/article5.json";
import rulandhero from "./locales/ru/landhero.json";
import ruinteractive from "./locales/ru/interactive.json";
import ru from "./locales/ru/ecommerce.json";


/* =========================
   TR - Turkish
========================= */
import trcontact4 from "./locales/tr/contact4.json";
import trcontact1 from "./locales/tr/contact1.json";
import trcontact from "./locales/tr/contact.json";
import trcontact3 from "./locales/tr/contact3.json";
import trCommon from "./locales/tr/common.json";
import trHome from "./locales/tr/home.json";
import trHome1 from "./locales/tr/home1.json";
import trHome2 from "./locales/tr/home2.json";
import trHome3 from "./locales/tr/home3.json";
import trHome4 from "./locales/tr/home4.json";
import trHome5 from "./locales/tr/home5.json";
import trFooter from "./locales/tr/footer.json";
import trInterior1 from "./locales/tr/interior1.json";
import trInterior2 from "./locales/tr/interior2.json";
import trInterior3 from "./locales/tr/interior3.json";
import trInterior4 from "./locales/tr/interior4.json";
import trInterior5 from "./locales/tr/interior5.json";
import trInterior6 from "./locales/tr/interior6.json";
import trInterior7 from "./locales/tr/interior7.json";
import trScape1 from "./locales/tr/scape1.json";
import trScape2 from "./locales/tr/scape2.json";
import trbuy1 from "./locales/tr/buy1.json";
import trbuy2 from "./locales/tr/buy2.json";
import trbuy3 from "./locales/tr/buy3.json";
import trbuy4 from "./locales/tr/buy4.json";
import trbuy5 from "./locales/tr/buy5.json";
import trbuy6 from "./locales/tr/buy6.json";
import trbuy7 from "./locales/tr/buy7.json";
import trpage3 from "./locales/tr/page3.json";
import trecosystem from "./locales/tr/ecosystem.json";
import trwhyPartner from "./locales/tr/whyPartner.json";
import trstakeholders from "./locales/tr/stakeholders.json";
import trpartnerForm from "./locales/tr/partnerForm.json";
import trbuiltForEveryone from "./locales/tr/builtForEveryone.json";
import trCta from "./locales/tr/cta.json";
import trMort1 from "./locales/tr/mort1.json";
import trMort2 from "./locales/tr/mort2.json";
import trMort3 from "./locales/tr/mort3.json";
import trMort6 from "./locales/tr/mort6.json";
import trbook from "./locales/tr/book.json";
import trconsultation from "./locales/tr/consultation.json";
import trarticle1 from "./locales/tr/article1.json";
import trarticle2 from "./locales/tr/article2.json";
import trarticle3 from "./locales/tr/article3.json";
import trarticle4 from "./locales/tr/article4.json";
import trarticle5 from "./locales/tr/article5.json";
import trlandhero from "./locales/tr/landhero.json";
import trinteractive from "./locales/tr/interactive.json";
import tr from "./locales/tr/ecommerce.json";


/* =========================
   ZH - Chinese
========================= */
import zhcontact4 from "./locales/zh/contact4.json";
import zhcontact1 from "./locales/zh/contact1.json";
import zhcontact3 from "./locales/zh/contact3.json";
import zhcontact from "./locales/zh/contact.json";
import zhCommon from "./locales/zh/common.json";
import zhHome from "./locales/zh/home.json";
import zhHome1 from "./locales/zh/home1.json";
import zhHome2 from "./locales/zh/home2.json";
import zhHome3 from "./locales/zh/home3.json";
import zhHome4 from "./locales/zh/home4.json";
import zhHome5 from "./locales/zh/home5.json";
import zhFooter from "./locales/zh/footer.json";
import zhInterior1 from "./locales/zh/interior1.json";
import zhInterior2 from "./locales/zh/interior2.json";
import zhInterior3 from "./locales/zh/interior3.json";
import zhInterior4 from "./locales/zh/interior4.json";
import zhInterior5 from "./locales/zh/interior5.json";
import zhInterior6 from "./locales/zh/interior6.json";
import zhInterior7 from "./locales/zh/interior7.json";
import zhScape1 from "./locales/zh/scape1.json";
import zhScape2 from "./locales/zh/scape2.json";
import zhbuy1 from "./locales/zh/buy1.json";
import zhbuy2 from "./locales/zh/buy2.json";
import zhbuy3 from "./locales/zh/buy3.json";
import zhbuy4 from "./locales/zh/buy4.json";
import zhbuy5 from "./locales/zh/buy5.json";
import zhbuy6 from "./locales/zh/buy6.json";
import zhbuy7 from "./locales/zh/buy7.json";
import zhpage3 from "./locales/zh/page3.json";
import zhecosystem from "./locales/zh/ecosystem.json";
import zhwhyPartner from "./locales/zh/whyPartner.json";
import zhstakeholders from "./locales/zh/stakeholders.json";
import zhpartnerForm from "./locales/zh/partnerForm.json";
import zhbuiltForEveryone from "./locales/zh/builtForEveryone.json";
import zhCta from "./locales/zh/cta.json";
import zhMort1 from "./locales/zh/mort1.json";
import zhMort2 from "./locales/zh/mort2.json";
import zhMort3 from "./locales/zh/mort3.json";
import zhMort6 from "./locales/zh/mort6.json";
import zhbook from "./locales/zh/book.json";
import zhconsultation from "./locales/zh/consultation.json";
import zharticle1 from "./locales/zh/article1.json";
import zharticle2 from "./locales/zh/article2.json";
import zharticle3 from "./locales/zh/article3.json";
import zharticle4 from "./locales/zh/article4.json";
import zharticle5 from "./locales/zh/article5.json";
import zhlandhero from "./locales/zh/landhero.json";
import zhinteractive from "./locales/zh/interactive.json";
import zh from "./locales/zh/ecommerce.json";

/* =========================
   TL - Filipino/Tagalog
========================= */
import tlcontact4 from "./locales/tl/contact4.json";
import tlcontact3 from "./locales/tl/contact3.json";
import tlcontact1 from "./locales/tl/contact1.json";
import tlcontact from "./locales/tl/contact.json";
import tlCommon from "./locales/tl/common.json";
import tlHome from "./locales/tl/home.json";
import tlHome1 from "./locales/tl/home1.json";
import tlHome2 from "./locales/tl/home2.json";
import tlHome3 from "./locales/tl/home3.json";
import tlHome4 from "./locales/tl/home4.json";
import tlHome5 from "./locales/tl/home5.json";
import tlFooter from "./locales/tl/footer.json";
import tlInterior1 from "./locales/tl/interior1.json";
import tlInterior2 from "./locales/tl/interior2.json";
import tlInterior3 from "./locales/tl/interior3.json";
import tlInterior4 from "./locales/tl/interior4.json";
import tlInterior5 from "./locales/tl/interior5.json";
import tlInterior6 from "./locales/tl/interior6.json";
import tlInterior7 from "./locales/tl/interior7.json";
import tlScape1 from "./locales/tl/scape1.json";
import tlScape2 from "./locales/tl/scape2.json";
import tlbuy1 from "./locales/tl/buy1.json";
import tlbuy2 from "./locales/tl/buy2.json";
import tlbuy3 from "./locales/tl/buy3.json";
import tlbuy4 from "./locales/tl/buy4.json";
import tlbuy5 from "./locales/tl/buy5.json";
import tlbuy6 from "./locales/tl/buy6.json";
import tlbuy7 from "./locales/tl/buy7.json";
import tlpage3 from "./locales/tl/page3.json";
import tlecosystem from "./locales/tl/ecosystem.json";
import tlwhyPartner from "./locales/tl/whyPartner.json";
import tlstakeholders from "./locales/tl/stakeholders.json";
import tlpartnerForm from "./locales/tl/partnerForm.json";
import tlbuiltForEveryone from "./locales/tl/builtForEveryone.json";
import tlCta from "./locales/tl/cta.json";
import tlMort1 from "./locales/tl/mort1.json";
import tlMort2 from "./locales/tl/mort2.json";
import tlMort3 from "./locales/tl/mort3.json";
import tlMort6 from "./locales/tl/mort6.json";
import tlbook from "./locales/tl/book.json";
import tlconsultation from "./locales/tl/consultation.json";
import tlarticle1 from "./locales/tl/article1.json";
import tlarticle2 from "./locales/tl/article2.json";
import tlarticle3 from "./locales/tl/article3.json";
import tlarticle4 from "./locales/tl/article4.json";
import tlarticle5 from "./locales/tl/article5.json";
import tllandhero from "./locales/tl/landhero.json";
import tlinteractive from "./locales/tl/interactive.json";
import tl from "./locales/tl/ecommerce.json";

/* =========================
   FA - Persian (Farsi)
========================= */
import facontact4 from "./locales/fa/contact4.json";
import facontact3 from "./locales/fa/contact3.json";
import facontact1 from "./locales/fa/contact1.json";
import facontact from "./locales/fa/contact.json";
import faCommon from "./locales/fa/common.json";
import fahome from "./locales/fa/home.json";
import fahome1 from "./locales/fa/home1.json";
import fahome2 from "./locales/fa/home2.json";
import fahome3 from "./locales/fa/home3.json";
import fahome4 from "./locales/fa/home4.json";
import fahome5 from "./locales/fa/home5.json";
import fafooter from "./locales/fa/footer.json";
import faInterior1 from "./locales/fa/interior1.json";
import faInterior2 from "./locales/fa/interior2.json";
import faInterior3 from "./locales/fa/interior3.json";
import faInterior4 from "./locales/fa/interior4.json";
import faInterior7 from "./locales/fa/interior7.json";
import fainterior5 from "./locales/fa/interior5.json";
import fainterior6 from "./locales/fa/interior6.json";
import fabook from "./locales/fa/book.json";
import fabuy1 from "./locales/fa/buy1.json";
import fabuy2 from "./locales/fa/buy2.json";
import faBuy5 from "./locales/fa/buy5.json";
import fabuy3 from "./locales/fa/buy3.json";
import fabuy4 from "./locales/fa/buy4.json";
import fabuy6 from "./locales/fa/buy6.json";
import fabuy7 from "./locales/fa/buy7.json";
import faarticle1 from "./locales/fa/article1.json";
import faarticle2 from "./locales/fa/article2.json";
import faarticle3 from "./locales/fa/article3.json";
import faarticle4 from "./locales/fa/article4.json";
import faarticle5 from "./locales/fa/article5.json";
import falandhero from "./locales/fa/landhero.json";
import fainteractive from "./locales/fa/interactive.json";
import faconsultation from "./locales/fa/consultation.json";
import fascape2 from "./locales/fa/scape2.json";
import fascape1 from "./locales/fa/scape1.json";
import fapage3 from "./locales/fa/page3.json";
import faecosystem from "./locales/fa/ecosystem.json";
import fawhypartner from "./locales/fa/whyPartner.json";
import fastakeholders from "./locales/fa/stakeholders.json";
import fapartnerForm from "./locales/fa/partnerForm.json";
import fabuiltForEveryone from "./locales/fa/builtForEveryone.json";
import faCta from "./locales/fa/cta.json";
import faMort1 from "./locales/fa/mort1.json";
import faMort2 from "./locales/fa/mort2.json";
import faMort3 from "./locales/fa/mort3.json";
import faMort6 from "./locales/fa/mort6.json";
import faEcommerce from "./locales/fa/ecommerce.json";


/* =========================
   UR - Urdu
========================= */
import urcontact1 from "./locales/ur/contact1.json";
import urcontact4 from "./locales/ur/contact4.json";
import urcontact3 from "./locales/ur/contact3.json";
import urcontact from "./locales/ur/contact.json";
import urcommon from "./locales/ur/common.json";
import urfooter from "./locales/ur/footer.json";
import urhome from "./locales/ur/home.json";
import urhome1 from "./locales/ur/home1.json";
import urhome2 from "./locales/ur/home2.json";
import urhome3 from "./locales/ur/home3.json";
import urhome4 from "./locales/ur/home4.json";
import urhome5 from "./locales/ur/home5.json";
import urInterior1 from "./locales/ur/interior1.json";
import urInterior2 from "./locales/ur/interior2.json";
import urInterior3 from "./locales/ur/interior3.json";
import urInterior4 from "./locales/ur/interior4.json";
import urInterior7 from "./locales/ur/interior7.json";
import urinterior5 from "./locales/ur/interior5.json";
import urinterior6 from "./locales/ur/interior6.json";
import urbook from "./locales/ur/book.json";
import urbuy1 from "./locales/ur/buy1.json";
import urbuy2 from "./locales/ur/buy2.json";
import urBuy5 from "./locales/ur/buy5.json";
import urbuy3 from "./locales/ur/buy3.json";
import urbuy4 from "./locales/ur/buy4.json";
import urbuy6 from "./locales/ur/buy6.json";
import urbuy7 from "./locales/ur/buy7.json";
import urarticle1 from "./locales/ur/article1.json";
import urarticle2 from "./locales/ur/article2.json";
import urarticle3 from "./locales/ur/article3.json";
import urarticle4 from "./locales/ur/article4.json";
import urarticle5 from "./locales/ur/article5.json";
import urlandhero from "./locales/ur/landhero.json";
import urinteractive from "./locales/ur/interactive.json";
import urconsultation from "./locales/ur/consultation.json";
import urscape2 from "./locales/ur/scape2.json";
import urscape1 from "./locales/ur/scape1.json";
import urpage3 from "./locales/ur/page3.json";
import urecosystem from "./locales/ur/ecosystem.json";
import urwhypartner from "./locales/ur/whyPartner.json";
import urstakeholders from "./locales/ur/stakeholders.json";
import urpartnerForm from "./locales/ur/partnerForm.json";
import urbuiltForEveryone from "./locales/ur/builtForEveryone.json";
import urCta from "./locales/ur/cta.json";
import urMort1 from "./locales/ur/mort1.json";
import urMort2 from "./locales/ur/mort2.json";
import urMort3 from "./locales/ur/mort3.json";
import urMort6 from "./locales/ur/mort6.json";
import urEcommerce from "./locales/ur/ecommerce.json";


/* =========================
   PA - Punjabi
========================= */
import pacontact4 from "./locales/pa/contact4.json";
import pacontact1 from "./locales/pa/contact1.json";
import pacontact3 from "./locales/pa/contact3.json";
import pacontact from "./locales/pa/contact.json";
import pacommon from "./locales/pa/common.json";
import pahome from "./locales/pa/home.json";
import pahome1 from "./locales/pa/home1.json";
import pahome2 from "./locales/pa/home2.json";
import pahome3 from "./locales/pa/home3.json";
import pahome4 from "./locales/pa/home4.json";
import pahome5 from "./locales/pa/home5.json";
import pafooter from "./locales/pa/footer.json";
import paInterior1 from "./locales/pa/interior1.json";
import paInterior2 from "./locales/pa/interior2.json";
import paInterior4 from "./locales/pa/interior4.json";
import paInterior7 from "./locales/pa/interior7.json";
import painterior5 from "./locales/pa/interior5.json";
import painterior6 from "./locales/pa/interior6.json";
import pabook from "./locales/pa/book.json";
import pabuy1 from "./locales/pa/buy1.json";
import pabuy2 from "./locales/pa/buy2.json";
import paBuy3 from "./locales/pa/buy3.json";
import pabuy4 from "./locales/pa/buy4.json";
import paBuy5 from "./locales/pa/buy5.json";
import paBuy6 from "./locales/pa/buy6.json";
import pabuy7 from "./locales/pa/buy7.json";
import paarticle1 from "./locales/pa/article1.json";
import paarticle2 from "./locales/pa/article2.json";
import paarticle3 from "./locales/pa/article3.json";
import paarticle4 from "./locales/pa/article4.json";
import paarticle5 from "./locales/pa/article5.json";
import palandhero from "./locales/pa/landhero.json";
import painteractive from "./locales/pa/interactive.json";
import paconsultation from "./locales/pa/consultation.json";
import pascape2 from "./locales/pa/scape2.json";
import pascape1 from "./locales/pa/scape1.json";
import papage3 from "./locales/pa/page3.json";
import paecosystem from "./locales/pa/ecosystem.json";
import pawhypartner from "./locales/pa/whyPartner.json";
import pastakeholders from "./locales/pa/stakeholders.json";
import papartnerForm from "./locales/pa/partnerForm.json";
import pabuiltForEveryone from "./locales/pa/builtForEveryone.json";
import paCta from "./locales/pa/cta.json";
import paMort1 from "./locales/pa/mort1.json";
import paMort2 from "./locales/pa/mort2.json";
import paMort3 from "./locales/pa/mort3.json";
import paMort6 from "./locales/pa/mort6.json";
import paEcommerce from "./locales/pa/ecommerce.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        contact: encontact,
        contact1: encontact1,
        contact3: encontact3,
        contact4: encontact4,
        home: enHome,
        home1: enHome1,
        home2: enHome2,
        home3: enHome3,
        home4: enHome4,
        home5: enHome5,
        footer: enFooter,
        interior1: enInterior1,
        interior2: enInterior2,
        interior3: enInterior3,
        interior4: enInterior4,
        interior5: enInterior5,
        interior6: enInterior6,
        interior7: enInterior7,
        scape1: enScape1,
        scape2: enScape2,
        buy1: enbuy1,
        buy2: enbuy2,
        buy3: enbuy3,
        buy4: enbuy4,
        buy5: enbuy5,
        buy6: enbuy6,
        buy7: enbuy7,
        page3: enpage3,
        ecosystem: enecosystem,
        whyPartner: enwhyPartner,
        stakeholders: enstakeholders,
        partnerForm: enpartnerForm,
        builtForEveryone: enbuiltForEveryone,
        cta: enCta,
        mort1: enMort1,
        mort2: enMort2,
        mort3: enMort3,
        mort6: enMort6,
        book: enbook,
        consultation: enconsultation,
        landhero: enlandhero,
        interactive: eninteractive,
        article1: enarticle1,
        article2: enarticle2,
        article3: enarticle3,
        article4: enarticle4,
        article5: enarticle5,
        ecommerce: en,
      },

      ar: {
        common: arCommon,
        contact: arcontact,
        contact1: arcontact1,
        contact3: arcontact3,
        contact4: arcontact4,
        home: arhome,
        home1: arhome1,
        home2: arhome2,
        home3: arhome3,
        home4: arhome4,
        home5: arhome5,
        footer: arfooter,
        interior1: arInterior1,
        interior2: arInterior2,
        interior3: arInterior3,
        interior4: arInterior4,
        interior5: arinterior5,
        interior6: arinterior6,
        interior7: arInterior7,
        scape1: arscape1,
        scape2: arscape2,
        buy1: arbuy1,
        buy2: arbuy2,
        buy3: arbuy3,
        buy4: arbuy4,
        buy5: arbuy5,
        buy6: arbuy6,
        buy7: arbuy7,
        book: arbook,
        consultation: arconsultation,
        landhero: arlandhero,
        interactive: arinteractive,
        article1: ararticle1,
        article2: ararticle2,
        article3: ararticle3,
        article4: ararticle4,
        article5: ararticle5,
        page3: arpage3,
        ecosystem: arecosystem,
        whyPartner: arwhypartner,
        stakeholders: arstakeholders,
        partnerForm: arpartnerForm,
        builtForEveryone: arbuiltForEveryone,
        cta: arCta,
        mort1: arMort1,
        mort2: arMort2,
        mort3: arMort3,
        mort6: arMort6,
        ecommerce: arEcommerce,
      },


      ar: {
        common: arCommon,
        contact: arcontact,
        contact1: arcontact1,
        contact3: arcontact3,
        contact4: arcontact4,
        home: arhome,
        home1: arhome1,
        home2: arhome2,
        home3: arhome3,
        home4: arhome4,
        home5: arhome5,
        footer: arfooter,
        interior1: arInterior1,
        interior2: arInterior2,
        interior3: arInterior3,
        interior4: arInterior4,
        interior5: arinterior5,
        interior6: arinterior6,
        interior7: arInterior7,
        scape1: arscape1,
        scape2: arscape2,
        buy1: arbuy1,
        buy2: arbuy2,
        buy3: arbuy3,
        buy4: arbuy4,
        buy5: arbuy5,
        buy6: arbuy6,
        buy7: arbuy7,
        book: arbook,
        consultation: arconsultation,
        landhero: arlandhero,
        interactive: arinteractive,
        article1: ararticle1,
        article2: ararticle2,
        article3: ararticle3,
        article4: ararticle4,
        article5: ararticle5,
        page3: arpage3,
        ecosystem: arecosystem,
        whyPartner: arwhypartner,
        stakeholders: arstakeholders,
        partnerForm: arpartnerForm,
        builtForEveryone: arbuiltForEveryone,
        cta: arCta,
        mort1: arMort1,
        mort2: arMort2,
        mort3: arMort3,
        mort6: arMort6,
        ecommerce: arEcommerce,
      },


      hi: {
        common: hiCommon,
        contact: hicontact,
        contact1: hicontact1,
        contact3: hicontact3,
        contact4: hicontact4,
        home: hiHome,
        home1: hiHome1,
        home2: hiHome2,
        home3: hiHome3,
        home4: hiHome4,
        home5: hiHome5,
        footer: hiFooter,
        interior1: hiInterior1,
        interior2: hiInterior2,
        interior3: hiInterior3,
        interior4: hiInterior4,
        interior5: hiInterior5,
        interior6: hiInterior6,
        interior7: hiInterior7,
        scape1: hiScape1,
        scape2: hiScape2,
        buy1: hibuy1,
        buy2: hibuy2,
        buy3: hibuy3,
        buy4: hibuy4,
        buy5: hibuy5,
        buy6: hibuy6,
        buy7: hibuy7,
        page3: hipage3,
        ecosystem: hiecosystem,
        whyPartner: hiwhyPartner,
        stakeholders: histakeholders,
        partnerForm: hipartnerForm,
        builtForEveryone: hibuiltForEveryone,
        cta: hiCta,
        mort1: hiMort1,
        mort2: hiMort2,
        mort3: hiMort3,
        mort6: hiMort6,
        book: hibook,
        consultation: hiconsultation,
        landhero: hilandhero,
        interactive: hiinteractive,
        article1: hiarticle1,
        article2: hiarticle2,
        article3: hiarticle3,
        article4: hiarticle4,
        article5: hiarticle5,
        ecommerce: hi,
      },


      de: {
        common: deCommon,
        contact: decontact,
        contact1: decontact1,
        contact3: decontact3,
        contact4: decontact4,
        home: deHome,
        home1: deHome1,
        home2: deHome2,
        home3: deHome3,
        home4: deHome4,
        home5: deHome5,
        footer: deFooter,
        interior1: deInterior1,
        interior2: deInterior2,
        interior3: deInterior3,
        interior4: deInterior4,
        interior5: deInterior5,
        interior6: deInterior6,
        interior7: deInterior7,
        scape1: deScape1,
        scape2: deScape2,
        buy1: debuy1,
        buy2: debuy2,
        buy3: debuy3,
        buy4: debuy4,
        buy5: debuy5,
        buy6: debuy6,
        buy7: debuy7,
        page3: depage3,
        ecosystem: deecosystem,
        whyPartner: dewhyPartner,
        stakeholders: destakeholders,
        partnerForm: departnerForm,
        builtForEveryone: debuiltForEveryone,
        cta: deCta,
        mort1: deMort1,
        mort2: deMort2,
        mort3: deMort3,
        mort6: deMort6,
        book: debook,
        consultation: deconsultation,
        landhero: delandhero,
        interactive: deinteractive,
        article1: dearticle1,
        article2: dearticle2,
        article3: dearticle3,
        article4: dearticle4,
        article5: dearticle5,
        ecommerce: de,
      },


      es: {
        common: esCommon,
        contact: escontact,
        contact1: escontact1,
        contact3: escontact3,
        contact4: escontact4,
        home: esHome,
        home1: esHome1,
        home2: esHome2,
        home3: esHome3,
        home4: esHome4,
        home5: esHome5,
        footer: esFooter,
        interior1: esInterior1,
        interior2: esInterior2,
        interior3: esInterior3,
        interior4: esInterior4,
        interior5: esInterior5,
        interior6: esInterior6,
        interior7: esInterior7,
        scape1: esScape1,
        scape2: esScape2,
        buy1: esbuy1,
        buy2: esbuy2,
        buy3: esbuy3,
        buy4: esbuy4,
        buy5: esbuy5,
        buy6: esbuy6,
        buy7: esbuy7,
        page3: espage3,
        ecosystem: esecosystem,
        whyPartner: eswhyPartner,
        stakeholders: esstakeholders,
        partnerForm: espartnerForm,
        builtForEveryone: esbuiltForEveryone,
        cta: esCta,
        mort1: esMort1,
        mort2: esMort2,
        mort3: esMort3,
        mort6: esMort6,
        book: esbook,
        consultation: esconsultation,
        landhero: eslandhero,
        interactive: esinteractive,
        article1: esarticle1,
        article2: esarticle2,
        article3: esarticle3,
        article4: esarticle4,
        article5: esarticle5,
        ecommerce: es,
      },


      fr: {
        common: frCommon,
        contact: frcontact,
        contact1: frcontact1,
        contact3: frcontact3,
        contact4: frcontact4,
        home: frHome,
        home1: frHome1,
        home2: frHome2,
        home3: frHome3,
        home4: frHome4,
        home5: frHome5,
        footer: frFooter,
        interior1: frInterior1,
        interior2: frInterior2,
        interior3: frInterior3,
        interior4: frInterior4,
        interior5: frInterior5,
        interior6: frInterior6,
        interior7: frInterior7,
        scape1: frScape1,
        scape2: frScape2,
        buy1: frbuy1,
        buy2: frbuy2,
        buy3: frbuy3,
        buy4: frbuy4,
        buy5: frbuy5,
        buy6: frbuy6,
        buy7: frbuy7,
        page3: frpage3,
        ecosystem: frecosystem,
        whyPartner: frwhyPartner,
        stakeholders: frstakeholders,
        partnerForm: frpartnerForm,
        builtForEveryone: frbuiltForEveryone,
        cta: frCta,
        mort1: frMort1,
        mort2: frMort2,
        mort3: frMort3,
        mort6: frMort6,
        book: frbook,
        consultation: frconsultation,
        landhero: frlandhero,
        interactive: frinteractive,
        article1: frarticle1,
        article2: frarticle2,
        article3: frarticle3,
        article4: frarticle4,
        article5: frarticle5,
        ecommerce: fr,
      },


      ru: {
        common: ruCommon,
        contact: rucontact,
        contact1: rucontact1,
        contact3: rucontact3,
        contact4: rucontact4,
        home: ruHome,
        home1: ruHome1,
        home2: ruHome2,
        home3: ruHome3,
        home4: ruHome4,
        home5: ruHome5,
        footer: ruFooter,
        interior1: ruInterior1,
        interior2: ruInterior2,
        interior3: ruInterior3,
        interior4: ruInterior4,
        interior5: ruInterior5,
        interior6: ruInterior6,
        interior7: ruInterior7,
        scape1: ruScape1,
        scape2: ruScape2,
        buy1: rubuy1,
        buy2: rubuy2,
        buy3: rubuy3,
        buy4: rubuy4,
        buy5: rubuy5,
        buy6: rubuy6,
        buy7: rubuy7,
        page3: rupage3,
        ecosystem: ruecosystem,
        whyPartner: ruwhyPartner,
        stakeholders: rustakeholders,
        partnerForm: rupartnerForm,
        builtForEveryone: rubuiltForEveryone,
        cta: ruCta,
        mort1: ruMort1,
        mort2: ruMort2,
        mort3: ruMort3,
        mort6: ruMort6,
        book: rubook,
        consultation: ruconsultation,
        landhero: rulandhero,
        interactive: ruinteractive,
        article1: ruarticle1,
        article2: ruarticle2,
        article3: ruarticle3,
        article4: ruarticle4,
        article5: ruarticle5,
        ecommerce: ru,
      },


      tr: {
        common: trCommon,
        contact: trcontact,
        contact1: trcontact1,
        contact3: trcontact3,
        contact4: trcontact4,
        home: trHome,
        home1: trHome1,
        home2: trHome2,
        home3: trHome3,
        home4: trHome4,
        home5: trHome5,
        footer: trFooter,
        interior1: trInterior1,
        interior2: trInterior2,
        interior3: trInterior3,
        interior4: trInterior4,
        interior5: trInterior5,
        interior6: trInterior6,
        interior7: trInterior7,
        scape1: trScape1,
        scape2: trScape2,
        buy1: trbuy1,
        buy2: trbuy2,
        buy3: trbuy3,
        buy4: trbuy4,
        buy5: trbuy5,
        buy6: trbuy6,
        buy7: trbuy7,
        page3: trpage3,
        ecosystem: trecosystem,
        whyPartner: trwhyPartner,
        stakeholders: trstakeholders,
        partnerForm: trpartnerForm,
        builtForEveryone: trbuiltForEveryone,
        cta: trCta,
        mort1: trMort1,
        mort2: trMort2,
        mort3: trMort3,
        mort6: trMort6,
        book: trbook,
        consultation: trconsultation,
        landhero: trlandhero,
        interactive: trinteractive,
        article1: trarticle1,
        article2: trarticle2,
        article3: trarticle3,
        article4: trarticle4,
        article5: trarticle5,
        ecommerce: tr,
      },


      zh: {
        common: zhCommon,
        contact: zhcontact,
        contact1: zhcontact1,
        contact3: zhcontact3,
        contact4: zhcontact4,
        home: zhHome,
        home1: zhHome1,
        home2: zhHome2,
        home3: zhHome3,
        home4: zhHome4,
        home5: zhHome5,
        footer: zhFooter,
        interior1: zhInterior1,
        interior2: zhInterior2,
        interior3: zhInterior3,
        interior4: zhInterior4,
        interior5: zhInterior5,
        interior6: zhInterior6,
        interior7: zhInterior7,
        scape1: zhScape1,
        scape2: zhScape2,
        buy1: zhbuy1,
        buy2: zhbuy2,
        buy3: zhbuy3,
        buy4: zhbuy4,
        buy5: zhbuy5,
        buy6: zhbuy6,
        buy7: zhbuy7,
        page3: zhpage3,
        ecosystem: zhecosystem,
        whyPartner: zhwhyPartner,
        stakeholders: zhstakeholders,
        partnerForm: zhpartnerForm,
        builtForEveryone: zhbuiltForEveryone,
        cta: zhCta,
        mort1: zhMort1,
        mort2: zhMort2,
        mort3: zhMort3,
        mort6: zhMort6,
        book: zhbook,
        consultation: zhconsultation,
        landhero: zhlandhero,
        interactive: zhinteractive,
        article1: zharticle1,
        article2: zharticle2,
        article3: zharticle3,
        article4: zharticle4,
        article5: zharticle5,
        ecommerce: zh,
      },


      tl: {
        common: tlCommon,
        contact: tlcontact,
        contact1: tlcontact1,
        contact3: tlcontact3,
        contact4: tlcontact4,
        home: tlHome,
        home1: tlHome1,
        home2: tlHome2,
        home3: tlHome3,
        home4: tlHome4,
        home5: tlHome5,
        footer: tlFooter,
        interior1: tlInterior1,
        interior2: tlInterior2,
        interior3: tlInterior3,
        interior4: tlInterior4,
        interior5: tlInterior5,
        interior6: tlInterior6,
        interior7: tlInterior7,
        scape1: tlScape1,
        scape2: tlScape2,
        buy1: tlbuy1,
        buy2: tlbuy2,
        buy3: tlbuy3,
        buy4: tlbuy4,
        buy5: tlbuy5,
        buy6: tlbuy6,
        buy7: tlbuy7,
        page3: tlpage3,
        ecosystem: tlecosystem,
        whyPartner: tlwhyPartner,
        stakeholders: tlstakeholders,
        partnerForm: tlpartnerForm,
        builtForEveryone: tlbuiltForEveryone,
        cta: tlCta,
        mort1: tlMort1,
        mort2: tlMort2,
        mort3: tlMort3,
        mort6: tlMort6,
        book: tlbook,
        consultation: tlconsultation,
        landhero: tllandhero,
        interactive: tlinteractive,
        article1: tlarticle1,
        article2: tlarticle2,
        article3: tlarticle3,
        article4: tlarticle4,
        article5: tlarticle5,
        ecommerce: tl,
      },


      fa: {
        common: faCommon,
        contact: facontact,
        contact1: facontact1,
        contact3: facontact3,
        contact4: facontact4,
        home: fahome,
        home1: fahome1,
        home2: fahome2,
        home3: fahome3,
        home4: fahome4,
        home5: fahome5,
        footer: fafooter,
        interior1: faInterior1,
        interior2: faInterior2,
        interior3: faInterior3,
        interior4: faInterior4,
        interior5: fainterior5,
        interior6: fainterior6,
        interior7: faInterior7,
        buy1: fabuy1,
        buy2: fabuy2,
        buy3: fabuy3,
        buy4: fabuy4,
        buy5: faBuy5,
        buy6: fabuy6,
        buy7: fabuy7,
        book: fabook,
        consultation: faconsultation,
        landhero: falandhero,
        interactive: fainteractive,
        scape1: fascape1,
        scape2: fascape2,
        article1: faarticle1,
        article2: faarticle2,
        article3: faarticle3,
        article4: faarticle4,
        article5: faarticle5,
        page3: fapage3,
        ecosystem: faecosystem,
        whyPartner: fawhypartner,
        stakeholders: fastakeholders,
        partnerForm: fapartnerForm,
        builtForEveryone: fabuiltForEveryone,
        cta: faCta,
        mort1: faMort1,
        mort2: faMort2,
        mort3: faMort3,
        mort6: faMort6,
        ecommerce: faEcommerce,
      },


      ur: {
        common: urcommon,
        contact: urcontact,
        contact1: urcontact1,
        contact3: urcontact3,
        contact4: urcontact4,
        home: urhome,
        home1: urhome1,
        home2: urhome2,
        home3: urhome3,
        home4: urhome4,
        home5: urhome5,
        footer: urfooter,
        interior1: urInterior1,
        interior2: urInterior2,
        interior3: urInterior3,
        interior4: urInterior4,
        interior5: urinterior5,
        interior6: urinterior6,
        interior7: urInterior7,
        buy1: urbuy1,
        buy2: urbuy2,
        buy3: urbuy3,
        buy4: urbuy4,
        buy5: urBuy5,
        buy6: urbuy6,
        buy7: urbuy7,
        book: urbook,
        consultation: urconsultation,
        landhero: urlandhero,
        interactive: urinteractive,
        scape1: urscape1,
        scape2: urscape2,
        article1: urarticle1,
        article2: urarticle2,
        article3: urarticle3,
        article4: urarticle4,
        article5: urarticle5,
        page3: urpage3,
        ecosystem: urecosystem,
        whyPartner: urwhypartner,
        stakeholders: urstakeholders,
        partnerForm: urpartnerForm,
        builtForEveryone: urbuiltForEveryone,
        cta: urCta,
        mort1: urMort1,
        mort2: urMort2,
        mort3: urMort3,
        mort6: urMort6,
        ecommerce: urEcommerce,
      },


      pa: {
        common: pacommon,
        contact: pacontact,
        contact1: pacontact1,
        contact3: pacontact3,
        contact4: pacontact4,
        home: pahome,
        home1: pahome1,
        home2: pahome2,
        home3: pahome3,
        home4: pahome4,
        home5: pahome5,
        footer: pafooter,
        interior1: paInterior1,
        interior2: paInterior2,
        interior4: paInterior4,
        interior5: painterior5,
        interior6: painterior6,
        interior7: paInterior7,
        buy1: pabuy1,
        buy2: pabuy2,
        buy3: paBuy3,
        buy4: pabuy4,
        buy5: paBuy5,
        buy6: paBuy6,
        buy7: pabuy7,
        book: pabook,
        consultation: paconsultation,
        landhero: palandhero,
        interactive: painteractive,
        scape1: pascape1,
        scape2: pascape2,
        article1: paarticle1,
        article2: paarticle2,
        article3: paarticle3,
        article4: paarticle4,
        article5: paarticle5,
        page3: papage3,
        ecosystem: paecosystem,
        whyPartner: pawhypartner,
        stakeholders: pastakeholders,
        partnerForm: papartnerForm,
        builtForEveryone: pabuiltForEveryone,
        cta: paCta,
        mort1: paMort1,
        mort2: paMort2,
        mort3: paMort3,
        mort6: paMort6,
        ecommerce: paEcommerce,
      },
    },

    fallbackLng: "en",

    supportedLngs: ["en", "ar", "hi", "de", "es", "fr", "ru", "tr", "zh", "tl", "fa", "ur", "pa"],


    fallbackLng: "en",


    supportedLngs: ["en", "ar", "hi", "de", "es", "fr", "ru", "tr", "zh", "tl", "fa", "ur", "pa"],


    ns: [
      "common",
      "contact",
      "contact1",
      "contact3",
      "contact4",
      "home",
      "home1",
      "home2",
      "home3",
      "home4",
      "home5",
      "footer",
      "interior1",
      "interior2",
      "interior3",
      "interior4",
      "interior5",
      "interior6",
      "interior7",
      "scape1",
      "scape2",
      "buy1",
      "buy2",
      "buy3",
      "buy4",
      "buy5",
      "buy6",
      "buy7",
      "page3",
      "ecosystem",
      "whyPartner",
      "stakeholders",
      "partnerForm",
      "builtForEveryone",
      "cta",
      "mort1",
      "mort2",
      "mort3",
      "mort6",
      "book",
      "consultation",
      "article1",
      "article2",
      "article3",
      "article4",
      "article5",
      "landhero",
      "interactive",
      "ecommerce",
    ],


    defaultNS: "common",


    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },


    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

