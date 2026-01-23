'use client'

import { useEffect, useState, useRef } from 'react'
import { useFilterStore } from '@/lib/stores/filterStore'
import { useDashboardStore } from '@/lib/stores/dashboardStore'
import { getMarketProcessingData } from '@/lib/utils/mockData'
import { formatCurrency, formatNumber } from '@/lib/utils/formatters'
import KPICard from '@/components/KPICard'
import ChartContainer from '@/components/ChartContainer'
import FilterBar from '@/components/FilterBar'
import ThemeToggle from '@/components/ThemeToggle'
import { useSession, signOut } from 'next-auth/react'
import { useToast } from '@/lib/toast-context'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Search, Bell, HelpCircle, Settings, User, ChevronDown, TrendingUp, Power } from 'lucide-react'
import Link from 'next/link'

// Custom Tooltip Component for Bar Chart
const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const filledValue = payload.find((p) => p.dataKey === 'filled')?.value || 0
    return (
      <div className="bg-gray-800 dark:bg-gray-900 rounded-lg p-3 shadow-lg border border-gray-700">
        <p className="text-white text-sm mb-1">{label}</p>
        <p className="text-gold-500 font-bold text-base">
          {filledValue.toFixed(2)}M
        </p>
      </div>
    )
  }
  return null
}

const COLORS = ['#DEC05F', '#3b82f6', '#10b981']

export default function MarketProcessingPage() {
  const { data: session } = useSession()
  const { selectedMonth } = useFilterStore()
  const { marketData, setMarketData } = useDashboardStore()
  const [selectedMarket, setSelectedMarket] = useState('SGD')
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const userDropdownRef = useRef(null)

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
    setMarketData(getMarketProcessingData(selectedMonth))
  }, [selectedMonth, setMarketData])

  if (!marketData) {
    return <div>Loading...</div>
  }

  // Filter data based on selected market tab
  const filteredMarkets = marketData.markets.filter(market => market.market === selectedMarket)
  
  // Calculate filtered totals for KPI cards
  const filteredTotalTransactions = filteredMarkets.reduce((sum, market) => sum + market.transactions, 0)
  const filteredTotalVolume = filteredMarkets.reduce((sum, market) => sum + market.volume, 0)
  const filteredAvgPerTransaction = filteredTotalTransactions > 0 ? filteredTotalVolume / filteredTotalTransactions : 0

  // Prepare chart data based on filtered markets
  const maxVolume = filteredMarkets.length > 0 
    ? Math.max(...filteredMarkets.map((market) => market.volume / 1000000)) 
    : 0
  const barChartData = filteredMarkets.map((market) => {
    const volume = market.volume / 1000000 // Convert to millions
    const remaining = maxVolume - volume
    // Highlight the bar with highest value
    const isHighlighted = volume === maxVolume
    return {
      name: market.market,
      transactions: market.transactions,
      volume: volume,
      filled: volume,
      remaining: remaining,
      isHighlighted: isHighlighted,
    }
  })

  const pieChartData = filteredMarkets.map((market) => ({
    name: market.market,
    value: market.contribution,
  }))

  const tabs = ['SGD', 'MYR', 'USC']

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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Transactions"
          value={formatNumber(filteredTotalTransactions)}
          change={1.35}
          icon={TrendingUp}
          trend="up"
        />
        <KPICard
          title="Total Volume"
          value={formatCurrency(filteredTotalVolume, selectedMarket)}
          change={3.68}
          icon={TrendingUp}
          trend="up"
        />
        <KPICard
          title="Avg per Transaction"
          value={formatCurrency(filteredAvgPerTransaction, selectedMarket)}
          change={2.3}
          icon={TrendingUp}
          trend="up"
        />
        <KPICard
          title="Markets Active"
          value={filteredMarkets.length.toString()}
          change={0}
          icon={TrendingUp}
          trend="up"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="Transaction Volume by Market"
        >
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={barChartData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeWidth={1} opacity={0.2} vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" axisLine={{ strokeWidth: 0.5 }} tickLine={false} />
              <YAxis 
                stroke="#6b7280" 
                axisLine={{ strokeWidth: 0.5 }}
                tickLine={false}
                tickFormatter={(value) => {
                  if (value >= 1) return `${value.toFixed(1)}M`
                  return `${(value * 1000).toFixed(0)}K`
                }}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '10px', paddingRight: '0px', marginTop: '-48px' }} />
              <Bar dataKey="filled" stackId="a" name="Volume (M)">
                {barChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isHighlighted ? '#DEC05F' : '#1f2937'} 
                  />
                ))}
              </Bar>
              <Bar dataKey="remaining" stackId="a" fill="#e5e7eb" name="" hide={true} radius={[0, 0, 4, 4]}>
                {barChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-remaining-${index}`} 
                    fill="#e5e7eb" 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer
          title="Market Contribution"
          subtitle={`${selectedMonth.label} - Percentage distribution`}
        >
          <div className="flex items-center justify-center" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => {
                    if (percent < 0.05) return '' // Hide label for very small slices
                    return `${name}: ${(percent * 100).toFixed(1)}%`
                  }}
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={2}
                  fill="#8884d8"
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0]
                      return (
                        <div className="bg-gray-800 dark:bg-gray-900 rounded-lg p-3 shadow-lg border border-gray-700">
                          <p className="text-white text-sm mb-1 font-semibold">{data.name}</p>
                          <p className="text-gold-500 font-bold text-base">
                            {data.value.toFixed(2)}%
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            {pieChartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-3.5 h-3.5 rounded-sm"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">{entry.name}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {entry.value.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </ChartContainer>
      </div>

      {/* Market Details Table */}
      <div className="bg-white dark:bg-dark-card rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-900">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Market Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-900">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Market
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Transactions
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Volume
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Contribution
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMarkets.map((market) => (
                <tr
                  key={market.market}
                  className="border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-dark-surface"
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{market.market}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white text-right">
                    {formatNumber(market.transactions)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white text-right">
                    {formatCurrency(market.volume, selectedMarket)}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-gold-500 text-right">
                    {market.contribution.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
