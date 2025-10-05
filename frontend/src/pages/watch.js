// watch.js

const INACTIVE_API = "http://localhost:8080/api/stands/inactive";
const ACTION_API = "http://localhost:8080/api/stands/action";
const END_GAME_API = "http://localhost:8080/api/stands/end_game";
let selectedStandId = null;

// Слушаем изменения выбранного стенда
window.addEventListener('standChanged', (event) => {
    selectedStandId = event.detail.standId;
    loadInactiveParticipants();
});


/**
 * Создает HTML-элемент для неактивного участника с кнопками действий.
 * @param {string} participantId - ID участника
 */
function createInactiveParticipantHtml(participantId) {
    return `
        <div id="participant-${participantId}" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm">
            <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="10"/>
                </svg>
                <span class="text-gray-800 font-medium">${participantId}</span>
            </div>
            <div class="flex gap-2">
                <button data-id="${participantId}" data-action="requeue"
                    class="btn-action bg-gray-300 hover:bg-gray-400 text-black text-sm py-1 px-3 rounded-lg transition">
                    Вернуть в очередь
                </button>
                <button data-id="${participantId}" data-action="delete"
                    class="btn-action bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded-lg transition">
                    Удалить
                </button>
            </div>
        </div>
    `;
}

/**
 * Отправляет действие на сервер (вернуть в очередь или удалить).
 * @param {string} participantId - ID участника
 * @param {string} action - 'requeue' или 'delete'
 */
async function sendAction(participantId, action) {
    try {
        const response = await fetch(ACTION_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ participantId, action })
        });

        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }
        
        // Удаляем элемент из DOM после успешного действия
        const element = document.getElementById(`participant-${participantId}`);
        if (element) {
            element.remove();
        }
        alert(`Участник ${participantId} успешно ${action === 'requeue' ? 'возвращен в очередь' : 'удален'}!`);
        
        // Обновляем список, чтобы проверить пуст ли он
        checkEmptyList(); 

    } catch (error) {
        console.error(`Ошибка при выполнении действия ${action}:`, error);
        alert(`Не удалось выполнить действие для участника ${participantId}.`);
    }
}

/**
 * Проверяет, пуст ли список неактивных участников, и выводит заглушку.
 */
function checkEmptyList() {
    const inactiveList = document.getElementById('inactiveList');
    if (inactiveList.children.length === 0) {
        inactiveList.innerHTML = '<p class="text-gray-500 italic">Список неактивных участников пуст.</p>';
    }
}

/**
 * Функция загрузки и отображения неактивных участников
 */
async function loadInactiveParticipants() {
    const inactiveList = document.getElementById('inactiveList');
    inactiveList.innerHTML = '<p class="text-gray-500 italic">Загрузка данных...</p>';

    try {
        // !!! API должен вернуть массив ID неактивных участников: ["ID_1", "ID_2", ...]
        const response = await fetch(INACTIVE_API); 
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.status}`);
        }

        const data = await response.json(); 

        inactiveList.innerHTML = ''; // Очищаем 'Загрузка...'
        
        if (data && data.length > 0) {
            data.forEach(id => {
                inactiveList.insertAdjacentHTML('beforeend', createInactiveParticipantHtml(id));
            });
        }
        
        checkEmptyList();

    } catch (error) {
        console.error("Не удалось загрузить неактивных участников:", error);
        inactiveList.innerHTML = '<p class="text-red-500">Ошибка загрузки данных.</p>';
    }
}

/**
 * Обработчик кликов для кнопок 'Вернуть в очередь' и 'Удалить'
 */
document.getElementById('inactiveList').addEventListener('click', (e) => {
    // Проверяем, что клик был по одной из кнопок действия
    if (e.target.classList.contains('btn-action')) {
        const participantId = e.target.dataset.id;
        const action = e.target.dataset.action;
        sendAction(participantId, action);
    }
});

/**
 * Обработчик кнопки "ЗАВЕРШИТЬ ИГРУ"
 */
document.getElementById('endGameButton').addEventListener('click', async () => {
    if (!confirm("Вы уверены, что хотите завершить текущую игру? Это может повлиять на всю очередь.")) {
        return;
    }

    const endGameButton = document.getElementById('endGameButton');
    endGameButton.disabled = true;
    endGameButton.textContent = "Завершение...";

    try {
        const response = await fetch(END_GAME_API, { method: 'POST' });
        
        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }

        alert('Игра успешно завершена. Очередь обновлена.');
        await loadInactiveParticipants(); // Перезагружаем данные

    } catch (error) {
        console.error("Ошибка при завершении игры:", error);
        alert('Не удалось завершить игру.');
    } finally {
        endGameButton.disabled = false;
        endGameButton.textContent = "ЗАВЕРШИТЬ ИГРУ";
    }
});


// Загружаем данные при старте страницы
loadInactiveParticipants();