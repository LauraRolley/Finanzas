// 1. Inicialización de datos desde el almacenamiento local
let transactions = JSON.parse(localStorage.getItem('finanzas_spice_data')) || [];
let myChart;

// 2. Referencias a elementos del DOM
const form = document.getElementById('finance-form');
const list = document.getElementById('finance-list');
const balanceDisplay = document.getElementById('total-balance');
const incomeDisplay = document.getElementById('total-income');
const expenseDisplay = document.getElementById('total-expenses');
const monthDisplay = document.getElementById('current-month');

// 3. Configurar el nombre del mes actual
const options = { month: 'long', year: 'numeric' };
monthDisplay.innerText = new Intl.DateTimeFormat('es-ES', options).format(new Date());

/**
 * Actualiza toda la interfaz de usuario
 */
function updateUI() {
    list.innerHTML = '';
    let income = 0, fixed = 0, variable = 0, savings = 0;

    transactions.forEach((t, index) => {
        const isIncome = t.category === 'Ingreso';
        const row = document.createElement('tr');
        row.className = "group transition-colors";
        row.innerHTML = `
            <td class="py-5 font-medium text-sm text-[#2d1a1a]">${t.desc}</td>
            <td class="py-5">
                <span class="badge ${getBadgeClass(t.category)}">
                    ${t.category}
                </span>
            </td>
            <td class="py-5 font-medium text-sm ${isIncome ? 'text-[#bf8b67]' : 'text-gray-800'}">
                ${isIncome ? '+' : '-'}${t.amount.toFixed(2)}€
            </td>
            <td class="py-5 text-right">
                <button onclick="deleteTransaction(${index})" class="btn-danger md:opacity-0 group-hover:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </td>
        `;
        list.appendChild(row);

        if (t.category === 'Ingreso') income += t.amount;
        else if (t.category === 'Fijo') fixed += t.amount;
        else if (t.category === 'Variable') variable += t.amount;
        else if (t.category === 'Ahorro') savings += t.amount;
    });

    const totalExpenses = fixed + variable + savings;
    const balance = income - totalExpenses;

    // Actualizar textos
    balanceDisplay.innerText = `${balance.toFixed(2)}€`;
    balanceDisplay.style.color = balance < 0 ? '#632626' : '#2d1a1a';
    incomeDisplay.innerText = `${income.toFixed(2)}€`;
    expenseDisplay.innerText = `${totalExpenses.toFixed(2)}€`;

    // Guardar y refrescar gráfico
    updateChart(fixed, variable, savings);
    localStorage.setItem('finanzas_spice_data', JSON.stringify(transactions));
}

/**
 * Retorna la clase CSS según la categoría
 */
function getBadgeClass(cat) {
    switch(cat) {
        case 'Ingreso': return 'badge-ingreso';
        case 'Fijo': return 'badge-fijo';
        case 'Variable': return 'badge-variable';
        case 'Ahorro': return 'badge-ahorro';
        default: return '';
    }
}

/**
 * Evento al enviar el formulario
 */
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const desc = document.getElementById('desc').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;

    if (desc && amount) {
        transactions.unshift({ desc, amount, category });
        updateUI();
        form.reset();
    }
});

/**
 * Elimina una transacción
 */
function deleteTransaction(index) {
    transactions.splice(index, 1);
    updateUI();
}

/**
 * Borra todos los datos
 */
function clearData() {
    if(confirm('¿Borrar todos los registros del Atelier?')) {
        transactions = [];
        updateUI();
    }
}

/**
 * Dibuja o actualiza el gráfico circular
 */
function updateChart(fixed, variable, savings) {
    const ctx = document.getElementById('financeChart').getContext('2d');
    if (myChart) myChart.destroy();
    
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Fijo', 'Variable', 'Ahorro'],
            datasets: [{
                data: [fixed, variable, savings],
                backgroundColor: ['#632626', '#9d5353', '#bf8b67'],
                borderWidth: 4,
                borderColor: '#ffffff',
                hoverOffset: 10
            }]
        },
        options: {
            cutout: '82%',
            responsive: true,
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 25,
                        font: { size: 10, family: 'Plus Jakarta Sans', weight: '500' }
                    }
                }
            }
        }
    });
}

// Ejecución inicial
updateUI();