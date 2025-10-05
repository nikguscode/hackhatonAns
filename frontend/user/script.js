// === script.js ===

// Уникальный ID пользователя (сохраняется в localStorage)
let userUniqueId = null;
let eventId = null;
let currentActivity = null;
let userQueues = [];
let hasShownPopup = false;
let backendGuestData = null; // Для хранения всего объекта Machine
let participantMachineNumber = null; // <-- НОВОЕ ПОЛЕ для machineNumbe

const ACTIVITY_TYPE_MAP = {
    "GAME_PC": "Компьютерная игра",
    "GAME_BOARD": "Настольная игра",
    "VR_AR": "VR/AR стенд",
    "MASTERCLASS": "Мастер-класс/лекция",
    "QUIZ_QUEST": "Викторина или квест",
    "PHOTO_ZONE": "Фотозона/интерактив"
};

// !!! ХАРДКОДЖЕННЫЕ ОТВЕТЫ ДЛЯ FAQ !!!
const FAQ_ANSWERS = {
    '1': 'Чтобы добавиться в очередь, просто отсканируйте QR-код на стенде. Если вы уже на странице стенда, нажмите "Да" во всплывающем окне. Ваш номер участника будет автоматически сохранен и использован.',
    '2': 'Когда подойдет ваша очередь, волонтер на стенде отсканирует ваш QR-код. Следите за своим местом в очереди в реальном времени (эта функция будет добавлена позже) или просто оставайтесь поблизости.',
    '3': 'Да, вы можете выйти из очереди в любое время, нажав кнопку "Выйти из очереди" в секции "Ваши очереди".',
    '4': 'Обратитесь к любому волонтеру на стойке информации или непосредственно к волонтеру стенда, где вы хотите получить помощь.'
};

// Генерация или получение уникального ID пользователя
function generateOrRetrieveUserId() {
    let id = localStorage.getItem('userUniqueId');
    if (!id) {
        id = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
        localStorage.setItem('userUniqueId', id);
    }
    return id;
}

// === Обновленная generateParticipantNumber() ===
function generateParticipantNumber() {
    // 1. Если machineNumber был загружен с бэкенда, используем его.
    if (participantMachineNumber) {
        // Мы используем MachineNumber напрямую, но обрезаем/дополняем его до 6 символов, 
        // чтобы сохранить формат, если он не соответствует 6 символам.
        // Если MachineNumber всегда 6 символов (как '9RBAIL'), то padStart не нужен.
        const pn = participantMachineNumber.slice(-6).toUpperCase().padStart(6, '#');
        
        // ВАЖНО: Мы не сохраняем этот номер в localStorage, 
        // так как он должен приходить с бэкенда для каждой сессии.
        
        return pn;
    }


    // 2. Логика Fallback: Используем старый метод (на основе локального userUniqueId)
    const key = `participantNumber_${eventId || 'default'}`;
    let existing = localStorage.getItem(key);
    if (existing) return existing;

    let pn = null;
    // Это запасной вариант, если инициализация с бэкендом не удалась.
    if (userUniqueId && /^[0-9]+$/.test(userUniqueId)) {
        pn = userUniqueId.slice(-6).padStart(6, '0');
    } else {
        pn = (Date.now() % 1000000).toString().padStart(6, '0');
    }

    localStorage.setItem(key, pn);
    return pn;
}
// === Добавление секции QR-кода (УБРАНЫ КНОПКИ) ===
function addQRCodeSection() {
    console.log('=== ADDING QR CODE SECTION ===');
    const container = document.querySelector('.max-w-md');
    if (!container) {
        console.error('Container not found! Cannot add QR code section.');
        return;
    }

    const existingSection = document.getElementById('qrCodeSection');
    if (existingSection) existingSection.remove();

    if (!userUniqueId) userUniqueId = generateOrRetrieveUserId();
    if (!eventId) eventId = '123';

    const participantNumber = generateParticipantNumber();
    const payload = `https://tbank.com/events/${encodeURIComponent(eventId)}?participant=${encodeURIComponent(participantNumber)}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=2&data=${encodeURIComponent(payload)}`;

    const section = document.createElement('div');
    section.id = 'qrCodeSection';
    // Добавлен класс cursor-pointer для визуализации кликабельности
    section.className = 'bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-4 text-center cursor-pointer';
    section.innerHTML = `
        <h2 class="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4">Ваш QR-код</h2>
        <div class="mb-2 sm:mb-3">
            <p class="text-xs sm:text-sm text-gray-600 mb-1">
                Номер участника: <span id="participantNumber" class="font-mono text-blue-600">${participantNumber}</span>
            </p>
            <p class="text-xs text-gray-500 mb-2 sm:mb-3">Нажмите на QR-код для увеличения</p>
        </div>
        <div id="qrCodeContainer" class="mb-3 sm:mb-4 flex justify-center items-center">
            <img id="qrImage" alt="QR-код" src="${qrApiUrl}" 
                 width="120" height="120" class="sm:w-[150px] sm:h-[150px]" 
                 style="border:1px solid #e5e7eb; border-radius:8px;" />
        </div>
        `;
    
    // Добавляем обработчик клика для увеличения QR-кода
    section.onclick = function() {
        showZoomedQrCode(qrApiUrl);
    };


    const container_div = section.querySelector('#qrCodeContainer');
    const img = section.querySelector('#qrImage');
    
    img.onerror = function() {
        console.error('Не удалось загрузить QR-изображение с API, показываем текст вместо изображения');
        container_div.innerHTML = `
            <div class="p-3 border-2 border-dashed border-gray-300 rounded-lg">
                <p class="text-red-500 mb-1">Не удалось сгенерировать QR-изображение</p>
                <p class="text-sm text-gray-600">Используемые данные:</p>
                <p class="text-xs font-mono bg-gray-100 p-2 rounded mt-2">${payload}</p>
            </div>
        `;
    };

    const userQueuesSection = document.getElementById('userQueuesSection');
    if (userQueuesSection) {
        userQueuesSection.insertAdjacentElement('afterend', section);
    } else {
        const faqSection = container.querySelector('.bg-white.p-4.rounded-lg.shadow-lg');
        if (faqSection) {
            faqSection.insertAdjacentElement('beforebegin', section);
        } else {
            const header = container.querySelector('header');
            if (header) header.insertAdjacentElement('afterend', section);
            else container.appendChild(section);
        }
    }

    console.log('QR section inserted, payload:', payload);
}

