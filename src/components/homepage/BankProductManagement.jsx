import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../manageApi/utils/custom.apiservice'; 
import {
  Button, Modal, Form, Input, InputNumber, Select, Row, Col, Divider,
  Typography, Table, Card, Space, Tag, Popconfirm, message, notification, Upload, Statistic, Grid
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  BankOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

const THEME = { primary: "#7c3aed", success: "#10b981" };

const BankProductManagement = () => {
  const MORTGAGE_PATH = "mortgages"; 

  const screens = useBreakpoint();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  // Logo Upload State
  const [logoList, setLogoList] = useState([]);

  const [form] = Form.useForm();

  const validateImageSize = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Only image files are allowed!");
      return Upload.LIST_IGNORE;
    }
    const sizeInMB = file.size / 1024 / 1024;
    if (sizeInMB > 5) {
      message.error("Image must be less than 5MB");
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  // --- CUSTOM UPLOAD HANDLER (Using apiService) ---
  const handleCustomUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiService.upload('upload', formData);
      onSuccess(response); 
      message.success("Logo uploaded successfully!");
    } catch (err) {
      onError(err);
      // apiService interceptor will show the toast automatically
    }
  };

  // --- 1. FETCH DATA (Using apiService) ---
  const fetchProducts = useCallback(async (page, limit, search) => {
    setLoading(true);
    try {
      const resData = await apiService.get(`${MORTGAGE_PATH}/get-all-bank-products`, {
        page,
        limit,
        search: search || undefined
      });
      
      const list = Array.isArray(resData?.data) ? resData.data : (Array.isArray(resData) ? resData : []);
      
      setProducts(list);
      setTotal(resData?.total || resData?.pagination?.total || list.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(currentPage, pageSize, searchText);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, currentPage, pageSize, fetchProducts]);

  // --- 2. SAVE & EDIT (Using apiService) ---
  const handleSave = async (values) => {
    setLoading(true);
    try {
      const finalLogo = logoList.length > 0
        ? (logoList[0].url || logoList[0].response?.file?.url || logoList[0].response?.url || logoList[0].response)
        : "";

      const payload = {
        ...values,
        bankInfo: {
          ...values.bankInfo,
          logo: finalLogo
        }
      };

      if (editingId) {
        await apiService.post(`${MORTGAGE_PATH}/edit-product-requirements?id=${editingId}`, payload);
        notification.success({ message: `Bank Product Updated Successfully!` });
      } else {
        await apiService.post(`${MORTGAGE_PATH}/create-bank-products`, payload);
        notification.success({ message: `Bank Product Created Successfully!` });
      }

      closeModal();
      fetchProducts(currentPage, pageSize, searchText);
    } catch (err) {
      console.error(err);
    } finally { 
      setLoading(false); 
    }
  };

  // --- 3. DELETE (Using apiService) ---
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await apiService.delete(`${MORTGAGE_PATH}/delete-bank-product/${id}`);
      message.success("Product deleted successfully");
      fetchProducts(currentPage, pageSize, searchText);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setLogoList([]);
    form.resetFields();
  };

  const handleEditClick = (record) => {
    setEditingId(record._id);
    form.setFieldsValue(record);
    
    if(record.bankInfo?.logo) {
      setLogoList([{ uid: '-1', url: record.bankInfo.logo, status: 'done', name: 'Bank Logo' }]);
    }
    
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Bank Name',
      dataIndex: ['bankInfo', 'bankName'],
      key: 'bankName',
      fixed: screens.md ? 'left' : false,
      width: 150,
      render: (t) => <Text strong>{t}</Text>
    },
    {
      title: 'Offer Title',
      dataIndex: ['offerSummary', 'title'],
      key: 'title',
      width: 250,
    },
    {
      title: 'Type',
      dataIndex: ['offerSummary', 'productType'],
      key: 'productType',
      width: 120,
      render: (type) => <Tag color={type === 'FIXED' ? 'purple' : 'blue'}>{type}</Tag>
    },
    {
      title: 'Rate',
      dataIndex: ['offerSummary', 'initialRate'],
      key: 'initialRate',
      width: 100,
      render: (val) => <Text strong style={{color: THEME.primary}}>{val}%</Text>
    },
    {
      title: 'EMI',
      key: 'emi',
      width: 150,
      render: (_, r) => `${r.offerSummary?.currency || ''} ${r.offerSummary?.monthlyEMI?.toLocaleString() || 0}`
    },
    {
      title: 'Action',
      key: 'action',
      fixed: screens.md ? 'right' : false,
      width: 100,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined style={{color: THEME.primary, fontSize: '18px'}} />}
            onClick={() => handleEditClick(record)}
            title="View/Edit"
          />
          <Popconfirm title="Delete this product?" onConfirm={() => handleDelete(record._id)} okText="Yes">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <Title level={3} style={{ margin: 0 }}>Bank Offers Management</Title>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
          style={{ backgroundColor: THEME.primary }}
          className="w-full md:w-auto"
        >
          Add New Offer
        </Button>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Total Offers" value={total} prefix={<BankOutlined style={{ color: THEME.primary }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={16}>
          <Card bordered={false} className="shadow-sm">
            <Input
              placeholder="Search by Bank or Offer Title..."
              prefix={<SearchOutlined />}
              size="large"
              allowClear
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} bodyStyle={{ padding: 0 }} className="shadow-sm">
        <Table
            columns={columns}
            dataSource={products}
            loading={loading}
            rowKey="_id"
            scroll={{ x: 1000 }}
            pagination={{
                current: currentPage,
                total: total,
                pageSize: pageSize,
                onChange: (p) => setCurrentPage(p),
                position: ['bottomCenter'],
                size: "small"
            }}
        />
      </Card>

      <Modal
        title={editingId ? "Edit Bank Offer" : "Add New Bank Offer"}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={1000}
        style={{ top: 20 }}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            offerSummary: { currency: 'AED', productType: 'FIXED' },
            loanDetails: { interestType: 'CONVENTIONAL' }
          }}
        >
          <Divider orientation="left" style={{ borderColor: THEME.primary }}>1. Bank Information</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name={['bankInfo', 'bankName']} label="Bank Name" rules={[{ required: true }]}>
                <Input placeholder="e.g. HSBC" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Bank Logo">
                <Upload
                  listType="picture-card"
                  fileList={logoList}
                  customRequest={handleCustomUpload}
                  maxCount={1}
                  beforeUpload={validateImageSize}
                  onChange={({ fileList }) => setLogoList(fileList)}
                >
                  {logoList.length >= 1 ? null : <div><PlusOutlined /><div>Upload</div></div>}
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ borderColor: THEME.primary }}>2. Offer Summary</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name={['offerSummary', 'title']} label="Offer Title" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name={['offerSummary', 'popularityTag']} label="Popularity Tag"><Input placeholder="e.g. Popular" /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name={['offerSummary', 'productType']} label="Product Type"><Select><Option value="FIXED">Fixed</Option><Option value="VARIABLE">Variable</Option></Select></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={12} md={4}><Form.Item name={['offerSummary', 'fixedYears']} label="Fixed Years"><InputNumber className="w-full" /></Form.Item></Col>
            <Col xs={12} md={5}><Form.Item name={['offerSummary', 'initialRate']} label="Initial Rate (%)"><InputNumber className="w-full" step="0.01" /></Form.Item></Col>
            <Col xs={12} md={5}><Form.Item name={['offerSummary', 'currency']} label="Currency"><Input className="w-full" /></Form.Item></Col>
            <Col xs={12} md={5}><Form.Item name={['offerSummary', 'monthlyEMI']} label="Monthly EMI"><InputNumber className="w-full" /></Form.Item></Col>
            <Col xs={24} md={5}><Form.Item name={['offerSummary', 'totalUpfrontCost']} label="Total Upfront Cost"><InputNumber className="w-full" /></Form.Item></Col>
          </Row>

          <Divider orientation="left" style={{ borderColor: THEME.primary }}>3. Loan Details</Divider>
          <Row gutter={16}>
            <Col xs={12} md={4}><Form.Item name={['loanDetails', 'tenureYears']} label="Tenure (Years)"><InputNumber className="w-full" /></Form.Item></Col>
            <Col xs={12} md={5}><Form.Item name={['loanDetails', 'loanToValue']} label="LTV (%)"><InputNumber className="w-full" /></Form.Item></Col>
            <Col xs={24} md={5}><Form.Item name={['loanDetails', 'interestType']} label="Interest Type"><Select><Option value="CONVENTIONAL">Conventional</Option><Option value="ISLAMIC">Islamic</Option></Select></Form.Item></Col>
            <Col xs={12} md={5}><Form.Item name={['loanDetails', 'overpaymentAllowedPercent']} label="Overpayment (%)"><InputNumber className="w-full" /></Form.Item></Col>
            <Col xs={24} md={5}><Form.Item name={['loanDetails', 'followOnRate']} label="Follow On Rate"><Input placeholder="e.g. 1.69% + 3M Eibor" /></Form.Item></Col>
          </Row>

          <Divider orientation="left" style={{ borderColor: THEME.primary }}>4. Cost Breakdown</Divider>
          <Row gutter={16}>
            <Col xs={12} md={6}><Form.Item name={['costBreakdown', 'downPayment']} label="Down Payment"><InputNumber className="w-full" /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name={['costBreakdown', 'dldFee']} label="DLD Fee"><InputNumber className="w-full" /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name={['costBreakdown', 'mortgageRegistrationFee']} label="Mortgage Reg Fee"><InputNumber className="w-full" /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name={['costBreakdown', 'trusteeFee']} label="Trustee Fee"><InputNumber className="w-full" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col xs={12} md={6}><Form.Item name={['costBreakdown', 'bankProcessingFee']} label="Bank Processing Fee"><InputNumber className="w-full" /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name={['costBreakdown', 'valuationFee']} label="Valuation Fee"><InputNumber className="w-full" /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name={['costBreakdown', 'feesAddedToLoan']} label="Fees Added to Loan"><InputNumber className="w-full" /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name={['costBreakdown', 'totalUpfrontCost']} label="Total Upfront Cost"><InputNumber className="w-full" /></Form.Item></Col>
          </Row>

          <Divider orientation="left" style={{ borderColor: THEME.primary }}>5. Insurance & Eligibility</Divider>
          <Row gutter={16}>
            <Col xs={12} md={6}><Form.Item name={['insurance', 'lifeInsurance']} label="Life Insurance"><Input /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name={['insurance', 'propertyInsurance']} label="Property Insurance"><Input /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name={['eligibility', 'minLTV']} label="Min LTV"><InputNumber className="w-full" /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name={['eligibility', 'maxLTV']} label="Max LTV"><InputNumber className="w-full" /></Form.Item></Col>
          </Row>

          <div className="flex justify-end gap-3 mt-6 pb-4">
            <Button onClick={closeModal} size="large">Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading} size="large" style={{ backgroundColor: THEME.primary }}>
               {editingId ? "Update Product" : "Save Product"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default BankProductManagement;