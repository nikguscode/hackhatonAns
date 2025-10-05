// Глобальные переменные
let stands = [];
let currentStandId = null;

// Инициализация после authLoaded + гарантированно после готовности DOM
async function initAfterAuth() {
    console.log('initAfterAuth: called');
    // Если DOM ещё не готов — ждём, иначе продолжаем сразу
    if (document.readyState === 'loading') {
        await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
    }
    try {
        console.log('initAfterAuth: calling loadStands()');
        await loadStands();
        setupEventListeners();
        console.log('initAfterAuth: finished');
    } catch (err) {
        console.error('initAfterAuth error:', err);
    }
}

window.addEventListener('authLoaded', initAfterAuth);


// ---------- helper: безопасный парсер ISO с нормализацией офсета ----------
function normalizeIsoString(iso) {
    if (!iso || typeof iso !== 'string') return null;

    // Убираем пробелы вокруг
    iso = iso.trim();

    // Если офсет содержит секунды, например +04:02:33 -> +04:02
    // заменяем последнюю часть вида [+-]HH:MM:SS на [+-]HH:MM
    iso = iso.replace(/([+-]\d{2}:\d{2}):\d{2}$/, '$1');

    // Некоторые бэкенды могут отдавать частично кривые строки — попытка устранить лишние пробелы
    return iso;
}

function parseIsoSafe(iso) {
    if (!iso) return null;
    const normalized = normalizeIsoString(iso);
    if (!normalized) return null;

    const d = new Date(normalized);
    if (Number.isNaN(d.getTime())) {
        // как запасной вариант попробуем отрезать офсет вообще (использовать локальное время)
        const withoutOffset = normalized.replace(/[+-]\d{2}:\d{2}$/, '');
        const d2 = new Date(withoutOffset);
        if (!Number.isNaN(d2.getTime())) {
            return d2.toISOString();
        }
        return null;
    }
    return d.toISOString();
}

// ---------- Обновлённый loadStands с маппингом и безопасным парсингом ----------
async function loadStands() {
    console.log('loadStands: starting fetch to backend /api/stands');
    try {
        stopAllQueuePolling();

        const response = await fetch('http://127.0.0.1:8081/api/stands', {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            credentials: 'include',
            mode: 'cors'
        });

        console.log('loadStands: fetch finished, status', response.status);

        if (!response.ok) {
            const text = await response.text();
            console.error('loadStands: response body:', text);
            throw new Error(`Ошибка: ${response.status} — ${text}`);
        }

        const serverStands = await response.json();

        stands = (Array.isArray(serverStands) ? serverStands : []).map(s => {
            const startIso = s.startDateTime || s.startAt || null;
            const endIso = s.endDateTime || s.endAt || null;

            const parsedStart = parseIsoSafe(startIso);
            const parsedEnd = parseIsoSafe(endIso);

            return {
                id: s.id,
                title: s.title || s.name || 'Без названия',
                owner: s.volunteerFullName || s.employeeFullName || s.owner || s.responsible || '',
                activity: s.activity || s.activityType || 'other',
                count: (typeof s.count === 'number' ? s.count : 1),
                startAt: parsedStart,
                endAt: parsedEnd,
                date: parsedStart ? parsedStart.split('T')[0] : null
            };
        });

        console.log('loadStands: mapped stands', stands);
        renderStands();
    } catch (error) {
        console.error('Ошибка при загрузке стендов:', error);
        const placeholder = document.getElementById('stands-placeholder');
        if (placeholder) placeholder.textContent = 'Ошибка загрузки стендов: ' + (error.message || error);
    }
}

// Массив для хранения всех идентификаторов интервалов.
// Это полезно, если в будущем потребуется остановить обновление (например, при смене страницы).
const queueIntervals = {}; 

/**
 * Запускает интервальный опрос (polling) сервера 
 * для обновления количества участников в очереди для указанного стенда.
 * @param {number} standId ID стенда.
 * @param {number} intervalMs Интервал обновления в миллисекундах (по умолчанию 15 секунд).
 */
function startQueuePolling(standId, intervalMs = 15000) {
    // Очищаем старый интервал, если он существует
    if (queueIntervals[standId]) {
        clearInterval(queueIntervals[standId]);
    }
    
    // 1. Выполняем первый запрос сразу же при старте
    updateQueueCount(standId); 

    // 2. Устанавливаем интервал для регулярного обновления
    const intervalId = setInterval(() => {
        updateQueueCount(standId);
    }, intervalMs);
    
    // Сохраняем ID интервала
    queueIntervals[standId] = intervalId;
}

// Вспомогательная функция для очистки всех интервалов (можно использовать при переходе на другую страницу)
function stopAllQueuePolling() {
    Object.values(queueIntervals).forEach(clearInterval);
}

