import React, { useState } from 'react';
import BankProductList from './Bankproductlist';
import BankProductForm from './Bankproductform';
import BankProductView from './Bankproductview';

/*
 * pages:
 *   list   — table of all products
 *   create — create single product
 *   bulk   — bulk import
 *   edit   — edit existing product
 *   view   — view single product details
 */

const BankProductManagement = () => {
  const [page, setPage] = useState('list');
  const [selectedId, setSelectedId] = useState(null);
  const [editData, setEditData] = useState(null);

  const goList = () => {
    setPage('list');
    setSelectedId(null);
    setEditData(null);
  };

  const goView = (id) => {
    setSelectedId(id);
    setPage('view');
  };

  const goCreate = (mode) => {
    // mode: 'single' | 'bulk'
    setEditData(null);
    setPage(mode === 'bulk' ? 'bulk' : 'create');
  };

  const goEdit = (record) => {
    setEditData(record);
    setPage('edit');
  };

  if (page === 'view') {
    return (
      <BankProductView
        productId={selectedId}
        onBack={goList}
        onEdit={goEdit}
        onDelete={goList}
      />
    );
  }

  if (page === 'create' || page === 'bulk') {
    return (
      <BankProductForm
        mode={page === 'bulk' ? 'bulk' : 'create'}
        onBack={goList}
        onSuccess={goList}
      />
    );
  }

  if (page === 'edit') {
    return (
      <BankProductForm
        mode="edit"
        editData={editData}
        onBack={goList}
        onSuccess={goList}
      />
    );
  }

  return (
    <BankProductList
      onView={goView}
      onCreate={goCreate}
      onEdit={goEdit}
    />
  );
};

export default BankProductManagement;