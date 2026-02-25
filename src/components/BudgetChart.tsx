import { useData } from '../contexts/DataContext'
import { motion } from 'framer-motion'
import { PieChart as PieChartIcon } from 'lucide-react'

export function BudgetChart() {
  const { data } = useData()

  const acc: { category: string; budget: number; spent: number }[] = []
  const map = new Map<string, { budget: number; spent: number }>()

  data.budgets.forEach(b => {
    const v = map.get(b.category) ?? { budget: 0, spent: 0 }
    v.budget += b.amount
    map.set(b.category, v)
  })

  data.expenses.forEach(e => {
    const v = map.get(e.category) ?? { budget: 0, spent: 0 }
    v.spent += e.amount
    map.set(e.category, v)
  })

  map.forEach((v, k) => acc.push({ category: k, budget: v.budget, spent: v.spent }))

  // Sort alphabetically for stable chart order
  acc.sort((a, b) => a.category.localeCompare(b.category))

  const maxVal = Math.max(1, ...acc.map(a => Math.max(a.budget, a.spent)))

  const height = 240
  const barW = 24
  const gap = 20
  const paddingLeft = 60
  const width = Math.max(acc.length * (barW * 2 + gap) + paddingLeft + 40, 500)

  return (
    <div className="card chart-card glass" aria-label="Budget summary chart">
      <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <PieChartIcon className="text-primary" size={20} />
        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Budget Utilization</span>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '2rem' }}>
        <svg width={width} height={height} role="img" aria-label="Budget vs spent bar chart">
          <defs>
            <linearGradient id="budgetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--brand-500)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--brand-600)" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="spentGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--danger)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--danger)" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Grid lines and labels */}
          {[0, 0.25, 0.5, 0.75, 1].map(p => {
            const y = height - 40 - p * (height - 80)
            const val = p * maxVal
            const label = val >= 1000 ? `${(val / 1000).toFixed(1)}k` : Math.round(val).toString()

            return (
              <g key={p}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - 20}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.3"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="var(--text-muted)"
                  fontWeight="500"
                >
                  {label}
                </text>
              </g>
            )
          })}

          {acc.length === 0 ? (
            <text
              x={width / 2}
              y={height / 2}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize="14"
              opacity="0.5"
            >
              No planning data yet
            </text>
          ) : acc.map((a, idx) => {
            const xBase = paddingLeft + idx * (barW * 2 + gap)
            const budgetH = (a.budget / maxVal) * (height - 80)
            const spentH = (a.spent / maxVal) * (height - 80)
            const yBudget = height - 40 - budgetH
            const ySpent = height - 40 - spentH

            return (
              <g key={a.category}>
                {/* Budget Bar */}
                <motion.rect
                  initial={{ height: 0, y: height - 40 }}
                  animate={{ height: budgetH, y: yBudget }}
                  x={xBase}
                  width={barW}
                  fill="url(#budgetGrad)"
                  rx={4}
                />

                {/* Spent Bar */}
                <motion.rect
                  initial={{ height: 0, y: height - 40 }}
                  animate={{ height: spentH, y: ySpent }}
                  x={xBase + barW + 4}
                  width={barW}
                  fill="url(#spentGrad)"
                  rx={4}
                />

                <text
                  x={xBase + barW + 2}
                  y={height - 15}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill="var(--text-muted)"
                >
                  {a.category}
                </text>
              </g>
            )
          })}

          <line x1={paddingLeft} y1={height - 40} x2={width - 20} y2={height - 40} stroke="var(--border)" strokeWidth="2" />
        </svg>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--brand-500)' }} />
          <span>Budgeted</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--danger)', opacity: 0.8 }} />
          <span>Spent</span>
        </div>
      </div>
    </div>
  )
}
