let transactions = [];
let allTransactions = [];
let myChart = null;

let username = localStorage.getItem('username');
if (!username) {
    window.location.href = 'index.html';
}

function showTab(tabName) {
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('transactions-section').style.display = 'none';
    document.getElementById('analytics-section').style.display = 'none';
    document.getElementById('settings-section').style.display = 'none';

    document.getElementById(tabName + '-section').style.display = 'block';

    document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');

    let titles = {
        dashboard: 'Dashboard Overview',
        transactions: 'All Transactions',
        analytics: 'Analytics',
        settings: 'Settings'
    };
    document.getElementById('page-title').textContent = titles[tabName];

    if (tabName === 'analytics') {
        renderAnalyticsCharts();
    }
    if (tabName === 'dashboard') {
        setTimeout(function() { renderDashboardChart(); }, 300);
    }
}

function logout() {
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}

function addTransaction() {
    let description = document.getElementById('description').value;
    let amount = document.getElementById('amount').value;
    let type = document.getElementById('type').value;
    let category = document.getElementById('category').value;

    if (description === '' || amount === '') {
        alert('Please fill all fields!');
        return;
    }

    let transaction = {
        id: Date.now(),
        username: username,
        description: description,
        amount: parseFloat(amount),
        type: type,
        category: category,
        date: new Date().toLocaleDateString()
    };

    fetch('http://127.0.0.1:5000/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
    })
    .then(res => res.json())
    .then(() => {
        document.getElementById('description').value = '';
        document.getElementById('amount').value = '';
        loadTransactions();
    })
    .catch(() => alert('Error adding transaction!'));
}

function loadTransactions() {
    fetch('http://127.0.0.1:5000/transactions?username=' + username)
        .then(res => res.json())
        .then(data => {
            allTransactions = data;
            transactions = data;
            displayTransactions();
            updateBalance();
            renderDashboardChart();
        });
}

function displayTransactions() {
    let list = document.getElementById('transaction-list');
    if (list) {
        list.innerHTML = '';
        let recent = [...allTransactions].reverse().slice(0, 4);
        if (recent.length === 0) {
            list.innerHTML = '<p style="color:gray;text-align:center;">No transactions yet</p>';
        }
        recent.forEach(function(t) {
            let li = document.createElement('li');
            li.classList.add(t.type);
            li.innerHTML = `
                <div class="t-left">
                    <strong>${t.description}</strong>
                    <small>${t.category} | ${t.date}</small>
                </div>
                <div class="t-right">
                    <span>₹${t.amount}</span>
                    <button class="delete-btn" onclick="deleteTransaction(${t.id})">✕</button>
                </div>
            `;
            list.appendChild(li);
        });
    }

    let allList = document.getElementById('all-transaction-list');
    if (allList) {
        allList.innerHTML = '';
        if (transactions.length === 0) {
            allList.innerHTML = '<p style="color:gray;text-align:center;">No transactions found</p>';
        }
        transactions.forEach(function(t) {
            let li = document.createElement('li');
            li.classList.add(t.type);
            li.innerHTML = `
                <div class="t-left">
                    <strong>${t.description}</strong>
                    <small>${t.category} | ${t.date}</small>
                </div>
                <div class="t-right">
                    <span>₹${t.amount}</span>
                    <button class="delete-btn" onclick="deleteTransaction(${t.id})">✕</button>
                </div>
            `;
            allList.appendChild(li);
        });
    }

    let su = document.getElementById('settings-username');
    if (su) su.value = username;
}

function updateBalance() {
    let income = 0;
    let expense = 0;

    allTransactions.forEach(function(t) {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;
    });

    let balance = income - expense;

    document.getElementById('balance').textContent = '₹' + balance;
    document.getElementById('total-income').textContent = '₹' + income;
    document.getElementById('total-expense').textContent = '₹' + expense;
    document.getElementById('analytics-balance').textContent = '₹' + balance;
    document.getElementById('analytics-income').textContent = '₹' + income;
    document.getElementById('analytics-expense').textContent = '₹' + expense;
}

function renderDashboardChart() {
    let income = 0, expense = 0;
    allTransactions.forEach(function(t) {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;
    });

    let el = document.getElementById('myChart');
    if (!el) return;
    if (myChart) myChart.destroy();
    myChart = new Chart(el.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Income', 'Expense'],
            datasets: [{ data: [income, expense], backgroundColor: ['#0D7377', '#ff6b6b'] }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
}

function renderAnalyticsCharts() {
    let income = 0, expense = 0;
    let categoryTotals = {};

    allTransactions.forEach(function(t) {
        if (t.type === 'income') income += t.amount;
        else {
            expense += t.amount;
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        }
    });

    let balance = income - expense;

    let ti = document.getElementById('table-income');
    let te = document.getElementById('table-expense');
    let tb = document.getElementById('table-balance');
    if (ti) ti.textContent = '₹' + income;
    if (te) te.textContent = '₹' + expense;
    if (tb) tb.textContent = '₹' + balance;

    let catList = document.getElementById('category-list');
    if (catList) {
        catList.innerHTML = '';
        if (Object.keys(categoryTotals).length === 0) {
            catList.innerHTML = '<li style="color:gray;">No expenses yet</li>';
        }
        Object.keys(categoryTotals).forEach(function(cat) {
            let li = document.createElement('li');
            li.style.cssText = 'padding:12px; margin-bottom:8px; background:#fff5f5; border-radius:8px; border-left:4px solid #ff6b6b; display:flex; justify-content:space-between;';
            li.innerHTML = `<span style="font-weight:600;">${cat}</span><span style="font-weight:800; color:#ff6b6b;">₹${categoryTotals[cat]}</span>`;
            catList.appendChild(li);
        });
    }
}

function searchTransactions() {
    let query = document.getElementById('search-input').value.toLowerCase();
    transactions = allTransactions.filter(function(t) {
        return t.description.toLowerCase().includes(query) ||
               t.category.toLowerCase().includes(query);
    });
    displayTransactions();
}

function exportCSV() {
    let csv = 'Description,Amount,Type,Category,Date\n';
    allTransactions.forEach(function(t) {
        csv += `${t.description},${t.amount},${t.type},${t.category},${t.date}\n`;
    });

    let blob = new Blob([csv], { type: 'text/csv' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'ExpenseIQ_transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
}

function deleteTransaction(id) {
    fetch('http://127.0.0.1:5000/delete/' + id, { method: 'DELETE' })
        .then(() => loadTransactions());
}

function applyFilter() {
    let category = document.getElementById('filter-category').value;
    let type = document.getElementById('filter-type').value;
    transactions = allTransactions.filter(function(t) {
        return (category === 'all' || t.category === category) &&
               (type === 'all' || t.type === type);
    });
    displayTransactions();
}

function resetFilter() {
    document.getElementById('filter-category').value = 'all';
    document.getElementById('filter-type').value = 'all';
    transactions = allTransactions;
    displayTransactions();
}

window.onload = function() {
    document.getElementById('today-date').textContent = new Date().toDateString();
    let su = document.getElementById('settings-username');
    if (su) su.value = username;
    loadTransactions();
}