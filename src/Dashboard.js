import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('monthly'); // daily, weekly, monthly

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/metrics?timeRange=${timeRange}`);
        setData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up polling for live updates
    const interval = setInterval(fetchData, 60000); // Poll every minute
    
    return () => clearInterval(interval);
  }, [timeRange]);

  const lineChartData = {
    labels: data?.timeSeriesData?.map(item => item.timestamp) || [],
    datasets: [
      {
        label: 'Metric Value',
        data: data?.timeSeriesData?.map(item => item.value) || [],
        fill: false,
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
        tension: 0.3,
      },
    ],
  };

  const barChartData = {
    labels: data?.categoryData?.map(item => item.category) || [],
    datasets: [
      {
        label: 'Category Distribution',
        data: data?.categoryData?.map(item => item.count) || [],
        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff'],
        borderRadius: 8,
      },
    ],
  };

  const doughnutData = {
    labels: data?.pieData?.map(item => item.label) || [],
    datasets: [
      {
        data: data?.pieData?.map(item => item.value) || [],
        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff'],
        borderWidth: 1,
      },
    ],
  };

  if (loading) return <div className="text-center text-xl font-semibold mt-10">Loading dashboard data...</div>;
  if (error) return <div className="text-red-500 text-center text-xl mt-10">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800">📊 Data Analytics Dashboard</h1>
        <div className="mt-4 flex justify-center space-x-4">
          {['daily', 'weekly', 'monthly'].map((range) => (
            <button
              key={range}
              className={`px-4 py-2 rounded-md font-semibold transition ${
                timeRange === range
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-md rounded-lg p-5 text-center">
          <h3 className="text-lg font-semibold text-gray-700">📄 Total Records</h3>
          <p className="text-2xl font-bold text-blue-500">{data?.summary?.totalRecords || 0}</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-5 text-center">
          <h3 className="text-lg font-semibold text-gray-700">📈 Average Value</h3>
          <p className="text-2xl font-bold text-green-500">
            {data?.summary?.averageValue != null ? data.summary.averageValue : '0.00'}
          </p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-5 text-center">
          <h3 className="text-lg font-semibold text-gray-700">⏳ Last Updated</h3>
          <p className="text-2xl font-bold text-red-500">{data?.summary?.lastUpdated || 'N/A'}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">📅 Time Series Analysis</h2>
          <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">📊 Category Distribution</h2>
          <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 col-span-1 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">📍 Breakdown by Type</h2>
          <div className="flex justify-center">
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
