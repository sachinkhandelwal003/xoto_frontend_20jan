// src/services/inventory.service.js
import { apiService } from "../manageApi/utils/custom.apiservice";

const inventoryService = {
  // Get inventory by property ID
  getInventoryByProperty: (propertyId, params = {}) => {
    const queryParams = new URLSearchParams({
      propertyId,
      page: params.page || 1,
      limit: params.limit || 100,
      ...(params.status && { status: params.status }),
      ...(params.unitType && { unitType: params.unitType })
    }).toString();
    
    return apiService.get(`/properties/inventory?${queryParams}`);
  },

  // Create new inventory unit
  createInventory: (data) => {
    return apiService.post('/properties/inventory', data);
  },

  // Bulk import inventory
  bulkImportInventory: (data) => {
    return apiService.post('/properties/inventory/bulk', data);
  },

  // Update inventory unit
  updateInventory: (unitId, data) => {
    return apiService.patch(`/properties/inventory/${unitId}`, data);
  },

  // Delete inventory unit
  deleteInventory: (unitId) => {
    return apiService.delete(`/properties/inventory/${unitId}`);
  },

  // Reserve a unit
  reserveUnit: (unitId, data) => {
    return apiService.post(`/properties/inventory/${unitId}/reserve`, data);
  },

  // Book a unit
  bookUnit: (unitId, data) => {
    return apiService.post(`/properties/inventory/${unitId}/book`, data);
  },

  // Release a unit
  releaseUnit: (unitId, data) => {
    return apiService.post(`/properties/inventory/${unitId}/release`, data);
  },

  // Mark as sold
  markAsSold: (unitId, data) => {
    return apiService.post(`/properties/inventory/${unitId}/sold`, data);
  },

  // Get single inventory unit
  getSingleInventory: (unitId) => {
    return apiService.get(`/properties/inventory/${unitId}`);
  }
};

export { inventoryService };