import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Card, Typography, Tag, Button, Space, 
  message, Spin, Modal, Tooltip, Avatar, Divider, Progress, Empty
} from "antd";
import { 
  CopyOutlined, EyeOutlined, LinkOutlined, 
  ClockCircleOutlined, DesktopOutlined, MobileOutlined,
  GlobalOutlined, ArrowLeftOutlined, FireOutlined, FilePdfOutlined,
  RiseOutlined, CheckCircleOutlined, SyncOutlined, CompassOutlined
} from "@ant-design/icons";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;

export default function TrackBrochure() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract lead info from navigation state
  const navLead = location.state?.lead;
  const leadId = navLead?._id || location.state?.leadId;

  const [loading, setLoading] = useState(true);
  const [brochures, setBrochures] = useState([]);
  
  // Modal state for detailed viewing history
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);

  // Dynamic Image URL Builder
  const placeholderImg = "https://via.placeholder.com/400x250?text=No+Image+Available";
  const backendBaseUrl = import.meta.env?.VITE_API_URL || "http://localhost:5000";

  const getImageUrl = (property) => {
    let imageUrl = property?.image || property?.photos?.[0] || property?.mainLogo;
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${backendBaseUrl}${imageUrl}`;
    }
    return imageUrl || placeholderImg;
  };

  useEffect(() => {
    const fetchTrackingData = async () => {
      if (!leadId) {
        message.error("No lead context provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.get(`/brochure/lead/${leadId}`);
        const list = response?.data?.data || response?.data || [];
        setBrochures(list);
      } catch (error) {
        console.error("Failed to fetch tracking data:", error);
        message.error("Could not load brochure tracking data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();
  }, [leadId]);

  // Utility: Copy link to clipboard
  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    message.success("Tracking link copied to clipboard!");
  };

  // Utility: Format Dates securely
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', 
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  const formatStageString = (str) => {
    if (!str) return "N/A";
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Open detailed history modal
  const handleViewHistory = (brochure) => {
    setSelectedHistory(brochure);
    setIsHistoryModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f6f7fb]">
        <Spin size="large" />
        <Text type="secondary" className="mt-4 text-lg font-medium">Fetching tracking intelligence...</Text>
      </div>
    );
  }

  const displayLead = brochures.length > 0 ? brochures[0].leadId : navLead;

  return (
    <div className="p-6 md:p-10 space-y-6 bg-[#f6f7fb] min-h-screen">
      
      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)} 
            className="mb-2 text-gray-500 hover:text-indigo-600 -ml-3 font-medium transition-colors"
          >
            Back to Lead Details
          </Button>
          <Title level={3} className="!mb-1 text-gray-800 flex items-center gap-3">
            <FireOutlined className="text-volcano" /> Client Engagement Matrix
          </Title>
          {displayLead && (
             <div className="flex items-center gap-3 mt-2">
               <Text type="secondary" className="text-base">
                 Tracking analytics for <Text strong className="text-indigo-600 text-base">{displayLead?.name?.first_name} {displayLead?.name?.last_name}</Text>
               </Text>
               <Tag color="purple" className="rounded-full px-3 py-0.5 border-none font-bold uppercase tracking-wider text-[10px] shadow-sm">
                 Global Status: {displayLead?.status}
               </Tag>
             </div>
          )}
        </div>
        
        {/* Quick summary stats */}
        <div className="flex gap-4">
          <div className="bg-indigo-50/50 px-6 py-4 rounded-2xl border border-indigo-100 text-center min-w-[130px] shadow-inner">
            <Text type="secondary" className="text-[10px] font-extrabold uppercase tracking-widest block mb-1 text-indigo-500">Total Sent</Text>
            <Title level={3} className="!mb-0 !text-indigo-700">{brochures.length}</Title>
          </div>
          <div className="bg-emerald-50/50 px-6 py-4 rounded-2xl border border-emerald-100 text-center min-w-[130px] shadow-inner">
            <Text type="secondary" className="text-[10px] font-extrabold uppercase tracking-widest block mb-1 text-emerald-600">Total Opens</Text>
            <Title level={3} className="!mb-0 !text-emerald-700">
              {brochures.reduce((acc, curr) => acc + (curr.viewCount || 0), 0)}
            </Title>
          </div>
        </div>
      </div>

      {/* ---------------- MAIN DASHBOARD CARDS ---------------- */}
      <div className="space-y-6">
        {brochures.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-3xl shadow-sm border border-gray-100">
            <FilePdfOutlined className="text-7xl text-gray-200 mb-5 block" />
            <Title level={4} className="text-gray-400 !mb-2">No Brochures Found</Title>
            <Text type="secondary" className="text-base">This lead hasn't been sent any AI property presentations yet.</Text>
          </div>
        ) : (
          brochures.map((brochure) => {
            const prop = brochure.propertyId;
            const interest = brochure.interestId;
            const aiMatch = interest?.ai_match;
            const imgUrl = getImageUrl(prop);

            return (
              <Card 
                key={brochure._id} 
                className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden bg-white"
                bodyStyle={{ padding: '0' }}
              >
                {/* Changed to lg:flex-row to ensure it stays horizontal on larger screens without squishing */}
                <div className="flex flex-col lg:flex-row items-stretch">
                  
                  {/* 1. LEFT: Fixed-Width Property Image & Title */}
                  <div className="relative w-full lg:w-80 h-64 lg:h-auto flex-shrink-0 bg-gray-100 border-r border-gray-100">
                    <img 
                      src={imgUrl} 
                      alt={prop?.propertyName} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                    />
                    
                    {/* Gradient Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    
                    {/* Top Right Match Tag */}
                    {aiMatch?.score && (
                      <div className="absolute top-4 right-4">
                        <Tag color={aiMatch.score >= 90 ? "success" : "processing"} className="m-0 rounded-full px-3 py-1 border-white/20 shadow-lg font-bold backdrop-blur-md bg-white/90 text-gray-800">
                          {aiMatch.score}% Match
                        </Tag>
                      </div>
                    )}
                    
                    {/* Bottom Property Info overlaid on image */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <Title level={4} className="!mb-1 !text-white drop-shadow-md line-clamp-1" title={prop?.propertyName}>
                        {prop?.propertyName || "Unknown Property"}
                      </Title>
                      <Text className="text-white/90 drop-shadow-md font-medium text-sm">
                        {prop?.price ? `${prop.price.toLocaleString()} AED` : "Price N/A"}
                      </Text>
                    </div>
                  </div>

                  {/* 2. RIGHT: Content Grid Container */}
                  <div className="flex-1 p-6 flex flex-col">
                    
                    {/* Top Header Row */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                      <Text type="secondary" className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        Tracking Intelligence
                      </Text>
                      <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 flex items-center">
                        <Text type="secondary" className="text-[10px] uppercase font-bold tracking-wider mr-2">Track ID:</Text>
                        <Text strong className="font-mono text-gray-700 text-xs">{brochure.trackingId}</Text>
                      </div>
                    </div>

                    {/* 3-Column Stats Grid (This guarantees it won't squish) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                       
                       {/* Column 1: Pipeline Health */}
                       <div className="flex flex-col gap-4">
                          <div>
                            <Text type="secondary" className="text-[10px] uppercase font-bold tracking-wider block mb-1">Current Stage</Text>
                            <Tag color="geekblue" className="rounded-md px-3 py-1 border-none font-semibold m-0 text-sm w-max">
                              <CheckCircleOutlined className="mr-1"/> {formatStageString(interest?.conversion_stage)}
                            </Tag>
                          </div>
                          
                          <div className="flex gap-4 items-center">
                            <div className="flex-1">
                              <Text type="secondary" className="text-[10px] uppercase font-bold tracking-wider block mb-1">Engagement</Text>
                              <div className="flex items-center gap-1.5">
                                <FireOutlined className="text-volcano text-lg" />
                                <Text strong className="text-lg text-gray-800">{interest?.engagement_score || 0} pts</Text>
                              </div>
                            </div>
                            
                            <div className="flex-1 border-l border-gray-100 pl-4">
                              <Text type="secondary" className="text-[10px] uppercase font-bold tracking-wider block mb-1">AI Prob.</Text>
                              <Progress percent={interest?.conversion_probability || 0} size="small" strokeColor="#4f46e5" className="m-0" />
                            </div>
                          </div>
                       </div>

                       {/* Column 2: Brochure Metrics */}
                       <div className="flex flex-col gap-4 md:border-l border-gray-100 md:pl-6">
                        <div>
  <Text
    className="text-[10px] uppercase font-bold tracking-wider block mb-1 text-gray-500"
  >
    Total Opens
  </Text>

  <Tag
    color={brochure.viewCount > 0 ? "green" : "default"}
    className="rounded-lg px-3 py-1 border-none shadow-sm m-0 font-bold text-sm"
  >
    <EyeOutlined className="mr-1.5" />
    {brochure.viewCount || 0} Views
  </Tag>
</div>
                          <div>
                            <Text type="secondary" className="text-[10px] uppercase font-bold tracking-wider block mb-1 text-emerald-600">Last Interaction</Text>
                            {brochure.viewCount > 0 ? (
                              <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 flex items-center gap-2">
                                <ClockCircleOutlined className="text-indigo-400" />
                                <Text strong className="text-xs text-gray-700">{formatDate(brochure.lastViewedAt)}</Text>
                              </div>
                            ) : (
                              <Text type="secondary" className="text-xs italic">No interactions yet</Text>
                            )}
                          </div>
                       </div>

                       {/* Column 3: Action Buttons */}
                       <div className="flex flex-col gap-3 justify-center md:border-l border-gray-100 md:pl-6">
                         <Button 
                           type="dashed" 
                           icon={<CopyOutlined />} 
                           onClick={() => handleCopyLink(brochure.shareLink)}
                           className="rounded-xl text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                         >
                           Copy Track Link
                         </Button>
                         <Button 
                           icon={<LinkOutlined />} 
                           href={brochure.fileUrl} 
                           target="_blank" 
                           className="rounded-xl"
                         >
                           Open Live PDF
                         </Button>
                         <Button 
                           type="primary" 
                           icon={<RiseOutlined />}
                           onClick={() => handleViewHistory(brochure)} 
                           disabled={brochure.viewCount === 0} 
                           className="rounded-xl bg-indigo-600 hover:bg-indigo-700 border-none shadow-sm font-medium"
                         >
                           View Access Logs
                         </Button>
                       </div>
                       
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* ---------------- DETAILED HISTORY MODAL (CARD LAYOUT) ---------------- */}
      <Modal
        title={
          <div className="flex items-center gap-3 py-3">
            <Avatar size={48} className="bg-indigo-50 text-indigo-600 border border-indigo-100" icon={<EyeOutlined />} />
            <div>
              <Title level={4} className="!mb-0 text-gray-800">Access History Log</Title>
              <Text type="secondary" className="text-sm font-medium">
                {selectedHistory?.propertyId?.propertyName}
              </Text>
            </div>
          </div>
        }
        open={isHistoryModalOpen}
        onCancel={() => setIsHistoryModalOpen(false)}
        footer={null}
        width={750}
        centered
        destroyOnClose
        className="custom-history-modal"
      >
        <Divider className="my-0" />
        
        {/* Modal Stats Header */}
        <div className="bg-gray-50 p-5 border-b border-gray-100 flex flex-wrap gap-6 justify-between">
          <div>
            <Text type="secondary" className="text-[10px] uppercase font-bold tracking-wider block mb-1">First Opened</Text>
            <Text strong className="text-gray-700">
              {selectedHistory?.views?.length > 0 ? formatDate(selectedHistory.views[0].viewedAt) : "—"}
            </Text>
          </div>
          <div>
            <Text type="secondary" className="text-[10px] uppercase font-bold tracking-wider block mb-1 text-indigo-500">Last Opened</Text>
            <Text strong className="text-indigo-600">
              {formatDate(selectedHistory?.lastViewedAt)}
            </Text>
          </div>
          <div className="text-right">
            <Text type="secondary" className="text-[10px] uppercase font-bold tracking-wider block mb-1 text-emerald-500">Total Opens</Text>
            <Tag color="emerald" className="m-0 rounded-lg px-3 font-bold border-none text-emerald-600">
              {selectedHistory?.viewCount} Views
            </Tag>
          </div>
        </div>

        {/* History Log Cards */}
        <div className="p-5 max-h-[500px] overflow-y-auto space-y-4 bg-white">
          {selectedHistory?.views?.length > 0 ? (
            [...selectedHistory.views].reverse().map((view, index) => {
              const isMobile = view.device?.toLowerCase().includes('mobile');
              
              return (
                <div key={view._id} className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-colors group">
                  
                  <div className={`p-4 rounded-xl flex-shrink-0 ${isMobile ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'}`}>
                    {isMobile ? <MobileOutlined className="text-2xl" /> : <DesktopOutlined className="text-2xl" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Text strong className="text-gray-800 text-base block">{formatDate(view.viewedAt)}</Text>
                        <Text type="secondary" className="text-xs uppercase font-bold tracking-wider">{view.device || 'Unknown Device'}</Text>
                      </div>
                      <Tag className="rounded-full border-gray-200 bg-gray-50 text-gray-500 font-bold m-0">
                        Log #{selectedHistory.views.length - index}
                      </Tag>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-3">
                      <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 w-max">
                        <GlobalOutlined className="text-gray-400" />
                        <Text className="font-mono text-xs text-gray-600">{view.ip}</Text>
                      </div>
                      
                      <Tooltip title={view.userAgent}>
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 overflow-hidden flex-1 cursor-help">
                          <CompassOutlined className="text-gray-400 flex-shrink-0" />
                          <Text className="text-xs text-gray-600 truncate">{view.userAgent}</Text>
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <Empty description="No tracking logs recorded yet." className="py-10" />
          )}
        </div>
      </Modal>

      <style>{`
        .custom-history-modal .ant-modal-body {
          padding: 0 !important;
        }
      `}</style>
    </div>
  );
}