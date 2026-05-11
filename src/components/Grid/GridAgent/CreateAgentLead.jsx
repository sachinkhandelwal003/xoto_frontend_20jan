import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { City } from 'country-state-city';
import {
  FiArrowLeft, FiUser, FiPhone, FiMail, FiHome, FiMapPin,
  FiDollarSign, FiCalendar, FiFileText, FiCheckCircle, FiAlertCircle,
  FiChevronDown, FiPlus, FiX, FiLoader
} from 'react-icons/fi';
import { message } from 'antd';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

// ─────────────────────────────────────────────────────────────
// FORM FIELD COMPONENTS
// ─────────────────────────────────────────────────────────────
const Label = ({ children, required }) => (
  <label className="block text-xs font-medium text-gray-600 mb-1.5">
    {children} {required && <span className="text-red-500 normal-case">*</span>}
  </label>
);

const InputField = ({ label, required, error, icon: Icon, ...props }) => (
  <div>
    {label && <Label required={required}>{label}</Label>}
    <div className="relative">
      {Icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon size={15} className="text-gray-400" /></div>}
      <input
        className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 rounded-lg border text-sm font-normal text-gray-800 bg-white placeholder-gray-400 outline-none transition-all duration-150 ${error ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><FiAlertCircle size={11} />{error}</p>}
  </div>
);

const SelectField = ({ label, required, error, children, ...props }) => (
  <div>
    {label && <Label required={required}>{label}</Label>}
    <div className="relative">
      <select
        className={`w-full pl-3 pr-8 py-2.5 rounded-lg border text-sm font-normal text-gray-800 bg-white outline-none appearance-none transition-all duration-150 ${error ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'}`}
        {...props}
      >
        {children}
      </select>
      <FiChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
    {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><FiAlertCircle size={11} />{error}</p>}
  </div>
);

