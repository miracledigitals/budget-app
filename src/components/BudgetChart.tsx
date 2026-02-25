import { useData } from '../contexts/DataContext'

export function BudgetChart() {
  const { data } = useData()
  // accumulate per category
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
  const maxVal = Math.max(1, ...acc.map(a => Math.max(a.budget, a.spent)))
  const height = 180
  const barW = 18
  const gap = 14
  const width = Math.max(acc.length * (barW + gap) + 60, 320)

  return (
    <div className="card chart-card" aria-label="Budget chart">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Budget vs Spent</span>
      </div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Budget vs spent bar chart">
        {acc.map((a, idx) => {
          const x = 40 + idx * (barW + gap)
          const budgetH = (a.budget / maxVal) * height
          const spentH = (a.spent / maxVal) * height
          const yBudget = height - budgetH
          const ySpent = height - spentH
          return (
            <g key={a.category}>
              <rect x={x} y={yBudget} width={barW} height={budgetH} fill="#4f46e5" rx={4} />
              <rect x={x + barW/4} y={ySpent} width={barW/2} height={spentH} fill="#10b981" rx={4} />
              <text x={x + barW/2} y={height + 12} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{a.category}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
