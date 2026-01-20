import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Button,
  Drawer,
  Switch,
  Card,
  Space,
  Tag,
  Tooltip,
  Spin,
  Typography,
  Divider,
  Row,
  Col,
  Progress,
  Badge,
  Statistic,
  Alert
} from 'antd';
import { Form } from 'antd';
import {
  EyeOutlined,
  SaveOutlined,
  CloseOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  TeamOutlined
} from '@ant-design/icons';
import CustomTable from '../../pages/custom/CustomTable';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../manageApi/utils/toast';
import { showSuccessAlert, showErrorAlert } from '../../../../manageApi/utils/sweetAlert';
import { moduleService } from '../modules/module.service';

// Theme colors
const PURPLE_THEME = {
  primary: '#722ed1',
  primaryLight: '#9254de',
  primaryLighter: '#d3adf7',
  primaryBg: '#f9f0ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#1890ff',
  gray: '#8c8c8c',
  dark: '#1f2937'
};

// Helper: Deep clone to avoid mutation
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

const useModulePermission = () => {
  const { permissions } = useSelector(s => s.auth);
  const p = permissions?.['Module→All Modules'] ?? {};
  return {
    canView: !!p.canView,
    canAdd: !!p.canAdd,
    canEdit: !!p.canEdit,
    canDelete: !!p.canDelete,
    canViewAll: !!p.canViewAll,
  };
};

// ProCard-like component
const ProCard = ({ children, title, extra, headerStyle, bodyStyle, className = '', ...props }) => (
  <Card
    {...props}
    className={`shadow-sm border-0 ${className}`}
    title={
      title && (
        <div className="flex items-center justify-between" style={headerStyle}>
          <span className="font-semibold text-gray-800">{title}</span>
          {extra}
        </div>
      )
    }
    bodyStyle={{ padding: '20px 24px', ...bodyStyle }}
    headStyle={{
      background: PURPLE_THEME.primaryBg,
      borderBottom: `1px solid ${PURPLE_THEME.primaryLighter}`,
      padding: '16px 24px',
      borderRadius: '8px 8px 0 0',
      ...headerStyle
    }}
  >
    {children}
  </Card>
);