const TextareaField = ({ label, required, error, ...props }) => (
  <div>
    {label && <Label required={required}>{label}</Label>}
    <textarea
      rows={3}
      className={`w-full px-3 py-2.5 rounded-lg border text-sm font-normal text-gray-800 bg-white placeholder-gray-400 outline-none transition-all duration-150 resize-none ${error ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><FiAlertCircle size={11} />{error}</p>}
  </div>
);

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-white">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F5F3FF', color: '#4A027C' }}>
        <Icon size={16} />
      </div>
      <h3 className="text-sm font-medium text-gray-800">{title}</h3>
    </div>
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
      {children}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// SUCCESS OVERLAY
// ─────────────────────────────────────────────────────────────
const UAE_POPULAR_AREAS = [
  'Dubai Marina', 'Downtown Dubai', 'Business Bay', 'Jumeirah Village Circle',
  'Jumeirah Lake Towers', 'Palm Jumeirah', 'Dubai Hills Estate', 'Arabian Ranches',
  'Damac Hills', 'Dubai Creek Harbour', 'Meydan', 'Jumeirah Beach Residence',
  'Al Barsha', 'Dubai Silicon Oasis', 'International City', 'Dubai Sports City',
  'Motor City', 'Al Furjan', 'Town Square', 'Jumeirah Golf Estates',
  'Yas Island', 'Saadiyat Island', 'Al Reem Island', 'Al Raha Beach',
  'Khalifa City', 'Mohammed Bin Zayed City', 'Al Maryah Island',
  'Sharjah Waterfront City', 'Aljada', 'Maryam Island', 'Al Majaz',
  'Ajman Corniche', 'Al Nuaimiya', 'Al Hamra Village', 'Mina Al Arab',
];

const unwrapList = (res) => {
  const data = res?.data?.success !== undefined ? res.data : res?.data || res;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.properties)) return data.properties;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data?.properties)) return data.data.properties;
  if (Array.isArray(data?.data?.results)) return data.data.results;
  return [];
};

const getPropertyId = (property) => property?._id || property?.id || property?.property_id || '';
const getPropertyName = (property) => (
  property?.propertyName || property?.title || property?.name || property?.projectName || 'Untitled Property'
);
const getPropertyMeta = (property) => {
  const location = [property?.area, property?.city, property?.emirate].filter(Boolean).join(', ');
  const price = property?.price ? `AED ${Number(property.price).toLocaleString('en-AE')}` : '';
  return [location, price].filter(Boolean).join(' - ');
};

/* const SuccessOverlay = ({ leadId, navigate }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-4 max-w-sm w-full mx-4 animate-bounce-in">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4A027C, #7C3AED)' }}>
        <FiCheckCircle size={40} className="text-white" />
      </div>
      <h2 className="text-2xl font-medium text-gray-900">Lead Created!</h2>
      <p className="text-sm text-gray-500 text-center">Your lead has been successfully submitted. Our team will follow up shortly.</p>
      <p className="text-xs text-purple-600 font-mono bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">ID: {leadId}</p>
      <div className="flex gap-3 w-full mt-2">
        <button
          onClick={() => navigate && navigate('/dashboard/agent/GridAgent-lead')}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #4A027C, #7C3AED)' }}
        >
          View All Leads
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
        >
          Add Another
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
*/
// MAIN: CREATE LEAD PAGE
// ─────────────────────────────────────────────────────────────
const CreateAgentLead = ({ navigate }) => {
  const routerNavigate = useNavigate();
  const goTo = navigate || routerNavigate;

  const [form, setForm] = useState({
    // Client Info
    first_name:        '',
    last_name:         '',
    phone_number:      '',
    country_code:      '+971',
    email:             '',
    // Requirements
    property_type:     '',
    transaction_type:  'buy',
    budget_min:        '',
    budget_max:        '',
    bedrooms:          '',
    bathrooms:         '',
    area_sqft_min:     '',
    area_sqft_max:     '',
    furnished:         'any',
    ready_by_date:     '',
    additional_notes:  '',
    // Optional
    enquiry_type:      '',
    listing_id:        '',
    // Location (managed separately)
  });

  const [locationInputs, setLocationInputs] = useState(['']);
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const uaeLocations = useMemo(() => {
    const cities = City.getCitiesOfCountry('AE')?.map((city) => city.name) || [];
    return [...new Set([...UAE_POPULAR_AREAS, ...cities])].sort((a, b) => a.localeCompare(b));
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoadingProperties(true);
      try {
        const res = await apiService.get('/properties/public');
        setProperties(unwrapList(res).filter((property) => getPropertyId(property)));
      } catch {
        setProperties([]);
      } finally {
        setLoadingProperties(false);
      }
    };

    fetchProperties();
  }, []);

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  // Location helpers
  const addLocation = () => setLocationInputs((prev) => [...prev, '']);
  const removeLocation = (i) => setLocationInputs((prev) => prev.filter((_, idx) => idx !== i));
  const updateLocation = (i, val) => setLocationInputs((prev) => prev.map((v, idx) => idx === i ? val : v));

  // ── Validation ───────────────────────────────────────────
  const validate = () => {
    const errs = {};
    const filledLocations = locationInputs.filter((l) => l.trim());
    const hasReq = form.property_type || filledLocations.length > 0 || form.budget_min || form.budget_max || form.bedrooms || form.bathrooms || form.additional_notes;
    if (!hasReq) errs._requirements = 'At least one requirement is needed (property type, location, budget, or bedrooms)';
    if (form.budget_min && form.budget_max && Number(form.budget_min) > Number(form.budget_max)) errs.budget_max = 'Max budget must be ≥ min budget';
    return errs;
  };

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const payload = {
        // Client (optional)
        ...(form.first_name   && { first_name:   form.first_name.trim()   }),
        ...(form.last_name    && { last_name:     form.last_name.trim()    }),
        ...(form.phone_number && { phone_number:  form.phone_number.trim(), country_code: form.country_code }),
        ...(form.email        && { email:         form.email.trim()        }),
        // Requirements
        ...(form.property_type    && { property_type:   form.property_type    }),
        transaction_type:           form.transaction_type,
        location_preferences:       locationInputs.filter((l) => l.trim()).map((l) => l.trim()),
        ...(form.budget_min        && { budget_min:     Number(form.budget_min)    }),
        ...(form.budget_max        && { budget_max:     Number(form.budget_max)    }),
        ...(form.bedrooms          && { bedrooms:       Number(form.bedrooms)      }),
        ...(form.bathrooms         && { bathrooms:      Number(form.bathrooms)     }),
        ...(form.area_sqft_min     && { area_sqft_min:  Number(form.area_sqft_min) }),
        ...(form.area_sqft_max     && { area_sqft_max:  Number(form.area_sqft_max) }),
        furnished:                  form.furnished,
        ...(form.ready_by_date     && { ready_by_date:  form.ready_by_date         }),
        ...(form.additional_notes  && { additional_notes: form.additional_notes    }),
        // Optional
        ...(form.enquiry_type  && { enquiry_type: form.enquiry_type }),
        ...(form.listing_id    && { listing_id:   form.listing_id   }),
      };

      const res = await apiService.post('/gridlead/create-lead', payload);
      // Same dual-unwrap pattern as AdvisorLeadsPage
      const result = res?.data?.success !== undefined ? res.data : res;

      if (result?.success) {
        message.success(result?.message || 'Lead created successfully');
        goTo('/dashboard/agent/GridAgent-lead');
      } else {
        const errMsg = result?.message || 'Something went wrong. Please try again.';
        setApiError(errMsg);
        message.error(errMsg);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Server error. Please try again.';
      setApiError(errMsg);
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Success Overlay ── */}
      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => goTo('/dashboard/agent/GridAgent-lead')}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-purple-700 hover:border-purple-300 transition-all"
            >
              <FiArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-medium text-gray-900 leading-tight">Create New Lead</h1>
              <p className="text-xs text-gray-400">Add a new client requirement to CRM</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form id="create-lead-form" onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* API Error */}
          {apiError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
              <p className="text-sm text-red-700">{apiError}</p>
            </div>
          )}

          {/* Requirements error */}
          {errors._requirements && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <FiAlertCircle className="text-amber-500 mt-0.5 flex-shrink-0" size={16} />
              <p className="text-sm text-amber-700">{errors._requirements}</p>
            </div>
          )}

          {/* ── Section 1: Client Info (Optional) ── */}
          <SectionCard title="Client Information (Optional)" icon={FiUser}>
            <InputField label="First Name" placeholder="John" icon={FiUser} value={form.first_name} onChange={(e) => set('first_name', e.target.value)} />
            <InputField label="Last Name"  placeholder="Smith" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} />
            <div>
              <Label>Phone Number</Label>
              <div className="flex gap-2">
                <select
                  className="px-2 py-2.5 rounded-lg border border-gray-200 text-sm font-normal text-gray-700 bg-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 appearance-none"
                  style={{ minWidth: 80 }}
                  value={form.country_code}
                  onChange={(e) => set('country_code', e.target.value)}
                >
                  {['+971','+91','+1','+44','+966','+974','+965','+968'].map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
                <input
                  type="tel"
                  placeholder="50 123 4567"
                  className="flex-1 pl-3 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm font-normal text-gray-800 bg-white placeholder-gray-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  value={form.phone_number}
                  onChange={(e) => set('phone_number', e.target.value)}
                />
              </div>
            </div>
            <InputField label="Email Address" type="email" placeholder="john@example.com" icon={FiMail} value={form.email} onChange={(e) => set('email', e.target.value)} />
          </SectionCard>

          {/* ── Section 2: Property Requirements ── */}
          <SectionCard title="Property Requirements" icon={FiHome}>
            <SelectField label="Property Type" value={form.property_type} onChange={(e) => set('property_type', e.target.value)}>
              <option value="">Select property type</option>
              {['Apartment','Villa','Townhouse','Penthouse','Studio','Office','Retail','Warehouse','Land'].map((t) => (<option key={t} value={t}>{t}</option>))}
            </SelectField>
            <SelectField label="Transaction Type" required value={form.transaction_type} onChange={(e) => set('transaction_type', e.target.value)}>
              <option value="buy">Buy</option>
              <option value="rent">Rent</option>
              <option value="invest">Invest</option>
            </SelectField>
            <InputField label="Min Budget (AED)" type="number" placeholder="500,000" icon={FiDollarSign} value={form.budget_min} onChange={(e) => set('budget_min', e.target.value)} />
            <InputField label="Max Budget (AED)" type="number" placeholder="2,000,000" icon={FiDollarSign} value={form.budget_max} onChange={(e) => set('budget_max', e.target.value)} error={errors.budget_max} />
            <SelectField label="Bedrooms" value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)}>
              <option value="">Any</option>
              {[0,1,2,3,4,5,6,7].map((n) => (<option key={n} value={n}>{n === 0 ? 'Studio' : `${n} BR`}</option>))}
            </SelectField>
            <SelectField label="Bathrooms" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)}>
              <option value="">Any</option>
              {[1,2,3,4,5].map((n) => (<option key={n} value={n}>{n}</option>))}
            </SelectField>
            <InputField label="Min Area (sqft)" type="number" placeholder="500" value={form.area_sqft_min} onChange={(e) => set('area_sqft_min', e.target.value)} />
            <InputField label="Max Area (sqft)" type="number" placeholder="3000" value={form.area_sqft_max} onChange={(e) => set('area_sqft_max', e.target.value)} />
            <SelectField label="Furnishing" value={form.furnished} onChange={(e) => set('furnished', e.target.value)}>
              <option value="any">Any</option>
              <option value="furnished">Furnished</option>
              <option value="semi-furnished">Semi-Furnished</option>
              <option value="unfurnished">Unfurnished</option>
            </SelectField>
            <InputField label="Ready By Date" type="date" icon={FiCalendar} value={form.ready_by_date} onChange={(e) => set('ready_by_date', e.target.value)} />
          </SectionCard>

          {/* ── Section 3: Location Preferences ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-white">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F5F3FF', color: '#4A027C' }}>
                <FiMapPin size={16} />
              </div>
              <h3 className="text-sm font-medium text-gray-800">Location Preferences</h3>
            </div>
            <div className="p-6 flex flex-col gap-3">
              <datalist id="uae-location-options">
                {uaeLocations.map((location) => (
                  <option key={location} value={location} />
                ))}
              </datalist>
              {locationInputs.map((loc, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <FiMapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      list="uae-location-options"
                      placeholder="Search UAE location"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm font-normal text-gray-800 bg-white placeholder-gray-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      value={loc}
                      onChange={(e) => updateLocation(i, e.target.value)}
                    />
                  </div>
                  {locationInputs.length > 1 && (
                    <button type="button" onClick={() => removeLocation(i)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition-all">
                      <FiX size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addLocation}
                className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors w-fit mt-1"
              >
                <FiPlus size={15} /> Add another location
              </button>
            </div>
          </div>

          {/* ── Section 4: Additional Info ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-white">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F5F3FF', color: '#4A027C' }}>
                <FiFileText size={16} />
              </div>
              <h3 className="text-sm font-medium text-gray-800">Additional Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <SelectField label="Enquiry Type" value={form.enquiry_type} onChange={(e) => set('enquiry_type', e.target.value)}>
                <option value="">Auto (from transaction type)</option>
                <option value="buy">Buy</option>
                <option value="rent">Rent</option>
                <option value="sell">Sell</option>
                <option value="general_enquiry">General Enquiry</option>
                <option value="consultation">Consultation</option>
              </SelectField>
              <div>
                <Label>Interested Property</Label>
                <div className="relative">
                  <select
                    value={form.listing_id}
                    onChange={(e) => set('listing_id', e.target.value)}
                    className="w-full pl-3 pr-9 py-2.5 rounded-lg border border-gray-200 text-sm font-normal text-gray-800 bg-white outline-none appearance-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  >
                    <option value="">
                      {loadingProperties ? 'Loading properties...' : 'Select listed property'}
                    </option>
                    {properties.map((property) => {
                      const id = getPropertyId(property);
                      const meta = getPropertyMeta(property);
                      return (
                        <option key={id} value={id}>
                          {getPropertyName(property)}{meta ? ` (${meta})` : ''}
                        </option>
                      );
                    })}
                  </select>
                  {loadingProperties ? (
                    <FiLoader size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin pointer-events-none" />
                  ) : (
                    <FiChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <TextareaField
                  label="Additional Notes"
                  placeholder="Any special requirements or notes about the client..."
                  value={form.additional_notes}
                  onChange={(e) => set('additional_notes', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Bottom Submit (mobile) ── */}
          <div className="sticky bottom-0 z-20 -mx-6 mt-2 border-t border-gray-100 bg-white/95 px-6 py-4 backdrop-blur">
            <div className="max-w-4xl mx-auto flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => goTo('/dashboard/agent/GridAgent-lead')}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #4A027C, #7C3AED)' }}
              >
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : (
                  <><FiCheckCircle size={15} /> Save Lead</>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateAgentLead;
