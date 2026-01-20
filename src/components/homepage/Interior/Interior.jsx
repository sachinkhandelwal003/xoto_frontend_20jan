import React, { useState } from 'react';
import Card from '../../../components/Interiorsection/Cards/InteriorCards';
import StepCarousel from '../../StepCarousel';
import FreelancersSection from '../../freelancers/FreelancersSection';
import FaqPage from '../../faq';
import { Sparkles, Users, Award, Clock, Shield, Star, ArrowRight, CheckCircle, Home, Bed, Utensils, Bath } from 'lucide-react';

// Room Categories with Images
const roomCategories = [
  {
    id: 'living',
    name: 'Living Room',
    icon: <Home className="w-5 h-5" />,
    heroImage: 'https://images.unsplash.com/photo-1618221195710-ddbe2e4f40c6?w=1600',
    cards: [
      {
        image: 'https://super.homelane.com/other%20interiors/168120391788650f80c5a73bc-HLKT00000826_batch-3-800x600_24-main.jpg',
        hoverImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&auto=format&fit=crop&q=60',
        text: 'Modern Oasis Living Room Design',
      },
      {
        image: 'https://super.homelane.com/other%20interiors/16806849858178d361e94e031-HLKT00000795_living-room-800x600_4-main.jpg',
        hoverImage: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&auto=format&fit=crop&q=60',
        text: 'Contemporary and Bright Living Room Design',
      },
      {
        image: 'https://super.homelane.com/other%20interiors/16364324986456a596bb2b958-HLKT00000761_resize-800x600_2-main.jpg',
        hoverImage: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&auto=format&fit=crop&q=60',
        text: 'A Tinge of Earth Living Room',
      },
      {
        image: 'https://super.homelane.com/other%20interiors/1680685063047f4e8a4ce5614-HLKT00000796_living-room-800x600_10-main.jpg',
        hoverImage: 'https://images.unsplash.com/photo-1600566752225-537e566f0322?w=800&auto=format&fit=crop&q=60',
        text: 'Brilliantly White Living Room Design',
      },
      {
        image: 'https://media.architecturaldigest.com/photos/560c37dd7da26e3235ad995e/master/pass/gray-living-room-01.jpg',
        hoverImage: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&auto=format&fit=crop&q=60',
        text: 'Inspiring Grey Living Room Ideas',
      },
      {
        image: 'https://dropinblog.net/cdn-cgi/image/fit=scale-down,width=700/34246798/files/featured/Modern_Living_Room_Wall_Decoration.jpg',
        hoverImage: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=800&auto=format&fit=crop&q=60',
        text: 'Modern Living Room Wall Decoration',
      },
    ]
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    icon: <Bed className="w-5 h-5" />,
    heroImage: 'https://images.unsplash.com/photo-1618778637070-3b6900d63f47?w=1600',
    cards: [
      { 
        image: 'https://images.unsplash.com/photo-1616594039963-ae4f3e2a3e9e?w=800', 
        hoverImage: 'https://images.unsplash.com/photo-1616594039963-ae4f3e2a3e9e?w=800', 
        text: 'Serene Master Bedroom' 
      },
      { 
        image: 'https://images.unsplash.com/photo-1566665797739-1674de6b64f8?w=800', 
        hoverImage: 'https://images.unsplash.com/photo-1566665797739-1674de6b64f8?w=800', 
        text: 'Cozy Minimal Bedroom' 
      },
      { 
        image: 'https://images.unsplash.com/photo-1611892440504-42a792c8a8f9?w=800', 
        hoverImage: 'https://images.unsplash.com/photo-1611892440504-42a792c8a8f9?w=800', 
        text: 'Luxury Hotel Style Bedroom' 
      },
      { 
        image: 'https://images.unsplash.com/photo-1617325249277-8e1c9a9a9c8d?w=800', 
        hoverImage: 'https://images.unsplash.com/photo-1617325249277-8e1c9a9a9c8d?w=800', 
        text: 'Kids Bedroom with Fun Theme' 
      },
      { 
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 
        hoverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 
        text: 'Modern Scandinavian Bedroom' 
      },
      { 
        image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800', 
        hoverImage: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800', 
        text: 'Romantic Couple Bedroom' 
      },
    ]
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    icon: <Utensils className="w-5 h-5" />,
    heroImage: 'https://images.unsplash.com/photo-1556911220-b0b55f0d6e7e?w=1600',
    cards: [
      {
        image: 'https://super.homelane.com/Modular%20Kitchens/sleek-superfoam-minimalist-straight-kitchen-industrial-accents-2.webp',
        hoverImage: 'https://super.homelane.com/Modular%20Kitchens/sleek-superfoam-minimalist-straight-kitchen-industrial-accents-2.webp',
        text: 'Modular Kitchen Design with Stylish Cabinets and Sleek Appliances',
      },
      {
        image: 'https://super.homelane.com/Modular%20Kitchens/white-whisper-modern-island-kitchen-marble-island.webp',
        hoverImage: 'https://super.homelane.com/Modular%20Kitchens/white-whisper-modern-island-kitchen-marble-island.webp',
        text: 'White Whisper Modular Island Kitchen',
      },
      {
        image: 'https://super.homelane.com/other%20interiors/16364324986456a596bb2b958-HLKT00000761_resize-800x600_2-main.jpg',
        hoverImage: 'https://super.homelane.com/other%20interiors/16364324986456a596bb2b958-HLKT00000761_resize-800x600_2-main.jpg',
        text: 'A Tinge of Earth Living Room',
      },
      {
        image: 'https://super.homelane.com/Modular%20Kitchens/chamoisee-modern-kitchen-wood-white-cabinets.webp',
        hoverImage: 'https://super.homelane.com/Modular%20Kitchens/chamoisee-modern-kitchen-wood-white-cabinets.webp',
        text: 'Chamoisee L-Shaped Modular Kitchen',
      },
      {
        image: 'https://radonindia.com/cdn/shop/files/112117123_1512x.jpg?v=1694426525',
        hoverImage: 'https://radonindia.com/cdn/shop/files/112117123_1512x.jpg?v=1694426525',
        text: 'Parallel Modular Kitchen Design',
      },
      {
        image: 'https://i.pinimg.com/736x/eb/0c/23/eb0c23bf3f195214da6998236bfb3ed8.jpg',
        hoverImage: 'https://i.pinimg.com/736x/eb/0c/23/eb0c23bf3f195214da6998236bfb3ed8.jpg',
        text: 'Kitchen Design With Open And Closed Storage Units',
      },
    ]
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    icon: <Bath className="w-5 h-5" />,
    heroImage: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600',
    cards: [
      {
        image: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg',
        hoverImage: 'https://images.pexels.com/photos/5824519/pexels-photo-5824519.jpeg',
        text: 'Minimalist Spa-Inspired Bathroom'
      },
      {
        image: 'https://images.pexels.com/photos/5824533/pexels-photo-5824533.jpeg',
        hoverImage: 'https://images.pexels.com/photos/5824525/pexels-photo-5824525.jpeg',
        text: 'Luxury Marble Master Bath'
      },
      {
        image: 'https://images.pexels.com/photos/6312358/pexels-photo-6312358.jpeg',
        hoverImage: 'https://images.pexels.com/photos/5824515/pexels-photo-5824515.jpeg',
        text: 'Modern Black & White Bathroom'
      },
      {
        image: 'https://images.pexels.com/photos/5824517/pexels-photo-5824517.jpeg',
        hoverImage: 'https://images.pexels.com/photos/5824535/pexels-photo-5824535.jpeg',
        text: 'Organic Modern Bath Oasis'
      },
      {
        image: 'https://images.pexels.com/photos/5824527/pexels-photo-5824527.jpeg',
        hoverImage: 'https://images.pexels.com/photos/5824531/pexels-photo-5824531.jpeg',
        text: 'Industrial Chic Bathroom'
      },
      {
        image: 'https://images.pexels.com/photos/5824521/pexels-photo-5824521.jpeg',
        hoverImage: 'https://images.pexels.com/photos/5824529/pexels-photo-5824529.jpeg',
        text: 'Scandinavian Wet Room'
      },
      {
        image: 'https://images.pexels.com/photos/5824537/pexels-photo-5824537.jpeg',
        hoverImage: 'https://images.pexels.com/photos/5824513/pexels-photo-5824513.jpeg',
        text: 'Japanese Soaking Tub Retreat'
      },
      {
        image: 'https://images.pexels.com/photos/5824523/pexels-photo-5824523.jpeg',
        hoverImage: 'https://images.pexels.com/photos/5824539/pexels-photo-5824539.jpeg',
        text: 'Vintage Glam Bath Suite'
      },
      {
        image: 'https://images.pexels.com/photos/5824519/pexels-photo-5824519.jpeg',
        hoverImage: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg',
        text: 'Smart Technology Bathroom'
      }
    ]
  }
];

