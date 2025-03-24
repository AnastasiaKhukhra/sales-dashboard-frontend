import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { Sale, createSale, updateSale, fetchSales, setCurrentPage, setItemsPerPage } from '../features/salesSlice';
import { format } from 'date-fns';

type SortField = 'product' | 'amount' | 'date';
type SortDirection = 'asc' | 'desc';

const SortIcon: React.FC<{ isActive: boolean; direction: SortDirection }> = ({ isActive, direction }) => {
  if (!isActive) return null;
  
  return (
    <svg
      className={`h-4 w-4 ml-1 ${direction === 'asc' ? 'transform rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
    </svg>
  );
};

const SalesTableTab: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: sales, loading, error, total, currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.sales
  );
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newSale, setNewSale] = useState<Omit<Sale, 'id'>>({
    product: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
  });

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchSales({ 
      page: 1, 
      limit: itemsPerPage,
      sortField,
      sortDirection
    }));
  }, [dispatch]); // Only run once on mount

  // Subsequent data fetches when dependencies change
  useEffect(() => {
    dispatch(fetchSales({ 
      page: currentPage, 
      limit: itemsPerPage,
      sortField,
      sortDirection
    }));
  }, [dispatch, currentPage, itemsPerPage, sortField, sortDirection]);

  const sortedSales = [...sales].sort((a, b) => {
    if (sortField === 'product') {
      return sortDirection === 'asc'
        ? a.product.localeCompare(b.product)
        : b.product.localeCompare(a.product);
    }
    if (sortField === 'amount') {
      return sortDirection === 'asc'
        ? a.amount - b.amount
        : b.amount - a.amount;
    }
    return sortDirection === 'asc'
      ? new Date(a.date).getTime() - new Date(b.date).getTime()
      : new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const totalPages = Math.ceil(total / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    dispatch(setCurrentPage(1));
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    setNewSale({
      product: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitAdd = async () => {
    try {
      await dispatch(createSale(newSale)).unwrap();
      setIsAddModalOpen(false);
      setNewSale({
        product: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Failed to add sale:', error);
    }
  };

  const handleSubmitEdit = async () => {
    if (!editingSale) return;
    try {
      await dispatch(updateSale(editingSale)).unwrap();
      setIsEditModalOpen(false);
      setEditingSale(null);
    } catch (error) {
      console.error('Failed to update sale:', error);
    }
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const handleItemsPerPageChange = (limit: number) => {
    dispatch(setItemsPerPage(limit));
    dispatch(setCurrentPage(1));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sales Table</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleAdd}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add Sale
          </button>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Items per page:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                onClick={() => handleSort('product')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
              >
                Product
                <SortIcon isActive={sortField === 'product'} direction={sortDirection} />
              </th>
              <th
                onClick={() => handleSort('amount')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
              >
                Amount
                <SortIcon isActive={sortField === 'amount'} direction={sortDirection} />
              </th>
              <th
                onClick={() => handleSort('date')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
              >
                Date
                <SortIcon isActive={sortField === 'date'} direction={sortDirection} />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedSales.map((sale) => (
              <tr key={sale.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {sale.product}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  ${Number(sale.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {format(new Date(sale.date), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleEdit(sale)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} entries
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          {(() => {
            const pages = [];
            const maxVisiblePages = 5;
            const halfMaxVisible = Math.floor(maxVisiblePages / 2);

            if (totalPages <= maxVisiblePages) {
              // Show all pages if total is less than max visible
              for (let i = 1; i <= totalPages; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === i
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {i}
                  </button>
                );
              }
            } else {
              // Always show first page
              pages.push(
                <button
                  key={1}
                  onClick={() => handlePageChange(1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === 1
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  1
                </button>
              );

              // Calculate start and end of visible range
              let startPage = Math.max(2, currentPage - halfMaxVisible);
              let endPage = Math.min(totalPages - 1, currentPage + halfMaxVisible);

              // Adjust if we're near the start
              if (currentPage <= halfMaxVisible) {
                startPage = 2;
                endPage = maxVisiblePages - 1;
              }
              // Adjust if we're near the end
              else if (currentPage > totalPages - halfMaxVisible) {
                startPage = totalPages - maxVisiblePages + 2;
                endPage = totalPages - 1;
              }

              // Add ellipsis after first page if needed
              if (startPage > 2) {
                pages.push(
                  <span key="ellipsis1" className="px-2 text-gray-700 dark:text-gray-300">
                    ...
                  </span>
                );
              }

              // Add visible page numbers
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === i
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {i}
                  </button>
                );
              }

              // Add ellipsis before last page if needed
              if (endPage < totalPages - 1) {
                pages.push(
                  <span key="ellipsis2" className="px-2 text-gray-700 dark:text-gray-300">
                    ...
                  </span>
                );
              }

              // Always show last page
              pages.push(
                <button
                  key={totalPages}
                  onClick={() => handlePageChange(totalPages)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === totalPages
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {totalPages}
                </button>
              );
            }

            return pages;
          })()}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Sale</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product</label>
                <input
                  type="text"
                  value={newSale.product}
                  onChange={(e) => setNewSale({ ...newSale, product: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                <input
                  type="number"
                  value={newSale.amount}
                  onChange={(e) => setNewSale({ ...newSale, amount: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <input
                  type="date"
                  value={newSale.date}
                  onChange={(e) => setNewSale({ ...newSale, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAdd}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editingSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit Sale</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product</label>
                <input
                  type="text"
                  value={editingSale.product}
                  onChange={(e) => setEditingSale({ ...editingSale, product: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                <input
                  type="number"
                  value={editingSale.amount}
                  onChange={(e) => setEditingSale({ ...editingSale, amount: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <input
                  type="date"
                  value={editingSale.date.split('T')[0]}
                  onChange={(e) => setEditingSale({ ...editingSale, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTableTab; 