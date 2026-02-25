import { useEffect, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { DEFAULT_CATEGORIES } from '../contexts/DataContext';
import { BudgetChart } from './BudgetChart';
import { SkeletonCard } from './SkeletonCard';

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

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-left">
          <h2>{monthLabel}</h2>
          <select value={activeMonth} onChange={e => setActiveMonth(e.target.value)}>
            <option value={activeMonth}>{monthLabel}</option>
          </select>
        </div>
      </header>

      {loading ? (
        <div className="summary-cards">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} height={120} />
          ))}
        </div>
      ) : (
        <div className="summary-cards">
        <div className="card summary-card">
          <div>Income</div>
          <div className="card-value">{formatCurrency(data.income)}</div>
          <button className="btn btn-sm" onClick={() => setShowIncomeForm(!showIncomeForm)}>
            {showIncomeForm ? 'Cancel' : 'Edit'}
          </button>
        </div>
        <div className="card summary-card">
          <div>Total Budget</div>
          <div className="card-value">{formatCurrency(totalBudget)}</div>
        </div>
        <div className="card summary-card">
          <div>Spent</div>
          <div className="card-value">{formatCurrency(totalSpent)}</div>
        </div>
        <div className="card summary-card">
          <div>Remaining</div>
          <div className="card-value">{formatCurrency(remaining)}</div>
        </div>
        </div>
      )}

      {showIncomeForm && (
        <form className="form-inline" onSubmit={async e => { e.preventDefault(); await addIncome(parseFloat(incomeAmount)); setShowIncomeForm(false); }}>
          <input type="number" placeholder="Income amount" value={incomeAmount} onChange={e => setIncomeAmount(e.target.value)} required />
          <button type="submit" className="btn btn-primary">Save</button>
        </form>
      )}

      <section className="section">
        <div className="section-header">
          <h3>Budgets</h3>
          <button className="btn btn-primary" onClick={() => setShowBudgetForm(!showBudgetForm)}>
            {showBudgetForm ? 'Cancel' : '+ Add Budget'}
          </button>
        </div>
        
        {showBudgetForm && (
          <form className="form-card" onSubmit={async e => { e.preventDefault(); await addBudget(budgetCategory, parseFloat(budgetAmount), budgetTags.split(',').map(t => t.trim()).filter(Boolean)); setShowBudgetForm(false); setBudgetCategory(''); setBudgetAmount(''); setBudgetTags(''); }}>
            <select value={budgetCategory} onChange={e => setBudgetCategory(e.target.value)} required>
              <option value="">Select Category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="Amount" value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} required />
            <input type="text" placeholder="Tags (comma separated)" value={budgetTags} onChange={e => setBudgetTags(e.target.value)} />
            <button type="submit" className="btn btn-primary">Add Budget</button>
          </form>
        )}

        <div className="budget-list">
          {data.budgets.length === 0 ? <div className="empty-state">No budgets set for this month.</div> : 
            data.budgets.map(budget => {
              const spent = data.expenses.filter(e => e.category === budget.category).reduce((acc, e) => acc + e.amount, 0);
              const percent = Math.min((spent / budget.amount) * 100, 100);
              return (
                <div key={budget.id} className="budget-item">
                  <div className="budget-header">
                    <span className="budget-title" onClick={() => setSelectedCategory(budget.category)}>{budget.category}</span>
                    <button className="btn-icon" onClick={() => deleteBudget(budget.id)}>🗑</button>
                  </div>
                  <div className="tags">{(budget.tags || []).map(t => <span key={t} className="tag">{t}</span>)}</div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }}></div></div>
                  <div className="budget-meta"><span>{formatCurrency(spent)} spent</span><span>{formatCurrency(budget.amount - spent)} left</span></div>
                </div>
              );
            })
          }
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h3>Expenses</h3>
          <button className="btn btn-primary" onClick={() => setShowExpenseForm(!showExpenseForm)}>
            {showExpenseForm ? 'Cancel' : '+ Log Expense'}
          </button>
        </div>

        {showExpenseForm && (
          <form className="form-card" onSubmit={async e => { e.preventDefault(); await addExpense(expenseCategory, parseFloat(expenseAmount), expenseDate, expenseNote); setShowExpenseForm(false); setExpenseCategory(''); setExpenseAmount(''); setExpenseNote(''); setExpenseDate(new Date().toISOString().split('T')[0]); }}>
            <select value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)} required>
              <option value="">Select Category</option>
              {budgetCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="Amount" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} required />
            <input type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} required />
            <input type="text" placeholder="Note (optional)" value={expenseNote} onChange={e => setExpenseNote(e.target.value)} />
            <button type="submit" className="btn btn-primary">Add Expense</button>
          </form>
        )}

        <table className="expenses-table">
          <thead>
            <tr><th>Category</th><th>Amount</th><th>Date</th><th>Note</th><th></th></tr>
          </thead>
          <tbody>
            {data.expenses.length === 0 ? <tr><td colSpan={5} className="empty-state">No expenses logged yet.</td></tr> :
              [...data.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(exp => (
                <tr key={exp.id}>
                  <td>{exp.category}</td>
                  <td>{formatCurrency(exp.amount)}</td>
                  <td>{formatDate(exp.date)}</td>
                  <td>{exp.note || '-'}</td>
                  <td><button className="btn-icon" onClick={() => deleteExpense(exp.id)}>🗑</button></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </section>

      {!loading && <BudgetChart />}

      <button className="btn btn-danger" onClick={resetMonth}>Reset Month</button>

      {selectedCategory && (
        <div className="overlay" onClick={() => setSelectedCategory(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{selectedCategory}</h3>
            <div className="summary-cards">
              <div className="card summary-card">
                <div>Budget</div>
                <div className="card-value">{formatCurrency(data.budgets.filter(b => b.category === selectedCategory).reduce((acc, b) => acc + b.amount, 0))}</div>
              </div>
              <div className="card summary-card">
                <div>Spent</div>
                <div className="card-value">{formatCurrency(data.expenses.filter(e => e.category === selectedCategory).reduce((acc, e) => acc + e.amount, 0))}</div>
              </div>
            </div>
            <h4>Expenses</h4>
            <table className="expenses-table">
              <tbody>
                {data.expenses.filter(e => e.category === selectedCategory).map(e => (
                  <tr key={e.id}><td>{formatCurrency(e.amount)}</td><td>{formatDate(e.date)}</td><td>{e.note || '-'}</td></tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-primary" onClick={() => setSelectedCategory(null)}>Close</button>
          </div>
        </div>
      )}

      {loading && <div className="loading-overlay"><div className="spinner"></div></div>}
    </div>
  );
}
