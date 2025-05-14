// DOM Elements
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');
const addTransactionFab = document.getElementById('add-transaction-fab');
const addTransactionModal = document.getElementById('add-transaction-modal');
const closeModalBtn = document.querySelector('.close-modal');
const cancelBtn = document.querySelector('.btn-cancel');
const transactionTypeButtons = document.querySelectorAll('.transaction-type');
const transactionForm = document.getElementById('transaction-form');
const transactionCategorySelect = document.getElementById('transaction-category');
const dateButtons = document.querySelectorAll('.btn-date');
const chartTypeButtons = document.querySelectorAll('.btn-chart');
const recentTransactionsList = document.getElementById('recent-transactions');
const budgetCategoriesList = document.getElementById('budget-categories');

// App Data
let transactions = [];
let budgets = [];
let currentChartType = 'line';
let currentDateFilter = 'month';
let currentTransactionType = 'income';
let chart = null;

// Categories
const incomeCategories = [
    { id: 'salary', name: 'Salary', icon: 'fa-money-bill-wave' },
    { id: 'freelance', name: 'Freelance', icon: 'fa-laptop-code' },
    { id: 'investments', name: 'Investments', icon: 'fa-chart-line' },
    { id: 'gifts', name: 'Gifts', icon: 'fa-gift' },
    { id: 'other_income', name: 'Other', icon: 'fa-ellipsis-h' }
];

const expenseCategories = [
    { id: 'housing', name: 'Housing', icon: 'fa-home' },
    { id: 'food', name: 'Food & Dining', icon: 'fa-utensils' },
    { id: 'transportation', name: 'Transportation', icon: 'fa-car' },
    { id: 'utilities', name: 'Utilities', icon: 'fa-bolt' },
    { id: 'entertainment', name: 'Entertainment', icon: 'fa-film' },
    { id: 'health', name: 'Healthcare', icon: 'fa-medkit' },
    { id: 'shopping', name: 'Shopping', icon: 'fa-shopping-cart' },
    { id: 'personal', name: 'Personal', icon: 'fa-user' },
    { id: 'education', name: 'Education', icon: 'fa-graduation-cap' },
    { id: 'travel', name: 'Travel', icon: 'fa-plane' },
    { id: 'other_expense', name: 'Other', icon: 'fa-ellipsis-h' }
];

// Event Listeners
function setupEventListeners() {
    // Sidebar toggle
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        mainContent.classList.toggle('full-width');
    });

    // Modal events
    addTransactionFab.addEventListener('click', () => {
        addTransactionModal.classList.add('active');
        document.getElementById('transaction-date').valueAsDate = new Date();
    });

    closeModalBtn.addEventListener('click', () => {
        addTransactionModal.classList.remove('active');
    });

    cancelBtn.addEventListener('click', () => {
        addTransactionModal.classList.remove('active');
    });

    // Transaction type selection
    transactionTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            transactionTypeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentTransactionType = button.dataset.type;
            populateCategorySelect(currentTransactionType);
        });
    });

    // Transaction form submission
    transactionForm.addEventListener('submit', handleTransactionSubmit);

    // Date filter buttons
    dateButtons.forEach(button => {
        button.addEventListener('click', () => {
            dateButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentDateFilter = button.textContent.toLowerCase();
            updateChartData();
        });
    });

    // Chart type buttons
    chartTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            chartTypeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentChartType = button.textContent.toLowerCase();
            updateChartData();
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addTransactionModal) {
            addTransactionModal.classList.remove('active');
        }
    });

    // Navigation
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            document.querySelectorAll('.sidebar-nav li').forEach(item => {
                item.classList.remove('active');
            });
            this.parentElement.classList.add('active');
            
            // For a real app, add page navigation here
        });
    });
}

// Initialize category select
function populateCategorySelect(type) {
    transactionCategorySelect.innerHTML = '<option value="">Select a category</option>';
    
    const categories = type === 'income' ? incomeCategories : expenseCategories;
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        transactionCategorySelect.appendChild(option);
    });
}

// Handle transaction form submission
function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const category = document.getElementById('transaction-category').value;
    const description = document.getElementById('transaction-description').value;
    const date = document.getElementById('transaction-date').value;
    
    if (!amount || !category || !date) {
        alert('Please fill in all required fields');
        return;
    }
    
    const newTransaction = {
        id: transactions.length + 1,
        type: currentTransactionType,
        amount,
        category,
        description,
        date
    };
    
    transactions.unshift(newTransaction);
    
    // Update budgets if it's an expense
    if (currentTransactionType === 'expense') {
        updateBudgetForTransaction(newTransaction);
    }
    
    // Save to localStorage
    saveDataToLocalStorage();
    
    // Update UI
    renderRecentTransactions();
    renderBudgetCategories();
    updateSummaryCards();
    updateChartData();
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Transaction added successfully!';
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
        successMessage.classList.add('show');
        
        setTimeout(() => {
            successMessage.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(successMessage);
            }, 300);
        }, 2000);
    }, 100);
    
    // Reset form
    transactionForm.reset();
    addTransactionModal.classList.remove('active');
}

// Update budget for new expense transaction
function updateBudgetForTransaction(transaction) {
    if (transaction.type !== 'expense') return;
    
    // Find existing budget for this category
    let budget = budgets.find(b => b.category === transaction.category);
    
    if (budget) {
        // Update existing budget
        budget.spent += transaction.amount;
    } else {
        // Create new budget with reasonable default
        const estimatedMonthlyBudget = transaction.amount * 1.5;
        budgets.push({
            category: transaction.category,
            budget: estimatedMonthlyBudget,
            spent: transaction.amount
        });
    }
}

// Render recent transactions
function renderRecentTransactions() {
    recentTransactionsList.innerHTML = '';
    
    const recentTransactions = transactions.slice(0, 5);
    
    if (recentTransactions.length === 0) {
        recentTransactionsList.innerHTML = '<p class="no-data">No transactions to display. Add your first transaction by clicking the + button.</p>';
        return;
    }
    
    recentTransactions.forEach(transaction => {
        const categories = transaction.type === 'income' ? incomeCategories : expenseCategories;
        const category = categories.find(cat => cat.id === transaction.category);
        
        const transactionItem = document.createElement('div');
        transactionItem.className = `transaction-item transaction-${transaction.type}`;
        
        transactionItem.innerHTML = `
            <div class="transaction-icon">
                <i class="fas ${category ? category.icon : 'fa-question'}"></i>
            </div>
            <div class="transaction-details">
                <div class="transaction-title">${transaction.description || category?.name || 'Unnamed'}</div>
                <div class="transaction-date">${formatDate(transaction.date)}</div>
            </div>
            <div class="transaction-amount">${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}</div>
        `;
        
        recentTransactionsList.appendChild(transactionItem);
    });
}

// Render budget categories
function renderBudgetCategories() {
    budgetCategoriesList.innerHTML = '';
    
    if (budgets.length === 0) {
        budgetCategoriesList.innerHTML = '<p class="no-data">No budgets to display. Add transactions to automatically create budgets.</p>';
        return;
    }
    
    budgets.forEach(budget => {
        const category = expenseCategories.find(cat => cat.id === budget.category);
        const percentUsed = (budget.spent / budget.budget) * 100;
        let progressColor = '#2ecc71'; // Green for < 70%
        
        if (percentUsed >= 90) {
            progressColor = '#e74c3c'; // Red for >= 90%
        } else if (percentUsed >= 70) {
            progressColor = '#f39c12'; // Orange for >= 70%
        }
        
        const budgetItem = document.createElement('div');
        budgetItem.className = 'budget-category';
        
        budgetItem.innerHTML = `
            <div class="budget-category-header">
                <div class="category-name">
                    <i class="fas ${category ? category.icon : 'fa-question'}"></i>
                    ${category ? category.name : budget.category}
                </div>
                <div class="budget-values">
                    <span class="spent">$${budget.spent.toFixed(2)}</span>
                    <span class="budget">/ $${budget.budget.toFixed(2)}</span>
                </div>
            </div>
            <div class="budget-progress">
                <div class="progress-bar" style="width: ${Math.min(percentUsed, 100)}%; background-color: ${progressColor}"></div>
            </div>
        `;
        
        budgetCategoriesList.appendChild(budgetItem);
    });
}

// Update summary cards
function updateSummaryCards() {
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    
    // Filter transactions for current and last month
    const currentMonthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth;
    });
    
    const lastMonthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === lastMonth;
    });
    
    // Calculate totals
    const currentIncome = currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const lastIncome = lastMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const currentExpenses = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const lastExpenses = lastMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const currentSavings = currentIncome - currentExpenses;
    const lastSavings = lastIncome - lastExpenses;
    
    // Calculate percentages
    const incomeChange = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0;
    const expenseChange = lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses) * 100 : 0;
    const savingsChange = lastSavings > 0 ? ((currentSavings - lastSavings) / lastSavings) * 100 : 0;
    
    // Get total balance (all income - all expenses)
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const balance = totalIncome - totalExpenses;
    
    // Update the DOM
    document.querySelector('.card.income .amount').textContent = `$${currentIncome.toFixed(2)}`;
    document.querySelector('.card.expenses .amount').textContent = `$${currentExpenses.toFixed(2)}`;
    document.querySelector('.card.savings .amount').textContent = `$${currentSavings.toFixed(2)}`;
    document.querySelector('.card.balance .amount').textContent = `$${balance.toFixed(2)}`;
    
    // Update trend indicators
    updateTrendIndicator('.card.income .trend', incomeChange);
    updateTrendIndicator('.card.expenses .trend', expenseChange, true);
    updateTrendIndicator('.card.savings .trend', savingsChange);
    updateTrendIndicator('.card.balance .trend', 0); // No trend for balance
}

// Update trend indicator with correct icon and text
function updateTrendIndicator(selector, percentChange, inversePositive = false) {
    const element = document.querySelector(selector);
    
    if (Math.abs(percentChange) < 0.1) {
        element.innerHTML = `<i class="fas fa-equals"></i> No change from last month`;
        element.className = `trend`;
        return;
    }
    
    const isPositive = inversePositive ? percentChange < 0 : percentChange > 0;
    const absChange = Math.abs(percentChange);
    
    element.innerHTML = `
        <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i> 
        ${absChange.toFixed(0)}% from last month
    `;
    
    element.className = `trend ${isPositive ? 'positive' : 'negative'}`;
}

// Initialize and update chart
function initChart() {
    console.log('Starting chart initialization...');
    
    const chartElement = document.getElementById('income-expense-chart');
    if (!chartElement) {
        console.error('Chart element not found in the DOM');
        return;
    }
    
    console.log('Chart element found:', chartElement);
    
    try {
        const ctx = chartElement.getContext('2d');
        console.log('Got 2D context:', ctx);
        
        // Set gradient for income
        const incomeGradient = ctx.createLinearGradient(0, 0, 0, 400);
        incomeGradient.addColorStop(0, 'rgba(46, 204, 113, 0.6)');
        incomeGradient.addColorStop(1, 'rgba(46, 204, 113, 0.1)');
        
        // Set gradient for expenses
        const expenseGradient = ctx.createLinearGradient(0, 0, 0, 400);
        expenseGradient.addColorStop(0, 'rgba(231, 76, 60, 0.6)');
        expenseGradient.addColorStop(1, 'rgba(231, 76, 60, 0.1)');
        
        console.log('Creating chart with Chart.js...');
        
        chart = new Chart(ctx, {
            type: currentChartType,
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Income',
                        backgroundColor: currentChartType === 'line' ? incomeGradient : 'rgba(46, 204, 113, 0.6)',
                        borderColor: 'rgba(46, 204, 113, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(46, 204, 113, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(46, 204, 113, 1)',
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        tension: 0.3,  // Add curve to the line
                        data: []
                    },
                    {
                        label: 'Expenses',
                        backgroundColor: currentChartType === 'line' ? expenseGradient : 'rgba(231, 76, 60, 0.6)',
                        borderColor: 'rgba(231, 76, 60, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(231, 76, 60, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(231, 76, 60, 1)',
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        tension: 0.3,  // Add curve to the line
                        data: []
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => `$${value}`,
                            font: {
                                size: 11,
                                weight: '500'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#2d3748',
                        bodyColor: '#4a5568',
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: {
                            size: 13,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 12
                        },
                        displayColors: true,
                        boxWidth: 10,
                        boxHeight: 10,
                        boxPadding: 3,
                        usePointStyle: true,
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += `$${context.parsed.y.toFixed(2)}`;
                                return label;
                            },
                            afterLabel: function(context) {
                                const incomeData = context.chart.data.datasets[0].data;
                                const expenseData = context.chart.data.datasets[1].data;
                                const index = context.dataIndex;
                                
                                if (incomeData[index] && expenseData[index]) {
                                    const savingsValue = incomeData[index] - expenseData[index];
                                    const prefix = savingsValue >= 0 ? '+' : '';
                                    return `Savings: ${prefix}$${savingsValue.toFixed(2)}`;
                                }
                                return null;
                            }
                        }
                    }
                }
            }
        });
        
        console.log('Chart created successfully');
        
        updateChartData();
    } catch (error) {
        console.error('Error initializing chart:', error);
    }
}

// Update chart data based on date filter
function updateChartData() {
    if (!chart) return;
    
    // Destroy previous chart to update type
    chart.destroy();
    
    // Get date range based on filter
    const dates = getDateRangeLabels();
    
    // For each date, calculate total income and expenses
    const incomeData = [];
    const expenseData = [];
    
    dates.forEach(date => {
        let filteredTransactions = [];
        
        // For month and year filters, we need to handle date ranges
        if (currentDateFilter === 'month' || currentDateFilter === 'year') {
            filteredTransactions = transactions.filter(t => {
                const tDate = new Date(t.date);
                const dateValue = new Date(date.value);
                
                if (currentDateFilter === 'month') {
                    // Check if the transaction is within the week
                    const weekStart = new Date(dateValue);
                    const weekEnd = new Date(dateValue);
                    weekEnd.setDate(weekEnd.getDate() + 6);
                    
                    return tDate >= weekStart && tDate <= weekEnd;
                } else {
                    // Year filter - check same month
                    return tDate.getMonth() === dateValue.getMonth() && 
                           tDate.getFullYear() === dateValue.getFullYear();
                }
            });
        } else {
            // For day and week filter, exact date match
            filteredTransactions = transactions.filter(t => {
                return t.date === date.value;
            });
        }
        
        const dayIncome = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const dayExpenses = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        incomeData.push(dayIncome);
        expenseData.push(dayExpenses);
    });
    
    // Create some sample data if no transactions exist
    if (transactions.length === 0) {
        // Set some default data for visual demonstration
        for (let i = 0; i < dates.length; i++) {
            // Create a pattern where income is slightly higher than expenses
            const baseValue = Math.random() * 300 + 200;
            incomeData[i] = baseValue + Math.random() * 200;
            expenseData[i] = baseValue - Math.random() * 150;
            
            // Ensure expenses don't go negative
            if (expenseData[i] < 0) expenseData[i] = Math.random() * 50;
        }
    }
    
    // Smooth the data for better visualization
    const smoothedIncomeData = smoothData(incomeData);
    const smoothedExpenseData = smoothData(expenseData);
    
    // Initialize new chart
    const ctx = document.getElementById('income-expense-chart').getContext('2d');
    
    // Set gradient backgrounds
    const incomeGradient = ctx.createLinearGradient(0, 0, 0, 400);
    incomeGradient.addColorStop(0, 'rgba(46, 204, 113, 0.6)');
    incomeGradient.addColorStop(1, 'rgba(46, 204, 113, 0.1)');
    
    const expenseGradient = ctx.createLinearGradient(0, 0, 0, 400);
    expenseGradient.addColorStop(0, 'rgba(231, 76, 60, 0.6)');
    expenseGradient.addColorStop(1, 'rgba(231, 76, 60, 0.1)');
    
    chart = new Chart(ctx, {
        type: currentChartType,
        data: {
            labels: dates.map(d => d.label),
            datasets: [
                {
                    label: 'Income',
                    backgroundColor: currentChartType === 'line' ? incomeGradient : 'rgba(46, 204, 113, 0.6)',
                    borderColor: 'rgba(46, 204, 113, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(46, 204, 113, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(46, 204, 113, 1)',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.3,  // Add curve to the line
                    data: smoothedIncomeData
                },
                {
                    label: 'Expenses',
                    backgroundColor: currentChartType === 'line' ? expenseGradient : 'rgba(231, 76, 60, 0.6)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(231, 76, 60, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(231, 76, 60, 1)',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.3,  // Add curve to the line
                    data: smoothedExpenseData
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => `$${value}`,
                        font: {
                            size: 11,
                            weight: '500'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#2d3748',
                    bodyColor: '#4a5568',
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        size: 13,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 12
                    },
                    displayColors: true,
                    boxWidth: 10,
                    boxHeight: 10,
                    boxPadding: 3,
                    usePointStyle: true,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += `$${context.parsed.y.toFixed(2)}`;
                            return label;
                        },
                        afterLabel: function(context) {
                            const incomeData = context.chart.data.datasets[0].data;
                            const expenseData = context.chart.data.datasets[1].data;
                            const index = context.dataIndex;
                            
                            if (incomeData[index] && expenseData[index]) {
                                const savingsValue = incomeData[index] - expenseData[index];
                                const prefix = savingsValue >= 0 ? '+' : '';
                                return `Savings: ${prefix}$${savingsValue.toFixed(2)}`;
                            }
                            return null;
                        }
                    }
                }
            }
        }
    });
    
    // Add click event to chart to show detailed breakdown
    document.getElementById('income-expense-chart').onclick = function(evt) {
        const points = chart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
        
        if (points.length) {
            const firstPoint = points[0];
            const date = dates[firstPoint.index];
            showTransactionBreakdown(date);
        }
    };
}

// Smooth data for better visualization
function smoothData(data) {
    if (data.length <= 3) return data;
    
    const result = [...data];
    
    for (let i = 1; i < data.length - 1; i++) {
        // Simple moving average
        result[i] = (data[i-1] + data[i] * 2 + data[i+1]) / 4;
    }
    
    return result;
}

// Show transaction breakdown for a specific date
function showTransactionBreakdown(date) {
    // In a real app, this would show a detailed breakdown modal
    console.log(`Transactions for ${date.label}: ${date.value}`);
    
    let filteredTransactions = [];
    
    if (currentDateFilter === 'month' || currentDateFilter === 'year') {
        filteredTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            const dateValue = new Date(date.value);
            
            if (currentDateFilter === 'month') {
                // Check if the transaction is within the week
                const weekStart = new Date(dateValue);
                const weekEnd = new Date(dateValue);
                weekEnd.setDate(weekEnd.getDate() + 6);
                
                return tDate >= weekStart && tDate <= weekEnd;
            } else {
                // Year filter - check same month
                return tDate.getMonth() === dateValue.getMonth() && 
                       tDate.getFullYear() === dateValue.getFullYear();
            }
        });
    } else {
        // For day and week filter, exact date match
        filteredTransactions = transactions.filter(t => {
            return t.date === date.value;
        });
    }
    
    if (filteredTransactions.length === 0) {
        return;
    }
    
    // Create and show the breakdown modal
    renderTransactionBreakdownModal(date.label, filteredTransactions);
}

