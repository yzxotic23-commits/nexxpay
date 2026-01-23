'use client'

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useFilterStore } from '@/lib/stores/filterStore'
import { useDashboardStore } from '@/lib/stores/dashboardStore'
import { getWealthAccountProductionData, getWealthAccountStatusData } from '@/lib/utils/mockData'
import { formatNumber, formatPercentage } from '@/lib/utils/formatters'
import KPICard from '@/components/KPICard'
import ChartContainer from '@/components/ChartContainer'
import FilterBar from '@/components/FilterBar'
import ThemeToggle from '@/components/ThemeToggle'
import { useSession, signOut } from 'next-auth/react'
import { useToast } from '@/lib/toast-context'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Users, TrendingUp, Search, Bell, HelpCircle, Settings, User, ChevronDown, Power, Filter, Plus, Trash2, Save, X, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 dark:bg-gray-900 rounded-lg p-3 shadow-lg border border-gray-700">
        <p className="text-white text-sm mb-1">{label}</p>
        <p className="text-gold-500 font-bold text-base">
          {payload[0].value} accounts
        </p>
      </div>
    )
  }
  return null
}

export default function WealthAccountPage() {
  const { data: session } = useSession()
  const { selectedMonth } = useFilterStore()
  const { wealthAccountData, setWealthAccountData } = useDashboardStore()
  const { showToast } = useToast()
  const [selectedMarket, setSelectedMarket] = useState('SGD')
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const userDropdownRef = useRef(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [rowToDelete, setRowToDelete] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [rowToView, setRowToView] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  const tabs = ['SGD', 'MYR', 'USC']

  // State for bank rent table data
  const [bankRentData, setBankRentData] = useState([
    {
      id: 1,
      supplier: 'WEALTH+',
      bankAccountName: 'ANJANA DEVI D/O VIJAYAN (LIQUIDPAY)',
      status: 'ACTIVE',
      department: 'WEALTH+',
      sellOff: 'OFF',
      startDate: '1-Jan',
      currency: 'SGD',
      rentalCommission: '200.00',
      commission: '150.00',
      markup: '450.00',
      sales: '800.00',
      addition: '',
      remark: '',
      paymentTotal: '350.00'
    },
    {
      id: 2,
      supplier: 'WEALTH+',
      bankAccountName: 'TRISTAN LOW (MARI)',
      status: 'ACTIVE',
      department: 'NP_INT_SGD',
      sellOff: '',
      startDate: '1-Jan',
      currency: 'SGD',
      rentalCommission: '200.00',
      commission: '150.00',
      markup: '',
      sales: '350.00',
      addition: '',
      remark: '',
      paymentTotal: '350.00'
    },
    {
      id: 3,
      supplier: 'WEALTH+',
      bankAccountName: 'DAYANG NADIRA BINTE ISMAIL (DBS)',
      status: 'ACTIVE',
      department: 'NP_INT_SGD',
      sellOff: '',
      startDate: '1-Jan',
      currency: 'SGD',
      rentalCommission: '500.00',
      commission: '200.00',
      markup: '',
      sales: '700.00',
      addition: '',
      remark: '',
      paymentTotal: '700.00'
    },
    {
      id: 4,
      supplier: 'WEALTH+',
      bankAccountName: 'MOHAMAD FAZLI BIN MOHAMAD (OCBC)',
      status: 'ACTIVE',
      department: 'NP_INT_SGD',
      sellOff: '',
      startDate: '1-Jan',
      currency: 'SGD',
      rentalCommission: '200.00',
      commission: '150.00',
      markup: '',
      sales: '350.00',
      addition: '',
      remark: '',
      paymentTotal: '350.00'
    },
    {
      id: 5,
      supplier: 'WEALTH+',
      bankAccountName: 'NURUL AIN BINTE MOHAMAD (UOB)',
      status: 'ACTIVE',
      department: 'NP_INT_SGD',
      sellOff: '',
      startDate: '1-Jan',
      currency: 'SGD',
      rentalCommission: '500.00',
      commission: '200.00',
      markup: '',
      sales: '700.00',
      addition: '',
      remark: '',
      paymentTotal: '700.00'
    },
    {
      id: 6,
      supplier: 'WEALTH+',
      bankAccountName: 'AHMAD ZAKI BIN ABDULLAH (DBS)',
      status: 'ACTIVE',
      department: 'NP_INT_SGD',
      sellOff: '',
      startDate: '1-Jan',
      currency: 'SGD',
      rentalCommission: '200.00',
      commission: '150.00',
      markup: '',
      sales: '350.00',
      addition: '',
      remark: '',
      paymentTotal: '350.00'
    },
    {
      id: 7,
      supplier: 'WEALTH+',
      bankAccountName: 'SITI NURHALIZA BINTE MOHAMAD (OCBC)',
      status: 'ACTIVE',
      department: 'NP_INT_SGD',
      sellOff: '',
      startDate: '1-Jan',
      currency: 'SGD',
      rentalCommission: '500.00',
      commission: '200.00',
      markup: '',
      sales: '700.00',
      addition: '',
      remark: '',
      paymentTotal: '700.00'
    },
    {
      id: 8,
      supplier: 'WEALTH+',
      bankAccountName: 'MOHAMAD HAFIZ BIN ISMAIL (UOB)',
      status: 'ACTIVE',
      department: 'NP_INT_SGD',
      sellOff: '',
      startDate: '1-Jan',
      currency: 'SGD',
      rentalCommission: '200.00',
      commission: '150.00',
      markup: '',
      sales: '350.00',
      addition: '',
      remark: '',
      paymentTotal: '350.00'
    },
    {
      id: 9,
      supplier: 'WEALTH+',
      bankAccountName: 'NURUL SYAFIQAH BINTE ABDULLAH (DBS)',
      status: 'ACTIVE',
      department: 'NP_INT_SGD',
      sellOff: '',
      startDate: '1-Jan',
      currency: 'SGD',
      rentalCommission: '900.00',
      commission: '300.00',
      markup: '',
      sales: '1,200.00',
      addition: '',
      remark: '',
      paymentTotal: '1,200.00'
    },
    {
      id: 10,
      supplier: 'WEALTH+',
      bankAccountName: 'MOHAMAD FAISAL BIN MOHAMAD (OCBC)',
      status: 'ACTIVE',
      department: 'NP_INT_SGD',
      sellOff: '',
      startDate: '1-Jan',
      currency: 'SGD',
      rentalCommission: '500.00',
      commission: '200.00',
      markup: '',
      sales: '700.00',
      addition: '',
      remark: '',
      paymentTotal: '700.00'
    },
    {
      id: 11,
      supplier: 'WEALTH+',
      bankAccountName: 'NURUL AISYAH BINTE ISMAIL (UOB)',
      status: 'ACTIVE',
      department: 'NP_INT_SGD',
      sellOff: '',
      startDate: '1-Jan',
      currency: 'SGD',
      rentalCommission: '200.00',
      commission: '150.00',
      markup: '',
      sales: '350.00',
      addition: '',
      remark: '',
      paymentTotal: '350.00'
    },
    {
      id: 12,
      supplier: 'WEALTH+',
      bankAccountName: 'MOHAMAD HAZIQ BIN ABDULLAH (DBS)',
      status: 'ACTIVE',
      department: 'NP_INT_SGD',
      sellOff: '',
      startDate: '1-Jan',
      currency: 'SGD',
      rentalCommission: '500.00',
      commission: '200.00',
      markup: '',
      sales: '700.00',
      addition: '',
      remark: '',
      paymentTotal: '700.00'
    }
  ])

  // Function to calculate payment total
  const calculatePaymentTotal = (rentalCommission, commission) => {
    // Remove commas and parse as float
    const rental = parseFloat(String(rentalCommission).replace(/,/g, '')) || 0
    const comm = parseFloat(String(commission).replace(/,/g, '')) || 0
    const total = rental + comm
    // Format with commas for thousands
    return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Function to add new row
  const addNewRow = () => {
    const newRow = {
      id: Date.now(),
      supplier: 'WEALTH+',
      bankAccountName: '',
      status: 'ACTIVE',
      department: 'NP_INT_SGD',
      sellOff: '',
      startDate: '1-Jan',
      currency: 'SGD',
      rentalCommission: '0.00',
      commission: '0.00',
      markup: '',
      sales: '0.00',
      addition: '',
      remark: '',
      paymentTotal: '0.00'
    }
    setBankRentData([...bankRentData, newRow])
    showToast('New row added', 'success')
  }

  // Function to open delete confirmation modal
  const openDeleteModal = (id) => {
    const row = bankRentData.find(r => r.id === id)
    setRowToDelete(row)
    setIsDeleteModalOpen(true)
  }

  // Function to open detail modal
  const openDetailModal = (row) => {
    setRowToView(row)
    setIsDetailModalOpen(true)
  }

  // Reset to page 1 if current page exceeds total pages after data changes
  useEffect(() => {
    const totalPages = Math.ceil(bankRentData.length / itemsPerPage)
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [bankRentData.length, currentPage, itemsPerPage])

  // Function to delete row after confirmation
  const confirmDelete = () => {
    if (rowToDelete) {
      setBankRentData(bankRentData.filter(row => row.id !== rowToDelete.id))
      showToast('Row deleted successfully', 'success')
      setIsDeleteModalOpen(false)
      setRowToDelete(null)
    }
  }

  // Function to save row to database
  const saveRow = async (row) => {
    try {
      // TODO: Implement API call to save to database
      // const response = await fetch('/api/bank-rent', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(row)
      // })
      // if (!response.ok) throw new Error('Failed to save')
      
      // For now, just show success message
      showToast('Row saved successfully', 'success')
      console.log('Saving row to database:', row)
    } catch (error) {
      showToast('Failed to save row', 'error')
      console.error('Error saving row:', error)
    }
  }

  // Function to update cell value
  const updateCell = (id, field, value) => {
    setBankRentData(bankRentData.map(row => {
      if (row.id === id) {
        const updated = { ...row, [field]: value }
        // Auto calculate payment total when rental commission or commission changes
        if (field === 'rentalCommission' || field === 'commission') {
          updated.paymentTotal = calculatePaymentTotal(
            field === 'rentalCommission' ? value : updated.rentalCommission,
            field === 'commission' ? value : updated.commission
          )
        }
        return updated
      }
      return row
    }))
  }

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false)
      }
    }
    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserDropdownOpen])

  useEffect(() => {
    // Load both production and status data
    const productionData = getWealthAccountProductionData(selectedMonth)
    const statusData = getWealthAccountStatusData(selectedMonth)
    setWealthAccountData({ production: productionData, status: statusData })
  }, [selectedMonth, setWealthAccountData])

  if (!wealthAccountData || !wealthAccountData.production || !wealthAccountData.status) {
    return <div>Loading...</div>
  }

  const { production, status } = wealthAccountData

  // Prepare chart data
  const productionChartData = production?.dailyData?.map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    accounts: day.accounts,
  })) || []

  return (
    <div className="space-y-6">
      {/* Tabs and Filter Bar - Tabs and Filter Bar center */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-4 mt-4">
          {/* Tabs - Center */}
          <nav className="inline-flex bg-white dark:bg-dark-card p-1 rounded-full" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedMarket(tab)}
                className={`px-6 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                  selectedMarket === tab
                    ? 'bg-gold-500 text-gray-900 dark:text-gray-900 shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* Separator */}
          <div className="text-gray-400 dark:text-gray-600">|</div>

          {/* Filter Bar - Center */}
          <FilterBar />
        </div>
      </div>

      {/* Production Section */}
      <div className="flex items-center justify-between mb-6">
        {/* Spacer untuk balance */}
        <div className="flex-1"></div>
        
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account Production</h2>
        
        {/* Spacer untuk balance */}
        <div className="flex-1"></div>
      </div>

      {/* Production Content */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <KPICard
            title="Total Accounts Created"
            value={formatNumber(production.totalAccounts)}
            change={production.growthRate}
            icon={Users}
            trend="up"
          />
          <KPICard
            title="Previous Month"
            value={formatNumber(production.previousMonthAccounts)}
            change={0}
            icon={Users}
            trend="up"
          />
          <KPICard
            title="Growth Rate"
            value={formatPercentage(production.growthRate)}
            change={production.growthRate}
            icon={TrendingUp}
            trend="up"
          />
        </div>

        <ChartContainer
          title="Daily Account Creation"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={productionChartData}>
              <defs>
                <linearGradient id="colorAccounts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DEC05F" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#DEC05F" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeWidth={1} opacity={0.2} vertical={false} />
              <XAxis dataKey="date" stroke="#6b7280" angle={-45} textAnchor="end" height={60} axisLine={{ strokeWidth: 0.5 }} tickLine={false} />
              <YAxis 
                stroke="#6b7280" 
                axisLine={{ strokeWidth: 0.5 }}
                tickLine={false}
                tickFormatter={(value) => {
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                  return value.toString()
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#DEC05F', strokeWidth: 1, strokeDasharray: '5 5' }} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '10px', paddingRight: '0px', marginTop: '-48px' }} />
              <Area
                type="monotone"
                dataKey="accounts"
                stroke="#DEC05F"
                strokeWidth={2.5}
                fill="url(#colorAccounts)"
                name="New Accounts"
                activeDot={{ r: 5, fill: '#000000', stroke: '#DEC05F', strokeWidth: 2 }}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Status Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          {/* Spacer untuk balance */}
          <div className="flex-1"></div>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account Status & Output</h2>
          
          {/* Spacer untuk balance */}
          <div className="flex-1"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <KPICard
            title="Total Accounts"
            value={formatNumber(status?.totalAccounts || 0)}
            change={0}
            icon={Users}
            trend="up"
          />
          <KPICard
            title="Active Accounts"
            value={formatNumber(status?.activeAccounts || 0)}
            change={2.5}
            icon={Users}
            trend="up"
          />
          <KPICard
            title="Output Volume"
            value={formatNumber(status?.outputVolume || 0)}
            change={5.2}
            icon={TrendingUp}
            trend="up"
          />
          <KPICard
            title="Utilization Ratio"
            value={`${(status?.utilizationRatio || 0).toFixed(1)}%`}
            change={1.8}
            icon={TrendingUp}
            trend="up"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-dark-card rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Total Accounts</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatNumber(status?.totalAccounts || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Active Accounts</span>
                <span className="text-lg font-bold text-green-500">
                  {formatNumber(status?.activeAccounts || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Inactive Accounts</span>
                <span className="text-lg font-bold text-gray-500">
                  {formatNumber((status?.totalAccounts || 0) - (status?.activeAccounts || 0))}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Output Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Output Volume</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatNumber(status?.outputVolume || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Utilization Ratio</span>
                <span className="text-lg font-bold text-gold-500">
                  {(status?.utilizationRatio || 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Avg per Account</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatNumber((status?.outputVolume || 0) / (status?.activeAccounts || 1))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section - Only show for SGD tab */}
      {selectedMarket === 'SGD' && (
        <div className="mt-8">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg border border-gray-200 dark:border-gray-900 overflow-hidden">
            {/* Table Header with Title and Add Button */}
            <div className="flex items-center justify-between px-6 py-5 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-900">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bank Price</h2>
              <button
                onClick={addNewRow}
                className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-gray-900 rounded-xl transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                Add Row
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900">
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-white dark:border-white">
                      <div className="flex items-center justify-between">
                        <span>SUPPLIER</span>
                          <Filter className="w-3.5 h-3.5 cursor-pointer hover:text-gray-200 transition-colors text-white" />
                      </div>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-white dark:border-white">
                      <div className="flex items-center justify-between">
                        <span>BANK ACCOUNT NAME</span>
                          <Filter className="w-3.5 h-3.5 cursor-pointer hover:text-gray-200 transition-colors text-white" />
                      </div>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-white dark:border-white">
                      <div className="flex items-center justify-between">
                        <span>STATUS</span>
                          <Filter className="w-3.5 h-3.5 cursor-pointer hover:text-gray-200 transition-colors text-white" />
                      </div>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-white dark:border-white">
                      <div className="flex items-center justify-between">
                        <span>DEPARTMENT</span>
                          <Filter className="w-3.5 h-3.5 cursor-pointer hover:text-gray-200 transition-colors text-white" />
                      </div>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-white dark:border-white">
                      <div className="flex items-center justify-between">
                        <span>SELL-OFF</span>
                          <Filter className="w-3.5 h-3.5 cursor-pointer hover:text-gray-200 transition-colors text-white" />
                      </div>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-white dark:border-white">
                      <div className="flex items-center justify-between">
                        <span>START DATE</span>
                          <Filter className="w-3.5 h-3.5 cursor-pointer hover:text-gray-200 transition-colors text-white" />
                      </div>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-white dark:border-white">
                      <div className="flex items-center justify-between">
                        <span>CURRENCY</span>
                          <Filter className="w-3.5 h-3.5 cursor-pointer hover:text-gray-200 transition-colors text-white" />
                      </div>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-white dark:border-white">
                      <div className="flex items-center justify-between">
                        <span>RENTAL COMMISSION</span>
                          <Filter className="w-3.5 h-3.5 cursor-pointer hover:text-gray-200 transition-colors text-white" />
                      </div>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-white dark:border-white">
                      <div className="flex items-center justify-between">
                        <span>COMMISSION</span>
                          <Filter className="w-3.5 h-3.5 cursor-pointer hover:text-gray-200 transition-colors text-white" />
                      </div>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-white dark:border-white">
                      <div className="flex items-center justify-between">
                        <span>MARKUP</span>
                          <Filter className="w-3.5 h-3.5 cursor-pointer hover:text-gray-200 transition-colors text-white" />
                      </div>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-white dark:border-white">
                      <div className="flex items-center justify-between">
                        <span>SALES</span>
                          <Filter className="w-3.5 h-3.5 cursor-pointer hover:text-gray-200 transition-colors text-white" />
                      </div>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-white dark:border-white">
                      <div className="flex items-center justify-between">
                        <span>ADDITION</span>
                          <Filter className="w-3.5 h-3.5 cursor-pointer hover:text-gray-200 transition-colors text-white" />
                      </div>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-white dark:border-white">
                      <div className="flex items-center justify-between">
                        <span>REMARK</span>
                          <Filter className="w-3.5 h-3.5 cursor-pointer hover:text-gray-200 transition-colors text-white" />
                      </div>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-white dark:border-white">
                      <div className="flex items-center justify-between">
                        <span>PAYMENT TOTAL</span>
                          <Filter className="w-3.5 h-3.5 cursor-pointer hover:text-gray-200 transition-colors text-white" />
                      </div>
                    </th>
                    <th className="px-4 py-3.5 text-center text-xs font-bold text-white uppercase tracking-wider" style={{ minWidth: '120px' }}>
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-card">
                  {(() => {
                    // Calculate pagination
                    const totalPages = Math.ceil(bankRentData.length / itemsPerPage)
                    const startIndex = (currentPage - 1) * itemsPerPage
                    const endIndex = startIndex + itemsPerPage
                    const paginatedData = bankRentData.slice(startIndex, endIndex)
                    
                    return paginatedData.map((row, index) => (
                    <tr 
                      key={row.id} 
                      className={`group transition-colors duration-150 ${
                        index % 2 === 0 
                          ? 'bg-white dark:bg-dark-card' 
                          : 'bg-gray-50/50 dark:bg-gray-900/50'
                      } hover:bg-gray-100 dark:hover:bg-gray-800/50`}
                    >
                      <td className="px-4 py-3 border border-gray-200 dark:border-gray-800">
                        <input
                          type="text"
                          value={row.supplier}
                          onChange={(e) => updateCell(row.id, 'supplier', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm text-gray-900 dark:text-white bg-transparent border border-transparent focus:outline-none focus:border-2 focus:border-gold-500 focus:bg-gray-50 dark:focus:bg-gray-800 rounded transition-all"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-200 dark:border-gray-800">
                        <input
                          type="text"
                          value={row.bankAccountName}
                          onChange={(e) => updateCell(row.id, 'bankAccountName', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm text-gray-900 dark:text-white bg-transparent border border-transparent focus:outline-none focus:border-2 focus:border-gold-500 focus:bg-gray-50 dark:focus:bg-gray-800 rounded transition-all"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-200 dark:border-gray-800">
                        <input
                          type="text"
                          value={row.status}
                          onChange={(e) => updateCell(row.id, 'status', e.target.value)}
                          className={`w-full px-2 py-1.5 text-sm font-medium rounded transition-all focus:outline-none focus:border-2 focus:border-gold-500 ${
                            row.status === 'ACTIVE' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : row.status === 'SUSPEND'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              : row.status === 'INACTIVE'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              : 'bg-transparent text-gray-900 dark:text-white focus:bg-gray-50 dark:focus:bg-gray-800'
                          }`}
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-200 dark:border-gray-800">
                        <input
                          type="text"
                          value={row.department}
                          onChange={(e) => updateCell(row.id, 'department', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm text-gray-900 dark:text-white bg-transparent border border-transparent focus:outline-none focus:border-2 focus:border-gold-500 focus:bg-gray-50 dark:focus:bg-gray-800 rounded transition-all"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-200 dark:border-gray-800">
                        <input
                          type="text"
                          value={row.sellOff}
                          onChange={(e) => updateCell(row.id, 'sellOff', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm text-gray-900 dark:text-white bg-transparent border border-transparent focus:outline-none focus:border-2 focus:border-gold-500 focus:bg-gray-50 dark:focus:bg-gray-800 rounded transition-all"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-200 dark:border-gray-800">
                        <input
                          type="text"
                          value={row.startDate}
                          onChange={(e) => updateCell(row.id, 'startDate', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm text-gray-900 dark:text-white bg-transparent border border-transparent focus:outline-none focus:border-2 focus:border-gold-500 focus:bg-gray-50 dark:focus:bg-gray-800 rounded transition-all"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-200 dark:border-gray-800">
                        <input
                          type="text"
                          value={row.currency}
                          onChange={(e) => updateCell(row.id, 'currency', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm text-gray-900 dark:text-white bg-transparent border border-transparent focus:outline-none focus:border-2 focus:border-gold-500 focus:bg-gray-50 dark:focus:bg-gray-800 rounded transition-all"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-200 dark:border-gray-800">
                        <input
                          type="text"
                          value={row.rentalCommission}
                          onChange={(e) => updateCell(row.id, 'rentalCommission', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm text-gray-900 dark:text-white bg-transparent border border-transparent focus:outline-none focus:border-2 focus:border-gold-500 focus:bg-gray-50 dark:focus:bg-gray-800 rounded transition-all text-right"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-200 dark:border-gray-800">
                        <input
                          type="text"
                          value={row.commission}
                          onChange={(e) => updateCell(row.id, 'commission', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm text-gray-900 dark:text-white bg-transparent border border-transparent focus:outline-none focus:border-2 focus:border-gold-500 focus:bg-gray-50 dark:focus:bg-gray-800 rounded transition-all text-right"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-200 dark:border-gray-800">
                        <input
                          type="text"
                          value={row.markup}
                          onChange={(e) => updateCell(row.id, 'markup', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm text-gray-900 dark:text-white bg-transparent border border-transparent focus:outline-none focus:border-2 focus:border-gold-500 focus:bg-gray-50 dark:focus:bg-gray-800 rounded transition-all text-right"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-200 dark:border-gray-800">
                        <input
                          type="text"
                          value={row.sales}
                          onChange={(e) => updateCell(row.id, 'sales', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm text-gray-900 dark:text-white bg-transparent border border-transparent focus:outline-none focus:border-2 focus:border-gold-500 focus:bg-gray-50 dark:focus:bg-gray-800 rounded transition-all text-right"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-200 dark:border-gray-800">
                        <input
                          type="text"
                          value={row.addition}
                          onChange={(e) => updateCell(row.id, 'addition', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm text-gray-900 dark:text-white bg-transparent border border-transparent focus:outline-none focus:border-2 focus:border-gold-500 focus:bg-gray-50 dark:focus:bg-gray-800 rounded transition-all text-right"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-200 dark:border-gray-800">
                        <input
                          type="text"
                          value={row.remark}
                          onChange={(e) => updateCell(row.id, 'remark', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm text-gray-900 dark:text-white bg-transparent border border-transparent focus:outline-none focus:border-2 focus:border-gold-500 focus:bg-gray-50 dark:focus:bg-gray-800 rounded transition-all"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
                        <input
                          type="text"
                          value={row.paymentTotal}
                          readOnly
                          className="w-full px-2 py-1.5 text-sm font-semibold text-gray-900 dark:text-white bg-transparent focus:outline-none cursor-not-allowed text-right"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openDetailModal(row)}
                            className="flex items-center justify-center w-9 h-9 text-blue-500 hover:text-white hover:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => saveRow(row)}
                            className="flex items-center justify-center w-9 h-9 text-green-500 hover:text-white hover:bg-green-500 dark:hover:bg-green-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                            title="Save row"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(row.id)}
                            className="flex items-center justify-center w-9 h-9 text-red-500 hover:text-white hover:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 opacity-0 group-hover:opacity-100"
                            title="Delete row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    ))
                  })()}
                </tbody>
              </table>
              
              {/* Pagination */}
              {(() => {
                const totalPages = Math.ceil(bankRentData.length / itemsPerPage)
                if (totalPages <= 1) return null
                
                return (
                  <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-800">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, bankRentData.length)} of {bankRentData.length} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center justify-center w-9 h-9 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Previous page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${
                                  currentPage === page
                                    ? 'bg-gold-500 text-gray-900'
                                    : 'text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                              >
                                {page}
                              </button>
                            )
                          } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return (
                              <span key={page} className="px-2 text-gray-600 dark:text-gray-400">
                                ...
                              </span>
                            )
                          }
                          return null
                        })}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center justify-center w-9 h-9 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Next page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && rowToDelete && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-[9999] flex items-center justify-center p-4"
          onClick={() => {
            setIsDeleteModalOpen(false)
            setRowToDelete(null)
          }}
        >
          <div 
            className="bg-white dark:bg-dark-card rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-gray-900 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Delete Row</h2>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setRowToDelete(null)
                }}
                className="p-2 hover:bg-gold-100 dark:hover:bg-gold-500/20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Are you sure you want to delete this row?
              </p>
              <div className="bg-gray-50 dark:bg-black rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">Bank Account:</span> {rowToDelete.bankAccountName || 'N/A'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">Supplier:</span> {rowToDelete.supplier || 'N/A'}
                </p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                This action cannot be undone. All data will be permanently removed.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setRowToDelete(null)
                }}
                className="flex-1 px-6 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Delete Row
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Detail View Modal */}
      {isDetailModalOpen && rowToView && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-[9999] flex items-center justify-center p-4"
          onClick={() => {
            setIsDetailModalOpen(false)
            setRowToView(null)
          }}
        >
          <div 
            className="bg-white dark:bg-dark-card rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-gray-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Row Details</h2>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false)
                  setRowToView(null)
                }}
                className="p-2 hover:bg-gold-100 dark:hover:bg-gold-500/20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-black rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Supplier</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{rowToView.supplier || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-black rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Bank Account Name</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{rowToView.bankAccountName || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-black rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Status</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{rowToView.status || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-black rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Department</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{rowToView.department || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-black rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Sell-Off</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{rowToView.sellOff || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-black rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Start Date</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{rowToView.startDate || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-black rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Currency</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{rowToView.currency || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-black rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Rental Commission</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{rowToView.rentalCommission || '0.00'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-black rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Commission</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{rowToView.commission || '0.00'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-black rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Markup</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{rowToView.markup || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-black rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Sales</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{rowToView.sales || '0.00'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-black rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Addition</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{rowToView.addition || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-black rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Payment Total</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{rowToView.paymentTotal || '0.00'}</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Remark</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{rowToView.remark || 'N/A'}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false)
                  setRowToView(null)
                }}
                className="px-6 py-2 bg-gold-500 text-gray-900 rounded-lg font-medium hover:bg-gold-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
