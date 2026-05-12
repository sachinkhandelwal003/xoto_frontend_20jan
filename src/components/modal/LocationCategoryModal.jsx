import React, { useState, useEffect } from 'react';
import { 
  Modal, Button, Card, Row, Col, Typography, Spin, 
  Badge, Tag, Space, message, Divider, Statistic 
} from 'antd';
import { 
  EnvironmentOutlined, CheckCircleOutlined, RightOutlined, 
  LeftOutlined, BuildOutlined, PictureOutlined, EyeOutlined,
  CalculatorOutlined, LockOutlined, ThunderboltOutlined,
  DollarCircleOutlined, AppstoreOutlined, BgColorsOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../../manageApi/utils/custom.apiservice';

const { Title, Text, Paragraph } = Typography;

/**
 * XOTO DISCOVERY JOURNEY MODAL
 * Workflow: Location -> Category -> Sub -> Type -> Preview -> Moodboard -> PACKAGE SELECT -> ESTIMATION & UNLOCK
 */
const LocationCategoryModal = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [step, setStep] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [packages, setPackages] = useState([]);
  
  const [selection, setSelection] = useState({
    coords: null,
    category: null,
    subcategory: null,
    type: null,
    package: null
  });

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4 }
  };

  useEffect(() => {
    const initFetch = async () => {
      try {
        const res = await apiService.get('/estimate/master/category');
        setCategories(res.data || res.categories || []);
        
        setLoadingPackages(true);
        const pkgRes = await apiService.get("/packages");
        if (pkgRes.success) setPackages(pkgRes.packages.filter(p => p.isActive));
        setLoadingPackages(false);
      } catch (err) {
        setLoadingPackages(false);
      }
    };
    initFetch();
  }, []);

  const handleFetchSubs = async (catId) => {
    setLoading(true);
    try {
      const res = await apiService.get(`/estimate/master/category/${catId}/subcategories`);
      setSubCategories(res.data || []);
      setStep(2);
    } finally { setLoading(false); }
  };

  const handleFetchTypes = async (subId) => {
    setLoading(true);
    try {
      const res = await apiService.get(`/estimate/master/category/${selection.category._id}/subcategories/${subId}/types`);
      setTypes(res.data || []);
      setStep(3);
    } finally { setLoading(false); }
  };

  const handleLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSelection(s => ({ ...s, coords: { lat: pos.coords.latitude, lng: pos.coords.longitude } }));
        setLoading(false);
        setStep(1); 
      },
      () => {
        message.warning("Using manual search coordinates.");
        setLoading(false);
        setStep(1);
      }
    );
  };

  // --- RENDER STEPS ---

  const renderLocation = () => (
    <motion.div {...fadeIn} className="text-center py-10">
      <EnvironmentOutlined className="text-5xl text-purple-600 mb-6" />
      <Title level={2}>Locate Property</Title>
      <Paragraph>Detecting coordinates for property mapping. [cite: 6]</Paragraph>
      <Button type="primary" size="large" onClick={handleLocation} loading={loading} className="bg-purple-600 rounded-full">
        Grant Access <RightOutlined />
      </Button>
    </motion.div>
  );

  const renderCategories = () => (
    <motion.div {...fadeIn}>
      <Title level={3} className="text-center mb-8">Select Service Category </Title>
      <Row gutter={[20, 20]}>
        {categories.map(cat => (
          <Col span={12} key={cat._id}>
            <Card hoverable className={`text-center rounded-2xl border-2 transition-all ${selection.category?._id === cat._id ? 'border-purple-500 bg-purple-50' : 'border-gray-100'}`}
              onClick={() => { setSelection({...selection, category: cat}); handleFetchSubs(cat._id); }}>
              <div className="text-4xl mb-3">{cat.name === 'Interior' ? '🛋️' : '🌳'}</div>
              <Title level={4} className="m-0 uppercase">{cat.name}</Title>
            </Card>
          </Col>
        ))}
      </Row>
    </motion.div>
  );

  const renderSubCategories = () => (
    <motion.div {...fadeIn}>
      <Title level={3} className="text-center mb-8">Select Space Type</Title>
      <Row gutter={[16, 16]}>
        {subCategories.map(sub => (
          <Col span={8} key={sub._id}>
            <Card size="small" hoverable className="rounded-xl text-center" onClick={() => { setSelection({...selection, subcategory: sub}); handleFetchTypes(sub._id); }}>
              <BuildOutlined className="text-2xl text-purple-500 mb-2" />
              <div className="font-bold text-xs uppercase">{sub.label}</div>
            </Card>
          </Col>
        ))}
      </Row>
      <Button type="link" icon={<LeftOutlined />} onClick={() => setStep(1)} className="mt-6">Back</Button>
    </motion.div>
  );

  const renderTypes = () => (
    <motion.div {...fadeIn}>
      <Title level={3} className="text-center mb-8">Choose Design Aesthetic</Title>
      <Row gutter={[16, 16]}>
        {types.map(t => (
          <Col span={8} key={t._id}>
            <Card size="small" hoverable className="rounded-xl text-center border-purple-100" onClick={() => { setSelection({...selection, type: t}); setStep(4); }}>
              <BgColorsOutlined className="text-2xl text-purple-600 mb-2" />
              <div className="font-bold text-[11px] uppercase">{t.label}</div>
            </Card>
          </Col>
        ))}
      </Row>
      <Button type="link" icon={<LeftOutlined />} onClick={() => setStep(2)} className="mt-6">Back</Button>
    </motion.div>
  );

  const renderQuickPreview = () => {
    const previewImg = selection.category?.name === "Interior"
        ? "https://images.unsplash.com/photo-1586023492125-27b2c045efd7"
        : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c";

    return (
      <motion.div {...fadeIn}>
        <div className="flex justify-between items-center mb-4">
            <Title level={3} className="m-0 text-purple-800">Visual Preview </Title>
            <Tag color="blue" icon={<EyeOutlined />}>Static Overlay [cite: 8]</Tag>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-2xl mb-6 border-4 border-white">
          <img src={`${previewImg}?auto=format&fit=crop&w=1200&q=80`} className="w-full h-[320px] object-cover" alt="Yard Overlay" />
        </div>
        <div className="flex justify-between">
          <Button size="large" onClick={() => setStep(3)}>Back</Button>
          <Button type="primary" size="large" className="bg-purple-600 border-none" onClick={() => setStep(5)}>
            Generate Mood Board   <RightOutlined />
          </Button>
        </div>
      </motion.div>
    );
  };

  const renderMoodBoard = () => {
    const imgIds = selection.category?.name === 'Interior' 
      ? ['1586023492125-27b2c045efd7', '1583847268964-b28dc2f51ac9', '1598928506311-c55ded91a20c', '1616489953149-75573a1b55a1']
      : ['1558905619-171426efb452', '1584622650111-993a426fbf0a', '1592595821298-af38b39ca1e0', '1600585154340-be6161a56a0c'];

    return (
      <motion.div {...fadeIn}>
        <Title level={3} className="text-purple-800 font-extrabold uppercase italic mb-4">Mood Board </Title>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {imgIds.map((id, i) => (
            <motion.div key={i} whileHover={{ scale: 1.02 }} className={`rounded-xl overflow-hidden shadow-lg border-2 border-white ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
              <img src={`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80`} className="w-full h-full object-cover" alt="Mood asset" />
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between">
          <Button size="large" onClick={() => setStep(4)}>Back</Button>
          <Button type="primary" size="large" className="bg-purple-600 border-none" onClick={() => setStep(6)}>
            Choose Package Tier <RightOutlined />
          </Button>
        </div>
      </motion.div>
    );
  };

  const renderPackages = () => (
    <motion.div {...fadeIn}>
      <Title level={2} className="text-center mb-4 text-purple-900 font-bold uppercase">Package Tiers</Title>
      <Paragraph className="text-center text-gray-400 mb-8 font-semibold">Select a tier to define your render quality and estimate depth. </Paragraph>
      {loadingPackages ? <Spin size="large" className="block mx-auto" /> : (
        <Row gutter={[20, 20]}>
          {packages.map((pkg) => (
            <Col xs={24} md={8} key={pkg._id}>
              <Card hoverable className={`rounded-3xl border-2 transition-all duration-300 h-full ${selection.package?._id === pkg._id ? 'border-purple-600 bg-purple-50 shadow-xl scale-105' : 'border-gray-100'}`}
                onClick={() => setSelection({...selection, package: pkg})}>
                <Title level={4} className="text-center mb-4 uppercase">{pkg.name}</Title>
                <Divider className="my-2" />
                <ul className="space-y-2 mb-6 h-32 overflow-hidden">
                  {pkg.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="text-[11px] text-gray-500 flex items-start">
                      <CheckCircleOutlined className="text-green-500 mr-2 mt-1" /> {f}
                    </li>
                  ))}
                </ul>
                <Button block type={selection.package?._id === pkg._id ? "primary" : "default"} 
                  className={selection.package?._id === pkg._id ? "bg-purple-600 border-none rounded-xl font-bold" : "rounded-xl"}
                  onClick={() => setStep(7)}>
                  Select {pkg.name}
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      <div className="text-center mt-6">
        <Button type="link" onClick={() => setStep(5)} className="text-gray-400">Back to Mood Board</Button>
      </div>
    </motion.div>
  );

  const renderEstimation = () => {
    const pkg = selection.package;
    const basePrice = pkg?.price || (pkg?.name === 'Premium' ? 14500 : 6800);
    return (
      <motion.div {...fadeIn}>
        <div className="text-center mb-8">
          <Badge status="processing" text="Estimation Generated" />
          <Title level={2} className="mt-2 text-purple-900 font-black italic">Project Estimate </Title>
          <Text type="secondary">Based on project tier: <strong>{pkg?.name}</strong></Text>
        </div>
        <Row gutter={24} className="mb-8">
          <Col span={15}>
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-purple-100">
              <Title level={5} className="uppercase text-[10px] tracking-widest text-gray-400 font-bold mb-4">Cost Components</Title>
              <div className="space-y-4">
                <div className="flex justify-between"><Text><ThunderboltOutlined className="text-yellow-500 mr-2"/> Design Fees</Text><Text strong>{(basePrice * 0.15).toLocaleString()} AED</Text></div>
                <div className="flex justify-between"><Text><AppstoreOutlined className="text-blue-500 mr-2"/> Materials (Est.)</Text><Text strong className="text-gray-400 font-normal"><LockOutlined className="text-[10px]"/> Unlocked in BOQ </Text></div>
                <div className="flex justify-between"><Text><CalculatorOutlined className="text-green-500 mr-2"/> Labor Index</Text><Text strong>{(basePrice * 0.35).toLocaleString()} AED</Text></div>
                <Divider className="my-2" />
                <div className="flex justify-between text-2xl font-black text-purple-700 uppercase italic"><span>Estimated Total</span><span>{basePrice.toLocaleString()} AED</span></div>
              </div>
            </div>
          </Col>
          <Col span={9}>
            <Card className="h-full rounded-[40px] border-none shadow-2xl bg-gradient-to-br from-purple-800 to-indigo-900 text-white text-center flex flex-col justify-center">
               <Statistic title={<span className="text-purple-200 text-xs font-bold uppercase tracking-widest">Base Estimate</span>} value={basePrice} suffix="AED" valueStyle={{ color: '#fff', fontSize: '2.5rem', fontWeight: 900 }} />
               <Text className="text-white/40 text-[9px] mt-4 block">Estimate accuracy based on tier </Text>
            </Card>
          </Col>
        </Row>
        <div className="flex justify-between items-center">
          <Button size="large" onClick={() => setStep(6)}>Back to Packages</Button>
          <Button type="primary" size="large" className="bg-purple-600 border-none px-12 h-14 rounded-2xl font-black shadow-xl" onClick={() => setIsVisible(false)}>
            Unlock Tier  <RightOutlined />
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <Modal open={isVisible} onCancel={() => setIsVisible(false)} footer={null} width={step >= 4 ? 1050 : 750} centered bodyStyle={{ padding: '40px' }} maskStyle={{ backdropFilter: 'blur(12px)', background: 'rgba(23, 2, 41, 0.6)' }}>
      <AnimatePresence mode="wait">
        {step === 0 && renderLocation()}
        {step === 1 && renderCategories()}
        {step === 2 && renderSubCategories()}
        {step === 3 && renderTypes()}
        {step === 4 && renderQuickPreview()}
        {step === 5 && renderMoodBoard()}
        {step === 6 && renderPackages()}
        {step === 7 && renderEstimation()}
      </AnimatePresence>
      <div className="flex justify-center gap-3 mt-10">
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'w-10 bg-purple-600' : 'w-2 bg-gray-200'}`} />
        ))}
      </div>
    </Modal>
  );
};

export default LocationCategoryModal;