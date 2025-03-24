import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { fetchSales } from '../features/salesSlice';

const AnalyticsTab: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const sales = useSelector((state: RootState) => state.sales.data);
  const { isDarkMode } = useTheme();
  const [chartKey, setChartKey] = useState(0);
  const [allProducts, setAllProducts] = useState<Record<string, number>>({});

  // Fetch all sales data for total products count
  useEffect(() => {
    const fetchAllData = async () => {
      const result = await dispatch(fetchSales({ 
        page: 1, 
        limit: 100000, // Fetch all records
        sortField: 'date',
        sortDirection: 'desc'
      })).unwrap();
      
      // Calculate all products
      const allProductsData = result.data.reduce((acc: Record<string, number>, sale: { product: string; amount: number }) => {
        acc[sale.product] = (acc[sale.product] || 0) + Number(sale.amount);
        return acc;
      }, {} as Record<string, number>);
      setAllProducts(allProductsData);
    };
    
    fetchAllData();
  }, [dispatch]);

  // Fetch latest 10 sales for the graph and breakdown
  useEffect(() => {
    const fetchLatestData = async () => {
      await dispatch(fetchSales({ 
        page: 1, 
        limit: 10,
        sortField: 'date',
        sortDirection: 'desc'
      }));
      setChartKey(prev => prev + 1);
    };
    
    fetchLatestData();
  }, [dispatch]);

  const totalSales = Object.values(allProducts).reduce((sum, amount) => sum + amount, 0);
  const averageSale = totalSales / Object.keys(allProducts).length;
  const salesByProduct = sales.reduce((acc, sale) => {
    acc[sale.product] = (acc[sale.product] || 0) + Number(sale.amount);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(salesByProduct)
    .map(([product, amount]) => ({
      product,
      amount: Number(amount.toFixed(1))
    }));

  // Sort allProducts by amount in descending order
  const sortedAllProducts = Object.entries(allProducts)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Sales</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">${totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Average Sale</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">${averageSale.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{Object.keys(allProducts).length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6">Latest Sales by Product</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart key={chartKey} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis 
                dataKey="product" 
                stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280' }}
              />
              <YAxis 
                stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '0.5rem',
                  color: isDarkMode ? '#F3F4F6' : '#111827'
                }}
                labelStyle={{ color: isDarkMode ? '#9CA3AF' : '#6B7280' }}
              />
              <Line 
                type="monotone"
                dataKey="amount" 
                stroke={isDarkMode ? '#60A5FA' : '#3B82F6'}
                strokeWidth={2}
                dot={{ r: 4, fill: isDarkMode ? '#60A5FA' : '#3B82F6' }}
                animationDuration={1000}
                animationBegin={0}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Product Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedAllProducts.map(([product, amount]) => (
                <tr key={product}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{product}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {((amount / totalSales) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab; 