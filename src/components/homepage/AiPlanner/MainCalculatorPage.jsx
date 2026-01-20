import React from 'react'
import { Calculator, Leaf, Home, ArrowRight, Sparkles, Hammer, PaintBucket, Trees, Zap, Target, Shield } from 'lucide-react'
import aaImage from "../../../assets/img/aa.jpg";

export default function MainCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Image */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${aaImage})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              
              <h1 className="heading-light">
                Plan Your Space with Confidence
              </h1>
              
              <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-12">
                Get transparent, detailed cost estimates tailored to your space, design, and budget.
              </p>
              
              <div className="flex flex-wrap justify-center gap-6">
                <a 
                  href="/estimate/calculator" 
                  className="group inline-flex items-center gap-3 px-10 py-5 bg-[var(--color-primary)] text-white font-bold rounded-2xl "
                >
                  <Trees className="w-7 h-7" />
                  Landscaping Estimate
                </a>
                
                <a 
                  href="/estimate/calculator/interior" 
                  className="group inline-flex bg-[var(--color-primary)] items-center gap-3 px-10 py-5  text-white font-bold rounded-2xl   shadow-lg  "
                >
                  <Home className="w-7 h-7" />
                  Interior Estimate
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-20 text-gray-50" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L60 52C120 44 240 28 360 28C480 28 600 44 720 44C840 44 960 28 1080 20C1200 12 1320 12 1380 12L1440 12V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V60Z" fill="currentColor"/>
          </svg>
        </div>
      </div>

      {/* Estimator Cards Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="heading-light text-black">
              Start Estimating
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Professional tools designed for accurate property investment estimations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {/* Landscaping Estimator Card */}
            <div className="group relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl border border-purple-100">
<div className="absolute inset-0 bg-gradient-to-br 
  from-[#4A027C] via-[#5A1690] to-[#3A015F]
  opacity-95 group-hover:opacity-100 transition-opacity duration-500" 
/>
              
              <div className="relative z-10 p-10 h-full flex flex-col">
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm mb-6 border border-white/30">
                    <Trees className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Landscaping</h3>
                  <p className="text-white/90 text-lg mb-8">
                    Transform your outdoors. Estimate precise costs for gardens, irrigation, hardscaping, and lighting installations.
                  </p>
                </div>

                <div className="mt-auto space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-white/90 text-base">
                      <div className="w-3 h-3 rounded-full bg-white" />
                      Garden Design & Layout Planning
                    </div>
                    <div className="flex items-center gap-3 text-white/90 text-base">
                      <div className="w-3 h-3 rounded-full bg-white" />
                      Irrigation & Water Systems
                    </div>
                    <div className="flex items-center gap-3 text-white/90 text-base">
                      <div className="w-3 h-3 rounded-full bg-white" />
                      Outdoor Lighting Installation
                    </div>
                  </div>

                  <a 
                    href="/estimate/calculator" 
                    className="group/btn inline-flex items-center justify-center gap-3 w-full py-5 bg-gradient-to-r from-white to-purple-50 text-purple-700 font-bold rounded-xl hover:bg-white transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border border-white/30"
                  >
                    <Leaf className="w-6 h-6 text-purple-600" />
                    Get Landscaping Estimate
                    <ArrowRight className="w-5 h-5 text-purple-600 group-hover/btn:translate-x-2 transition-transform" />
                  </a>
                </div>
              </div>
            </div>

            {/* Interior Estimator Card */}
            <div className="group relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl border border-purple-100">
<div className="absolute inset-0 bg-gradient-to-br 
  from-[#4A027C] via-[#5A1690] to-[#3A015F]
  opacity-95 group-hover:opacity-100 transition-opacity duration-500" 
/>             
              
              <div className="relative z-10 p-10 h-full flex flex-col">
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm mb-6 border border-white/30">
                    <PaintBucket className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Interior</h3>
                  <p className="text-white/90 text-lg mb-8">
                    Plan your interior renovation budget with accurate estimates for materials, labor, and premium finishing.
                  </p>
                </div>

                <div className="mt-auto space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-white/90 text-base">
                      <div className="w-3 h-3 rounded-full bg-white" />
                      Flooring, Tiling & Carpentry
                    </div>
                    <div className="flex items-center gap-3 text-white/90 text-base">
                      <div className="w-3 h-3 rounded-full bg-white" />
                      Painting & Wall Treatments
                    </div>
                    <div className="flex items-center gap-3 text-white/90 text-base">
                      <div className="w-3 h-3 rounded-full bg-white" />
                      Kitchen & Bathroom Fittings
                    </div>
                  </div>

                  <a 
                    href="/estimate/calculator/interior" 
                    className="group/btn inline-flex items-center justify-center gap-3 w-full py-5 bg-gradient-to-r from-white to-purple-50 text-violet-700 font-bold rounded-xl hover:bg-white transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border border-white/30"
                  >
                    <Hammer className="w-6 h-6 text-violet-600" />
                    Get Interior Estimate
                    <ArrowRight className="w-5 h-5 text-violet-600 group-hover/btn:translate-x-2 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="mt-20 text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-12">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-violet-600">Our Estimators</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="group p-8 rounded-3xl bg-gradient-to-b from-white to-purple-50 border border-purple-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-500 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Instant Results</h4>
                <p className="text-gray-600">Get accurate estimates instantly with our advanced algorithms</p>
              </div>
              
              <div className="group p-8 rounded-3xl bg-gradient-to-b from-white to-purple-50 border border-purple-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Market Accurate</h4>
                <p className="text-gray-600">Based on current market rates and industry standards</p>
              </div>
              
              <div className="group p-8 rounded-3xl bg-gradient-to-b from-white to-purple-50 border border-purple-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Professional Grade</h4>
                <p className="text-gray-600">Trusted by property professionals and investors</p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  )
}