const Permission = () => {
  const { token } = useSelector(s => s.auth);
  const perm = useModulePermission();

  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermMap, setRolePermMap] = useState({});
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });
  const [stats, setStats] = useState({
    totalPermissions: 0,
    activeRoles: 0,
    grantedPermissions: 0
  });

  const getPermValue = (value) => value === 1 || value === true;

  /* -------------------------- FETCH DATA -------------------------- */
  const fetchData = useCallback(async (page = 1, itemsPerPage = 10, filters = {}) => {
    if (!perm.canView) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [rolesRes, modulesRes, permissionsRes] = await Promise.all([
        apiService.get('/roles', { page, limit: itemsPerPage, ...filters }),
        moduleService.getAll(),
        apiService.get('/permission')
      ]);

      const sortedModules = (modulesRes.data || []).sort((a, b) => a.position - b.position);
      setModules(sortedModules);
      setRoles(rolesRes.roles || []);
      setPermissions(permissionsRes.permissions || []);

      setPagination({
        currentPage: rolesRes.pagination?.currentPage || 1,
        totalPages: rolesRes.pagination?.totalPages || 1,
        totalResults: rolesRes.pagination?.totalRecords || 0,
        itemsPerPage: rolesRes.pagination?.perPage || 10,
      });

      // Build immutable permission map
      const map = {};
      let grantedCount = 0;
      permissionsRes.permissions.forEach(p => {
        const roleId = p.role._id;
        const modId = p.module._id;
        const subId = p.subModule?._id || null;

        if (!map[roleId]) map[roleId] = {};
        if (!map[roleId][modId]) map[roleId][modId] = {};

        const key = subId || '__module__';
        const permObj = {
          id: p._id,
          canAdd: getPermValue(p.permissions.canAdd),
          canEdit: getPermValue(p.permissions.canEdit),
          canView: getPermValue(p.permissions.canView),
          canDelete: getPermValue(p.permissions.canDelete),
          canViewAll: getPermValue(p.permissions.canViewAll),
        };
        
        // Count granted permissions
        if (Object.values(permObj).some(v => v)) {
          grantedCount++;
        }
        
        map[roleId][modId][key] = permObj;
      });
      
      // Calculate stats
      const totalItems = sortedModules.reduce((c, m) => c + 1 + m.subModules.length, 0) * (rolesRes.roles?.length || 0);
      const activeRoles = rolesRes.roles?.filter(r => r.isActive)?.length || 0;
      
      setStats({
        totalPermissions: totalItems,
        activeRoles,
        grantedPermissions: grantedCount
      });
      
      setRolePermMap(map);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchData(pagination.currentPage, pagination.itemsPerPage, filters);
    }
  }, [token, fetchData]);

  const handlePageChange = (page, itemsPerPage) => fetchData(page, itemsPerPage, filters);
  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    fetchData(1, pagination.itemsPerPage, newFilters);
  };

  const openDrawer = (role) => {
    setSelectedRole(role);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedRole(null);
  };

  /* --------------------- IMMUTABLE UPDATE --------------------- */
  const updatePerm = useCallback((moduleId, subId, type, value) => {
    setRolePermMap(prev => {
      const copy = deepClone(prev);
      const roleId = selectedRole._id;

      if (!copy[roleId]) copy[roleId] = {};
      if (!copy[roleId][moduleId]) copy[roleId][moduleId] = {};

      const key = subId || '__module__';
      if (!copy[roleId][moduleId][key]) {
        copy[roleId][moduleId][key] = {
          canAdd: false,
          canEdit: false,
          canView: false,
          canDelete: false,
          canViewAll: false,
        };
      }

      copy[roleId][moduleId][key][type] = value;
      return copy;
    });
  }, [selectedRole]);

  /* -------------------------- SAVE -------------------------- */
  const savePermissions = async () => {
    if (!perm.canEdit) {
      showToast('You do not have permission to edit', 'warning');
      return;
    }

    setSaving(true);
    const roleId = selectedRole._id;
    const rolePerms = rolePermMap[roleId] || {};
    const toCreate = [];
    const toUpdate = [];
    const toDelete = [];

    Object.entries(rolePerms).forEach(([modId, modPerms]) => {
      Object.entries(modPerms).forEach(([key, p]) => {
        const subId = key === '__module__' ? null : key;
        const hasAny = p.canAdd || p.canEdit || p.canView || p.canDelete || p.canViewAll;

        const payload = {
          canAdd: p.canAdd ? 1 : 0,
          canEdit: p.canEdit ? 1 : 0,
          canView: p.canView ? 1 : 0,
          canDelete: p.canDelete ? 1 : 0,
          canViewAll: p.canViewAll ? 1 : 0,
        };

        if (hasAny && p.id) {
          toUpdate.push({ id: p.id, data: payload });
        } else if (hasAny && !p.id) {
          toCreate.push({ roleId, moduleId: modId, subModuleId: subId, ...payload });
        } else if (!hasAny && p.id) {
          toDelete.push(p.id);
        }
      });
    });

    try {
      // Delete first
      if (toDelete.length) {
        await Promise.all(toDelete.map(id => apiService.delete(`/permission/${id}`)));
      }

      // Update
      if (toUpdate.length) {
        await Promise.all(toUpdate.map(({ id, data }) => apiService.put(`/permission/${id}`, data)));
      }

      // Create
      if (toCreate.length) {
        await apiService.post('/permission', toCreate);
      }

      showSuccessAlert('Success', `${toCreate.length} created, ${toUpdate.length} updated, ${toDelete.length} removed`);
      closeDrawer();
      fetchData(pagination.currentPage, pagination.itemsPerPage, filters);
    } catch (err) {
      const msg = err.response?.data?.message || 'Save failed';
      showErrorAlert('Error', msg);
      console.error('Save error:', err.response?.data);
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------- COLUMNS -------------------------- */
  const columns = useMemo(() => [
    {
      key: 'name',
      title: 'Role Name',
      sortable: true,
      render: (v, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" 
               style={{ background: PURPLE_THEME.primaryBg }}>
            <TeamOutlined style={{ color: PURPLE_THEME.primary, fontSize: '18px' }} />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{v}</div>
            <div className="text-xs text-gray-500">{record.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      title: 'Description',
      render: v => <span className="text-gray-600">{v || 'No description'}</span>,
    },
    {
      key: 'permissions',
      title: 'Permissions',
      render: (_, r) => {
        const totalItems = modules.reduce((c, m) => c + 1 + m.subModules.length, 0);
        const granted = Object.values(rolePermMap[r._id] || {}).reduce(
          (c, mod) => c + Object.keys(mod).length,
          0
        );
        const percent = totalItems > 0 ? Math.round((granted / totalItems) * 100) : 0;
        
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{granted} / {totalItems}</span>
              <span className="font-semibold" style={{ color: PURPLE_THEME.primary }}>
                {percent}%
              </span>
            </div>
            <Progress
              percent={percent}
              size="small"
              strokeColor={percent === 100 ? PURPLE_THEME.success : PURPLE_THEME.primary}
              showInfo={false}
            />
            <div className="text-xs text-gray-500">
              {percent === 0 ? 'No access' : 
               percent === 100 ? 'Full access' : 
               'Limited access'}
            </div>
          </div>
        );
      },
    },
    {
      key: 'isActive',
      title: 'Status',
      sortable: true,
      filterable: true,
      filterKey: 'isActive',
      filterOptions: [
        { value: true, label: 'Active' },
        { value: false, label: 'Inactive' },
      ],
      render: v => (
        <Badge
          status={v ? "success" : "error"}
          text={
            <span className={v ? "text-green-600" : "text-red-600"}>
              {v ? 'Active' : 'Inactive'}
            </span>
          }
        />
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, r) => (
        <Space>
          <Tooltip title="Manage Permissions">
            <Button
              type="primary"
              ghost
              icon={<SettingOutlined />}
              onClick={() => openDrawer(r)}
              disabled={!perm.canView}
              style={{ borderColor: PURPLE_THEME.primary, color: PURPLE_THEME.primary }}
            >
              Configure
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ], [modules, rolePermMap, perm.canView]);

  /* -------------------------- RENDER -------------------------- */
  if (loading && !roles.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!perm.canView) {
    return (
      <div className="p-8 text-center">
        <div className="mb-4">
          <LockOutlined style={{ fontSize: '64px', color: PURPLE_THEME.gray }} />
        </div>
        <Typography.Title level={4} style={{ color: PURPLE_THEME.dark }}>
          Access Denied
        </Typography.Title>
        <Typography.Text type="secondary">
          You do not have permission to view Role Permissions.
        </Typography.Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Typography.Title 
              level={2} 
              style={{ 
                margin: 0, 
                color: PURPLE_THEME.dark,
                fontWeight: 600 
              }}
            >
              Role Permissions
            </Typography.Title>
            <Typography.Text type="secondary" className="text-gray-600">
              Manage and configure access permissions for all user roles
            </Typography.Text>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: PURPLE_THEME.primaryBg }}>
            <SafetyCertificateOutlined style={{ color: PURPLE_THEME.primary, fontSize: '20px' }} />
            <span className="font-medium" style={{ color: PURPLE_THEME.primary }}>
              {perm.canEdit ? 'Edit Mode' : 'View Mode'}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={8}>
            <ProCard className="h-full">
              <Statistic
                title="Total Roles"
                value={roles.length}
                prefix={<TeamOutlined />}
                valueStyle={{ color: PURPLE_THEME.primary }}
              />
              <div className="mt-2 text-sm text-gray-500">
                {stats.activeRoles} active roles
              </div>
            </ProCard>
          </Col>
          <Col xs={24} sm={8}>
            <ProCard className="h-full">
              <Statistic
                title="Granted Permissions"
                value={stats.grantedPermissions}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: PURPLE_THEME.success }}
              />
              <div className="mt-2 text-sm text-gray-500">
                Out of {stats.totalPermissions} total
              </div>
            </ProCard>
          </Col>
          <Col xs={24} sm={8}>
            <ProCard className="h-full">
              <Statistic
                title="Modules"
                value={modules.length}
                prefix={<SettingOutlined />}
                valueStyle={{ color: PURPLE_THEME.info }}
              />
              <div className="mt-2 text-sm text-gray-500">
                With sub-modules included
              </div>
            </ProCard>
          </Col>
        </Row>
      </div>

      {/* Main Table */}
      <ProCard
        title="Role Management"
        extra={
          <Tag color={PURPLE_THEME.primary} style={{ border: 'none', fontWeight: 500 }}>
            {pagination.totalResults} Total Roles
          </Tag>
        }
        className="shadow-md"
      >
        <CustomTable
          columns={columns}
          data={roles}
          totalItems={pagination.totalResults}
          currentPage={pagination.currentPage}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
          onFilter={handleFilter}
          loading={loading}
          rowClassName="hover:bg-purple-50 transition-colors"
        />
      </ProCard>

      {/* Drawer for Permissions */}
      <Drawer
        title={
          <div className="pr-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                   style={{ background: PURPLE_THEME.primaryBg }}>
                <TeamOutlined style={{ color: PURPLE_THEME.primary, fontSize: '24px' }} />
              </div>
              <div>
                <Typography.Title level={4} style={{ margin: 0, color: PURPLE_THEME.dark }}>
                  {selectedRole?.name}
                </Typography.Title>
                <div className="flex items-center gap-2">
                  <Tag color="blue" style={{ margin: 0 }}>{selectedRole?.code}</Tag>
                  <Badge 
                    status={selectedRole?.isActive ? "success" : "error"} 
                    text={selectedRole?.isActive ? "Active" : "Inactive"} 
                  />
                </div>
              </div>
            </div>
            <Typography.Text type="secondary">
              Configure module permissions for this role
            </Typography.Text>
          </div>
        }
        placement="right"
        onClose={closeDrawer}
        open={drawerOpen}
        closeIcon={<CloseOutlined />}
        width={1000}
        destroyOnClose
        maskClosable={false}
        styles={{
          body: { background: '#fafafa' },
          header: { 
            borderBottom: `1px solid ${PURPLE_THEME.primaryLighter}`,
            background: 'white'
          }
        }}
      >
        {selectedRole && (
          <div className="space-y-6">
            {/* Permission Summary */}
            <Alert
              message="Permission Configuration"
              description={`Click the switches to enable or disable permissions for ${selectedRole.name}. Changes are saved when you click "Save Permissions".`}
              type="info"
              showIcon
              style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}
            />

            {/* Modules */}
            <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
              {modules.map(mod => {
                const modPerms = rolePermMap[selectedRole._id]?.[mod._id] || {};
                const permTypes = [
                  { key: 'canView', label: 'View', color: '#52c41a' },
                  { key: 'canAdd', label: 'Add', color: '#1890ff' },
                  { key: 'canEdit', label: 'Edit', color: '#faad14' },
                  { key: 'canDelete', label: 'Delete', color: '#ff4d4f' },
                  { key: 'canViewAll', label: 'View All', color: '#722ed1' },
                ];

                return (
                  <ProCard
                    key={mod._id}
                    title={
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <SettingOutlined style={{ color: PURPLE_THEME.primary }} />
                          <div>
                            <span className="font-semibold text-gray-800">{mod.name}</span>
                            {mod.description && (
                              <div className="text-sm text-gray-500">{mod.description}</div>
                            )}
                          </div>
                        </div>
                        <Tag color="purple">Module</Tag>
                      </div>
                    }
                    className="hover:shadow-md transition-shadow"
                  >
                    {mod.subModules.length === 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {permTypes.map(({ key, label, color }) => {
                          const p = modPerms['__module__'] || {};
                          const checked = !!p[key];
                          const isAllowed = perm.canEdit;

                          return (
                            <div key={key} className="text-center">
                              <div className="mb-2">
                                <Switch
                                  checked={checked}
                                  onChange={c => updatePerm(mod._id, null, key, c)}
                                  disabled={!isAllowed}
                                  style={{ 
                                    backgroundColor: checked ? color : undefined 
                                  }}
                                  size="small"
                                />
                              </div>
                              <div className="text-sm font-medium" style={{ color }}>
                                {label}
                              </div>
                              <div className="text-xs text-gray-500">
                                {checked ? 'Enabled' : 'Disabled'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {mod.subModules.map(sub => {
                          const p = modPerms[sub._id] || {};
                          return (
                            <div key={sub._id} className="border-l-4 pl-4" 
                                 style={{ borderColor: PURPLE_THEME.primaryLighter }}>
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <div className="font-medium text-gray-700">{sub.name}</div>
                                    {sub.description && (
                                      <div className="text-sm text-gray-500">{sub.description}</div>
                                    )}
                                  </div>
                                  <Tag color="cyan" style={{ margin: 0 }}>Sub-module</Tag>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                  {permTypes.map(({ key, label, color }) => {
                                    const checked = !!p[key];
                                    const isAllowed = perm.canEdit;

                                    return (
                                      <div key={key} className="text-center">
                                        <div className="mb-2">
                                          <Switch
                                            checked={checked}
                                            onChange={c => updatePerm(mod._id, sub._id, key, c)}
                                            disabled={!isAllowed}
                                            style={{ 
                                              backgroundColor: checked ? color : undefined 
                                            }}
                                            size="small"
                                          />
                                        </div>
                                        <div className="text-sm font-medium" style={{ color }}>
                                          {label}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {checked ? 'Enabled' : 'Disabled'}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ProCard>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 flex justify-between items-center sticky bottom-0 bg-white p-4 border-t rounded-b-lg shadow-lg">
          <div className="text-sm text-gray-500">
            <CheckCircleOutlined className="mr-2" style={{ color: PURPLE_THEME.success }} />
            Configure permissions carefully
          </div>
          <Space>
            <Button 
              onClick={closeDrawer} 
              size="large"
              className="hover:border-purple-500 hover:text-purple-500"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={savePermissions}
              loading={saving}
              disabled={!perm.canEdit}
              size="large"
              style={{
                background: PURPLE_THEME.primary,
                borderColor: PURPLE_THEME.primary,
              }}
              className="hover:opacity-90 transition-opacity"
            >
              Save Permissions
            </Button>
          </Space>
        </div>
      </Drawer>
    </div>
  );
};

export default Permission;