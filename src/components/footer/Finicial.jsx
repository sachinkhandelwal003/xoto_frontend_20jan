import React from 'react';
import { Building2, ArrowRight, ShieldCheck, Lock } from 'lucide-react';

const BlurredFinancialComingSoon = () => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans overflow-hidden bg-black">
      
      {/* Background with Blur Effect */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[30s] scale-110"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=2000&q=80')`,
        }}
      >
        {/* Layer 1: Dark Overlay */}
        <div className="absolute inset-0 bg-[#0a0510]/80"></div>
        {/* Layer 2: Radial Purple Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#5C039B]/30 via-transparent to-transparent"></div>
      </div>

      {/* Glassmorphic Container with Intense Blur */}
      <div className="relative z-10 w-full max-w-2xl mx-4 group">
        <div className="p-8 md:p-16 rounded-[3.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] text-center transition-all duration-500 hover:border-[#5C039B]/30">
          
          {/* Top Decorative Line */}
          {/* <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[#5C039B] to-transparent mx-auto mb-10 rounded-full"></div> */}

          {/* Icon Section */}
       

          {/* Heading */}
          <h1 className="text-white text-5xl md:text-5xl font-semibold tracking-tighter mb-4 uppercase ">
            Financial Institutions <br />
             <span className="text-transparent bg-clip-text bg-white to-gray-500">Coming Soon</span>
          </h1>

          

     
        </div>
      </div>

      {/* Floating UI Elements */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-[#5C039B]/10 blur-[100px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-[#5C039B]/10 blur-[100px] rounded-full animate-pulse delay-1000"></div>

    </div>
  );
};

export default BlurredFinancialComingSoon;