// Отрисовка списка стендов
// Отрисовка списка стендов
// Отрисовка списка стендов
function renderStands() {
    const standsList = document.getElementById('standsList');
    
    // 1. Проверка на пустой список
    if (stands.length === 0) {
        standsList.innerHTML = `
            <div class="card container-pad">
                <p class="text-gray-500 italic">Стенды не найдены</p>
            </div>
        `;
        // Если стенды удалены, также останавливаем все интервалы
        stopAllQueuePolling();
        return;
    }

    // 2. Синхронно обновляем HTML. 
    standsList.innerHTML = stands.map(stand => `
        <div class="card container-pad" data-stand-id="${stand.id}">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-semibold text-gray-800">${stand.title}</h3>
                    <p class="text-gray-600">${stand.owner}</p>
                    <p class="text-sm text-gray-500">${getActivityType(stand.activity)}</p>
                </div>
                <button class="settings-btn text-gray-500 hover:text-gray-700" data-stand-id="${stand.id}">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div class="bg-gray-50 p-3 rounded-lg">
                    <p class="text-sm text-gray-500">Максимум участников</p>
                    <p class="text-lg font-semibold text-gray-800">${stand.count}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                    <p class="text-sm text-gray-500">Дата мероприятия</p>
                    <p class="text-lg font-semibold text-gray-800">${formatDate(stand.date)}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                    <p class="text-sm text-gray-500">Время</p>
                    <p class="text-lg font-semibold text-gray-800">${formatTime(stand.startAt)} - ${formatTime(stand.endAt)}</p>
                </div>
            </div>

            <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-sm text-gray-600">Очередь до конца</p>
                        <p class="text-2xl font-bold text-yellow-600" id="timer-${stand.id}">--:--:--</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-gray-600">Участников в очереди</p>
                        <p class="text-lg font-semibold text-gray-800" id="queue-${stand.id}">0</p>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // 3. Запуск интервалов с отложенной инициализацией
    setTimeout(() => {
        stands.forEach(stand => {
            startTimer(stand.id, stand.endAt);
            startQueuePolling(stand.id); 
        });
    }, 0);
}

function startTimer(standId, endTime) {
    const endISO = endTime ? normalizeIsoString(endTime) : null;
    if (!endISO) {
        // Нет корректного времени окончания — отображаем заглушку и не запускаем интервал
        const el = document.getElementById(`timer-${standId}`);
        if (el) el.textContent = '--:--:--';
        return;
    }

    const endDate = new Date(endISO);
    if (Number.isNaN(endDate.getTime())) {
        const el = document.getElementById(`timer-${standId}`);
        if (el) el.textContent = '--:--:--';
        return;
    }

    let timerIntervalId;
    function updateTimer() {
        const timerElement = document.getElementById(`timer-${standId}`);
        if (!timerElement) {
            if (timerIntervalId) clearInterval(timerIntervalId);
            return;
        }

        const now = new Date();
        const timeLeft = endDate - now;

        if (timeLeft <= 0) {
            timerElement.textContent = '00:00:00';
            timerElement.classList.add('text-red-500');
            clearInterval(timerIntervalId);
            return;
        }

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        timerElement.textContent =
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft < 3600000) {
            timerElement.classList.add('text-red-500');
        } else {
            timerElement.classList.remove('text-red-500');
        }
    }

    updateTimer();
    timerIntervalId = setInterval(updateTimer, 1000);
}
// Обновление количества участников в очереди
async function updateQueueCount(standId) {
    try {
        const response = await fetch(`http://localhost:8081/api/stands/${standId}/queue`);
        if (response.ok) {
            const data = await response.json();
            const queueElement = document.getElementById(`queue-${standId}`);
            if (queueElement) {
                queueElement.textContent = data.count || 0;
            }
        }
    } catch (error) {
        console.error('Ошибка при загрузке очереди:', error);
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Обработчик для кнопок настроек
    document.addEventListener('click', (e) => {
        if (e.target.closest('.settings-btn')) {
            const standId = e.target.closest('.settings-btn').dataset.standId;
            openSettingsModal(standId);
        }
    });

    // Закрытие модального окна
    document.getElementById('closeSettings').addEventListener('click', closeSettingsModal);
    document.getElementById('settingsModal').addEventListener('click', (e) => {
        if (e.target.id === 'settingsModal') {
            closeSettingsModal();
        }
    });

    // Обработчик формы настроек
    document.getElementById('settingsForm').addEventListener('submit', handleSettingsSubmit);
    
    // Обработчик удаления стенда
    document.getElementById('deleteStand').addEventListener('click', handleDeleteStand);
}

// Открытие модального окна настроек
function openSettingsModal(standId) {
    const stand = stands.find(s => s.id == standId);
    if (!stand) return;

    currentStandId = standId;
    const form = document.getElementById('settingsForm');
    
    // Заполняем форму данными стенда
    form.title.value = stand.title;
    form.owner.value = stand.owner;
    form.activity.value = stand.activity;
    form.count.value = stand.count;
    
    // Устанавливаем дату и время
    if (stand.startAt) {
        const startDate = new Date(stand.startAt);
        form.date.value = startDate.toISOString().split('T')[0];
        form.start_time.value = startDate.toTimeString().slice(0, 5);
    }
    
    if (stand.endAt) {
        const endDate = new Date(stand.endAt);
        form.end_time.value = endDate.toTimeString().slice(0, 5);
    }

    document.getElementById('settingsModal').classList.remove('hidden');
}

// Закрытие модального окна
function closeSettingsModal() {
    document.getElementById('settingsModal').classList.add('hidden');
    currentStandId = null;
}

function toIsoForBackend(dateObj) {
    if (!dateObj || !(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) return null;
    return dateObj.toISOString(); // пример: "2025-10-04T13:00:00.000Z"
}

async function handleSettingsSubmit(e) {
    e.preventDefault();
    if (!currentStandId) return;

    const form = e.target;
    const title = form.title.value.trim();           // frontend "title"
    const employeeFullName = form.owner.value.trim(); // frontend "owner"
    const activity = form.activity.value;            // frontend "activity" (game/table/vr/other)
    const count = parseInt(form.count.value, 10);    // остаётся локально, бек игнорирует
    const date = form.date.value;                    // YYYY-MM-DD
    const startTime = form.start_time.value;         // HH:MM
    const endTime = form.end_time.value;             // HH:MM

    // Валидация (как у вас было)
    if (title.length < 5) {
        alert('Название стенда должно содержать не менее 5 символов');
        return;
    }

    const ownerWords = employeeFullName.split(/\s+/).filter(Boolean);
    if (ownerWords.length !== 3) {
        alert('ФИО сотрудника должно состоять из трех слов');
        return;
    }

    if (isNaN(count) || count < 1) {
        alert('Количество участников должно быть положительным числом');
        return;
    }

    // Конвертация даты+времени в ISO для бэкенда
    let startDateTimeIso = null;
    let endDateTimeIso = null;

    if (date && startTime) {
        const [y, mo, d] = date.split('-').map(Number);
        const [sh, sm] = startTime.split(':').map(Number);
        const startLocal = new Date(y, (mo || 1) - 1, d || 1, sh || 0, sm || 0, 0, 0);
        startDateTimeIso = toIsoForBackend(startLocal);
    }

    if (date && endTime) {
        const [y, mo, d] = date.split('-').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        const endLocal = new Date(y, (mo || 1) - 1, d || 1, eh || 0, em || 0, 0, 0);
        endDateTimeIso = toIsoForBackend(endLocal);
    }

    // Формируем payload в формате, который ожидает бек (StandDto)
    const payload = {
        name: title,
        volunteerFullName: employeeFullName, // <--- Используем корректное значение
        activityType: activity,
        startDateTime: startDateTimeIso,
        endDateTime: endDateTimeIso
        // не отправляем count/owner как обязательные поля бек-модели,
        // если хотите — можно добавить их как доп. поля, но бек их не ожидает сейчас.
    };

    try {
        const response = await fetch(`http://localhost:8081/api/stands/${currentStandId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const txt = await response.text();
            throw new Error(`Ошибка: ${response.status} — ${txt}`);
        }

        alert('Стенд успешно обновлен!');
        closeSettingsModal();
        await loadStands(); // перезагрузим список
    } catch (error) {
        console.error('Ошибка при обновлении стенда:', error);
        alert('Не удалось обновить стенд: ' + (error.message || 'unknown'));
    }
}

// Обработка удаления стенда
async function handleDeleteStand() {
    if (!currentStandId) return;

    if (!confirm('Вы уверены, что хотите удалить этот стенд?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:8081/api/stands/${currentStandId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }

        alert('Стенд успешно удален!');
        closeSettingsModal();
        await loadStands(); // Перезагружаем список

    } catch (error) {
        console.error('Ошибка при удалении стенда:', error);
        alert('Не удалось удалить стенд');
    }
}

function getActivityType(activity) {
    const types = {
        'GAME_PC': 'Компьютерная игра',
        'GAME_BOARD': 'Настольная игра',
        'VR_AR': 'VR/AR стенд',
        'MASTERCLASS': 'Мастер-класс/лекция',
        'QUIZ_QUEST': 'Викторина или квест',
        'PHOTO_ZONE': 'Фотозона/интерактив',
        // 'other' или старые значения можно удалить, если они больше не используются
    };
    return types[activity] || activity;
}

function formatDate(dateString) {
    if (!dateString) return 'Не указано';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

function formatTime(isoString) {
    if (!isoString) return 'Не указано';
    const date = new Date(isoString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}
