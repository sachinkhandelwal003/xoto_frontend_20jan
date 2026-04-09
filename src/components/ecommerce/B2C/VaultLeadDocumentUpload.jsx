import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import {
  Button, Card, message, Spin, Upload, Table, Tag, Space, Divider, Empty, Select, Modal, Form, Input
} from 'antd';
import {
  ArrowLeftOutlined,
  UploadOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  PlusOutlined,
} from '@ant-design/icons';

const PRIMARY_COLOR = '#5c039c';
const { Option } = Select;

// Document types from Postman collection
const DOCUMENT_TYPES = [
  { value: 'emirates_id_front',  label: 'Emirates ID (Front)',   category: 'identity' },
  { value: 'emirates_id_back',   label: 'Emirates ID (Back)',    category: 'identity' },
  { value: 'passport',           label: 'Passport',              category: 'identity' },
  { value: 'visa',               label: 'Visa',                  category: 'identity' },
  { value: 'bank_statements',    label: 'Bank Statements',       category: 'financial' },
  { value: 'salary_certificate', label: 'Salary Certificate',    category: 'financial' },
  { value: 'payslips',           label: 'Payslips',              category: 'financial' },
];

const VaultLeadDocumentUpload = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();

  const [documents, setDocuments]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [uploading, setUploading]   = useState(false);
  const [leadInfo, setLeadInfo]     = useState(null);
  const [modalOpen, setModalOpen]   = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [form] = Form.useForm();

  // ── Fetch lead + documents ──────────────────────────────────────────────
  const fetchDocuments = async () => {
    const docRes = await apiService.get(`/vault/lead/documents/${leadId}`);
    const docs = Array.isArray(docRes?.data?.data)
      ? docRes.data.data
      : Array.isArray(docRes?.data) ? docRes.data : [];
    setDocuments(docs);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!leadId) return;
      try {
        setLoading(true);
        const leadRes = await apiService.get(`/vault/lead/admin/${leadId}`);
        setLeadInfo(leadRes?.data?.data || leadRes?.data);
        await fetchDocuments();
      } catch (err) {
        console.error(err);
        message.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [leadId]);

  // ── Step 1: user selects file → open modal to pick document type ────────
  const handleFileSelect = ({ file }) => {
    setSelectedFile(file);
    setModalOpen(true);
  };

  // ── Step 2: upload file to get URL, then POST JSON to backend ───────────
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedFile) {
        message.error('Please select a file first');
        return;
      }

      setUploading(true);

      // ── Step 2a: upload file to get a URL ──────────────────────────────
      // Agar tumhara backend file upload ke liye alag endpoint deta hai
      // toh wahan upload karo aur fileUrl lo.
      // Abhi ke liye FormData se file upload kar rahe hain:
      const fileForm = new FormData();
      fileForm.append('file', selectedFile);

      let fileUrl = '';
      let fileName = selectedFile.name;
      let fileSizeMb = parseFloat((selectedFile.size / (1024 * 1024)).toFixed(2));
      let mimeType = selectedFile.type;

      try {
const uploadRes = await apiService.post('/upload/file', fileForm, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

fileUrl = uploadRes?.data?.url || uploadRes?.data?.fileUrl;
        fileUrl = uploadRes?.data?.url || uploadRes?.data?.fileUrl || '';
      } catch {
        // Agar dedicated upload endpoint nahi hai toh backend seedha
        // /lead/documents mein file accept kar sakta hai — 
        // is case mein neeche JSON body mein fileUrl blank chhod do
        // aur backend handle karega
        console.warn('Dedicated upload endpoint not available, proceeding without pre-upload');
      }

      // ── Step 2b: POST JSON body as per Postman collection ──────────────
      const docTypeObj = DOCUMENT_TYPES.find(d => d.value === values.documentType);

      const payload = {
        entityType: 'Lead',
        entityId: leadId,
        documentType: values.documentType,
        documentCategory: docTypeObj?.category || 'general',
        fileUrl: fileUrl || values.fileUrl || '',
        fileName: fileName,
        fileSizeMb: fileSizeMb,
        mimeType: mimeType,
      };

      await apiService.post(`/vault/lead/documents/${leadId}`, payload);

      message.success('Document uploaded successfully!');
      setModalOpen(false);
      form.resetFields();
      setSelectedFile(null);
      await fetchDocuments();

    } catch (err) {
      console.error(err);
      const errMsg = err?.response?.data?.message || 'Failed to upload document';
      message.error(errMsg);
    } finally {
      setUploading(false);
    }
  };

  // ── Table columns ───────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Document',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          {record.fileName?.toLowerCase().endsWith('.pdf')
            ? <FilePdfOutlined style={{ fontSize: 22, color: '#ef4444' }} />
            : <FileImageOutlined style={{ fontSize: 22, color: PRIMARY_COLOR }} />
          }
          <div>
            <div className="font-medium">{text || 'Unnamed File'}</div>
            <div className="text-xs text-gray-500">
              {DOCUMENT_TYPES.find(d => d.value === record.documentType)?.label
                || record.documentType
                || record.documentCategory
                || 'General'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'documentCategory',
      key: 'documentCategory',
      render: (cat) => (
        <Tag color={cat === 'identity' ? 'blue' : cat === 'financial' ? 'green' : 'default'}>
          {cat ? cat.toUpperCase() : '—'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'verificationStatus',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'verified' ? 'green' : status === 'rejected' ? 'red' : 'orange'}>
          {status ? status.toUpperCase() : 'PENDING'}
        </Tag>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'fileSizeMb',
      key: 'size',
      render: (size) => size ? `${size} MB` : '—',
    },
    {
      title: 'Uploaded On',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      render: (date) => date ? new Date(date).toLocaleDateString('en-GB') : '—',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => record.fileUrl && window.open(record.fileUrl, '_blank')}
            disabled={!record.fileUrl}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading documents..." />
      </div>
    );
  }

  const clientName = leadInfo?.customerInfo?.fullName || 'Client';

  return (
    <div className="p-6 lg:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">

        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="mb-6">
          Back to Leads
        </Button>

        <Card
          title={
            <div>
              <div className="text-xl font-semibold">Upload Documents</div>
              <div className="text-sm text-gray-500 mt-1">
                For: <span className="font-medium text-gray-700">{clientName}</span>
              </div>
            </div>
          }
          extra={<Tag color="purple">Lead ID: {leadId}</Tag>}
        >
          {/* Upload Area */}
          <div className="mb-8 p-8 border-2 border-dashed border-gray-300 rounded-2xl text-center bg-white">
            <Upload
              customRequest={handleFileSelect}
              showUploadList={false}
              accept=".pdf,.jpg,.jpeg,.png"
              disabled={uploading}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                loading={uploading}
                style={{ background: PRIMARY_COLOR, borderColor: PRIMARY_COLOR, height: 52, fontSize: 16 }}
              >
                {uploading ? 'Uploading...' : 'Select Document to Upload'}
              </Button>
            </Upload>
            <p className="text-gray-500 text-sm mt-4">
              Supported: PDF, JPG, PNG (Max 10MB)
            </p>
          </div>

          <Divider />

          <h3 className="text-lg font-semibold mb-4">
            Uploaded Documents ({documents.length})
          </h3>

          {documents.length > 0 ? (
            <Table
              columns={columns}
              dataSource={documents}
              rowKey={(record) => record._id || record.documentId || record.id}
              pagination={false}
              bordered
            />
          ) : (
            <Empty description="No documents uploaded yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Card>
      </div>

      {/* Modal — select document type before uploading */}
      <Modal
        title="Select Document Type"
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); setSelectedFile(null); form.resetFields(); }}
        okText={uploading ? 'Uploading...' : 'Upload'}
        okButtonProps={{ loading: uploading, style: { background: PRIMARY_COLOR, borderColor: PRIMARY_COLOR } }}
        cancelButtonProps={{ disabled: uploading }}
      >
        {selectedFile && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <strong>File:</strong> {selectedFile.name} &nbsp;|&nbsp;
            <strong>Size:</strong> {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
          </div>
        )}

        <Form form={form} layout="vertical">
          <Form.Item
            name="documentType"
            label="Document Type"
            rules={[{ required: true, message: 'Please select document type' }]}
          >
            <Select placeholder="Select document type" size="large">
              <Select.OptGroup label="Identity Documents">
                {DOCUMENT_TYPES.filter(d => d.category === 'identity').map(d => (
                  <Option key={d.value} value={d.value}>{d.label}</Option>
                ))}
              </Select.OptGroup>
              <Select.OptGroup label="Financial Documents">
                {DOCUMENT_TYPES.filter(d => d.category === 'financial').map(d => (
                  <Option key={d.value} value={d.value}>{d.label}</Option>
                ))}
              </Select.OptGroup>
            </Select>
          </Form.Item>

          {/* Agar backend fileUrl manually bhi accept karta hai */}
          <Form.Item
            name="fileUrl"
            label="File URL (optional — agar file already uploaded hai)"
          >
            <Input placeholder="https://storage.xoto.com/..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VaultLeadDocumentUpload;