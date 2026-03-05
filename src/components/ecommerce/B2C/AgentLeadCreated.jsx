import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Input,
  Button,
  Tag,
  Tooltip,
  message,
  Tabs
} from "antd";

import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined // <-- NAYA PROFESSIONAL ICON (Deal ke liye)
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

// IMPORT MODAL HERE
import AddLeadModal from "../../../components/ecommerce/B2C/products/Addleadmodal"; 

const { Title, Text } = Typography;

export default function AgentLeadDashboard() {
  const navigate = useNavigate();
  
  // STATS
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  // MODAL KI STATE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null); 

  // TAB KI STATE
  const [activeTab, setActiveTab] = useState("leads");

  // ================= FETCH =================
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(
        "/agent/lead/get-all-leads?page=1&limit=10"
      );

      const allLeads =
        response?.data?.data ||
        response?.data ||
        [];

      const filteredLeads = Array.isArray(allLeads)
        ? allLeads.filter(l => !l.isDeleted && l.status !== 'deal') 
        : [];

      setLeads(filteredLeads);

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // ================= DELETE =================
  const deleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await apiService.delete(`/agent/lead/delete-lead/${id}`);
      message.success("Lead deleted successfully.");
      fetchLeads();
    } catch (err) {
      console.log(err);
      message.error("Failed to delete lead.");
    }
  };

  // ================= ADD / EDIT CLICK =================
  const handleAddClick = () => {
    setSelectedLead(null); 
    setIsModalOpen(true);  
  };

  const handleEditClick = (lead) => {
    setSelectedLead(lead); 
    setIsModalOpen(true);  
  };

  // ================= MOVE TO DEAL CLICK =================
  const handleMoveToDeal = async (lead) => {
    if (!window.confirm("Convert this lead to a deal?")) return;

    try {
      // Yahan par apni backend API call aayegi jab ready ho jaye:
      // await apiService.post(`/agent/lead/move-to-deal/${lead._id}`);
      
      message.success("Lead successfully converted to Deal.");
      
      // === INSTANT UI UPDATE LOGIC ===
      setDeals(prevDeals => [...prevDeals, { ...lead, status: 'deal' }]); 
      setLeads(prevLeads => prevLeads.filter(l => l._id !== lead._id)); 

    } catch (error) {
      console.log(error);
      message.error("Failed to convert lead to deal.");
    }
  };

  // ================= STATUS =================
  const getStatus = (status) => {
    if (status === "active") return <Tag color="green">Active</Tag>;
    if (status === "closed") return <Tag color="default">Closed</Tag>;
    if (status === "deal") return <Tag color="purple">-</Tag>; 
    return <Tag color="gold">New</Tag>;
  };

  // ================= TABLES COMPONENTS =================
  // Leads wali table
  const LeadsTable = () => (
    <table className="w-full table-fixed border-collapse">
      <thead>
        <tr className="text-gray-500 text-xs uppercase tracking-wider border-b">
          <th className="py-4 px-4 text-left font-medium">Client Name</th>
          <th className="px-4 text-center font-medium">Email</th>
          <th className="px-4 text-center font-medium">Contact</th>
          <th className="px-4 text-center font-medium">Status</th>
          <th className="px-4 text-center font-medium">Action</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr><td colSpan="5" className="py-10 text-center text-gray-500">Loading records...</td></tr>
        ) : leads.length === 0 ? (
          <tr><td colSpan="5" className="py-10 text-center text-gray-400">No active leads found.</td></tr>
        ) : (
          leads.map((lead) => (
            <tr key={lead._id} className="hover:bg-gray-50 text-sm border-b transition-colors">
              <td className="py-4 px-4 ">
                <div className="font-medium text-gray-800 truncate">{lead?.name?.first_name} {lead?.name?.last_name}</div>
              </td>
              <td className="px-4 text-center">
                <a href={`mailto:${lead?.email}`} className="text-blue-600 hover:text-blue-800 transition-colors">{lead?.email}</a>
              </td>
              <td className="px-4 text-center text-gray-600">{lead?.phone_number}</td>
              <td className="px-4 text-center">{getStatus(lead?.status)}</td>
              <td className="px-4 text-center">
                <div className="flex justify-center items-center gap-2">
                  
                  <Tooltip title="Edit Lead">
                    <Button 
                      type="text" 
                      icon={<EditOutlined />} 
                      className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md" 
                      onClick={() => handleEditClick(lead)} 
                    />
                  </Tooltip>
                  <Tooltip title="Delete Lead">
                    <Button 
                      danger 
                      type="text" 
                      icon={<DeleteOutlined />} 
                      className="hover:bg-red-50 rounded-md"
                      onClick={() => deleteLead(lead._id)} 
                    />
                  </Tooltip>
                  <Tooltip title="Convert to Deal">
                    <Button 
                      type="text" 
                      icon={<CheckCircleOutlined className="text-lg" />} 
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md" 
                      onClick={() => handleMoveToDeal(lead)} 
                    />
                  </Tooltip>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  // Deals wali table
  const DealsTable = () => (
    <table className="w-full table-fixed border-collapse">
      <thead>
        <tr className="text-gray-500 text-xs uppercase tracking-wider border-b">
          <th className="py-4 px-4 text-left font-medium">Client Name</th>
          <th className="px-4 text-center font-medium">Email</th>
          <th className="px-4 text-center font-medium">Contact</th>
          <th className="px-4 text-center font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        {deals.length === 0 ? (
          <tr><td colSpan="4" className="py-10 text-center text-gray-400">No deals converted yet.</td></tr>
        ) : (
          deals.map((deal) => (
            <tr key={deal._id} className="hover:bg-gray-50 text-sm border-b transition-colors bg-white">
              <td className="py-4 px-4 ">
                <div className="font-medium text-gray-800 truncate">{deal?.name?.first_name} {deal?.name?.last_name}</div>
              </td>
              <td className="px-4 text-center">
                <a href={`mailto:${deal?.email}`} className="text-blue-600 hover:text-blue-800 transition-colors">{deal?.email}</a>
              </td>
              <td className="px-4 text-center text-gray-600">{deal?.phone_number}</td>
              <td className="px-4 text-center">{getStatus(deal?.status)}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  // Tabs ki configuration (EMOJIS REMOVED)
  const tabItems = [
    {
      key: 'leads',
      label: <span className="text-base font-medium px-2">Active Leads ({leads.length})</span>,
      children: <LeadsTable />,
    },
    {
      key: 'deals',
      label: <span className="text-base font-medium px-2">Deals ({deals.length})</span>,
      children: <DealsTable />,
    }
  ];

  return (
    <div className="p-6 bg-[#f6f7fb] min-h-screen relative">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-1 text-gray-800">
Deal Management           </Title>
          <Text className="text-gray-500">Manage your leads and deals effectively</Text>
        </div>

        {activeTab === "leads" && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            className="!bg-[#7c3aed] !border-none shadow-md hover:shadow-lg transition-all"
            onClick={handleAddClick} 
          >
            Add New Lead
          </Button>
        )}
      </div>

      {/* SEARCH BAR */}
      <Card className="rounded-xl shadow-sm border-none mb-6">
        <Input
          size="large"
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Search by client name or email address..."
          className="w-full md:w-1/2 rounded-lg"
        />
      </Card>

      {/* TABS CONTAINER */}
      <Card className="rounded-xl shadow-sm border-none p-2">
        <Tabs 
          activeKey={activeTab} 
          onChange={(key) => setActiveTab(key)} 
          items={tabItems}
          size="large"
          tabBarStyle={{ marginBottom: '20px', padding: '0 8px' }}
        />
      </Card>

      {/* MODAL */}
      {isModalOpen && (
        <AddLeadModal 
          leadData={selectedLead} 
          onClose={() => {
            setIsModalOpen(false); 
            setSelectedLead(null); 
            fetchLeads();          
          }} 
        />
      )}
    </div>
  );
}