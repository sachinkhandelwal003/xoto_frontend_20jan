import React, { useState, useMemo } from 'react';
import { Select, Typography, Space, Card } from 'antd';
// 1. Import from library (Keep this as Country)
import { Country, State, City } from 'country-state-city'; 

const { Option } = Select;

// 2. FIX: Rename your component to 'LocationSelector' (or anything else)
const LocationSelector = () => {
  // --- States for Location ---
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  // --- Data Sources ---
  const countries = useMemo(() => Country.getAllCountries(), []);

  const states = useMemo(() => {
    if (!selectedCountry) return [];
    return State.getStatesOfCountry(selectedCountry);
  }, [selectedCountry]);

  const cities = useMemo(() => {
    if (!selectedCountry || !selectedState) return [];
    return City.getCitiesOfState(selectedCountry, selectedState);
  }, [selectedCountry, selectedState]);

  // --- Handlers ---
  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    setSelectedState(null); // Reset State
    setSelectedCity(null);  // Reset City
  };

  const handleStateChange = (stateCode) => {
    setSelectedState(stateCode);
    setSelectedCity(null); // Reset City
  };

  const handleCityChange = (cityName) => {
    setSelectedCity(cityName);
  };

  // --- Shared Search Filter Function ---
  const filterOption = (input, option) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  return (
    <div style={{ padding: '50px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card title="Select Location (Searchable)" bordered={false} style={{ width: 500, margin: '0 auto' }}>
        
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          
          {/* 1. Country Select */}
          <div>
            <Typography.Text strong>Country</Typography.Text>
            <Select
              showSearch
              placeholder="Select Country"
              optionFilterProp="label"
              filterOption={filterOption}
              onChange={handleCountryChange}
              value={selectedCountry}
              style={{ width: '100%', marginTop: '5px' }}
            >
              {countries.map((country) => (
                <Option 
                    key={country.isoCode} 
                    value={country.isoCode} 
                    label={country.name}
                >
                  {country.flag} {country.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* 2. State Select */}
          <div>
            <Typography.Text strong>State / Province</Typography.Text>
            <Select
              showSearch
              placeholder={!selectedCountry ? "Select Country First" : "Select State"}
              optionFilterProp="label"
              filterOption={filterOption}
              onChange={handleStateChange}
              value={selectedState}
              disabled={!selectedCountry} // Disable if no country selected
              style={{ width: '100%', marginTop: '5px' }}
            >
              {states.map((state) => (
                <Option 
                    key={state.isoCode} 
                    value={state.isoCode} 
                    label={state.name}
                >
                  {state.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* 3. City Select */}
          <div>
            <Typography.Text strong>City</Typography.Text>
            <Select
              showSearch
              placeholder={!selectedState ? "Select State First" : "Select City"}
              optionFilterProp="label"
              filterOption={filterOption}
              onChange={handleCityChange}
              value={selectedCity}
              disabled={!selectedState} // Disable if no state selected
              style={{ width: '100%', marginTop: '5px' }}
            >
              {cities.map((city) => (
                <Option 
                    key={city.name} 
                    value={city.name} 
                    label={city.name}
                >
                  {city.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* Result Display */}
          <div style={{ marginTop: 20, padding: 10, background: '#eee', borderRadius: 4 }}>
             <strong>Selected: </strong> 
             {selectedCountry || '...'} / {selectedState || '...'} / {selectedCity || '...'}
          </div>

        </Space>
      </Card>
    </div>
  );
};

export default LocationSelector;