// === Функция для увеличения QR-кода (ПУНКТ 2) ===
function showZoomedQrCode(qrUrl) {
    const existingOverlay = document.getElementById('qrZoomOverlay');
    if (existingOverlay) {
        existingOverlay.remove();
        return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'qrZoomOverlay';
    overlay.className = 'qr-zoom-overlay';
    
    const img = document.createElement('img');
    img.src = qrUrl.replace('size=150x150', 'size=500x500'); // Увеличиваем размер для лучшего сканирования
    img.alt = 'Увеличенный QR-код';

    overlay.appendChild(img);
    document.body.appendChild(overlay);

    // Закрытие по клику на оверлей
    overlay.onclick = function() {
        overlay.remove();
    };
}


// === Обновление списка очередей ===
function updateUserQueuesSection() {
    const container = document.getElementById('userQueuesSection');
    if (!container) return;

    if (userQueues.length === 0) {
        container.innerHTML = `<p class="text-gray-500 text-center">Вы пока не записаны в очереди</p>`;
        return;
    }

    const getReadableActivityType = (type) => {
        return ACTIVITY_TYPE_MAP[type] || type || 'N/A';
    };

    const formatQueuedAt = (timestamp) => {
        if (!timestamp) return 'N/A';
        try {
            // Форматирование даты, используя встроенные возможности JS
            const date = new Date(timestamp);
            // Формат: 05.10.2025 01:42
            return date.toLocaleDateString('ru-RU', { 
                day: '2-digit', month: '2-digit', year: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
            });
        } catch (e) {
            console.error("Error formatting date:", e);
            return 'N/A';
        }
    };

// --- Функция для генерации заглушек (ВРЕМЕННО) ---
    const getQueueStatusMocks = (index) => {
        // Заглушки для демонстрации
        const peopleAhead = (userQueues.length - index) * 2 - 1; 
        const waitTime = peopleAhead > 5 ? `~${Math.ceil(peopleAhead / 3) * 5} мин` : 'менее 10 мин';
        
        return { peopleAhead, waitTime };
    };
    // ----------------------------------------------------


    container.innerHTML = `
        <h2 class="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4">Ваши очереди</h2>
        <div class="space-y-2 sm:space-y-3">
            ${userQueues.map((q, index) => {
                const status = getQueueStatusMocks(index); // Получаем заглушки

                return `
                <div class="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
                    <p class="font-semibold text-sm sm:text-base text-black">${q.standName || 'Неизвестная активность'}</p>
                    <p class="text-xs sm:text-sm text-gray-600 mt-1">
                        Тип: <span class="font-medium">${getReadableActivityType(q.standActivityType)}</span>
                    </p>
                    
                    <p class="text-sm text-black mt-2 font-medium">
                        Впереди: <span class="text-blue-600 font-bold">${status.peopleAhead} чел.</span>
                    </p>
                    <p class="text-sm text-black mt-1 font-medium">
                        Ожидание: <span class="text-green-600 font-bold">${status.waitTime}</span>
                    </p>
                    <p class="text-xs text-gray-500 mt-2 border-t border-dashed pt-2">Время записи: ${formatQueuedAt(q.queuedAt)}</p>
                    <button class="leave-queue-btn w-full mt-2 py-1 px-3 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm rounded-lg transition-colors" data-queue-index="${index}">
                        Выйти из очереди
                    </button>
                </div>
            `;
            }).join('')}
        </div>
    `;

    // Добавляем обработчики для кнопок выхода из очереди
    container.querySelectorAll('.leave-queue-btn').forEach(btn => {
        btn.onclick = function() {
            const queueIndex = parseInt(this.dataset.queueIndex);
            leaveQueue(queueIndex);
        };
    });
}

// === Инициализация FAQ (ПУНКТ 3) ===
function initializeFAQ() {
    document.querySelectorAll('.faq-item').forEach(item => {
        const questionId = item.dataset.question;
        const answerElement = item.querySelector('.faq-answer');
        
        // Вставляем ответ из хардкоженной константы
        if (answerElement) {
            answerElement.textContent = FAQ_ANSWERS[questionId] || 'Ответ временно недоступен.';
        }
        
        // Обработчик клика
        item.addEventListener('click', () => {
            // Скрываем все остальные ответы
            document.querySelectorAll('.faq-answer').forEach(ans => {
                if (ans !== answerElement) {
                    ans.classList.add('hidden');
                }
            });
            // Переключаем видимость текущего ответа
            answerElement.classList.toggle('hidden');
        });
    });
}


// ... (Остальной код остается без изменений, кроме того, что он теперь использует обновленную версию postJoinQueue) ...
// === Всплывающее окно для присоединения к очереди ===
function showJoinQueuePopup() {
    console.log('=== DEBUG POPUP ===');
    console.log('currentActivity:', currentActivity);
    console.log('userQueues:', userQueues);
    
    // Если уже показывали всплывающее окно, не показываем снова
    if (hasShownPopup) {
        console.log('Popup already shown, skipping');
        return;
    }
    
    // Создаем fallback активность если нет данных
    if (!currentActivity) {
        currentActivity = {
            id: '1',
            name: 'Активность',
            activityType: 'Стенд',
            volunteerFullName: 'Волонтер',
            participants: []
        };
    }
    
    // Проверяем, не в очереди ли уже пользователь
    const alreadyInQueue = userQueues.some(queue => 
        queue.queueId === currentActivity?.id && queue.userId === userUniqueId
    );
    
    if (alreadyInQueue) {
        console.log('User already in queue, not showing popup');
        return;
    }
    
    console.log('Showing popup...');
    
    const popup = document.createElement('div');
    popup.id = 'joinQueuePopup';
    popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50';
    popup.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm mx-4">
            <h3 class="text-lg font-semibold text-black mb-4">Добро пожаловать!</h3>
            <p class="text-gray-800 mb-6">Хотите присоединиться к очереди "${currentActivity?.name || 'активности'}"?</p>
            <div class="flex gap-3">
                <button id="joinYesBtn" class="flex-1 py-2 bg-yellow-400 text-black rounded-lg font-semibold">Да</button>
                <button id="joinNoBtn" class="flex-1 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold">Нет</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Event listeners for popup
    document.getElementById('joinYesBtn').onclick = function() {
        popup.remove();
        joinCurrentQueue();
        hasShownPopup = true;
    };
    
    document.getElementById('joinNoBtn').onclick = function() {
        popup.remove();
        hasShownPopup = true;
    };
    
    // Закрытие по клику на фон
    popup.onclick = function(e) {
        if (e.target === popup) {
            popup.remove();
            hasShownPopup = true;
        }
    };
}

// === Присоединение к очереди ===
async function joinCurrentQueue() {
    if (!currentActivity || !currentActivity.id) {
        console.error("Cannot join queue: currentActivity or ID is missing.");
        return;
    }
    
    const participantNumber = generateParticipantNumber();

    const success = await postJoinQueue(currentActivity.id, participantNumber);
    
    if (success) {
        console.log('User successfully joined queue. List updated from backend.');
    } else {
         console.error('Queue join aborted due to backend failure.');
    }
}

async function postLeaveQueue(standId) {
    console.log(`Attempting to leave queue for stand ${standId}`);
    // Эндпоинт для выхода из очереди.
    const url = `http://127.0.0.1:8081/api/guest/stands/${standId}`; 

    try {
        const response = await fetch(url, {
            method: "DELETE", // Используем DELETE метод
            credentials: 'include' 
        });

        if (response.ok || response.status === 204) { 
            console.log('Successfully left queue on backend. Status:', response.status);
            return true;
        } else {
            const errorText = await response.text();
            console.error(`Failed to leave queue. Status: ${response.status}, Error: ${errorText}`);
            alert(`Не удалось выйти из очереди: ${response.status} ${errorText.substring(0, 50)}`);
            return false;
        }
    } catch (error) {
        console.error('Network error during queue leave:', error);
        alert('Ошибка сети при попытке выхода из очереди.');
        return false;
    }
}

// === Выход из очереди (ОБНОВЛЕНО С DELETE ЗАПРОСОМ) ===
function leaveQueue(queueIndex) {
    if (queueIndex >= 0 && queueIndex < userQueues.length) {
        const queueToLeave = userQueues[queueIndex];
        
        // Проверяем наличие ID стенда для запроса
        if (!queueToLeave.standId) {
            alert('Ошибка: Отсутствует ID стенда для выхода из очереди.');
            return;
        }
        
        // Показываем подтверждение
        const confirmPopup = document.createElement('div');
        confirmPopup.className = 'fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50';
        confirmPopup.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm mx-4">
                <h3 class="text-lg font-semibold text-black mb-4">Подтверждение</h3>
                <p class="text-gray-800 mb-6">Вы уверены, что хотите выйти из очереди "${queueToLeave.standName || 'активности'}"?</p>
                <div class="flex gap-3">
                    <button id="confirmLeaveBtn" class="flex-1 py-2 bg-red-500 text-white rounded-lg font-semibold">Да, выйти</button>
                    <button id="cancelLeaveBtn" class="flex-1 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold">Отмена</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmPopup);
        
        // Обработчики для подтверждения
        document.getElementById('confirmLeaveBtn').onclick = async function() {
            // Отключаем кнопку, пока идет запрос
            this.disabled = true; 
            this.textContent = 'Выход...';
            
            const success = await postLeaveQueue(queueToLeave.standId);

            confirmPopup.remove(); 
            
            if (success) {
                // Если запрос успешен, повторно загружаем свежий список очередей и обновляем UI
                userQueues = await fetchUserQueuesFromBackend();
                updateUserQueuesSection();
            }
        };
        
        document.getElementById('cancelLeaveBtn').onclick = function() {
            confirmPopup.remove();
        };
        
        // Закрытие по клику на фон
        confirmPopup.onclick = function(e) {
            if (e.target === confirmPopup) {
                confirmPopup.remove();
            }
        };
    }
}

