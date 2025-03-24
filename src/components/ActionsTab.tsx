import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { Sale, bulkCreateSales, fetchSales } from '../features/salesSlice';

const ActionsTab: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [parsedData, setParsedData] = useState<Array<Omit<Sale, 'id'>> | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setParsedData(null);
      return;
    }

    try {
      setUploadStatus('Reading file...');
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text.split('\n');
        
        const salesData = rows.slice(1)
          .filter(row => row.trim())
          .map(row => {
            const [product, amount, date] = row.split(',');
            if (!product || !amount || !date) {
              throw new Error('Invalid CSV format: missing required fields');
            }
            return {
              product: product.trim(),
              amount: parseFloat(amount.trim()),
              date: date.trim()
            } as Omit<Sale, 'id'>;
          });

        setParsedData(salesData);
        setUploadStatus('File ready to upload');
      };

      reader.onerror = () => {
        setUploadStatus('Error reading file');
        setParsedData(null);
      };

      reader.readAsText(file);
    } catch (error) {
      setUploadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      setParsedData(null);
    }
  };

  const handleSubmitUpload = async () => {
    if (!parsedData) return;

    try {
      setUploadStatus('Uploading data...');
      const result = await dispatch(bulkCreateSales(parsedData)).unwrap();
      setUploadStatus(`Successfully uploaded ${result.length} records!`);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setParsedData(null);
    } catch (error) {
      setUploadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      // Fetch all data first
      const result = await dispatch(fetchSales({ 
        page: 1, 
        limit: 100000, // Fetch all records
        sortField: 'date',
        sortDirection: 'desc'
      })).unwrap();

      const headers = ['Product', 'Amount', 'Date'];
      const csvContent = [
        headers.join(','),
        ...result.data.map((sale: Sale) => [
          sale.product,
          sale.amount,
          sale.date
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'sales_data.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Upload Sales Data</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              CSV file with columns: Product, Amount, Date
            </p>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <div className="flex flex-col items-center justify-center space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex items-center space-x-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span>Choose CSV File</span>
              </button>
              <button
                onClick={handleSubmitUpload}
                disabled={!parsedData}
                className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                  parsedData 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Submit Upload</span>
              </button>
            </div>
            
            {fileInputRef.current?.files?.[0] && (
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium">
                  {fileInputRef.current.files[0].name}
                </span>
              </div>
            )}
          </div>
        </div>

        {uploadStatus && (
          <div className={`mt-4 p-4 rounded-lg flex items-center space-x-3 ${
            uploadStatus.startsWith('Error') 
              ? 'bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-400' 
              : uploadStatus.startsWith('Successfully') 
                ? 'bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                : 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
          }`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {uploadStatus.startsWith('Error') ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : uploadStatus.startsWith('Successfully') ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              )}
            </svg>
            <div>
              <p className="font-medium">{uploadStatus}</p>
              {parsedData && (
                <p className="text-sm opacity-75 mt-1">
                  {parsedData.length} records ready to upload
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Download Sales Data</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Export all your sales data as a CSV file
            </p>
          </div>
        </div>
        
        <button
          onClick={handleDownloadCSV}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Download CSV</span>
        </button>
      </div>
    </div>
  );
};

export default ActionsTab; 