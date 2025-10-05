// main.js

// URL вашего API для получения статистики. Убедитесь, что этот адрес доступен и возвращает нужные данные.
const STATS_API = "http://localhost:8081/api/stats/activity";

/**
 * Инициализирует и отрисовывает линейный график активности очереди.
 * @param {Array<string>} labels - Подписи по оси X (например, время или дни).
 * @param {Array<number>} data - Значения по оси Y (например, количество участников в очереди).
 */
function renderChart(labels, data) {
    const ctx = document.getElementById('activityChart').getContext('2d');
    
    // Уничтожаем предыдущий экземпляр графика, если он существует (для будущих обновлений)
    if (window.activityChart instanceof Chart) {
        window.activityChart.destroy();
    }

    window.activityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Количество участников в очереди',
                data: data,
                borderColor: '#FFC800', // Желтый цвет T-Bank
                backgroundColor: 'rgba(255, 200, 0, 0.2)',
                tension: 0.4, // Сглаживание линии
                pointRadius: 3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Участники'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Время'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            }
        }
    });
}

/**
 * Загружает данные статистики с сервера и обновляет дашборд.
 */
async function loadDashboardData() {
    console.log("Загрузка данных дашборда...");

    // Заглушка на случай ошибки загрузки
    const defaultErrorText = 'Н/Д';

    try {
        // Запрос к API
        const response = await fetch(STATS_API);
    
        if (!response.ok) {
            throw new Error(`Ошибка загрузки данных: ${response.status}`);
        }

        const data = await response.json(); 
        console.log("Полученные данные:", data);

        // 1. Отрисовка графика
        if (data.labels && data.queueSizes) {
             renderChart(data.labels, data.queueSizes);
        } else {
             document.getElementById('activityChart').innerHTML = '<p class="text-gray-500 text-center mt-10">Данные для графика отсутствуют.</p>';
        }

        // 2. Обновление дополнительных показателей
        document.getElementById('totalParticipants').textContent = data.total || defaultErrorText;
        document.getElementById('avgWaitTime').textContent = data.avgWait || defaultErrorText;
        document.getElementById('peakQueue').textContent = data.peak || defaultErrorText;

    } catch (error) {
        console.error("Не удалось загрузить данные дашборда:", error);
        
        // Установка состояния ошибки
        document.getElementById('totalParticipants').textContent = defaultErrorText;
        document.getElementById('avgWaitTime').textContent = defaultErrorText;
        document.getElementById('peakQueue').textContent = defaultErrorText;
        document.getElementById('activityChart').innerHTML = '<p class="text-red-500 text-center mt-10">Ошибка загрузки данных графика.</p>';
    }
}

window.addEventListener('authLoaded', () => {
    // Если DOM уже загружен, запускаем сразу. Если нет, это произойдет позже.
    document.addEventListener('DOMContentLoaded', loadDashboardData);
});