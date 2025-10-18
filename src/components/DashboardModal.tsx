import { useState, useMemo, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar, Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { gearService, employeeService } from '../services/supabaseService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
  annotationPlugin
);

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RestPeriod {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  reason: string;
}

interface LeavePeriod {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  leave_type: string;
}

interface Employee {
  id: string;
  name: string;
  employee_number: string;
  psira_number: string;
}

export default function DashboardModal({ isOpen, onClose }: DashboardModalProps) {
  const [dateRange, setDateRange] = useState(30); // Days to show
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [restPeriods, setRestPeriods] = useState<RestPeriod[]>([]);
  const [leavePeriods, setLeavePeriods] = useState<LeavePeriod[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;
      
      try {
        setDataLoading(true);
        const [employeesData, restData, leaveData] = await Promise.all([
          employeeService.getActiveEmployees(),
          gearService.getRestPeriods(),
          gearService.getLeavePeriods()
        ]);
        
        setEmployees(employeesData);
        setRestPeriods(restData);
        setLeavePeriods(leaveData);
      } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        alert(`Failed to load dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}. Check console for details.`);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [isOpen]);

  // Generate daily data for the selected date range using REAL database data
  const chartData = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - dateRange);
    
    // Set end date to December 31st of current year
    const endDate = new Date(today.getFullYear(), 11, 31); // Month 11 = December
    
    const dates: string[] = [];
    const restCounts: number[] = [];
    const leaveCounts: number[] = [];
    const totalAbsentCounts: number[] = [];
    const availableCounts: number[] = [];

    // Generate dates from startDate to December 31st
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dates.push(dateStr);
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Count employees on rest and leave for each date using REAL database data
    dates.forEach(dateStr => {
      const currentDate = new Date(dateStr);
      let restCount = 0;
      let leaveCount = 0;

      // Count employees on rest days using database data
      restPeriods.forEach(restPeriod => {
        const restStart = new Date(restPeriod.start_date);
        const restEnd = new Date(restPeriod.end_date);
        
        if (currentDate >= restStart && currentDate <= restEnd) {
          restCount++;
        }
      });

      // Count employees on annual leave using database data
      leavePeriods.forEach(leavePeriod => {
        const leaveStart = new Date(leavePeriod.start_date);
        const leaveEnd = new Date(leavePeriod.end_date);
        
        if (currentDate >= leaveStart && currentDate <= leaveEnd) {
          leaveCount++;
        }
      });

      // Calculate available employees (total employees minus those on rest or leave)
      const totalEmployees = employees.length;
      const availableCount = totalEmployees - restCount - leaveCount;
      
      restCounts.push(restCount);
      leaveCounts.push(leaveCount);
      totalAbsentCounts.push(restCount + leaveCount);
      availableCounts.push(availableCount);
    });

    // Debug logging
    console.log('📊 Dashboard Chart Data Debug:', {
      totalEmployees: employees.length,
      totalDates: dates.length,
      sampleAvailableCounts: availableCounts.slice(0, 5),
      sampleRestCounts: restCounts.slice(0, 5),
      sampleLeaveCounts: leaveCounts.slice(0, 5)
    });

    return {
      labels: dates.map(date => new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })),
      datasets: [
        {
          label: 'On Rest',
          data: restCounts,
          backgroundColor: 'rgba(255, 193, 7, 1)',
          borderColor: 'rgba(255, 193, 7, 1)',
          borderWidth: 0,
        },
        {
          label: 'On Leave',
          data: leaveCounts,
          backgroundColor: 'rgba(220, 53, 69, 1)',
          borderColor: 'rgba(220, 53, 69, 1)',
          borderWidth: 0,
        },
        {
          label: 'Total Absent',
          data: totalAbsentCounts,
          backgroundColor: 'rgba(108, 117, 125, 1)',
          borderColor: 'rgba(108, 117, 125, 1)',
          borderWidth: 0,
        },
        {
          label: 'Available',
          data: availableCounts,
          backgroundColor: 'rgba(40, 167, 69, 1)',
          borderColor: 'rgba(40, 167, 69, 1)',
          borderWidth: 0,
        }
      ]
    };
  }, [dateRange, employees, restPeriods, leavePeriods]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      datalabels: {
        display: function(context: any) {
          // Show data labels only on every 5th bar
          return context.dataIndex % 5 === 0;
        },
        color: 'black',
        font: {
          weight: 'bold' as const,
          size: 10,
        },
        anchor: 'end',
        align: 'top',
        offset: 5,
        formatter: function(value: number) {
          return value > 0 ? value : '';
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: false,
        }
      },
      y: {
        display: true,
        title: {
          display: false,
        },
        min: 0,
        max: 30
      }
    },
    elements: {
      bar: {
        borderWidth: 0,
        borderSkipped: false,
      }
    }
  };

  // Calculate summary statistics using REAL database data
  const summaryStats = useMemo(() => {
    const today = new Date();
    let currentlyOnRest = 0;
    let currentlyOnLeave = 0;

    // Count employees currently on rest
    restPeriods.forEach(restPeriod => {
      const restStart = new Date(restPeriod.start_date);
      const restEnd = new Date(restPeriod.end_date);
      
      if (today >= restStart && today <= restEnd) {
        currentlyOnRest++;
      }
    });

    // Count employees currently on leave
    leavePeriods.forEach(leavePeriod => {
      const leaveStart = new Date(leavePeriod.start_date);
      const leaveEnd = new Date(leavePeriod.end_date);
      
      if (today >= leaveStart && today <= leaveEnd) {
        currentlyOnLeave++;
      }
    });

    return {
      currentlyOnRest,
      currentlyOnLeave,
      totalAbsentees: currentlyOnRest + currentlyOnLeave
    };
  }, [restPeriods, leavePeriods]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Loading indicator */}
            {dataLoading && (
              <div className="text-center py-4">
                <div className="text-blue-600">Loading data from database...</div>
              </div>
            )}

            {/* Summary Statistics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {summaryStats.currentlyOnRest}
                </div>
                <div className="text-sm text-yellow-800">Currently on Rest</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {summaryStats.currentlyOnLeave}
                </div>
                <div className="text-sm text-red-800">Currently on Leave</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {summaryStats.totalAbsentees}
                </div>
                <div className="text-sm text-gray-800">Total</div>
              </div>
            </div>

            {/* Controls */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range (Days to Show)
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={7}>Last 7 Days</option>
                <option value={14}>Last 14 Days</option>
                <option value={30}>Last 30 Days</option>
                <option value={60}>Last 60 Days</option>
                <option value={90}>Last 90 Days</option>
              </select>
            </div>

            {/* Charts */}
            <div className="space-y-8">
              {/* Rest Days Chart */}
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-4">Employees on Rest Days</h3>
                <div className="h-64">
                  <Bar 
                    data={{
                      labels: chartData.labels,
                      datasets: [chartData.datasets[0]]
                    }} 
                    options={{
                      ...options,
                      plugins: {
                        title: {
                          display: false,
                        },
                        legend: {
                          display: true,
                        },
                        datalabels: {
                          display: function(context: any) {
                            // Show data labels only on every 5th bar
                            return context.dataIndex % 5 === 0;
                          },
                          color: 'black',
                          font: {
                            weight: 'bold' as const,
                            size: 10,
                          },
                          anchor: 'end',
                          align: 'top',
                          offset: 5,
                          formatter: function(value: number) {
                            return value > 0 ? value : '';
                          }
                        } as any
                      } as any
                    }} 
                  />
                </div>
              </div>

              {/* Leave Days Chart */}
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-4">Employees on Leave</h3>
                <div className="h-64">
                  <Bar 
                    data={{
                      labels: chartData.labels,
                      datasets: [chartData.datasets[1]]
                    }} 
                    options={{
                      ...options,
                      plugins: {
                        title: {
                          display: false,
                        },
                        legend: {
                          display: true,
                        },
                        datalabels: {
                          display: function(context: any) {
                            // Show data labels only on every 5th bar
                            return context.dataIndex % 5 === 0;
                          },
                          color: 'black',
                          font: {
                            weight: 'bold' as const,
                            size: 10,
                          },
                          anchor: 'end',
                          align: 'top',
                          offset: 5,
                          formatter: function(value: number) {
                            return value > 0 ? value : '';
                          }
                        } as any
                      } as any
                    }} 
                  />
                </div>
              </div>

              {/* Total Absentees Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Absentees (Rest + Leave)</h3>
                <div className="h-64">
                  <Bar 
                    data={{
                      labels: chartData.labels,
                      datasets: [chartData.datasets[2]]
                    }} 
                    options={{
                      ...options,
                      plugins: {
                        title: {
                          display: false,
                        },
                        legend: {
                          display: true,
                        },
                        datalabels: {
                          display: function(context: any) {
                            // Show data labels only on every 5th bar
                            return context.dataIndex % 5 === 0;
                          },
                          color: 'black',
                          font: {
                            weight: 'bold' as const,
                            size: 10,
                          },
                          anchor: 'end',
                          align: 'top',
                          offset: 5,
                          formatter: function(value: number) {
                            return value > 0 ? value : '';
                          }
                        } as any
                      } as any
                    }} 
                  />
                </div>
              </div>
              
              {/* Availability Line Chart */}
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-4">Available Guards Over Time</h3>
                <div className="h-64">
                  <Line 
                    data={{
                      labels: chartData.labels,
                      datasets: [
                        {
                          label: 'Available Guards',
                          data: chartData.datasets[3]?.data || [],
                          borderColor: 'rgba(40, 167, 69, 1)',
                          backgroundColor: 'rgba(40, 167, 69, 0.1)',
                          borderWidth: 3,
                          fill: true,
                          tension: 0.4,
                          pointBackgroundColor: 'rgba(40, 167, 69, 1)',
                          pointBorderColor: '#fff',
                          pointBorderWidth: 2,
                          pointRadius: 0,
                          pointHoverRadius: 0,
                        }
                      ]
                    }} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        title: {
                          display: false,
                        },
                        legend: {
                          display: false
                        },
                        datalabels: {
                          display: function(context: any) {
                            // Show label for every 10th data point
                            return context.dataIndex % 10 === 0;
                          },
                          anchor: 'end',
                          align: 'top',
                          offset: 5,
                          color: 'rgba(40, 167, 69, 1)',
                          font: {
                            weight: 'bold',
                            size: 12
                          },
                          formatter: function(value: any) {
                            return value;
                          }
                        },
                        annotation: {
                          annotations: {
                            todayLine: {
                              type: 'line',
                              xMin: new Date().toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              }),
                              xMax: new Date().toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              }),
                              borderColor: 'rgba(59, 130, 246, 0.8)',
                              borderWidth: 2,
                              borderDash: [5, 5],
                              label: {
                                content: 'Today',
                                display: true,
                                position: 'top'
                              }
                            } as any
                          } as any
                        } as any,
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 80,
                          ticks: {
                            stepSize: 10
                          }
                        },
                        x: {
                          ticks: {
                            maxTicksLimit: 15,
                            display: true
                          }
                        }
                      },
                      elements: {
                        point: {
                          hoverBackgroundColor: 'rgba(40, 167, 69, 1)'
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-3 flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}