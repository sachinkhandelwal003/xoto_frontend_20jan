import React from 'react';
import { 
  Search, 
  Plus, 
  Users, 
  Target, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown 
} from 'lucide-react';

const  AgentLeadDashboard = () => {
  // Mock data for the table
  const leads = [
    {
      id: 1,
      name: "Mr. John Doe",
      email: "john.doe@email.com",
      agent: "Sarah Smith",
      propertyType: "Apartment",
      status: "Active",
      image: "https://via.placeholder.com/40"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Agent & Lead Management</h1>
          <p className="text-gray-500 text-sm">Manage your website details and updates.</p>
        </div>
        <button className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={18} />
          Add New Lead
        </button>
      </div>

      {/* Stats Cards */}
      <div className="flex gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border-t-4 border-[#7c3aed] shadow-sm w-48">
          <p className="text-gray-500 text-sm mb-2">Total Agents</p>
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded text-[#7c3aed]">
              <Users size={20} />
            </div>
            <span className="text-2xl font-bold">1</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border-t-4 border-[#7c3aed] shadow-sm w-48">
          <p className="text-gray-500 text-sm mb-2">Total Leads</p>
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded text-[#7c3aed]">
              <Target size={20} />
            </div>
            <span className="text-2xl font-bold">1</span>
          </div>
        </div>
      </div>

      {/* Main Content Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Lead Details</th>
                <th className="px-6 py-4 font-semibold text-center">Assigned Agent</th>
                <th className="px-6 py-4 font-semibold text-center">Type</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={lead.image} alt="" className="w-10 h-10 rounded-lg bg-gray-200" />
                      <div>
                        <div className="font-bold text-gray-800">{lead.name}</div>
                        <div className="text-xs text-gray-400">{lead.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs">
                        👤
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600 font-medium">
                    {lead.propertyType}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-2 text-green-500 text-sm font-medium">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      {lead.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      <button className="p-1 text-[#7c3aed] hover:bg-purple-50 rounded">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-1 text-red-400 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex items-center justify-end gap-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <ChevronLeft size={20} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-[#7c3aed] text-[#7c3aed] font-medium">
              1
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-pointer">
            10 / page
            <ChevronDown size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentLeadDashboard;