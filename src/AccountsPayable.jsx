import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './App.css';

function AccountsPayable() {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ type: 'Meals', description: '', beforeTax: 0, tax: 0 });
  const [taxRate, setTaxRate] = useState(13); // Default tax rate percentage
  const [customTypes, setCustomTypes] = useState([]); // New state for custom expense types
  const [newCustomType, setNewCustomType] = useState(''); // New state for the input field

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense(prevExpense => ({ ...prevExpense, [name]: value }));
  };

  const handleSaveData = () => {
    if (!expenses.length) return;
  
    const expensesForExport = expenses.map(expense => ({
      ...expense,
      beforeTax: parseFloat(expense.beforeTax).toFixed(2),
      tax: typeof expense.tax === 'number' ? expense.tax.toFixed(2) : expense.tax,
      total: typeof expense.total === 'number' ? expense.total.toFixed(2) : expense.total
    }));
  
    const grandTotal = expensesForExport.reduce((acc, expense) => acc + parseFloat(expense.total), 0);
    
    const grandTotalRow = { description: 'Grand Total', beforeTax: '', tax: '', total: grandTotal.toFixed(2), type: '' };
    expensesForExport.push(grandTotalRow);
  
    const worksheet = XLSX.utils.json_to_sheet(expensesForExport, { header: ["type", "description", "beforeTax", "tax", "total"] });
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
    XLSX.writeFile(workbook, 'expense_report.xlsx');
  };
  const handleAddExpense = () => {
    const taxMultiplier = newExpense.type === 'Meals' ? 0.5 : 1;
    const taxAmount = parseFloat(((newExpense.beforeTax * taxRate / 100) * taxMultiplier).toFixed(2));
    const totalAmount = parseFloat(newExpense.beforeTax) + taxAmount;
    
    const expenseWithTotals = {
      ...newExpense,
      beforeTax: parseFloat(newExpense.beforeTax),
      tax: taxAmount,
      total: parseFloat(totalAmount.toFixed(2)),
    };
    setExpenses([...expenses, expenseWithTotals]);
    setNewExpense({ type: 'Meals', description: '', beforeTax: 0, tax: 0 });
  };
// New function to add custom expense type
const handleAddCustomType = () => {
    if (newCustomType && !customTypes.includes(newCustomType)) {
      setCustomTypes([...customTypes, newCustomType]);
      setNewCustomType('');
    }
  };
  // Calculate Grand Total
  const grandTotal = expenses.reduce((acc, expense) => acc + expense.total, 0);

  return (
    <div className="AccountsPayable">
      <h1>Expense Report Maker</h1>
      <div className="expense-form">
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={newExpense.description}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="beforeTax"
          placeholder="Before Tax"
          value={newExpense.beforeTax}
          onChange={handleInputChange}
        />
        <select
          name="type"
          value={newExpense.type}
          onChange={handleInputChange}
        >
          <option value="Meals">Meals</option>
          <option value="Shop Supplies">Shop Supplies</option>
          <option value="Flights">Flights</option>
          {customTypes.map((type, index) => (
            <option key={index} value={type}>{type}</option>
          ))}
        </select>
        <button onClick={handleAddExpense}>Add Expense</button>
        <button onClick={handleSaveData}>Save Data</button>
      </div>
       {/* New section for adding custom expense types */}
       <div className="custom-type-form">
        <input
          type="text"
          value={newCustomType}
          onChange={(e) => setNewCustomType(e.target.value)}
          placeholder="New Expense Type"
        />
        <button className="add-custom-type" onClick={handleAddCustomType}>Add Custom Type</button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Before Tax</th>
              <th>Tax</th>
              <th>Total</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
  {expenses.map((expense, index) => (
    <tr key={index}>
      <td>{expense.description}</td>
      <td>{parseFloat(expense.beforeTax).toFixed(2)}</td>
      <td>{typeof expense.tax === 'number' ? expense.tax.toFixed(2) : expense.tax}</td>
      <td>{typeof expense.total === 'number' ? expense.total.toFixed(2) : expense.total}</td>
      <td>{expense.type}</td>
    </tr>
  ))}
</tbody>
          <tfoot>
            <tr>
              <td colSpan="3"></td>
              <td>Grand Total:</td>
              <td>{grandTotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div>
        <label>Preferred Tax Rate (%):</label>
        <input
          type="number"
          value={taxRate}
          onChange={(e) => setTaxRate(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}

export default AccountsPayable;
