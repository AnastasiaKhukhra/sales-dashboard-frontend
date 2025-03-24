import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { fetchSales, Sale } from '../features/salesSlice';

// Format number with commas and fixed decimal places
const formatNumber = (num: number, decimals: number = 2): string => {
  const parts = Number(num).toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

const AnalyticsTab: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isDarkMode } = useTheme();
  const [chartKey, setChartKey] = useState(0);
  const [allProducts, setAllProducts] = useState<Record<string, number>>({});
  const [latestSales, setLatestSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all sales data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const result = await dispatch(fetchSales({ 
          page: 1, 
          limit: 100000,
          sortField: 'date',
          sortDirection: 'desc'
        })).unwrap();
        
        // Handle empty data
        if (!result?.data) {
          setAllProducts({});
          setLatestSales([]);
          return;
        }
        
        // Calculate all products
        const allProductsData = result.data.reduce((acc: Record<string, number>, sale: Sale) => {
          acc[sale.product] = (acc[sale.product] || 0) + Number(sale.amount);
          return acc;
        }, {} as Record<string, number>);
        
        setAllProducts(allProductsData);
        setLatestSales(result.data);
        setChartKey(prev => prev + 1);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setAllProducts({});
        setLatestSales([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllData();
  }, [dispatch]);

  // Calculate total sales and ensure it's a number
  const totalSales = Object.values(allProducts).reduce((sum, amount) => sum + Number(amount), 0);
  const averageSale = Object.keys(allProducts).length > 0 
    ? totalSales / Object.keys(allProducts).length 
    : 0;

  // Get latest 10 sales for the graph
  const chartData = latestSales.slice(0, 10)
    .map(sale => ({
      product: sale.product,
      amount: Number(sale.amount)
    }));

  // Sort allProducts by amount in descending order for the breakdown table
  const sortedAllProducts = Object.entries(allProducts)
    .sort(([, a], [, b]) => b - a);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Sales</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">${formatNumber(totalSales)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Average Sale</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">${formatNumber(averageSale)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{Object.keys(allProducts).length}</p>
        </div>
      </div>

      {chartData.length > 0 ? (
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
                  tickFormatter={(value) => formatNumber(value, 1)}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                    borderRadius: '0.5rem',
                    color: isDarkMode ? '#F3F4F6' : '#111827'
                  }}
                  labelStyle={{ color: isDarkMode ? '#9CA3AF' : '#6B7280' }}
                  formatter={(value: number) => [`$${formatNumber(value, 1)}`, 'Amount']}
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
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6">Latest Sales by Product</h3>
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">No sales data available</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Product Breakdown</h3>
        <div className="overflow-x-auto">
          {sortedAllProducts.length > 0 ? (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${formatNumber(amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {((amount / totalSales) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No product data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab; 