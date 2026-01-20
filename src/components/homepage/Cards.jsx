import React, { useState } from "react";
import customIcon from "../../assets/img/custom-icon.jpg";
import cardsBg from "../../assets/img/CardsBg.jpg";

const Cards = () => {
  const deals = [
    {
      id: 1,
      title: "Palm Harbor",
      price: "$2,095",
      monthly: true,
      address: "2699 Green Valley, Highland Lake, FL",
      beds: 3,
      bathrooms: 2,
      area: "5x7 m²",
      isPopular: true,
      imgUrl: "https://placehold.co/600x400/ECECEC/222?text=PROPERTY+1",
    },
    {
      id: 2,
      title: "Beverly Springfield",
      price: "$2,700",
      monthly: true,
      address: "2821 Lake Sevilla, Palm Harbor, TX",
      beds: 4,
      bathrooms: 2,
      area: "6x7.5 m²",
      isPopular: true,
      imgUrl: "https://placehold.co/600x400/ECECEC/222?text=PROPERTY+2",
    },
    {
      id: 3,
      title: "Faulkner Ave",
      price: "$4,550",
      monthly: true,
      address: "909 Woodland St, Michigan, IN",
      beds: 4,
      bathrooms: 3,
      area: "8x10 m²",
      isPopular: true,
      imgUrl: "https://placehold.co/600x400/ECECEC/222?text=PROPERTY+3",
    },
  ];

  const [likedDeals, setLikedDeals] = useState({});
  const toggleLike = (id) => {
    setLikedDeals((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const PropertyCard = ({ deal }) => {
    const isLiked = likedDeals[deal.id];

    return (
      <div className="group relative flex flex-col bg-white rounded-lg shadow-md overflow-hidden w-full max-w-sm transition-transform duration-300 hover:scale-105 hover:shadow-xl">
        {/* Image */}
        <div className="relative h-64 w-full overflow-hidden">
          <img
            src={customIcon}
            alt={deal.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {deal.isPopular && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold py-1 px-2 rounded-full flex items-center z-10">
              POPULAR
            </div>
          )}

          {/* Heart Icon */}
          <button
            onClick={() => toggleLike(deal.id)}
            className={`absolute top-3 right-3 z-20 p-2 rounded-full transition-colors duration-200 ${isLiked ? "text-red-500 bg-red-100" : "text-gray-400 hover:text-red-500 hover:bg-gray-100"}`}
            aria-label="Toggle favorite"
          >
            <svg
              className="w-5 h-5"
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
          </button>
        </div>

        {/* Details (Visible by default) */}
        <div className="p-4">
          <p className="text-xl font-bold text-[#1a237e]">
            {deal.price}{" "}
            <span className="text-gray-500 text-sm font-normal">
              /{deal.monthly ? "month" : ""}
            </span>
          </p>
          <h4 className="text-lg font-semibold text-gray-900 mt-1">
            {deal.title}
          </h4>
          <p className="text-gray-500 text-sm mt-1">{deal.address}</p>

          <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between space-x-2 text-gray-500 text-sm">
            <div className="flex items-center">
              <span className="mr-1">{deal.beds}</span>Beds
            </div>
            <div className="flex items-center">
              <span className="mr-1">{deal.bathrooms}</span>Baths
            </div>
            <div className="flex items-center">
              <span className="mr-1">{deal.area}</span>Area
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans min-h-screen relative p-8">
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={cardsBg}
          alt="City Skyline"
          className="w-full h-full object-cover opacity-60"
          style={{ filter: "grayscale(10%) brightness(0.6)" }}
        />
        <div className="absolute top-0 left-0 right-0 h-1/2  from-blue-700 to-transparent z-0"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="mb-12 flex flex-col md:flex-row items-start justify-between">
          <h2 className="text-white font-bold text-3xl md:text-4xl">
            Hot Property Deals
          </h2>
          <p className="text-white text-base sm:text-lg font-normal max-w-sm mt-3 md:mt-0">
            Discover exclusive properties with the best value in Dubai's premium
            locations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <PropertyCard key={deal.id} deal={deal} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Cards;
