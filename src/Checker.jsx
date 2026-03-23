// import React, { useState, useMemo } from 'react';
// import { Input, Select, Space, Typography } from 'antd';
// import CountryList from 'country-list-with-dial-code-and-flag';
// import Country from './Country';

// const { Option } = Select;

// const Checker = () => {
//   const [countryCode, setCountryCode] = useState("+971");
//   const [phoneNumber, setPhoneNumber] = useState("");

//   // Memoize the list to prevent unnecessary re-calculations
//   const countryOptions = useMemo(() => CountryList.getAll(), []);

//   return (
//     <>
//     <div style={{ padding: '50px' }}>
//       <Typography.Title level={4}>Mobile Number Input</Typography.Title>

//       {/* FIX 1: Use Space.Compact instead of addonBefore */}
//       <Space.Compact style={{ width: '100%', maxWidth: '500px' }}>
        
//         <Select
//           showSearch
//           value={countryCode}
//           onChange={setCountryCode}
//           style={{ width: '35%' }} // Adjust width as needed
//           placeholder="Code"
//           optionFilterProp="label" // FIX 2: Tell AntD to search inside the 'label' prop
//           filterOption={(input, option) =>
//             (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
//           }
//         >
//           {countryOptions.map((country, index) => (
//             <Option
//               // FIX 3: Ensure key is unique using code + index fallback
//               key={`${country.code}-${index}`} 
//               value={country.dial_code}
//               // We pass the plain text here for the Search Filter to use
//               label={`${country.name} ${country.dial_code}`} 
//             >
//               {/* This is what actually displays in the dropdown (Flag + Text) */}
//               <span>{country.flag} {country.name} ({country.dial_code})</span>
//             </Option>
//           ))}
//         </Select>

//         <Input
//           value={phoneNumber}
//           onChange={(e) => setPhoneNumber(e.target.value)}
//           placeholder="501234567"
//           style={{ width: '65%' }}
//         />
        
//       </Space.Compact>

//       {/* Debug Output */}
//       <div style={{ marginTop: '20px', color: '#888' }}>
//         <p>Full Mobile: <strong>{countryCode}{phoneNumber}</strong></p>
//       </div>
//     </div>
// <Country/>
//     </>
//   );
// };

// export default Checker;






import { Home, Building2, Sofa, Trees, Store } from "lucide-react";

const items = [
  {
    title: "MORTGAGES",
    desc: "Smart financing that works for you.",
    icon: <Home />,
    align: "left",
  },
  {
    title: "PROPERTY",
    desc: "Discover and transact with confidence.",
    icon: <Building2 />,
    align: "right",
  },
  {
    title: "INTERIORS",
    desc: "Design spaces that reflect your lifestyle.",
    icon: <Sofa />,
    align: "left",
  },
  {
    title: "LANDSCAPING",
    desc: "Elevate your outdoor living.",
    icon: <Trees />,
    align: "right",
  },
  {
    title: "XOTO STORE",
    desc: "Explore a curated marketplace for home upgrades.",
    icon: <Store />,
    align: "left",
  },
];

export default function Checker() {
  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-center p-6">
      <div className="relative bg-white rounded-2xl p-10 w-full max-w-4xl shadow-lg">

        {/* SVG Curved Lines */}
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          viewBox="0 0 800 600"
        >
          {/* Curves */}
          <path
            d="M200 80 H400 Q450 80 450 130 V170 Q450 220 500 220 H600"
            stroke="#000"
            fill="transparent"
          />
          <path
            d="M600 220 H400 Q350 220 350 270 V310 Q350 360 300 360 H200"
            stroke="#000"
            fill="transparent"
          />
          <path
            d="M200 360 H400 Q450 360 450 410 V450 Q450 500 500 500 H600"
            stroke="#000"
            fill="transparent"
          />
        </svg>

        {/* Content */}
        <div className="flex flex-col gap-16 relative z-10">
          {items.map((item, index) => (
            <div
              key={index}
              className={`flex items-center ${
                item.align === "left"
                  ? "justify-start"
                  : "justify-end"
              }`}
            >
              <div className="flex items-center gap-4">

                {item.align === "right" && (
                  <IconCircle icon={item.icon} />
                )}

                <div className="bg-gray-100 px-6 py-4 rounded-xl shadow-md w-64">
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>

                {item.align === "left" && (
                  <IconCircle icon={item.icon} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IconCircle({ icon }) {
  return (
    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-600 text-white shadow-lg">
      {icon}
    </div>
  );
}