import React from 'react';
import homeImg from '../../assets/img/contect.jpg';

const Contect = () => {
  const primaryPurple = '#673AB7';

  return (
    <section className="relative bg-white overflow-hidden font-sans py-16 px-6 md:px-12 lg:px-20">
      <div className="relative z-10 flex flex-col lg:flex-row items-stretch justify-between max-w-6xl mx-auto gap-10 lg:gap-16 min-h-[75vh]">

        {/* Left Side */}
        <div className="w-full lg:w-1/2 text-center lg:text-left flex flex-col justify-center">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 mb-4">
            <span className="text-purple-700">Where Dreams</span> Meet Doorsteps
          </h2>
          <p className="text-lg text-gray-700 mb-10 max-w-md mx-auto lg:mx-0">
            Find, Sell & Finance Your Dream Home — Smarter, Faster, Easier.
          </p>

          {/* Larger & Rotated Image */}
          <div className="relative mt-8 max-w-xl mx-auto lg:mx-0">
            <img
              src={homeImg}
              alt="3D House"
              className="w-full h-auto object-contain rounded-md transform"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-[55%] flex justify-center items-stretch">
          <div className="bg-white rounded-lg shadow-xl p-8 sm:p-10 w-full max-w-md border border-gray-100 flex flex-col justify-center h-full min-h-[620px]">
            <h3 className="text-2xl font-semibold text-gray-900 mb-5 text-center">
              Discover, Decide, Deal — All in One Place
            </h3>

            <form className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name*</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name*</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email*</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label htmlFor="number" className="block text-sm font-medium text-gray-700">Number*</label>
                <input
                  type="tel"
                  id="number"
                  name="number"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  placeholder="Enter number"
                />
              </div>

              <div>
                <label htmlFor="bookingInterest" className="block text-sm font-medium text-gray-700">Interested In*</label>
                <select
                  id="bookingInterest"
                  name="bookingInterest"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                >
                  <option>Buy</option>
                  <option>Sell</option>
                  <option>Rent</option>
                </select>
              </div>

              <div>
                <label htmlFor="preferredCity" className="block text-sm font-medium text-gray-700">City*</label>
                <select
                  id="preferredCity"
                  name="preferredCity"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                >
                  <option>Delhi</option>
                  <option>Mumbai</option>
                  <option>Bangalore</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700">Budget*</label>
                <input
                  type="text"
                  id="budget"
                  name="budget"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  placeholder="Enter your budget"
                />
              </div>

              <div className="sm:col-span-2 mt-4">
                <button
                  type="submit"
                  className="w-full py-2.5 text-white font-semibold rounded-md transition duration-300 shadow-md hover:shadow-lg"
                  style={{
                    backgroundColor: primaryPurple,
                    boxShadow: `0 4px 6px -1px rgba(103, 58, 183, 0.4), 0 2px 4px -1px rgba(103, 58, 183, 0.2)`,
                  }}
                >
                  Submit Now
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contect;