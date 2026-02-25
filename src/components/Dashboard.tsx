import { useEffect, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { DEFAULT_CATEGORIES } from '../contexts/DataContext';
import { BudgetChart } from './BudgetChart';
import { SkeletonCard } from './SkeletonCard';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  Plus,
  Trash2,
  Calendar,
  Edit3,
  X,
  PlusCircle,
  PieChart as PieChartIcon,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount || 0);
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function Dashboard() {
  const {
    activeMonth, data, loading, setActiveMonth, loadData,
    addIncome, addBudget, deleteBudget, addExpense, deleteExpense, resetMonth
  } = useData();

  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetTags, setBudgetTags] = useState('');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseNote, setExpenseNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => { loadData(); }, [loadData]);

  const categories = [...new Set([...DEFAULT_CATEGORIES, ...data.budgets.map(b => b.category)])].sort();
  const budgetCategories = [...new Set(data.budgets.map(b => b.category))].sort();

  const totalBudget = data.budgets.reduce((acc, b) => acc + b.amount, 0);
  const totalSpent = data.expenses.reduce((acc, e) => acc + e.amount, 0);
  const remaining = data.income > 0 ? data.income - totalSpent : Math.max(totalBudget - totalSpent, 0);

  const [year, month] = activeMonth.split('-');
  const monthLabel = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Calendar className="text-muted" size={24} />
            <h2 style={{ margin: 0 }}>{monthLabel}</h2>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <select value={activeMonth} onChange={e => setActiveMonth(e.target.value)} className="glass">
              {(() => {
                const months = [];
                const now = new Date();
                for (let i = -6; i <= 6; i++) {
                  const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, '0');
                  const key = `${y}-${m}`;
                  const label = d.toLocaleDateString('en-NG', { month: 'short', year: 'numeric' });
                  months.push(<option key={key} value={key}>{label}</option>);
                }
                return months;
              })()}
            </select>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="summary-cards">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} height={140} />
          ))}
        </div>
      ) : (
        <motion.div
          className="summary-cards"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="card summary-card border-l-4" style={{ borderLeftColor: 'var(--brand-500)' }}>
            <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wallet size={16} /> Income
            </div>
            <div className="card-value text-primary">{formatCurrency(data.income)}</div>
            <button className="btn btn-sm glass" onClick={() => setShowIncomeForm(!showIncomeForm)} style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>
              <Edit3 size={14} style={{ marginRight: '4px' }} /> {showIncomeForm ? 'Cancel' : 'Update'}
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="card summary-card">
            <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChartIcon size={16} /> Total Budget
            </div>
            <div className="card-value">{formatCurrency(totalBudget)}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
              {data.budgets.length} planned categories
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="card summary-card">
            <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingDown size={16} /> Spent
            </div>
            <div className="card-value" style={{ color: 'var(--danger)' }}>{formatCurrency(totalSpent)}</div>
            <div className="progress-track" style={{ height: '4px', marginTop: 'auto', marginBottom: 0 }}>
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min((totalSpent / (data.income || totalBudget || 1)) * 100, 100)}%`,
                  background: 'var(--danger)'
                }}
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="card summary-card">
            <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={16} /> Remaining
            </div>
            <div className="card-value" style={{ color: 'var(--success)' }}>{formatCurrency(remaining)}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
              {Math.round((remaining / (data.income || 1)) * 100)}% available
            </div>
          </motion.div>
        </motion.div>
      )}

      <AnimatePresence>
        {showIncomeForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="form-card glass"
            onSubmit={async e => {
              e.preventDefault();
              await addIncome(parseFloat(incomeAmount));
              setShowIncomeForm(false);
              setIncomeAmount('');
            }}
            style={{ overflow: 'hidden', padding: '1.25rem' }}
          >
            <div className="form-group" style={{ margin: 0 }}>
              <input
                type="number"
                placeholder="Enter income amount"
                value={incomeAmount}
                onChange={e => setIncomeAmount(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: 'fit-content' }}>Save Income</button>
          </motion.form>
        )}
      </AnimatePresence>

      <section className="section">
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h3 style={{ margin: 0 }}>Budgets</h3>
            <span className="date-badge">{data.budgets.length} Active</span>
          </div>
          <button className="btn btn-primary" onClick={() => setShowBudgetForm(!showBudgetForm)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {showBudgetForm ? <X size={18} /> : <PlusCircle size={18} />}
            {showBudgetForm ? 'Cancel' : 'Add Budget'}
          </button>
        </div>

        <AnimatePresence>
          {showBudgetForm && (
            <motion.form
              initial={{ height: 0, opacity: 0, scale: 0.98 }}
              animate={{ height: 'auto', opacity: 1, scale: 1 }}
              exit={{ height: 0, opacity: 0, scale: 0.98 }}
              className="form-card glass"
              onSubmit={async e => {
                e.preventDefault();
                await addBudget(budgetCategory, parseFloat(budgetAmount), budgetTags.split(',').map(t => t.trim()).filter(Boolean));
                setShowBudgetForm(false); setBudgetCategory(''); setBudgetAmount(''); setBudgetTags('');
              }}
              style={{ overflow: 'hidden', marginBottom: '1.5rem' }}
            >
              <div className="form-group" style={{ margin: 0 }}>
                <select value={budgetCategory} onChange={e => setBudgetCategory(e.target.value)} required>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <input type="number" placeholder="Budgeted Amount" value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <input type="text" placeholder="Tags (Home, Health...)" value={budgetTags} onChange={e => setBudgetTags(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary">Create Budget</button>
            </motion.form>
          )}
        </AnimatePresence>

        <motion.div
          className="budget-list"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {data.budgets.length === 0 ? (
            <div className="empty-state card" style={{ gridColumn: '1 / -1' }}>
              <PieChartIcon size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>No budgets set for this month yet.</p>
            </div>
          ) : (
            data.budgets.map(budget => {
              const spent = data.expenses.filter(e => e.category === budget.category).reduce((acc, e) => acc + e.amount, 0);
              const percent = Math.min((spent / budget.amount) * 100, 100);
              const isOver = spent > budget.amount;
              return (
                <motion.div key={budget.id} variants={itemVariants} className="budget-item card">
                  <div className="budget-header">
                    <span
                      className="budget-title"
                      onClick={() => setSelectedCategory(budget.category)}
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--primary)'
                      }}
                    >
                      {budget.category} <ChevronRight size={14} />
                    </span>
                    <button className="btn-icon" onClick={() => deleteBudget(budget.id)} style={{ color: 'var(--text-muted)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="tags">
                    {(budget.tags || []).map(t => <span key={t} className="tag">{t}</span>)}
                  </div>

                  <div className="progress-track">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      style={{ background: isOver ? 'var(--danger)' : 'var(--brand-500)' }}
                    />
                  </div>

                  <div className="budget-meta">
                    <span style={{ color: isOver ? 'var(--danger)' : 'var(--text-main)', fontWeight: 700 }}>
                      {formatCurrency(spent)} spent
                    </span>
                    <span style={{ opacity: 0.8 }}>
                      {isOver ? (
                        <span style={{ color: 'var(--danger)' }}>{formatCurrency(spent - budget.amount)} over</span>
                      ) : (
                        <span>{formatCurrency(budget.amount - spent)} left</span>
                      )}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </section>

      <section className="section">
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h3 style={{ margin: 0 }}>Expenses</h3>
            <span className="date-badge">{data.expenses.length} Logged</span>
          </div>
          <button className="btn btn-primary" onClick={() => setShowExpenseForm(!showExpenseForm)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {showExpenseForm ? <X size={18} /> : <Plus size={18} />}
            {showExpenseForm ? 'Cancel' : 'Log Expense'}
          </button>
        </div>

        <AnimatePresence>
          {showExpenseForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="form-card glass"
              onSubmit={async e => {
                e.preventDefault();
                await addExpense(expenseCategory, parseFloat(expenseAmount), expenseDate, expenseNote);
                setShowExpenseForm(false); setExpenseCategory(''); setExpenseAmount(''); setExpenseNote(''); setExpenseDate(new Date().toISOString().split('T')[0]);
              }}
              style={{ overflow: 'hidden', marginBottom: '1.5rem' }}
            >
              <div className="form-group" style={{ margin: 0 }}>
                <select value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)} required>
                  <option value="">Category</option>
                  {budgetCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <input type="number" placeholder="Amount" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <input type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <input type="text" placeholder="Optional Note" value={expenseNote} onChange={e => setExpenseNote(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary">Save Expense</button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="expenses-container">
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Note</th>
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <motion.tbody
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {data.expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    <Clock size={32} style={{ opacity: 0.1, marginBottom: '0.5rem' }} />
                    <div>No expenses logged yet this month.</div>
                  </td>
                </tr>
              ) : (
                [...data.expenses]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((exp, idx) => (
                    <motion.tr
                      key={exp.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <td style={{ fontWeight: 600 }}>{exp.category}</td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(exp.amount)}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{formatDate(exp.date)}</td>
                      <td style={{ color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {exp.note || '-'}
                      </td>
                      <td>
                        <button className="btn-icon delete-btn" onClick={() => deleteExpense(exp.id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
              )}
            </motion.tbody>
          </table>
        </div>
      </section>

      {!loading && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="section"
        >
          <div className="section-header">
            <h3>Visual Analysis</h3>
          </div>
          <BudgetChart />
        </motion.section>
      )}

      <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center' }}>
        <button
          className="btn glass"
          onClick={resetMonth}
          style={{
            color: 'var(--danger)',
            borderColor: 'rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Trash2 size={16} /> Reset Month Data
        </button>
      </div>

      <AnimatePresence>
        {selectedCategory && (
          <div className="overlay" onClick={() => setSelectedCategory(null)}>
            <motion.div
              className="modal glass"
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0 }}>{selectedCategory} Details</h3>
                <button className="btn-icon" onClick={() => setSelectedCategory(null)}><X size={20} /></button>
              </div>

              <div className="summary-cards" style={{ marginBottom: '2rem' }}>
                <div className="card glass">
                  <div className="label">Planned</div>
                  <div className="card-value" style={{ fontSize: '1.5rem' }}>
                    {formatCurrency(data.budgets.filter(b => b.category === selectedCategory).reduce((acc, b) => acc + b.amount, 0))}
                  </div>
                </div>
                <div className="card glass">
                  <div className="label">Spent</div>
                  <div className="card-value" style={{ fontSize: '1.5rem', color: 'var(--danger)' }}>
                    {formatCurrency(data.expenses.filter(e => e.category === selectedCategory).reduce((acc, e) => acc + e.amount, 0))}
                  </div>
                </div>
              </div>

              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Info size={18} className="text-primary" /> Transactions
              </h4>

              <div className="expenses-container glass">
                <table className="expenses-table">
                  <tbody>
                    {data.expenses.filter(e => e.category === selectedCategory).length === 0 ? (
                      <tr><td className="empty-state">No transactions for this category.</td></tr>
                    ) : (
                      data.expenses.filter(e => e.category === selectedCategory).map(e => (
                        <tr key={e.id}>
                          <td style={{ fontWeight: 700 }}>{formatCurrency(e.amount)}</td>
                          <td style={{ fontSize: '0.875rem' }}>{formatDate(e.date)}</td>
                          <td style={{ fontSize: '0.875rem', opacity: 0.7 }}>{e.note || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <button className="btn btn-primary btn-block" onClick={() => setSelectedCategory(null)}>Back to Dashboard</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="loading-overlay">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="spinner"
          />
        </div>
      )}
    </div>
  );
}
