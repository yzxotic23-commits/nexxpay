'use client'

import { useEffect, useState, useRef } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useToast } from '@/lib/toast-context'
import Link from 'next/link'
import { useFilterStore } from '@/lib/stores/filterStore'
import { useDashboardStore } from '@/lib/stores/dashboardStore'
import {
  getMarketProcessingData,
  getDepositData,
  getWithdrawData,
  getWealthAccountProductionData,
  getWealthAccountStatusData,
  getBankAccountData,
} from '@/lib/utils/mockData'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils/formatters'
import { subDays, startOfDay, endOfDay, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import KPICard from '@/components/KPICard'
import ThemeToggle from '@/components/ThemeToggle'
import FilterBar from '@/components/FilterBar'
import { useThemeStore } from '@/lib/stores/themeStore'
import {
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  CreditCard,
  Activity,
  Search,
  Bell,
  HelpCircle,
  Settings,
  User,
  ChevronDown,
  Power,
  MoreVertical,
  ChevronUp,
  Building2,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export default function DashboardPage() {
  const { showToast } = useToast()
  const { data: session } = useSession()
  const { selectedMonth, setSelectedMonth } = useFilterStore()
  const { theme } = useThemeStore()
  const [selectedBankMarket, setSelectedBankMarket] = useState('SGD')
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false)
  const [selectedMarketVolume, setSelectedMarketVolume] = useState('ALL')
  const [isMarketVolumeDropdownOpen, setIsMarketVolumeDropdownOpen] = useState(false)
  const [selectedMarket, setSelectedMarket] = useState('SGD')
  const [marketDepositData, setMarketDepositData] = useState({ MYR: null, SGD: null, USC: null })
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const userDropdownRef = useRef(null)
  const [marketWithdrawData, setMarketWithdrawData] = useState({ MYR: null, SGD: null, USC: null })
  
  // Color for SGD based on theme
  const sgdColor = theme === 'dark' ? '#C0C0C0' : '#1f2937' // Silver for dark mode, dark gray for light mode
  const {
    marketData,
    depositData,
    withdrawData,
    wealthAccountData,
    bankAccountData,
    setMarketData,
    setDepositData,
    setWithdrawData,
    setWealthAccountData,
    setBankAccountData,
  } = useDashboardStore()

  const bankDropdownRef = useRef(null)
  const marketVolumeDropdownRef = useRef(null)

  // Sync Bank Accounts dropdown with tabs filter
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
    setSelectedBankMarket(selectedMarket)
  }, [selectedMarket])

  // Show login success toast after page loads
  useEffect(() => {
    const showLoginToast = localStorage.getItem('showLoginSuccessToast')
    if (showLoginToast === 'true') {
      // Delay toast untuk memastikan halaman sudah selesai dimuat
      const timer = setTimeout(() => {
        showToast('Login successful! Welcome back!', 'success')
        localStorage.removeItem('showLoginSuccessToast')
      }, 200) // Delay 300ms setelah halaman dimuat
      return () => clearTimeout(timer)
    }
  }, [showToast])

  useEffect(() => {
    // Load all dashboard data
    setMarketData(getMarketProcessingData(selectedMonth))
    
    // Get data for all 3 markets and aggregate
    const myrDeposit = getDepositData(selectedMonth, 'MYR')
    const sgdDeposit = getDepositData(selectedMonth, 'SGD')
    const uscDeposit = getDepositData(selectedMonth, 'USC')
    
    const myrWithdraw = getWithdrawData(selectedMonth, 'MYR')
    const sgdWithdraw = getWithdrawData(selectedMonth, 'SGD')
    const uscWithdraw = getWithdrawData(selectedMonth, 'USC')
    
    // Store individual market data for Transaction Summary
    setMarketDepositData({ MYR: myrDeposit, SGD: sgdDeposit, USC: uscDeposit })
    setMarketWithdrawData({ MYR: myrWithdraw, SGD: sgdWithdraw, USC: uscWithdraw })
    
    // Aggregate deposit data from all markets
    const aggregatedDeposit = {
      month: myrDeposit.month,
      currency: 'ALL',
      currencySymbol: '',
      totalCount: myrDeposit.totalCount + sgdDeposit.totalCount + uscDeposit.totalCount,
      totalAmount: myrDeposit.totalAmount + sgdDeposit.totalAmount + uscDeposit.totalAmount,
      avgAmount: (myrDeposit.totalAmount + sgdDeposit.totalAmount + uscDeposit.totalAmount) / 
                 (myrDeposit.totalCount + sgdDeposit.totalCount + uscDeposit.totalCount),
      avgProcessingTime: (myrDeposit.avgProcessingTime + sgdDeposit.avgProcessingTime + uscDeposit.avgProcessingTime) / 3,
      dailyData: myrDeposit.dailyData.map((day, index) => ({
        date: day.date,
        count: day.count + (sgdDeposit.dailyData[index]?.count || 0) + (uscDeposit.dailyData[index]?.count || 0),
        amount: day.amount + (sgdDeposit.dailyData[index]?.amount || 0) + (uscDeposit.dailyData[index]?.amount || 0),
      }))
    }
    
    // Aggregate withdraw data from all markets
    const aggregatedWithdraw = {
      month: myrWithdraw.month,
      currency: 'ALL',
      currencySymbol: '',
      totalCount: myrWithdraw.totalCount + sgdWithdraw.totalCount + uscWithdraw.totalCount,
      totalAmount: myrWithdraw.totalAmount + sgdWithdraw.totalAmount + uscWithdraw.totalAmount,
      avgAmount: (myrWithdraw.totalAmount + sgdWithdraw.totalAmount + uscWithdraw.totalAmount) / 
                 (myrWithdraw.totalCount + sgdWithdraw.totalCount + uscWithdraw.totalCount),
      avgProcessingTime: (myrWithdraw.avgProcessingTime + sgdWithdraw.avgProcessingTime + uscWithdraw.avgProcessingTime) / 3,
      dailyData: myrWithdraw.dailyData.map((day, index) => ({
        date: day.date,
        count: day.count + (sgdWithdraw.dailyData[index]?.count || 0) + (uscWithdraw.dailyData[index]?.count || 0),
        amount: day.amount + (sgdWithdraw.dailyData[index]?.amount || 0) + (uscWithdraw.dailyData[index]?.amount || 0),
      }))
    }
    
    setDepositData(aggregatedDeposit)
    setWithdrawData(aggregatedWithdraw)
    setWealthAccountData(getWealthAccountProductionData(selectedMonth))
    setBankAccountData(getBankAccountData(selectedMonth))
  }, [selectedMonth, setMarketData, setDepositData, setWithdrawData, setWealthAccountData, setBankAccountData])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target)) {
        setIsBankDropdownOpen(false)
      }
      if (marketVolumeDropdownRef.current && !marketVolumeDropdownRef.current.contains(event.target)) {
        setIsMarketVolumeDropdownOpen(false)
      }
    }
    if (isBankDropdownOpen || isMarketVolumeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isBankDropdownOpen, isMarketVolumeDropdownOpen])

  // Calculate summary KPIs - filtered by selected market
  const filteredDepositData = marketDepositData[selectedMarket]
  const filteredWithdrawData = marketWithdrawData[selectedMarket]
  
  const totalTransactions = marketData?.totalTransactions || 0
  const totalDeposit = filteredDepositData?.totalAmount || 0
  const totalWithdraw = filteredWithdrawData?.totalAmount || 0
  const totalWealthAccounts = wealthAccountData?.totalAccounts || 0
  const totalWithdrawTransactions = filteredWithdrawData?.totalCount || 0
  
  // Bank accounts - total from all markets (getBankAccountData already returns total)
  const totalBankAccounts = bankAccountData?.totalRented || 0

  // Calculate Avg Processing Time for Deposit
  const myrDepositAvgTime = marketDepositData.MYR?.avgProcessingTime || 0
  const sgdDepositAvgTime = marketDepositData.SGD?.avgProcessingTime || 0
  const usdDepositAvgTime = marketDepositData.USC?.avgProcessingTime || 0

  // Calculate Avg Processing Time for Withdraw
  const myrWithdrawAvgTime = marketWithdrawData.MYR?.avgProcessingTime || 0
  const sgdWithdrawAvgTime = marketWithdrawData.SGD?.avgProcessingTime || 0
  const usdWithdrawAvgTime = marketWithdrawData.USC?.avgProcessingTime || 0

  // Calculate Bank Summary data
  const bankOwnerUsedAmount = bankAccountData?.totalRented || 0
  const bankAccountRental = bankAccountData?.totalRented || 0
  const wPlusAccountOutput = wealthAccountData?.totalAccounts || 0
  const wPlusAccountRentalQuantity = wealthAccountData?.totalAccounts || 0

  return (
    <div className="space-y-8">
      {/* Date Range Tabs and Filter Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4 mt-4">
          {/* Date Range Tabs - Center */}
          <nav className="inline-flex bg-white dark:bg-dark-card p-1 rounded-full" aria-label="Tabs">
            {[
              { type: 'yesterday', label: 'Yesterday' },
              { type: 'lastMonth', label: 'Last Month' },
              { type: 'thisMonth', label: 'This Month' },
            ].map((tab) => {
              const isActive = 
                (tab.type === 'yesterday' && selectedMonth?.label === 'Yesterday') ||
                (tab.type === 'lastMonth' && selectedMonth?.label === 'Last Month') ||
                (tab.type === 'thisMonth' && selectedMonth?.label === 'This Month')
              
              return (
              <button
                  key={tab.type}
                  onClick={() => {
                    const now = new Date()
                    let start, end, label
                    if (tab.type === 'yesterday') {
                      const yesterday = subDays(now, 1)
                      start = startOfDay(yesterday)
                      end = endOfDay(yesterday)
                      label = 'Yesterday'
                    } else if (tab.type === 'lastMonth') {
                      const lastMonth = subMonths(now, 1)
                      start = startOfMonth(lastMonth)
                      end = endOfMonth(lastMonth)
                      label = 'Last Month'
                    } else {
                      start = startOfMonth(now)
                      end = endOfMonth(now)
                      label = 'This Month'
                    }
                    setSelectedMonth({ start, end, label })
                  }}
                className={`px-6 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                    isActive
                    ? 'bg-gold-500 text-gray-900 dark:text-gray-900 shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                  {tab.label}
              </button>
              )
            })}
          </nav>

          {/* Separator */}
          <div className="text-gray-400 dark:text-gray-600">|</div>

          {/* Filter Bar - Center */}
          <FilterBar />
        </div>
      </div>

      {/* KPI Cards - Deposit Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">Deposit</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard
            title="MYR Avg Deposit Processing Time"
            value={`${myrDepositAvgTime.toFixed(1)}s`}
            change={0}
            icon={Activity}
            trend="up"
          />
          <KPICard
            title="SGD Avg Deposit Processing Time"
            value={`${sgdDepositAvgTime.toFixed(1)}s`}
            change={0}
            icon={Activity}
            trend="up"
          />
          <KPICard
            title="USD Avg Deposit Processing Time"
            value={`${usdDepositAvgTime.toFixed(1)}s`}
            change={0}
            icon={Activity}
            trend="up"
          />
        </div>
        </div>
        
      {/* KPI Cards - Withdraw Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">Withdraw</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard
            title="MYR Avg Withdrawal Processing Time"
            value={`${myrWithdrawAvgTime.toFixed(1)}s`}
            change={0}
            icon={ArrowUpCircle}
            trend="up"
          />
          <KPICard
            title="SGD Avg Withdrawal Processing Time"
            value={`${sgdWithdrawAvgTime.toFixed(1)}s`}
            change={0}
            icon={ArrowUpCircle}
            trend="up"
          />
          <KPICard
            title="USD Avg Withdrawal Processing Time"
            value={`${usdWithdrawAvgTime.toFixed(1)}s`}
            change={0}
            icon={ArrowUpCircle}
            trend="up"
          />
        </div>
      </div>

      {/* KPI Cards - Bank Summary Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">Bank Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <KPICard
            title="Bank Owner Used Amount"
            value={formatNumber(bankOwnerUsedAmount)}
            change={0}
            icon={Building2}
            trend="up"
            titleAlign="center"
          />
          <KPICard
            title="Bank Account Rental"
            value={formatNumber(bankAccountRental)}
            change={0}
            icon={CreditCard}
            trend="up"
            titleAlign="center"
          />
          <KPICard
            title="W+ Account Output"
            value={formatNumber(wPlusAccountOutput)}
            change={0}
            icon={Users}
            trend="up"
            titleAlign="center"
          />
          <KPICard
            title="W+ Account Rental Quantity"
            value={formatNumber(wPlusAccountRentalQuantity)}
            change={0}
            icon={Building2}
            trend="up"
            titleAlign="center"
          />
        </div>
      </div>
    </div>
  )
}
