import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Card, Typography, Tag, Button, Space, 
  message, Spin, Modal, Tooltip, Avatar, Divider, Table
} from "antd";
import { 
  CopyOutlined, EyeOutlined, LinkOutlined, 
  ClockCircleOutlined, DesktopOutlined, MobileOutlined,
  GlobalOutlined, ArrowLeftOutlined, FireOutlined, FilePdfOutlined 
} from "@ant-design/icons";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;

export default function TrackBrochure() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract lead info from navigation state
  const lead = location.state?.lead;
  const leadId = lead?._id || location.state?.leadId;

  const [loading, setLoading] = useState(true);
  const [brochures, setBrochures] = useState([]);
  
  // Modal state for detailed viewing history
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);

  // Dynamic Image URL Builder (Vite safe)
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
        // Adjust depending on whether the response is nested
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

  // Open detailed history modal
  const handleViewHistory = (brochure) => {
    setSelectedHistory(brochure);
    setIsHistoryModalOpen(true);
  };

  // ---------------- TABLE COLUMNS (HISTORY LOGS) ----------------
  const historyColumns = [
    {
      title: "Time Opened",
      dataIndex: "viewedAt",
      key: "viewedAt",
      render: (text) => (
        <span className="flex items-center gap-2">
          <ClockCircleOutlined className="text-gray-400" />
          <Text strong>{formatDate(text)}</Text>
        </span>
      ),
    },
    {
      title: "Device",
      dataIndex: "device",
      key: "device",
      render: (device) => {
        const isMobile = device?.toLowerCase().includes('mobile');
        return (
          <Tag color="blue" className="rounded-lg border-none px-3">
            {isMobile ? <MobileOutlined className="mr-1" /> : <DesktopOutlined className="mr-1" />}
            {device || "Unknown"}
          </Tag>
        );
      }
    },
    {
      title: "IP Address",
      dataIndex: "ip",
      key: "ip",
      render: (ip) => (
        <Text type="secondary" className="font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100">
          <GlobalOutlined className="mr-1" /> {ip}
        </Text>
      ),
    },
    {
      title: "Browser / Source",
      dataIndex: "userAgent",
      key: "userAgent",
      render: (ua) => (
        <Tooltip title={ua} placement="topLeft">
          <Text className="truncate block max-w-[200px] text-gray-500 text-xs">
            {ua}
          </Text>
        </Tooltip>
      ),
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f6f7fb]">
        <Spin size="large" />
        <Text type="secondary" className="mt-4 text-lg">Fetching tracking intelligence...</Text>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-6 bg-[#f6f7fb] min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)} 
            className="mb-2 text-gray-500 hover:text-indigo-600 -ml-3"
          >
            Back to Lead Details
          </Button>
          <Title level={3} className="!mb-1 text-gray-800 flex items-center gap-3">
            <FireOutlined className="text-volcano" /> Brochure Analytics
          </Title>
          {lead && (
             <Text type="secondary">
               Tracking engagement for <Text strong className="text-indigo-600">{lead?.name?.first_name} {lead?.name?.last_name}</Text>
             </Text>
          )}
        </div>
        
        {/* Quick summary stats */}
        <div className="flex gap-4">
          <div className="bg-blue-50 px-5 py-3 rounded-xl border border-blue-100 text-center min-w-[120px]">
            <Text type="secondary" className="text-[10px] font-bold uppercase tracking-widest block mb-1">Sent</Text>
            <Title level={4} className="!mb-0 !text-blue-600">{brochures.length}</Title>
          </div>
          <div className="bg-green-50 px-5 py-3 rounded-xl border border-green-100 text-center min-w-[120px]">
            <Text type="secondary" className="text-[10px] font-bold uppercase tracking-widest block mb-1">Total Opens</Text>
            <Title level={4} className="!mb-0 !text-green-600">
              {brochures.reduce((acc, curr) => acc + (curr.viewCount || 0), 0)}
            </Title>
          </div>
        </div>
      </div>

      {/* SINGLE LINE HORIZONTAL CARDS */}
      <div className="space-y-4">
        {brochures.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
            <FilePdfOutlined className="text-6xl text-gray-300 mb-4 block" />
            <Text type="secondary" className="text-lg">No brochures have been generated for this lead yet.</Text>
          </div>
        ) : (
          brochures.map((brochure) => {
            const prop = brochure.propertyId;
            const score = brochure.interestId?.ai_match?.score;
            const imgUrl = getImageUrl(prop);

            return (
              <Card 
                key={brochure._id} 
                className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                bodyStyle={{ padding: '0' }}
              >
                <div className="flex flex-col md:flex-row items-center bg-white">
                  
                  {/* Left: Image */}
                  <div className="w-full md:w-64 h-48 md:h-36 flex-shrink-0 relative overflow-hidden bg-gray-100">
                    <img 
                      src={imgUrl} 
                      alt={prop?.propertyName} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                    />
                    {score && (
                      <div className="absolute top-3 right-3">
                        <Tag color={score >= 90 ? "success" : "processing"} className="m-0 rounded-full px-2.5 py-0.5 border-none shadow-sm font-bold backdrop-blur-md bg-green-500/90 text-white">
                          {score}% Match
                        </Tag>
                      </div>
                    )}
                  </div>

                  {/* Middle-Left: Property Info & Tracking ID */}
                  <div className="p-5 flex-1 w-full flex flex-col justify-center">
                    <Title level={4} className="!mb-1 text-gray-800 line-clamp-1" title={prop?.propertyName}>
                      {prop?.propertyName || "Unknown Property"}
                    </Title>
                    <Text type="secondary" className="block mb-3 text-[15px]">
                      Price: {prop?.price ? <Text strong className="text-indigo-600">{prop.price.toLocaleString()} AED</Text> : "N/A"}
                    </Text>
                    
                    <div className="bg-gray-50/80 px-3 py-1.5 rounded-lg border border-gray-100 inline-flex items-center w-max">
                      <Text type="secondary" className="text-xs uppercase font-bold tracking-wider mr-2">Track ID:</Text>
                      <Text strong className="font-mono text-gray-700">{brochure.trackingId}</Text>
                    </div>
                  </div>

                  {/* Middle-Right: Engagement Stats */}
                  <div className="w-full md:w-64 p-5 flex flex-row md:flex-col justify-between md:justify-center border-t md:border-t-0 md:border-l md:border-r border-gray-100 gap-2">
                    <div>
                      <Text type="secondary" className="text-[10px] uppercase font-bold tracking-wider block mb-1">Total Engagement</Text>
                      <Space size="small" className="items-center">
                        <Tag color={brochure.viewCount > 0 ? "volcano" : "default"} className="rounded-lg px-3 border-none shadow-sm m-0 font-bold text-sm">
                          <EyeOutlined className="mr-1" /> {brochure.viewCount || 0} Views
                        </Tag>
                      </Space>
                    </div>
                    {brochure.viewCount > 0 && (
                      <div className="mt-2 text-right md:text-left">
                        <Text type="secondary" className="text-[10px] uppercase font-bold tracking-wider block mb-0.5">Last Opened</Text>
                        <Text strong className="text-xs text-gray-700">{formatDate(brochure.lastViewedAt)}</Text>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="w-full md:w-56 p-5 flex flex-col gap-2 justify-center bg-gray-50/30">
                    <Button 
                      type="dashed" 
                      icon={<CopyOutlined />} 
                      onClick={() => handleCopyLink(brochure.shareLink)}
                      className="rounded-xl font-medium border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                      block
                    >
                      Copy Link
                    </Button>
                    <Space className="w-full">
                      <Tooltip title="View PDF">
                        <Button 
                          icon={<LinkOutlined />} 
                          href={brochure.fileUrl} 
                          target="_blank" 
                          className="rounded-xl w-full"
                        />
                      </Tooltip>
                      <Button 
                        type="primary" 
                        onClick={() => handleViewHistory(brochure)} 
                        disabled={brochure.viewCount === 0} 
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md flex-1"
                      >
                        Logs
                      </Button>
                    </Space>
                  </div>

                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* DETAILED HISTORY MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-3 py-2">
            <Avatar className="bg-indigo-100 text-indigo-600" icon={<EyeOutlined />} />
            <div>
              <Title level={5} className="!mb-0">Access History Log</Title>
              <Text type="secondary" className="text-xs font-normal">
                {selectedHistory?.propertyId?.propertyName}
              </Text>
            </div>
          </div>
        }
        open={isHistoryModalOpen}
        onCancel={() => setIsHistoryModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsHistoryModalOpen(false)} size="large" className="rounded-xl">
            Close Log
          </Button>
        ]}
        width={900}
        centered
        destroyOnClose
      >
        <Divider className="mt-0 mb-4" />
        
        {/* Modal Stats Header */}
        <div className="flex gap-6 mb-6 px-2">
          <div>
            <Text type="secondary" className="text-xs uppercase font-bold tracking-wider block mb-1">First Opened</Text>
            <Text strong>{selectedHistory?.views?.length > 0 ? formatDate(selectedHistory.views[0].viewedAt) : "—"}</Text>
          </div>
          <div>
            <Text type="secondary" className="text-xs uppercase font-bold tracking-wider block mb-1">Last Opened</Text>
            <Text strong className="text-indigo-600">{formatDate(selectedHistory?.lastViewedAt)}</Text>
          </div>
        </div>

        <Table
          columns={historyColumns}
          dataSource={selectedHistory?.views || []}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
          size="middle"
          className="border border-gray-100 rounded-xl overflow-hidden"
        />
      </Modal>

    </div>
  );
}