// Features Data
const features = [
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "AI-Powered Designs",
    description: "Get personalized designs generated by advanced AI technology"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Expert Designers",
    description: "Work with certified interior design professionals"
  },
  {
    icon: <Clock className="w-8 h-8" />,
    title: "48-Hour Delivery",
    description: "Receive your complete design package within 2 days"
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Quality Guarantee",
    description: "100% satisfaction guarantee on all our designs"
  }
];

// Stats Data
const stats = [
  { number: "10,000+", label: "Happy Customers" },
  { number: "50,000+", label: "Designs Created" },
  { number: "4.9/5", label: "Customer Rating" },
  { number: "48hr", label: "Average Delivery" }
];

const Interior = () => {
  const [activeTab, setActiveTab] = useState('living');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', pincode: '', whatsappUpdates: true
  });
  const [pincodeError, setPincodeError] = useState(false);

  const currentCategory = roomCategories.find(cat => cat.id === activeTab) || roomCategories[0];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'pincode') setPincodeError(value.trim() === '');
  };

  const toggleWhatsappUpdates = () => {
    setFormData(prev => ({ ...prev, whatsappUpdates: !prev.whatsappUpdates }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.pincode.trim() === '') {
      setPincodeError(true);
      return;
    }
    alert('Thank you! We will contact you soon for your free 3D design session.');
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --color-primary: #5C039B;
          --color-blue: #03A4F4;
          --color-green: #64EF0A;
          --color-purple-light: #7E3BA8;
          --color-purple-dark: #4A0278;
        }
      `}</style>

      <div className="bg-gradient-to-br from-purple-50 to-blue-50">
        {/* Hero Section */}
        <div className="relative w-full h-[700px] overflow-hidden">
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700"
              style={{ backgroundImage: `url(${currentCategory.heroImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-blue-900/60" />
          </div>

          <div className="relative z-10 h-full container mx-auto px-4 md:px-8 flex items-end pb-16">
            <div className="text-white max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-purple-300" />
                <span className="text-purple-300 font-semibold">AI-Powered Interior Design</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                Interior Design Planner
              </h1>
              <p className="text-xl md:text-2xl font-light max-w-2xl mb-8 text-purple-100">
                Get stunning AI-generated designs tailored to your style, budget, and space requirements.
              </p>
              
              {/* Features List */}
              <div className="flex flex-wrap gap-6 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-purple-100">{feature.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form - Fixed on Right */}
            <div className="absolute right-8 bottom-16 w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border-2 border-purple-200">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-purple-800 mb-2">Get Free 3D Design</h2>
                <p className="text-purple-600">Book your complimentary design session</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="Your Name" 
                    required 
                    className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-all text-purple-800 placeholder-purple-400" 
                  />
                </div>
                
                <div>
                  <input 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    placeholder="Email Address" 
                    required 
                    className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-all text-purple-800 placeholder-purple-400" 
                  />
                </div>
                
                <div className="flex items-center gap-3 border-2 border-purple-200 rounded-xl px-4 py-3 focus-within:border-purple-500 transition-all">
                  <img src="https://flagcdn.com/in.svg" alt="India" className="w-6 h-4" />
                  <input 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    placeholder="Mobile Number" 
                    required 
                    className="flex-1 outline-none text-purple-800 placeholder-purple-400" 
                  />
                </div>
                
                <div>
                  <input 
                    name="pincode" 
                    value={formData.pincode} 
                    onChange={handleInputChange} 
                    placeholder="Your Pincode" 
                    required 
                    className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-all text-purple-800 placeholder-purple-400" 
                  />
                  {pincodeError && <p className="text-red-500 text-sm mt-2">Please enter your pincode</p>}
                </div>

                <div className="flex items-center justify-between bg-purple-50 rounded-xl p-4">
                  <div>
                    <span className="text-sm font-medium text-purple-800">WhatsApp Updates</span>
                    <p className="text-xs text-purple-600">Get design updates on WhatsApp</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.whatsappUpdates} 
                      onChange={toggleWhatsappUpdates} 
                      className="sr-only peer" 
                    />
                    <div className={`w-12 h-6 ${formData.whatsappUpdates ? 'bg-purple-600' : 'bg-gray-300'} rounded-full peer after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6`}></div>
                  </label>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Book Free 3D Design Session
                  <span className="bg-white text-purple-600 px-3 py-1 rounded-full text-sm font-bold">FREE</span>
                </button>
                
                <p className="text-center text-xs text-purple-500">
                  No credit card required • 100% free consultation
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white py-16 border-b border-purple-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">{stat.number}</div>
                  <div className="text-purple-800 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Tabs - Centered Design */}
        <div className="bg-white border-b sticky top-0 z-40 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex justify-center gap-2 py-6">
              {roomCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`flex items-center gap-3 px-8 py-4 font-semibold text-lg whitespace-nowrap transition-all rounded-2xl border-2 min-w-[160px] justify-center ${
                    activeTab === cat.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg border-transparent'
                      : 'text-purple-700 border-purple-200 hover:bg-purple-50 hover:border-purple-300'
                  }`}
                >
                  {cat.icon}
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
      

        {/* Cards Grid */}
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-purple-800 mb-4">
              Stunning {currentCategory.name} Designs
            </h2>
            <p className="text-xl text-purple-600 max-w-2xl mx-auto">
              Browse our curated collection of {currentCategory.name.toLowerCase()} designs and find inspiration for your space
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentCategory.cards.map((card, i) => (
              <Card 
                key={i} 
                image={card.image} 
                hoverImage={card.hoverImage} 
                text={card.text} 
              />
            ))}
          </div>

          <div className="text-center mt-16">
            <button className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-bold px-12 py-4 rounded-full transition-all text-lg flex items-center gap-3 mx-auto hover:shadow-lg">
              Load More {currentCategory.name} Designs
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

  <div className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-purple-800 mb-4">
                Why Choose Our AI Design Service
              </h2>
              <p className="text-xl text-purple-600 max-w-2xl mx-auto">
                Experience the future of interior design with our cutting-edge AI technology
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 text-center hover:shadow-xl transition-all border-2 border-purple-100 hover:border-purple-300"
                >
                  <div className="text-purple-600 bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-purple-800 mb-3">{feature.title}</h3>
                  <p className="text-purple-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Space?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Get started with your free 3D design session today and see your dream space come to life
            </p>
            <button className="bg-white text-purple-600 hover:bg-purple-50 font-bold px-12 py-4 rounded-full text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
              Start Your Free Design
            </button>
          </div>
        </div>

        {/* <FreelancersSection 
          heading={`Top Freelancers for ${currentCategory.name} Design`} 
        />
        <StepCarousel /> */}
        <FaqPage />
      </div>
    </>
  );
};

export default Interior;