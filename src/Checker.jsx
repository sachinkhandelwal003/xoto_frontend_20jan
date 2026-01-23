import React, { useState, useMemo } from 'react';
import { Input, Select, Space, Typography } from 'antd';
import CountryList from 'country-list-with-dial-code-and-flag';
import Country from './Country';

const { Option } = Select;

const Checker = () => {
  const [countryCode, setCountryCode] = useState("+971");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Memoize the list to prevent unnecessary re-calculations
  const countryOptions = useMemo(() => CountryList.getAll(), []);

  return (
    <>
    <div style={{ padding: '50px' }}>
      <Typography.Title level={4}>Mobile Number Input</Typography.Title>

      {/* FIX 1: Use Space.Compact instead of addonBefore */}
      <Space.Compact style={{ width: '100%', maxWidth: '500px' }}>
        
        <Select
          showSearch
          value={countryCode}
          onChange={setCountryCode}
          style={{ width: '35%' }} // Adjust width as needed
          placeholder="Code"
          optionFilterProp="label" // FIX 2: Tell AntD to search inside the 'label' prop
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        >
          {countryOptions.map((country, index) => (
            <Option
              // FIX 3: Ensure key is unique using code + index fallback
              key={`${country.code}-${index}`} 
              value={country.dial_code}
              // We pass the plain text here for the Search Filter to use
              label={`${country.name} ${country.dial_code}`} 
            >
              {/* This is what actually displays in the dropdown (Flag + Text) */}
              <span>{country.flag} {country.name} ({country.dial_code})</span>
            </Option>
          ))}
        </Select>

        <Input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="501234567"
          style={{ width: '65%' }}
        />
        
      </Space.Compact>

      {/* Debug Output */}
      <div style={{ marginTop: '20px', color: '#888' }}>
        <p>Full Mobile: <strong>{countryCode}{phoneNumber}</strong></p>
      </div>
    </div>
<Country/>
    </>
  );
};

export default Checker;