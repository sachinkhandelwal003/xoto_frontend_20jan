import React, { useState } from 'react';
import propertyImg from '../../assets/img/Property.png'

const Property = () => {
    
    const primaryPurple = '#673AB7';

    const deals = [
        {
            id: 1,
            type: "Sell",
            name: "Modern Apartment",
            price: "$150,000",
            locationTag: "California",
            beds: 2,
            bathroom: 1,
            area: '85m²',
            imgUrl: "https://placehold.co/600x400/6A1B9A/ffffff?text=Modern+Apartment",
        },
        {
            id: 2,
            type: "Rent",
            name: "City Apartment",
            price: "$180,000",
            locationTag: "Texas",
            beds: 3,
            bathroom: 2,
            area: '110m²',
            imgUrl: "https://placehold.co/600x400/4527A0/ffffff?text=City+Apartment",
        },
        {
            id: 3,
            type: "Sell",
            name: "Luxury Apartment",
            price: "$220,000",
            locationTag: "New York",
            beds: 4,
            bathroom: 3,
            area: '140m²',
            imgUrl: "https://placehold.co/600x400/1565C0/ffffff?text=Luxury+Apartment",
        },
    ];

    const [likedDeals, setLikedDeals] = useState({});

    const toggleLike = (id) => {
        setLikedDeals(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const locationColors = {
        "California": { bg: '#E3F2FD', text: '#1E88E5' },
        "Texas": { bg: '#E8F5E9', text: '#4CAF50' },
        "New York": { bg: '#FBEFF4', text: '#AD1457' },
    };

    const PropertyCard = ({ deal }) => {
        const isLiked = likedDeals[deal.id];

        const DetailIcon = ({ value, label, icon }) => (
            <div className="flex flex-col items-start space-y-1">
                {icon}
                <span className="text-gray-900 font-medium text-sm">{value}</span>
                <span className="text-gray-500 text-xs">{label}</span>
            </div>
        );

        const colors = locationColors[deal.locationTag] || { bg: '#E0E0E0', text: '#424242' };

        return (
            <div className="flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                
                <div className="relative h-64 w-full overflow-hidden">
                    <img 
                        src={propertyImg} 
                        alt={deal.name} 
                        className="w-full h-full object-cover rounded-t-xl"
                    />
                    
                    <div className="absolute top-4 left-4 text-white text-xs font-semibold py-1 px-3 rounded-full shadow-md"
                         style={{ backgroundColor: deal.type === 'Sell' ? '#E53935' : '#4DB6AC' }}>
                        {deal.type}
                    </div>

                    <button 
                        onClick={() => toggleLike(deal.id)}
                        className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-colors duration-200 ${isLiked ? 'text-red-500 bg-white/70' : 'text-white/70 bg-gray-900/40 hover:text-red-500'}`}
                        aria-label="Toggle like"
                    >
                        <svg className="w-6 h-6" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                    </button>
                </div>
                
                <div className="p-6 pb-4">
                    <h4 className="text-xl font-semibold text-gray-900 mb-1">{deal.name}</h4>
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-2xl font-bold text-gray-900">{deal.price}</p>
                        <span className="text-xs font-semibold py-1 px-4 rounded-md" 
                            style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                            {deal.locationTag}
                        </span>
                    </div>

                    <div className="border-t border-gray-100 pt-6 flex justify-between space-x-2">
                        <DetailIcon value={`${deal.beds}`} label="Bedrooms" icon={<svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>} />
                        <DetailIcon value={`${deal.bathroom}`} label="Bathroom" icon={<svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>} />
                        <DetailIcon value={`${deal.area}`} label="Living Area" icon={<svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-8v8m-4-8v8M4 16h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1z"></path></svg>} />
                    </div>

                    <button className="w-full py-3 mt-8 text-white font-semibold rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
                        style={{ backgroundColor: primaryPurple, boxShadow: `0 4px 6px -1px rgba(103, 58, 183, 0.4), 0 2px 4px -1px rgba(103, 58, 183, 0.2)` }}
                    >
                        View More
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="font-sans min-h-screen relative bg-gray-50 overflow-hidden">
            <style jsx="true">{`
                .title-color {
                    color: #212121;
                    font-weight: 700;
                    font-size: clamp(2rem, 5vw, 3rem);
                }
                .wave-background {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 50%;
                    background: radial-gradient(circle at 50% 100%, #EDE7F6 0%, #FFFFFF 50%);
                    opacity: 0.8;
                    z-index: 0;
                    background-image: linear-gradient(0deg, rgba(179, 157, 219, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 195, 74, 0.1) 1px, transparent 1px);
                    background-size: 50px 50px;
                }
            `}</style>

            <div className="wave-background"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
                <div className="mb-16 text-center">
                    <h2 className="title-color">Our Property</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {deals.map(deal => (
                        <PropertyCard key={deal.id} deal={deal} />
                    ))}
                </div>

                <div className="flex justify-center items-center mt-12 space-x-3">
                    <button className="p-3 bg-white text-gray-700 rounded-full shadow-lg border border-gray-200 hover:bg-gray-100 transition duration-150">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <button className="p-3 text-white rounded-full shadow-lg transition duration-150"
                        style={{ backgroundColor: primaryPurple, hover: { backgroundColor: '#512DA8' } }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Property;