// Render transaction breakdown modal
function renderTransactionBreakdownModal(dateLabel, transactions) {
    // First, check if a modal already exists and remove it
    const existingModal = document.getElementById('breakdown-modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'breakdown-modal';
    modal.className = 'modal active';
    
    // Calculate totals
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const netSavings = totalIncome - totalExpenses;
    
    // Create modal content
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Transactions for ${dateLabel}</h3>
                <button class="close-modal"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="breakdown-summary">
                    <div class="breakdown-item">
                        <span class="label">Income:</span>
                        <span class="value income">+$${totalIncome.toFixed(2)}</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="label">Expenses:</span>
                        <span class="value expense">-$${totalExpenses.toFixed(2)}</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="label">Net Savings:</span>
                        <span class="value ${netSavings >= 0 ? 'income' : 'expense'}">${netSavings >= 0 ? '+' : ''}$${netSavings.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="transaction-tabs">
                    <button class="tab-btn active" data-tab="all">All</button>
                    <button class="tab-btn" data-tab="income">Income</button>
                    <button class="tab-btn" data-tab="expense">Expenses</button>
                </div>
                
                <div class="transaction-list breakdown-list">
                    ${transactions.length > 0 ? 
                        transactions.map(transaction => {
                            const categories = transaction.type === 'income' ? incomeCategories : expenseCategories;
                            const category = categories.find(cat => cat.id === transaction.category);
                            
                            return `
                                <div class="transaction-item transaction-${transaction.type}" data-type="${transaction.type}">
                                    <div class="transaction-icon">
                                        <i class="fas ${category ? category.icon : 'fa-question'}"></i>
                                    </div>
                                    <div class="transaction-details">
                                        <div class="transaction-title">${transaction.description || category?.name || 'Unnamed'}</div>
                                        <div class="transaction-date">${formatDate(transaction.date)}</div>
                                    </div>
                                    <div class="transaction-amount">${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}</div>
                                </div>
                            `;
                        }).join('') 
                        : '<p class="no-data">No transactions for this period</p>'
                    }
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Tab functionality
    const tabButtons = modal.querySelectorAll('.tab-btn');
    const transactionItems = modal.querySelectorAll('.transaction-item');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active tab
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter transactions
            const tabType = btn.dataset.tab;
            
            transactionItems.forEach(item => {
                if (tabType === 'all' || item.dataset.type === tabType) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Close when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Get date labels based on current filter
function getDateRangeLabels() {
    const today = new Date();
    const result = [];
    
    switch (currentDateFilter) {
        case 'day':
            // Last 24 hours in 3-hour intervals
            for (let i = 7; i >= 0; i--) {
                const hour = today.getHours() - (i * 3);
                const date = new Date(today);
                date.setHours(hour, 0, 0, 0);
                
                const formattedHour = date.getHours();
                const period = formattedHour >= 12 ? 'PM' : 'AM';
                const hour12 = formattedHour % 12 || 12;
                
                result.push({
                    label: `${hour12} ${period}`,
                    value: formatDateValue(date)
                });
            }
            break;
            
        case 'week':
            // Last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                
                result.push({
                    label: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    value: formatDateValue(date)
                });
            }
            break;
            
        case 'month':
            // Last 30 days in weekly intervals
            for (let i = 4; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - (i * 7));
                
                const endDate = new Date(date);
                endDate.setDate(date.getDate() + 6);
                
                result.push({
                    label: `${date.getDate()}/${date.getMonth() + 1}`,
                    value: formatDateValue(date)
                });
            }
            break;
            
        case 'year':
            // Last 12 months
            for (let i = 11; i >= 0; i--) {
                const date = new Date(today);
                date.setMonth(today.getMonth() - i);
                
                result.push({
                    label: date.toLocaleDateString('en-US', { month: 'short' }),
                    value: formatDateValue(date)
                });
            }
            break;
            
        default:
            // Default to week
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                
                result.push({
                    label: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    value: formatDateValue(date)
                });
            }
    }
    
    return result;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Format date for value comparison
function formatDateValue(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Save data to local storage
function saveDataToLocalStorage() {
    localStorage.setItem('fintrack_transactions', JSON.stringify(transactions));
    localStorage.setItem('fintrack_budgets', JSON.stringify(budgets));
}

// Load data from local storage
function loadDataFromLocalStorage() {
    const storedTransactions = localStorage.getItem('fintrack_transactions');
    const storedBudgets = localStorage.getItem('fintrack_budgets');
    
    if (storedTransactions) {
        transactions = JSON.parse(storedTransactions);
    }
    
    if (storedBudgets) {
        budgets = JSON.parse(storedBudgets);
    }
}

// Initialize app
function initApp() {
    // Load data from localStorage
    loadDataFromLocalStorage();
    
    // Find active date button and set it
    const monthBtn = Array.from(dateButtons).find(btn => btn.textContent.toLowerCase() === 'month');
    if (monthBtn) {
        dateButtons.forEach(btn => btn.classList.remove('active'));
        monthBtn.classList.add('active');
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Populate initial data
    populateCategorySelect('income');
    renderRecentTransactions();
    renderBudgetCategories();
    updateSummaryCards();
    
    // Initialize chart
    initChart();
    
    // Set initial date for transaction form
    document.getElementById('transaction-date').valueAsDate = new Date();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initApp); 