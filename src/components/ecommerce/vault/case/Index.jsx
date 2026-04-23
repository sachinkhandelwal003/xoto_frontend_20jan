import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { useSelector } from 'react-redux';
import {
  Card, Steps, Button, Typography, Row, Col, Avatar,
  Tag, Descriptions, Divider, Spin, message, Modal, Input, Select,
  Form, DatePicker, InputNumber, Alert, Badge, Progress,
  Statistic, Table, Space, Switch
} from 'antd';
import dayjs from 'dayjs';
import {
  UserOutlined, FileTextOutlined, BankOutlined,
  CheckCircleOutlined, InfoCircleOutlined,
  EyeOutlined, HomeOutlined,
  DollarCircleOutlined, PlusOutlined, SaveOutlined,
  WalletOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const THEME_COLOR = "#5C039B";

// ✅ FIX 1: Parser regex — (,*) ki jagah sirf , use karo
const aedFormatter = (value) => `AED ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const aedParser   = (value) => value.replace(/AED\s?|,/g, '');

const CreateCase = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingProposals, setFetchingProposals] = useState(false);
  const { user, token, permissions } = useSelector((s) => s.auth);

  const [acceptedProposals, setAcceptedProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [createdCaseId, setCreatedCaseId] = useState(null);

  const [showBankSelectionModal, setShowBankSelectionModal] = useState(false);
  const [selectedBankFromProposal, setSelectedBankFromProposal] = useState(null);

  const [caseData, setCaseData] = useState({
    caseReference: '',
    clientInfo: {
      fullName: '', preferredName: '', gender: null, dateOfBirth: null,
      nationality: '', maritalStatus: 'Single', numberOfDependents: 0,
      email: '', mobile: '', homePhone: null, workPhone: null, whatsapp: null,
    },
    currentAddress: {
      building: '', apartment: '', area: '', city: 'Dubai', country: 'UAE',
      residenceType: null, yearsAtAddress: null,
    },
    previousAddress: {
      building: '', apartment: '', area: '', city: 'Dubai', country: 'UAE',
      residenceType: null, yearsAtAddress: null,
    },
    employmentDetails: {
      employerName: '', industry: null, designation: '', employmentType: 'Salaried',
      yearsWithEmployer: null, monthsWithEmployer: 0, probationPeriod: 'Completed',
      workAddress: null, workPhone: null, employerEmail: null,
    },
    incomeDetails: {
      basicSalary: 0, housingAllowance: 0, transportAllowance: 0, otherAllowances: 0,
      totalMonthlySalary: 0, annualBonus: 0, otherIncome: 0, totalMonthlyIncome: 0,
      salaryTransferBank: null, salaryTransferType: null,
    },
    expenseDetails: {
      monthlyRent: 0, monthlyOtherLoanInstallments: 0, monthlyCreditCardPayments: 0,
      monthlyLivingExpenses: 0, totalMonthlyLiabilities: 0, dbrPercentage: 0,
      dbrStatus: 'Eligible', existingLoans: [],
    },
    propertyInfo: {
      propertyType: 'Ready', propertySubtype: 'Apartment', propertyValue: 0,
      valuationAmount: null, ltvPercentage: null, loanAmount: 0, downPayment: 0,
      downPaymentSource: null,
      propertyAddress: { building: '', apartment: null, floor: null, area: '', city: 'Dubai', emirate: 'Dubai' },
      propertyDetails: { bedrooms: null, bathrooms: null, areaSqft: null, areaSqm: null, yearBuilt: null, view: null, furnishing: null, parkingSpaces: 0 },
      ownershipDetails: { currentOwner: '', ownerType: 'Individual', titleDeedNumber: null, titleDeedUrl: null, nocAvailable: false },
      transactionDetails: { purchasePrice: 0, agreementDate: null, handoverDate: null, depositPaid: 0, depositPaidDate: null, agentCommission: 0, dldFees: 0, registrationFees: 0, totalClosingCosts: 0 },
    },
    loanInfo: {
      requestedAmount: 0, approvedAmount: 0, tenureYears: 25, tenureMonths: 300,
      interestRateType: 'Fixed', interestRatePercentage: 0, processingFee: 0, valuationFee: 0,
      earlySettlementFeePercentage: 1, earlySettlementAllowedAfterYears: 3,
      lifeInsuranceRequired: true, propertyInsuranceRequired: true,
      monthlyInstallment: { principalAndInterest: 0, lifeInsurance: 0, propertyInsurance: 0, totalMonthlyPayment: 0 },
      selectedBank: '', selectedBankProduct: '', alternativeBanksConsidered: [],
    },
    internalNotes: '', customerNotes: '', pendingDocumentTypes: [],
  });

  // ✅ FIX 2: updateExpenseTotals — functional update use karo stale closure avoid karne ke liye
  const updateExpenseTotals = useCallback(() => {
    setCaseData(prev => {
      const expenses = prev.expenseDetails;
      const totalLiabilities =
        (expenses.monthlyRent || 0) +
        (expenses.monthlyOtherLoanInstallments || 0) +
        (expenses.monthlyCreditCardPayments || 0) +
        (expenses.monthlyLivingExpenses || 0);

      const totalMonthlyIncome = prev.incomeDetails.totalMonthlyIncome || 0;
      const dbr = totalMonthlyIncome > 0 ? (totalLiabilities / totalMonthlyIncome) * 100 : 0;
      const dbrStatus = dbr <= 50 ? 'Eligible' : dbr <= 60 ? 'Borderline' : 'Ineligible';

      return {
        ...prev,
        expenseDetails: {
          ...prev.expenseDetails,
          totalMonthlyLiabilities: totalLiabilities,
          dbrPercentage: parseFloat(dbr.toFixed(2)),
          dbrStatus,
        },
      };
    });
  }, []);

  useEffect(() => {
    updateExpenseTotals();
  }, [
    caseData.incomeDetails.totalMonthlyIncome,
    caseData.expenseDetails.monthlyRent,
    caseData.expenseDetails.monthlyCreditCardPayments,
    caseData.expenseDetails.monthlyLivingExpenses,
    caseData.expenseDetails.monthlyOtherLoanInstallments,
  ]);

  const [showAddLoanModal, setShowAddLoanModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [loanForm] = Form.useForm();

  const fetchAcceptedProposals = useCallback(async () => {
    setFetchingProposals(true);
    try {
      const res = await apiService.get('/vault/lead/proposals/my-proposals?page=1&limit=100&status=Accepted');
      if (res?.success) {
        const unconverted = res.data.filter(p => !p.convertedToCase);
        setAcceptedProposals(unconverted);
      }
    } catch (err) {
      message.error("Failed to fetch accepted proposals");
    } finally {
      setFetchingProposals(false);
    }
  }, []);

  const fetchLeadDetails = async (leadId) => {
    setLoading(true);
    try {
      let url = '';
      if (user?.role?.code === '18') {
        url = `/vault/lead/admin/all?page=1&limit=1&leadId=${leadId}`;
      } else {
        url = `/vault/lead/partner/get?page=1&limit=1&leadId=${leadId}`;
      }
      const res = await apiService.get(url);
      if (res?.success && res.data?.length > 0) {
        const lead = res.data[0];
        setSelectedLead(lead);
        populateCaseFromLeadAndProposal(lead, selectedProposal);
      } else {
        message.warning("Lead not found");
      }
    } catch (err) {
      message.error("Failed to fetch lead details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (documentType, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', 'Case');
      formData.append('entityId', createdCaseId);
      formData.append('documentType', documentType);
      formData.append('documentCategory', 'other');
      await apiService.post('/vault/lead/documents/upload', formData);
      message.success(`${documentType} uploaded`);
    } catch (err) {
      message.error("Upload failed");
    }
  };

  const populateCaseFromLeadAndProposal = (lead, proposal) => {
    if (!lead) return;

    const caseRef = `CASE-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const selectedBankProductToUse = selectedBankFromProposal || proposal?.selectedBankProducts?.[0];
    const selectedBankProduct = selectedBankProductToUse?.bankProductId || {};

    const propertyValue = lead.propertyDetails?.propertyValue || 0;
    const loanAmount = lead.propertyDetails?.loanAmountRequired || 0;
    const downPayment = propertyValue - loanAmount;
    const ltvPercentage = loanAmount > 0 ? (loanAmount / propertyValue) * 100 : 80;

    let dateOfBirth = null;
    if (lead.customerInfo?.dateOfBirth) {
      dateOfBirth = dayjs(lead.customerInfo.dateOfBirth);
    }

    const salary = lead.customerInfo?.monthlySalary || 0;

    setCaseData({
      caseReference: caseRef,
      clientInfo: {
        fullName: lead.customerInfo?.fullName || '',
        preferredName: lead.customerInfo?.preferredName || null,
        gender: null,
        dateOfBirth,
        nationality: lead.customerInfo?.nationality || '',
        maritalStatus: lead.customerInfo?.maritalStatus || 'Single',
        numberOfDependents: lead.customerInfo?.numberOfDependents || 0,
        email: lead.customerInfo?.email || '',
        mobile: lead.customerInfo?.mobileNumber || '',
        homePhone: lead.customerInfo?.alternativePhone || null,
        workPhone: null,
        whatsapp: lead.customerInfo?.whatsappNumber || null,
      },
      currentAddress: {
        building: '', apartment: '',
        area: lead.propertyDetails?.propertyAddress?.area || '',
        city: 'Dubai', country: 'UAE', residenceType: null, yearsAtAddress: null,
      },
      previousAddress: {
        building: '', apartment: '', area: '', city: 'Dubai', country: 'UAE',
        residenceType: null, yearsAtAddress: null,
      },
      employmentDetails: {
        employerName: lead.customerInfo?.employer || '',
        industry: null,
        designation: lead.customerInfo?.occupation || '',
        employmentType: 'Salaried',
        yearsWithEmployer: null,
        monthsWithEmployer: 0,
        probationPeriod: 'Completed',
        workAddress: null, workPhone: null, employerEmail: null,
      },
      incomeDetails: {
        basicSalary: salary,
        housingAllowance: 0,
        transportAllowance: 0,
        otherAllowances: 0,
        totalMonthlySalary: salary,
        annualBonus: 0,
        otherIncome: 0,
        totalMonthlyIncome: salary,
        salaryTransferBank: null,
        salaryTransferType: null,
      },
      expenseDetails: {
        monthlyRent: 0, monthlyOtherLoanInstallments: 0, monthlyCreditCardPayments: 0,
        monthlyLivingExpenses: 0, totalMonthlyLiabilities: 0, dbrPercentage: 0,
        dbrStatus: 'Eligible', existingLoans: [],
      },
      propertyInfo: {
        propertyType: lead.propertyDetails?.propertyType || 'Ready',
        propertySubtype: lead.propertyDetails?.propertySubtype || 'Apartment',
        propertyValue,
        valuationAmount: propertyValue,
        ltvPercentage,
        loanAmount,
        downPayment,
        downPaymentSource: null,
        propertyAddress: {
          building: lead.propertyDetails?.propertyAddress?.building || '',
          apartment: null, floor: null,
          area: lead.propertyDetails?.propertyAddress?.area || '',
          city: 'Dubai', emirate: 'Dubai',
        },
        propertyDetails: { bedrooms: null, bathrooms: null, areaSqft: null, areaSqm: null, yearBuilt: null, view: null, furnishing: null, parkingSpaces: 0 },
        ownershipDetails: {
          currentOwner: lead.customerInfo?.fullName || '',
          ownerType: 'Individual', titleDeedNumber: null, titleDeedUrl: null, nocAvailable: false,
        },
        transactionDetails: {
          purchasePrice: propertyValue,
          agreementDate: dayjs(),
          handoverDate: lead.propertyDetails?.completionDate ? dayjs(lead.propertyDetails.completionDate) : null,
          depositPaid: 0, depositPaidDate: null, agentCommission: 0,
          dldFees: propertyValue * 0.04,
          registrationFees: 4000,
          totalClosingCosts: (propertyValue * 0.04) + 4000 + 2500,
        },
      },
      loanInfo: {
        requestedAmount: loanAmount,
        approvedAmount: loanAmount,
        tenureYears: lead.loanRequirements?.preferredTenureYears || 25,
        tenureMonths: (lead.loanRequirements?.preferredTenureYears || 25) * 12,
        interestRateType: selectedBankProduct?.offerSummary?.productType === 'FIXED' ? 'Fixed' : 'Variable',
        interestRatePercentage: selectedBankProduct?.offerSummary?.initialRate || selectedBankProductToUse?.snapshotRate || 4.25,
        processingFee: selectedBankProduct?.costBreakdown?.bankProcessingFee || 2500,
        valuationFee: selectedBankProduct?.costBreakdown?.valuationFee || 2500,
        earlySettlementFeePercentage: 1,
        earlySettlementAllowedAfterYears: 3,
        lifeInsuranceRequired: selectedBankProduct?.insurance?.lifeInsuranceRequired || false,
        propertyInsuranceRequired: selectedBankProduct?.insurance?.propertyInsuranceRequired || true,
        monthlyInstallment: {
          principalAndInterest: selectedBankProduct?.offerSummary?.monthlyEMI || 0,
          lifeInsurance: 0, propertyInsurance: 0,
          totalMonthlyPayment: selectedBankProduct?.offerSummary?.monthlyEMI || 0,
        },
        selectedBank: selectedBankProduct?.bankInfo?.bankName || '',
        selectedBankProduct: selectedBankProduct?._id || '',
        alternativeBanksConsidered: [],
      },
      internalNotes: proposal?.coverNote || '',
      customerNotes: '',
      pendingDocumentTypes: [],
    });
  };

  useEffect(() => { fetchAcceptedProposals(); }, [fetchAcceptedProposals]);

  useEffect(() => {
    if (selectedProposal && selectedProposal.leadId?._id) {
      fetchLeadDetails(selectedProposal.leadId._id);
    }
  }, [selectedProposal, selectedBankFromProposal]);

  const handleNext = () => {
    if (currentStep === 0 && !selectedProposal) {
      return message.warning("Please select an accepted proposal first.");
    }
    if (currentStep === 0 && selectedProposal) {
      const bankProducts = selectedProposal.selectedBankProducts || [];
      if (bankProducts.length > 1 && !selectedBankFromProposal) {
        setShowBankSelectionModal(true);
        return;
      } else if (bankProducts.length === 1) {
        setSelectedBankFromProposal(bankProducts[0]);
        setCurrentStep(prev => prev + 1);
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => setCurrentStep(prev => prev - 1);

  const handleBankSelection = (selectedBankProduct) => {
    setSelectedBankFromProposal(selectedBankProduct);
    setShowBankSelectionModal(false);
    if (selectedLead && selectedProposal) {
      const updatedProposal = { ...selectedProposal, selectedBankProducts: [selectedBankProduct] };
      populateCaseFromLeadAndProposal(selectedLead, updatedProposal);
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleCaseDataChange = (section, field, value) => {
    setCaseData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleNestedChange = (section, nested, field, value) => {
    setCaseData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nested]: { ...prev[section][nested], [field]: value },
      },
    }));
  };

  // ✅ FIX 3: Income total — single setCaseData call with all updates together
  const handleIncomeChange = (field, val) => {
    setCaseData(prev => {
      const updated = { ...prev.incomeDetails, [field]: val || 0 };
      const total =
        (updated.basicSalary || 0) +
        (updated.housingAllowance || 0) +
        (updated.transportAllowance || 0) +
        (updated.otherAllowances || 0);
      return {
        ...prev,
        incomeDetails: {
          ...updated,
          totalMonthlySalary: total,
          totalMonthlyIncome: total,
        },
      };
    });
  };

  const handleAddLoan = () => {
    loanForm.validateFields().then(values => {
      const newLoan = {
        type: values.type,
        bank: values.bank,
        outstandingAmount: values.outstandingAmount,
        monthlyInstallment: values.monthlyInstallment,
        tenureRemainingMonths: values.tenureRemainingMonths,
      };

      setCaseData(prev => {
        let updatedLoans;
        if (editingLoan !== null) {
          updatedLoans = [...prev.expenseDetails.existingLoans];
          updatedLoans[editingLoan] = newLoan;
        } else {
          updatedLoans = [...prev.expenseDetails.existingLoans, newLoan];
        }
        const totalLoanInstallments = updatedLoans.reduce((sum, loan) => sum + (loan.monthlyInstallment || 0), 0);
        return {
          ...prev,
          expenseDetails: {
            ...prev.expenseDetails,
            existingLoans: updatedLoans,
            monthlyOtherLoanInstallments: totalLoanInstallments,
          },
        };
      });

      loanForm.resetFields();
      setShowAddLoanModal(false);
      setEditingLoan(null);
    });
  };

  const handleEditLoan = (index) => {
    const loan = caseData.expenseDetails.existingLoans[index];
    loanForm.setFieldsValue(loan);
    setEditingLoan(index);
    setShowAddLoanModal(true);
  };

  const handleRemoveLoan = (index) => {
    setCaseData(prev => {
      const updatedLoans = prev.expenseDetails.existingLoans.filter((_, i) => i !== index);
      const totalLoanInstallments = updatedLoans.reduce((sum, loan) => sum + (loan.monthlyInstallment || 0), 0);
      return {
        ...prev,
        expenseDetails: {
          ...prev.expenseDetails,
          existingLoans: updatedLoans,
          monthlyOtherLoanInstallments: totalLoanInstallments,
        },
      };
    });
  };

  const submitCase = async () => {
    setSubmitting(true);
    try {
      const formatDateForApi = (date) => {
        if (!date) return null;
        if (date.$d) return date.$d;
        if (date.toDate) return date.toDate();
        return date;
      };

      const selectedBankProductId =
        selectedBankFromProposal?.bankProductId?._id ||
        selectedBankFromProposal?.bankProductId ||
        caseData.loanInfo.selectedBankProduct;

      const payload = {
        proposalId: selectedProposal?._id,
        sourceLeadId: selectedLead?._id,
        clientInfo: { ...caseData.clientInfo, dateOfBirth: formatDateForApi(caseData.clientInfo.dateOfBirth) },
        currentAddress: caseData.currentAddress.building ? caseData.currentAddress : null,
        previousAddress: caseData.previousAddress.building ? caseData.previousAddress : null,
        employmentDetails: { ...caseData.employmentDetails },
        incomeDetails: { ...caseData.incomeDetails },
        expenseDetails: { ...caseData.expenseDetails },
        propertyInfo: {
          ...caseData.propertyInfo,
          transactionDetails: {
            ...caseData.propertyInfo.transactionDetails,
            agreementDate: formatDateForApi(caseData.propertyInfo.transactionDetails?.agreementDate),
            handoverDate: formatDateForApi(caseData.propertyInfo.transactionDetails?.handoverDate),
          },
        },
        loanInfo: {
          ...caseData.loanInfo,
          selectedBankProduct: selectedBankProductId,
          alternativeBanksConsidered: caseData.loanInfo.alternativeBanksConsidered || [],
        },
      };

      const response = await apiService.post('/vault/cases', payload);

      if (response?.success) {
        setCreatedCaseId(response.data._id);
        message.success("Case created successfully!");
        setCurrentStep(0);
        setSelectedProposal(null);
        setSelectedLead(null);
        setSelectedBankFromProposal(null);
        fetchAcceptedProposals();
      } else {
        message.error(response?.message || "Failed to create case");
      }
    } catch (err) {
      console.error("Case creation error:", err);
      message.error(err.response?.data?.message || "Error creating case");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── STEP 0: Select Proposal ───────────────────────────────────────
  const renderStep0 = () => (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <Title level={4} style={{ color: THEME_COLOR, marginBottom: 24 }}>
        Select Accepted Proposal to Convert to Case
      </Title>
      {fetchingProposals ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
      ) : acceptedProposals.length === 0 ? (
        <Alert message="No Accepted Proposals Found" description="There are no accepted proposals available to convert into cases." type="info" showIcon style={{ borderRadius: 12 }} />
      ) : (
        <Row gutter={[16, 16]}>
          {acceptedProposals.map(proposal => (
            <Col xs={24} md={12} lg={8} key={proposal._id}>
              <Card
                hoverable
                onClick={() => setSelectedProposal(proposal)}
                style={{
                  borderColor: selectedProposal?._id === proposal._id ? THEME_COLOR : '#f0f0f0',
                  borderWidth: selectedProposal?._id === proposal._id ? 2 : 1,
                  borderRadius: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: THEME_COLOR }} />
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ display: 'block', fontSize: 16 }}>{proposal.leadId?.customerInfo?.fullName}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{proposal.leadId?.customerInfo?.email}</Text>
                  </div>
                  <Badge status="success" text="Accepted" />
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Property Value</Text>
                    <div><b>AED {proposal.leadId?.propertyDetails?.propertyValue?.toLocaleString()}</b></div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Loan Amount</Text>
                    <div><b>AED {proposal.leadId?.propertyDetails?.loanAmountRequired?.toLocaleString()}</b></div>
                  </Col>
                  <Col span={24}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Selected Banks ({proposal.selectedBankProducts?.length || 0})</Text>
                    <div>
                      {proposal.selectedBankProducts?.map((p, idx) => (
                        <Tag key={idx} color="purple" style={{ marginTop: 4 }}>
                          {p.bankProductId?.bankInfo?.bankName} ({p.snapshotRate || p.bankProductId?.offerSummary?.initialRate}%)
                        </Tag>
                      ))}
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );

  // ─── STEP 1: Client Information ────────────────────────────────────
  const renderStep1 = () => (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <Title level={4} style={{ color: THEME_COLOR, marginBottom: 24 }}>Client Information</Title>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="Personal Details" styles={{ body: { padding: 24 } }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Full Name <span style={{ color: 'red' }}>*</span></Text>
                <Input value={caseData.clientInfo.fullName} onChange={(e) => handleCaseDataChange('clientInfo', 'fullName', e.target.value)} placeholder="Enter full name" style={{ marginTop: 4 }} />
              </Col>
              <Col span={12}>
                <Text strong>Preferred Name</Text>
                <Input value={caseData.clientInfo.preferredName} onChange={(e) => handleCaseDataChange('clientInfo', 'preferredName', e.target.value)} placeholder="Enter preferred name" style={{ marginTop: 4 }} />
              </Col>
              <Col span={8}>
                <Text strong>Gender <span style={{ color: 'red' }}>*</span></Text>
                <Select value={caseData.clientInfo.gender} onChange={(val) => handleCaseDataChange('clientInfo', 'gender', val)} style={{ width: '100%', marginTop: 4 }} placeholder="Select gender">
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                </Select>
              </Col>
              <Col span={8}>
                <Text strong>Date of Birth <span style={{ color: 'red' }}>*</span></Text>
                <DatePicker value={caseData.clientInfo.dateOfBirth} onChange={(date) => handleCaseDataChange('clientInfo', 'dateOfBirth', date)} style={{ width: '100%', marginTop: 4 }} format="DD/MM/YYYY" placeholder="Select date of birth" />
              </Col>
              <Col span={8}>
                <Text strong>Nationality <span style={{ color: 'red' }}>*</span></Text>
                <Input value={caseData.clientInfo.nationality} onChange={(e) => handleCaseDataChange('clientInfo', 'nationality', e.target.value)} placeholder="Enter nationality" style={{ marginTop: 4 }} />
              </Col>
              <Col span={8}>
                <Text strong>Marital Status</Text>
                <Select value={caseData.clientInfo.maritalStatus} onChange={(val) => handleCaseDataChange('clientInfo', 'maritalStatus', val)} style={{ width: '100%', marginTop: 4 }}>
                  <Option value="Single">Single</Option>
                  <Option value="Married">Married</Option>
                  <Option value="Divorced">Divorced</Option>
                  <Option value="Widowed">Widowed</Option>
                </Select>
              </Col>
              <Col span={8}>
                <Text strong>Number of Dependents</Text>
                <InputNumber value={caseData.clientInfo.numberOfDependents} onChange={(val) => handleCaseDataChange('clientInfo', 'numberOfDependents', val)} style={{ width: '100%', marginTop: 4 }} min={0} max={20} />
              </Col>
              <Col span={12}>
                <Text strong>Email <span style={{ color: 'red' }}>*</span></Text>
                <Input value={caseData.clientInfo.email} onChange={(e) => handleCaseDataChange('clientInfo', 'email', e.target.value)} placeholder="Enter email" style={{ marginTop: 4 }} />
              </Col>
              <Col span={12}>
                <Text strong>Mobile Number <span style={{ color: 'red' }}>*</span></Text>
                <Input value={caseData.clientInfo.mobile} onChange={(e) => handleCaseDataChange('clientInfo', 'mobile', e.target.value)} placeholder="Enter mobile number" style={{ marginTop: 4 }} />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Current Address" styles={{ body: { padding: 24 } }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Building Name</Text>
                <Input value={caseData.currentAddress.building} onChange={(e) => setCaseData(prev => ({ ...prev, currentAddress: { ...prev.currentAddress, building: e.target.value } }))} placeholder="Enter building name" style={{ marginTop: 4 }} />
              </Col>
              <Col span={12}>
                <Text strong>Apartment/Unit</Text>
                <Input value={caseData.currentAddress.apartment} onChange={(e) => setCaseData(prev => ({ ...prev, currentAddress: { ...prev.currentAddress, apartment: e.target.value } }))} placeholder="Enter apartment number" style={{ marginTop: 4 }} />
              </Col>
              <Col span={12}>
                <Text strong>Area <span style={{ color: 'red' }}>*</span></Text>
                <Input value={caseData.currentAddress.area} onChange={(e) => setCaseData(prev => ({ ...prev, currentAddress: { ...prev.currentAddress, area: e.target.value } }))} placeholder="Enter area" style={{ marginTop: 4 }} />
              </Col>
              <Col span={6}>
                <Text strong>Residence Type</Text>
                <Select value={caseData.currentAddress.residenceType} onChange={(val) => setCaseData(prev => ({ ...prev, currentAddress: { ...prev.currentAddress, residenceType: val } }))} style={{ width: '100%', marginTop: 4 }} placeholder="Select type">
                  <Option value="Owned">Owned</Option>
                  <Option value="Rented">Rented</Option>
                  <Option value="Company Provided">Company Provided</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Text strong>Years at Address</Text>
                <InputNumber value={caseData.currentAddress.yearsAtAddress} onChange={(val) => setCaseData(prev => ({ ...prev, currentAddress: { ...prev.currentAddress, yearsAtAddress: val } }))} style={{ width: '100%', marginTop: 4 }} min={0} max={50} placeholder="Years" />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Employment Details" styles={{ body: { padding: 24 } }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Employer Name <span style={{ color: 'red' }}>*</span></Text>
                <Input value={caseData.employmentDetails.employerName} onChange={(e) => handleCaseDataChange('employmentDetails', 'employerName', e.target.value)} placeholder="Enter employer name" style={{ marginTop: 4 }} />
              </Col>
              <Col span={12}>
                <Text strong>Designation <span style={{ color: 'red' }}>*</span></Text>
                <Input value={caseData.employmentDetails.designation} onChange={(e) => handleCaseDataChange('employmentDetails', 'designation', e.target.value)} placeholder="Enter job title" style={{ marginTop: 4 }} />
              </Col>
              <Col span={8}>
                <Text strong>Employment Type</Text>
                <Select value={caseData.employmentDetails.employmentType} onChange={(val) => handleCaseDataChange('employmentDetails', 'employmentType', val)} style={{ width: '100%', marginTop: 4 }}>
                  <Option value="Salaried">Salaried</Option>
                  <Option value="Self-Employed">Self-Employed</Option>
                </Select>
              </Col>
              <Col span={8}>
                <Text strong>Years with Employer</Text>
                <InputNumber value={caseData.employmentDetails.yearsWithEmployer} onChange={(val) => handleCaseDataChange('employmentDetails', 'yearsWithEmployer', val)} style={{ width: '100%', marginTop: 4 }} min={0} max={50} placeholder="Years" />
              </Col>
              <Col span={8}>
                <Text strong>Probation Period</Text>
                <Select value={caseData.employmentDetails.probationPeriod} onChange={(val) => handleCaseDataChange('employmentDetails', 'probationPeriod', val)} style={{ width: '100%', marginTop: 4 }}>
                  <Option value="Completed">Completed</Option>
                  <Option value="Ongoing">Ongoing</Option>
                  <Option value="Not Applicable">Not Applicable</Option>
                </Select>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // ─── STEP 2: Income & Expenses ─────────────────────────────────────
  // ✅ FIX 4: `return ( +` ka stray `+` hata diya
  const renderStep2 = () => {
    return (
      <div style={{ animation: 'fadeIn 0.5s' }}>
        <Title level={4} style={{ color: THEME_COLOR, marginBottom: 24 }}>Income & Financial Assessment</Title>

        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Card title="Income Details" styles={{ body: { padding: 24 } }}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Text strong>Basic Salary (Monthly) <span style={{ color: 'red' }}>*</span></Text>
                  <InputNumber
                    value={caseData.incomeDetails.basicSalary}
                    onChange={(val) => handleIncomeChange('basicSalary', val)}
                    style={{ width: '100%', marginTop: 4 }}
                    formatter={aedFormatter}
                    parser={aedParser}
                    placeholder="Enter basic salary"
                    min={0}
                  />
                </Col>
                <Col span={12}>
                  <Text strong>Housing Allowance</Text>
                  <InputNumber
                    value={caseData.incomeDetails.housingAllowance}
                    onChange={(val) => handleIncomeChange('housingAllowance', val)}
                    style={{ width: '100%', marginTop: 4 }}
                    formatter={aedFormatter}
                    parser={aedParser}
                    min={0}
                  />
                </Col>
                <Col span={12}>
                  <Text strong>Transport Allowance</Text>
                  <InputNumber
                    value={caseData.incomeDetails.transportAllowance}
                    onChange={(val) => handleIncomeChange('transportAllowance', val)}
                    style={{ width: '100%', marginTop: 4 }}
                    formatter={aedFormatter}
                    parser={aedParser}
                    min={0}
                  />
                </Col>
                <Col span={24}>
                  <Text strong>Other Allowances</Text>
                  <InputNumber
                    value={caseData.incomeDetails.otherAllowances}
                    onChange={(val) => handleIncomeChange('otherAllowances', val)}
                    style={{ width: '100%', marginTop: 4 }}
                    formatter={aedFormatter}
                    parser={aedParser}
                    min={0}
                  />
                </Col>
                <Col span={24}>
                  <Divider />
                  <div style={{ textAlign: 'center' }}>
                    <Statistic
                      title="Total Monthly Income"
                      value={caseData.incomeDetails.totalMonthlyIncome || 0}
                      precision={0}
                      prefix="AED"
                      valueStyle={{ color: THEME_COLOR, fontSize: 24 }}
                    />
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Monthly Expenses" styles={{ body: { padding: 24 } }}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Text strong>Monthly Rent/Mortgage</Text>
                  <InputNumber
                    value={caseData.expenseDetails.monthlyRent}
                    onChange={(val) => handleCaseDataChange('expenseDetails', 'monthlyRent', val || 0)}
                    style={{ width: '100%', marginTop: 4 }}
                    formatter={aedFormatter}
                    parser={aedParser}
                    min={0}
                  />
                </Col>
                <Col span={24}>
                  <Text strong>Credit Card Payments (Monthly)</Text>
                  <InputNumber
                    value={caseData.expenseDetails.monthlyCreditCardPayments}
                    onChange={(val) => handleCaseDataChange('expenseDetails', 'monthlyCreditCardPayments', val || 0)}
                    style={{ width: '100%', marginTop: 4 }}
                    formatter={aedFormatter}
                    parser={aedParser}
                    min={0}
                  />
                </Col>
                <Col span={24}>
                  <Text strong>Monthly Living Expenses</Text>
                  <InputNumber
                    value={caseData.expenseDetails.monthlyLivingExpenses}
                    onChange={(val) => handleCaseDataChange('expenseDetails', 'monthlyLivingExpenses', val || 0)}
                    style={{ width: '100%', marginTop: 4 }}
                    formatter={aedFormatter}
                    parser={aedParser}
                    min={0}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={24}>
            <Card
              title="Existing Loans & Liabilities"
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingLoan(null); loanForm.resetFields(); setShowAddLoanModal(true); }} style={{ background: THEME_COLOR }}>
                  Add Loan
                </Button>
              }
              styles={{ body: { padding: 24 } }}
            >
              <Table
                dataSource={caseData.expenseDetails.existingLoans}
                columns={[
                  { title: 'Type', dataIndex: 'type', key: 'type', render: (val) => <Tag color="blue">{val}</Tag> },
                  { title: 'Bank/Institution', dataIndex: 'bank', key: 'bank' },
                  { title: 'Outstanding Amount', dataIndex: 'outstandingAmount', key: 'outstandingAmount', render: (val) => `AED ${(val || 0).toLocaleString()}` },
                  { title: 'Monthly Installment', dataIndex: 'monthlyInstallment', key: 'monthlyInstallment', render: (val) => `AED ${(val || 0).toLocaleString()}` },
                  { title: 'Remaining Months', dataIndex: 'tenureRemainingMonths', key: 'tenureRemainingMonths' },
                  {
                    title: 'Actions', key: 'actions',
                    render: (_, __, index) => (
                      <Space>
                        <Button size="small" onClick={() => handleEditLoan(index)}>Edit</Button>
                        <Button size="small" danger onClick={() => handleRemoveLoan(index)}>Remove</Button>
                      </Space>
                    ),
                  },
                ]}
                rowKey={(_, index) => index}
                pagination={false}
                locale={{ emptyText: 'No existing loans added' }}
              />
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Debt Burden Ratio (DBR) Analysis" styles={{ body: { padding: 24 }, header: { background: '#f8f5ff' } }}>
              <Row gutter={[24, 24]}>
                <Col span={8}>
                  <Statistic title="Total Monthly Income" value={caseData.incomeDetails.totalMonthlyIncome || 0} prefix="AED" valueStyle={{ color: '#10b981' }} />
                </Col>
                <Col span={8}>
                  <Statistic title="Total Monthly Liabilities" value={caseData.expenseDetails.totalMonthlyLiabilities || 0} prefix="AED" valueStyle={{ color: '#ef4444' }} />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="DBR Percentage"
                    value={caseData.expenseDetails.dbrPercentage || 0}
                    suffix="%"
                    precision={1}
                    valueStyle={{
                      color: caseData.expenseDetails.dbrStatus === 'Eligible' ? '#10b981' :
                             caseData.expenseDetails.dbrStatus === 'Borderline' ? '#f59e0b' : '#ef4444',
                      fontWeight: 'bold'
                    }}
                  />
                  <Badge
                    status={caseData.expenseDetails.dbrStatus === 'Eligible' ? 'success' : caseData.expenseDetails.dbrStatus === 'Borderline' ? 'warning' : 'error'}
                    text={caseData.expenseDetails.dbrStatus}
                    style={{ marginTop: 8 }}
                  />
                </Col>
              </Row>
              {caseData.expenseDetails.dbrPercentage > 50 && (
                <Alert
                  message="High DBR Detected"
                  description={`DBR of ${caseData.expenseDetails.dbrPercentage?.toFixed(1)}% exceeds the ideal 50% threshold. Loan approval may be challenging.`}
                  type="warning"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // ─── STEP 3: Property & Loan ───────────────────────────────────────
  const renderStep3 = () => (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <Title level={4} style={{ color: THEME_COLOR, marginBottom: 24 }}>Property & Loan Details</Title>

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="Property Information" styles={{ body: { padding: 24 } }}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Text strong>Property Type</Text>
                <Select value={caseData.propertyInfo.propertyType} onChange={(val) => handleCaseDataChange('propertyInfo', 'propertyType', val)} style={{ width: '100%', marginTop: 4 }}>
                  <Option value="Ready">Ready</Option>
                  <Option value="Off-plan">Off-plan</Option>
                  <Option value="Commercial">Commercial</Option>
                </Select>
              </Col>
              <Col span={8}>
                <Text strong>Property Subtype</Text>
                <Select value={caseData.propertyInfo.propertySubtype} onChange={(val) => handleCaseDataChange('propertyInfo', 'propertySubtype', val)} style={{ width: '100%', marginTop: 4 }}>
                  <Option value="Apartment">Apartment</Option>
                  <Option value="Villa">Villa</Option>
                  <Option value="Townhouse">Townhouse</Option>
                  <Option value="Penthouse">Penthouse</Option>
                </Select>
              </Col>
              <Col span={8}>
                <Text strong>Property Value <span style={{ color: 'red' }}>*</span></Text>
                <InputNumber
                  value={caseData.propertyInfo.propertyValue}
                  onChange={(val) => {
                    const loanAmt = caseData.propertyInfo.loanAmount;
                    const ltv = val > 0 ? (loanAmt / val) * 100 : 80;
                    setCaseData(prev => ({ ...prev, propertyInfo: { ...prev.propertyInfo, propertyValue: val || 0, ltvPercentage: parseFloat(ltv.toFixed(2)) } }));
                  }}
                  style={{ width: '100%', marginTop: 4 }}
                  formatter={aedFormatter}
                  parser={aedParser}
                  min={0}
                />
              </Col>
              <Col span={8}>
                <Text strong>Building Name</Text>
                <Input value={caseData.propertyInfo.propertyAddress?.building} onChange={(e) => handleNestedChange('propertyInfo', 'propertyAddress', 'building', e.target.value)} placeholder="Enter building name" style={{ marginTop: 4 }} />
              </Col>
              <Col span={8}>
                <Text strong>Area <span style={{ color: 'red' }}>*</span></Text>
                <Input value={caseData.propertyInfo.propertyAddress?.area} onChange={(e) => handleNestedChange('propertyInfo', 'propertyAddress', 'area', e.target.value)} placeholder="Enter area" style={{ marginTop: 4 }} />
              </Col>
              <Col span={8}>
                <Text strong>Purchase Price <span style={{ color: 'red' }}>*</span></Text>
                <InputNumber
                  value={caseData.propertyInfo.transactionDetails?.purchasePrice}
                  onChange={(val) => handleNestedChange('propertyInfo', 'transactionDetails', 'purchasePrice', val || 0)}
                  style={{ width: '100%', marginTop: 4 }}
                  formatter={aedFormatter}
                  parser={aedParser}
                  min={0}
                />
              </Col>
              <Col span={12}>
                <Text strong>Agreement Date</Text>
                <DatePicker value={caseData.propertyInfo.transactionDetails?.agreementDate} onChange={(date) => handleNestedChange('propertyInfo', 'transactionDetails', 'agreementDate', date)} style={{ width: '100%', marginTop: 4 }} format="DD/MM/YYYY" />
              </Col>
              <Col span={12}>
                <Text strong>Handover Date (for Off-plan)</Text>
                <DatePicker value={caseData.propertyInfo.transactionDetails?.handoverDate} onChange={(date) => handleNestedChange('propertyInfo', 'transactionDetails', 'handoverDate', date)} style={{ width: '100%', marginTop: 4 }} format="DD/MM/YYYY" />
              </Col>
            </Row>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Text strong>Loan Amount</Text>
                <InputNumber
                  value={caseData.propertyInfo.loanAmount}
                  onChange={(val) => {
                    const propValue = caseData.propertyInfo.propertyValue;
                    const ltv = propValue > 0 ? ((val || 0) / propValue) * 100 : 0;
                    setCaseData(prev => ({
                      ...prev,
                      propertyInfo: { ...prev.propertyInfo, loanAmount: val || 0, ltvPercentage: parseFloat(ltv.toFixed(2)), downPayment: propValue - (val || 0) },
                    }));
                  }}
                  style={{ width: '100%', marginTop: 4 }}
                  formatter={aedFormatter}
                  parser={aedParser}
                  min={0}
                />
              </Col>
              <Col span={8}>
                <Text strong>Down Payment</Text>
                <InputNumber value={caseData.propertyInfo.downPayment} style={{ width: '100%', marginTop: 4 }} formatter={aedFormatter} parser={aedParser} disabled />
              </Col>
              <Col span={8}>
                <Text strong>LTV Percentage</Text>
                <InputNumber value={caseData.propertyInfo.ltvPercentage} style={{ width: '100%', marginTop: 4 }} suffix="%" disabled precision={2} />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card
            title="Loan Details"
            extra={selectedBankFromProposal && (
              <Tag color="green" style={{ fontSize: 14 }}>
                Selected Bank: {selectedBankFromProposal?.bankProductId?.bankInfo?.bankName || caseData.loanInfo.selectedBank}
              </Tag>
            )}
            styles={{ body: { padding: 24 } }}
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Text strong>Selected Bank</Text>
                <Input value={caseData.loanInfo.selectedBank} onChange={(e) => handleCaseDataChange('loanInfo', 'selectedBank', e.target.value)} style={{ marginTop: 4 }} disabled={!!selectedBankFromProposal} />
              </Col>
              <Col span={8}>
                <Text strong>Bank Product</Text>
                <Input value={caseData.loanInfo.selectedBankProduct} onChange={(e) => handleCaseDataChange('loanInfo', 'selectedBankProduct', e.target.value)} style={{ marginTop: 4 }} disabled={!!selectedBankFromProposal} />
              </Col>
              <Col span={8}>
                <Text strong>Interest Rate (%)</Text>
                <InputNumber value={caseData.loanInfo.interestRatePercentage} onChange={(val) => handleCaseDataChange('loanInfo', 'interestRatePercentage', val || 0)} style={{ width: '100%', marginTop: 4 }} step={0.01} min={0} />
              </Col>
              <Col span={8}>
                <Text strong>Tenure (Years)</Text>
                <InputNumber
                  value={caseData.loanInfo.tenureYears}
                  onChange={(val) => {
                    setCaseData(prev => ({ ...prev, loanInfo: { ...prev.loanInfo, tenureYears: val || 0, tenureMonths: (val || 0) * 12 } }));
                  }}
                  style={{ width: '100%', marginTop: 4 }}
                  min={5}
                  max={30}
                />
              </Col>
              <Col span={8}>
                <Text strong>Monthly EMI</Text>
                <InputNumber
                  value={caseData.loanInfo.monthlyInstallment?.principalAndInterest}
                  onChange={(val) => {
                    setCaseData(prev => ({
                      ...prev,
                      loanInfo: { ...prev.loanInfo, monthlyInstallment: { ...prev.loanInfo.monthlyInstallment, principalAndInterest: val || 0, totalMonthlyPayment: val || 0 } },
                    }));
                  }}
                  style={{ width: '100%', marginTop: 4 }}
                  formatter={aedFormatter}
                  parser={aedParser}
                  min={0}
                />
              </Col>
              <Col span={8}>
                <Text strong>Interest Rate Type</Text>
                <Select value={caseData.loanInfo.interestRateType} onChange={(val) => handleCaseDataChange('loanInfo', 'interestRateType', val)} style={{ width: '100%', marginTop: 4 }}>
                  <Option value="Fixed">Fixed</Option>
                  <Option value="Variable">Variable</Option>
                </Select>
              </Col>
            </Row>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Processing Fee</Text>
                <InputNumber value={caseData.loanInfo.processingFee} onChange={(val) => handleCaseDataChange('loanInfo', 'processingFee', val || 0)} style={{ width: '100%', marginTop: 4 }} formatter={aedFormatter} parser={aedParser} min={0} />
              </Col>
              <Col span={12}>
                <Text strong>Valuation Fee</Text>
                <InputNumber value={caseData.loanInfo.valuationFee} onChange={(val) => handleCaseDataChange('loanInfo', 'valuationFee', val || 0)} style={{ width: '100%', marginTop: 4 }} formatter={aedFormatter} parser={aedParser} min={0} />
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <Switch checked={caseData.loanInfo.lifeInsuranceRequired} onChange={(val) => handleCaseDataChange('loanInfo', 'lifeInsuranceRequired', val)} />
                  <Text strong>Life Insurance Required</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <Switch checked={caseData.loanInfo.propertyInsuranceRequired} onChange={(val) => handleCaseDataChange('loanInfo', 'propertyInsuranceRequired', val)} />
                  <Text strong>Property Insurance Required</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // ─── STEP 4: Documents ─────────────────────────────────────────────
  const renderStepDocuments = () => (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <Title level={4} style={{ color: THEME_COLOR, marginBottom: 24 }}>Documents Upload</Title>
      <Alert message="Upload Required Documents" description="You must upload all required documents before submitting the case." type="info" showIcon style={{ marginBottom: 20 }} />
      {caseData.pendingDocumentTypes?.length === 0 ? (
        <Alert type="success" message="All documents uploaded ✅" />
      ) : (
        (caseData.pendingDocumentTypes || ['bank_application_form', 'emirates_id_front', 'emirates_id_back', 'passport', 'visa', 'bank_statements', 'salary_certificate', 'payslips', 'title_deed', 'consent_form']).map(doc => (
          <Card key={doc} style={{ marginBottom: 10 }}>
            <b>{doc}</b>
            <input type="file" onChange={(e) => handleUpload(doc, e.target.files[0])} style={{ marginTop: 10, display: 'block' }} />
          </Card>
        ))
      )}
    </div>
  );

  // ─── STEP 5: Notes & Review ────────────────────────────────────────
  const renderStep4 = () => (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <Title level={4} style={{ color: THEME_COLOR, marginBottom: 24 }}>Notes & Final Review</Title>
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Card title="Internal Notes (Xoto Team Only)" styles={{ body: { padding: 24 } }}>
            <TextArea rows={6} value={caseData.internalNotes} onChange={(e) => setCaseData(prev => ({ ...prev, internalNotes: e.target.value }))} placeholder="Add internal notes for Xoto team..." style={{ borderRadius: 8 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Customer Notes (Visible to Customer)" styles={{ body: { padding: 24 } }}>
            <TextArea rows={6} value={caseData.customerNotes} onChange={(e) => setCaseData(prev => ({ ...prev, customerNotes: e.target.value }))} placeholder="Add notes that will be shared with the customer..." style={{ borderRadius: 8 }} />
          </Card>
        </Col>
        <Col span={24}>
          <Card title="Case Summary" styles={{ body: { padding: 24 }, header: { background: '#f8f5ff' } }}>
            <Row gutter={[16, 16]}>
              <Col span={8}><Statistic title="Case Reference" value={caseData.caseReference} valueStyle={{ fontSize: 16 }} /></Col>
              <Col span={8}><Statistic title="Client Name" value={caseData.clientInfo.fullName || 'Not set'} /></Col>
              <Col span={8}><Statistic title="Loan Amount" value={caseData.propertyInfo.loanAmount || 0} prefix="AED" precision={0} /></Col>
              <Col span={8}><Statistic title="Property Value" value={caseData.propertyInfo.propertyValue || 0} prefix="AED" precision={0} /></Col>
              <Col span={8}><Statistic title="Selected Bank" value={caseData.loanInfo.selectedBank || 'Not selected'} /></Col>
              <Col span={8}><Statistic title="Interest Rate" value={caseData.loanInfo.interestRatePercentage || 0} suffix="%" /></Col>
            </Row>
            <Divider />
            <Alert message="Ready to Create Case" description="Please review all information carefully before creating the case." type="success" showIcon />
          </Card>
        </Col>
      </Row>
    </div>
  );

  // ─── Bank Selection Modal ──────────────────────────────────────────
  const renderBankSelectionModal = () => (
    <Modal
      title="Select Bank for Case Creation"
      open={showBankSelectionModal}
      onCancel={() => { setShowBankSelectionModal(false); setSelectedProposal(null); }}
      footer={null}
      width={600}
      closable={false}
    >
      <Alert message="Multiple Banks Selected in Proposal" description="This proposal contains multiple bank options. Please select which bank to use for this case." type="info" showIcon style={{ marginBottom: 20 }} />
      <Row gutter={[16, 16]}>
        {selectedProposal?.selectedBankProducts?.map((bankProduct, index) => (
          <Col span={24} key={index}>
            <Card hoverable onClick={() => handleBankSelection(bankProduct)} style={{ borderRadius: 12, cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <BankOutlined style={{ fontSize: 32, color: THEME_COLOR }} />
                <div style={{ flex: 1 }}>
                  <Text strong style={{ fontSize: 16 }}>{bankProduct.bankProductId?.bankInfo?.bankName || 'Bank Name'}</Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag color="blue">Rate: {bankProduct.snapshotRate || bankProduct.bankProductId?.offerSummary?.initialRate}%</Tag>
                    <Tag color="green">Max LTV: {bankProduct.snapshotMaxLtv || bankProduct.bankProductId?.offerSummary?.maxLTV}%</Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>EMI: AED {(bankProduct.bankProductId?.offerSummary?.monthlyEMI || 0).toLocaleString()}/month</Text>
                </div>
                <CheckCircleOutlined style={{ fontSize: 20, color: '#10b981' }} />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <Button onClick={() => { setShowBankSelectionModal(false); setSelectedProposal(null); }}>Cancel</Button>
      </div>
    </Modal>
  );

  // ─── Main Render ───────────────────────────────────────────────────
  return (
    <div style={{ padding: '24px', background: '#fdfbff', minHeight: '100vh' }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ color: '#1e1b4b', margin: 0, fontWeight: 800 }}>Create Case from Proposal</Title>
        <Text type="secondary">Convert an accepted proposal into a formal case for processing.</Text>
      </div>

      <Card style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: 24 }}>
        <Steps
          current={currentStep}
          style={{ marginBottom: 40 }}
          items={[
            { title: 'Select Proposal' },
            { title: 'Client Info' },
            { title: 'Income & Expenses' },
            { title: 'Property & Loan' },
            { title: 'Documents' },
            { title: 'Review & Create' }
          ]}
        />

        <div style={{ minHeight: 500 }}>
          {currentStep === 0 && renderStep0()}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStepDocuments()}
          {currentStep === 5 && renderStep4()}
        </div>

        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: 24 }}>
          <Button disabled={currentStep === 0} onClick={handlePrev} style={{ borderRadius: 6, height: 40, padding: '0 24px' }}>
            Previous
          </Button>
          {currentStep < 5 ? (
            <Button type="primary" onClick={handleNext} style={{ background: THEME_COLOR, borderColor: THEME_COLOR, borderRadius: 6, height: 40, padding: '0 32px' }}>
              Continue
            </Button>
          ) : (
            <Button type="primary" onClick={submitCase} loading={submitting} style={{ background: '#10b981', borderColor: '#10b981' }} icon={<SaveOutlined />}>
              Create Case
            </Button>
          )}
        </div>
      </Card>

      {renderBankSelectionModal()}

      {/* Add/Edit Loan Modal */}
      <Modal
        title={editingLoan !== null ? "Edit Existing Loan" : "Add Existing Loan"}
        open={showAddLoanModal}
        onCancel={() => { setShowAddLoanModal(false); setEditingLoan(null); loanForm.resetFields(); }}
        footer={[
          <Button key="cancel" onClick={() => { setShowAddLoanModal(false); setEditingLoan(null); loanForm.resetFields(); }}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={handleAddLoan} style={{ background: THEME_COLOR }}>{editingLoan !== null ? "Update" : "Add"} Loan</Button>,
        ]}
        width={600}
      >
        <Form form={loanForm} layout="vertical">
          <Form.Item name="type" label="Loan Type" rules={[{ required: true }]}>
            <Select placeholder="Select loan type">
              <Option value="Car Loan">Car Loan</Option>
              <Option value="Personal Loan">Personal Loan</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item name="bank" label="Bank/Institution" rules={[{ required: true }]}>
            <Input placeholder="Enter bank name" />
          </Form.Item>
          <Form.Item name="outstandingAmount" label="Outstanding Amount" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} formatter={aedFormatter} parser={aedParser} placeholder="Enter outstanding amount" min={0} />
          </Form.Item>
          <Form.Item name="monthlyInstallment" label="Monthly Installment" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} formatter={aedFormatter} parser={aedParser} placeholder="Enter monthly installment" min={0} />
          </Form.Item>
          <Form.Item name="tenureRemainingMonths" label="Remaining Tenure (Months)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} max={360} placeholder="Enter remaining months" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CreateCase;