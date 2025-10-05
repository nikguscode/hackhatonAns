// vueue.js

const QUEUE_API_GET = "http://127.0.0.1:8081/api/employees/stand";
const MAX_TEAM_SIZE = 3; // Взято из примера (три компьютера) [cite: 18]
let selectedStandId = null;

/**
 * Функция для создания HTML-элемента участника очереди
 * @param {string} participantId - ID или ФИО участника
 * @returns {string} HTML-строка для списка
 */
function createParticipantHtml(participantId, isMissing = false) {
    const iconColor = isMissing ? 'text-red-500' : 'text-yellow-400';
    return `
        <div class="flex items-center gap-2 p-1 border-b border-gray-100 last:border-b-0">
            <svg class="w-5 h-5 ${iconColor}" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="10"/>
            </svg>
            <span class="text-gray-800">${participantId}</span>
            </div>
    `;
}

// Слушаем изменения выбранного стенда
window.addEventListener('standChanged', (event) => {
    selectedStandId = event.detail.standId;
    loadQueueData();
});

/**
 * Функция загрузки и отображения данных
 */
async function loadQueueData() {
    const queueList = document.getElementById('queueList');
    const currentTeamList = document.getElementById('currentTeamList');
    const missingList = document.getElementById('missingList');

    // Очищаем списки и показываем, что идет загрузка
    queueList.innerHTML = '<p class="text-gray-500 italic">Загрузка...</p>';
    currentTeamList.innerHTML = '<p class="text-gray-500 italic">Загрузка...</p>';
    missingList.innerHTML = '<p class="text-gray-500 italic">Загрузка...</p>';

   try {
        const response = await fetch(QUEUE_API_GET, {
            credentials: 'include' 
        }); 
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.status}`);
        }

        // Ожидаем массив Machine: [ { id: 'uuid', name: 'PC-1', ... }, ... ]
        const data = await response.json(); 
        
        // 1. Очередь (используем список Machine, возвращаемый бэкендом)
        if (Array.isArray(data) && data.length > 0) {
            // Предполагаем, что name/id машины — это то, что нужно отобразить
            queueList.innerHTML = data.map(m => createParticipantHtml(m.name || m.id)).join('');
        } else {
            queueList.innerHTML = '<p class="text-gray-500 italic">Очередь пуста.</p>';
        }

        // 2. Текущая команда и 3. Отсутствующие (Очищаем, так как бэкенд их не возвращает)
        currentTeamList.innerHTML = '<p class="text-gray-500 italic" id="team-placeholder">Нет активных участников. (Ожидает API)</p>';
        missingList.innerHTML = '<p class="text-gray-500 italic" id="missing-placeholder">Нет отсутствующих. (Ожидает API)</p>';


    } catch (error) {
        console.error("Не удалось загрузить данные очереди:", error);
        queueList.innerHTML = '<p class="text-red-500">Ошибка загрузки данных.</p>';
        currentTeamList.innerHTML = '<p class="text-red-500">Ошибка</p>';
        missingList.innerHTML = '<p class="text-red-500">Ошибка</p>';
    }
}

/**
 * Обработчик кнопки "НАЧАТЬ ИГРУ / ПРИГЛАСИТЬ СЛЕДУЮЩИХ"
 */
document.getElementById('startButton').addEventListener('click', async () => {
    // В реальной жизни эта логика будет сложной и должна быть на сервере,
    // но на фронтенде мы просто посылаем команду "обновить/начать новый раунд"
    
    // Блокируем кнопку
    const startButton = document.getElementById('startButton');
    startButton.disabled = true;
    startButton.textContent = "Обновление...";

    try {
        // Отправляем команду серверу для перехода к следующей команде/началу игры
        const response = await fetch(`${QUEUE_API_GET}/next`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Здесь можно отправить ID стенда, если у вас их несколько
            body: JSON.stringify({ standId: 'YourStandID' }) 
        });

        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }

        // После успешной команды, перезагружаем данные очереди
        await loadQueueData();
        alert('Участники приглашены, или игра началась!');

    } catch (error) {
        console.error("Ошибка при обработке начала игры:", error);
        alert('Не удалось начать игру/пригласить участников.');
    } finally {
        // Разблокируем кнопку
        startButton.disabled = false;
        startButton.textContent = "НАЧАТЬ ИГРУ / ПРИГЛАСИТЬ СЛЕДУЮЩИХ";
    }
});

// Загружаем данные при старте страницы
loadQueueData();