async function fetchUserQueuesFromBackend() {
    console.log('Fetching user queues from backend...');
    const url = "http://127.0.0.1:8081/api/guest/stands"; 
    
    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: 'include' 
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Queues loaded successfully:', data);
            return Array.isArray(data) ? data : []; 
        } else {
            console.error('Failed to fetch user queues:', response.status);
            return [];
        }
    } catch (error) {
        console.error('Network error while fetching queues:', error);
        return [];
    }
}

// === Инициализация страницы (ОБНОВЛЕННЫЙ БЛОК) ===
document.addEventListener('DOMContentLoaded', () => {
    console.log('App loaded');
    
    // 1. Инициализируем FAQ
    initializeFAQ();
    
    // 2. Инициализируем сессию и получаем куки с бэкенда (JSESSIONID)
    initializeBackendSession().then(async () => {
        
        // 3. Получаем ID стенда из URL
        const standId = getStandIdFromUrl();
        console.log("URL standId:", standId);

        // 4. После инициализации сессии и куки
        userUniqueId = generateOrRetrieveUserId();
        eventId = 'demo-event'; 
        
        // 5. Если standId найден, запрашиваем данные стенда (GET)
        if (standId) {
            const standData = await fetchStandDetails(standId);
            if (standData) {
                currentActivity = standData; 
                console.log("Stand data loaded:", currentActivity);
            } else {
                console.error("Could not load stand data. Using fallback/null.");
                currentActivity = null; 
            }
        } else {
            currentActivity = null; 
        }
        
        // 6. ЗАГРУЖАЕМ ОЧЕРЕДИ С БЭКЕНДА
        userQueues = await fetchUserQueuesFromBackend();
        
        // 7. Создание секций и отображение
        const container = document.querySelector('.max-w-md');
        const userQueuesSection = document.createElement('div');
        userQueuesSection.id = 'userQueuesSection';
        userQueuesSection.className = 'bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-4';
        
        const faqSection = document.getElementById('faqSection');
        if (faqSection) {
            faqSection.insertAdjacentElement('beforebegin', userQueuesSection);
        } else {
            container.appendChild(userQueuesSection);
        }
        
        addQRCodeSection();
        updateUserQueuesSection();
        
        // 8. Показываем всплывающее окно
        if (currentActivity) {
            setTimeout(() => {
                showJoinQueuePopup();
            }, 500);
        } else {
            console.log("No stand ID found in URL, skipping join popup.");
        }
    });
});

// === Обновленная initializeBackendSession() ===
async function initializeBackendSession() {
    console.log('Fetching session from backend...');
    const url = "http://127.0.0.1:8081/api/guest"; 
    
    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: 'include' 
        });

        if (response.ok) {
            const data = await response.json(); 
            backendGuestData = data; 
            
            // 1. Сохраняем uniqueId в localStorage для userUniqueId
            if (data && data.uniqueId) {
                localStorage.setItem('userUniqueId', data.uniqueId);
                userUniqueId = data.uniqueId; 
            }

            // 2. !!! СОХРАНЯЕМ MACHINE NUMBER !!!
            if (data && data.machineNumber) {
                // Сохраняем machineNumber для использования в QR и как Номер участника
                participantMachineNumber = data.machineNumber; 
                console.log('Backend session initialized. Machine Number:', participantMachineNumber);
            }
            
            return true;
        } else {
            console.error('Failed to initialize backend session:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Network error during session initialization:', error);
        return false;
    }
}


function getStandIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('standId');
}

async function fetchStandDetails(standId) {
    console.log(`Fetching stand details for ID: ${standId}`);
    const url = `http://127.0.0.1:8081/api/stands/${standId}`;
    
    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: 'include' 
        });

        if (response.ok) {
            return await response.json(); 
        } else {
            console.error(`Failed to fetch stand details. Status: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error('Network error while fetching stand details:', error);
        return null;
    }
}

async function postJoinQueue(standId, participantNumber) {
    console.log(`Attempting to join queue for stand ${standId} with participant number: ${participantNumber}`);
    const url = `http://127.0.0.1:8081/api/guest/stands/${standId}`; 

    try {
        const response = await fetch(url, {
            method: "POST",
            credentials: 'include',
            // !!! Отправляем participantNumber в теле запроса !!!
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                participantNumber: participantNumber
            })
        });

        if (response.ok || response.status === 204) { 
            console.log('Successfully joined queue on backend. Status:', response.status);
            
            userQueues = await fetchUserQueuesFromBackend(); 
            updateUserQueuesSection(); 
            
            return true;
        } else {
            const errorText = await response.text();
            console.error(`Failed to join queue. Status: ${response.status}, Error: ${errorText}`);
            alert(`Не удалось записаться в очередь: ${response.status} ${errorText.substring(0, 50)}`);
            return false;
        }
    } catch (error) {
        console.error('Network error during queue join:', error);
        alert('Ошибка сети при попытке записи в очередь.');
        return false;
    }
}