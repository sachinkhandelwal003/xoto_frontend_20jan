import React from 'react';

const RealEstateComingSoon = () => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      
      {/* Background: Modern Real Estate Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')` 
        }}
      >
        {/* Sleek Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-indigo-950/70"></div>
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center">
        
    

        {/* Main Heading */}
        <h1 className="text-center">
          <span className="block text-4xl md:text-6xl font-light text-white mb-2 tracking-tight">
            Building the Future of
          </span>
          <span className="block text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-indigo-400 animate-gradient-x tracking-tighter italic">
            COMING SOON
          </span>
        </h1>

        {/* Decorative Divider */}
        <div className="flex items-center gap-4 my-8 w-full max-w-sm">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-indigo-500"></div>
          <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]"></div>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-indigo-500"></div>
        </div>


        {/* Newsletter / CTA */}
        <div className="w-full max-w-md group">
      {/* <div className="relative flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl focus-within:border-indigo-500 transition-all duration-300"> */}
        
          
          {/* </div> */}
        </div>

   
      </div>

    </div>
  );
};

export default RealEstateComingSoon;