const LOGIN_API_URL = "http://127.0.0.1:8081/api/login"; 
const MAIN_PAGE_URL = "main.html";


// --- РЕГУЛЯРНЫЕ ВЫРАЖЕНИЯ ---
const USERNAME_REGEX = /^[a-zA-Z0-9_]{4,20}$/; 
const PASSWORD_REGEX = /^.{6,50}$/;

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;
    const loginButton = document.getElementById('loginButton');
    const errorMessage = document.getElementById('error-message');


    errorMessage.classList.add('hidden');
    loginButton.disabled = true;
    loginButton.textContent = "Проверка...";

    if (!USERNAME_REGEX.test(username)) {
        errorMessage.textContent = "Некорректный формат логина.";
        errorMessage.classList.remove('hidden');
        loginButton.disabled = false;
        loginButton.textContent = "ВОЙТИ";
        return; 
    }
    
    if (!PASSWORD_REGEX.test(password)) {
        errorMessage.textContent = "Некорректный формат пароля.";
        errorMessage.classList.remove('hidden');
        loginButton.disabled = false;
        loginButton.textContent = "ВОЙТИ";
        return;
    }
    
    // 2. ОТПРАВКА POST-ЗАПРОСА К БЭКЕНДУ
    try {
        const response = await fetch(LOGIN_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // 💡 ВАЖНО: Тело запроса, которое ожидает ваш LoginController
            body: JSON.stringify({
                login: username,
                password: password
            }),
            // 💡 Обязательно для работы с сессионными куками
            credentials: 'include' 
        });

        // 3. ОБРАБОТКА ОТВЕТА
       if (response.ok) { // Статус 200 OK - Успешный вход
            
            // !!! НОВОЕ: Читаем тело ответа (Employee DTO) !!!
            const employeeData = await response.json(); 
            
            // 💡 КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Получение роли и маппинг
            const apiRole = employeeData.role; // Получаем роль из DTO
            let userRole = apiRole; // По умолчанию используем роль из API
            
            // Маппинг роли: ADMIN -> super_admin
            if (apiRole === 'ADMIN') {
                userRole = 'super_admin';
            } else if (apiRole === 'VOLUNTEER') {
                userRole = 'volunteer'; // VOLUNTEER остается VOLUNTEER
            }
            
            // Проверка: Если API вернуло 'VOLUNTEER', userRole будет 'VOLUNTEER'.
            // Если API вернуло 'ADMIN', userRole будет 'super_admin'.
           
            
            // 🚨 СОХРАНЯЕМ РОЛЬ В SESSION STORAGE
            sessionStorage.setItem('userRole', userRole); 
            
            // 💾 СОХРАНЯЕМ DTO В LOCAL STORAGE
            try {
                // Переводим объект в строку JSON для сохранения
                localStorage.setItem('employeeData', JSON.stringify(employeeData));
                console.log("Данные сотрудника сохранены в localStorage.");
                console.log("Сохраненная роль:", userRole);
            } catch (storageError) {
                console.error("Ошибка при сохранении в localStorage:", storageError);
            }

            console.log("Успешный вход. Получена сессионная кука и роль.");
            window.location.href = MAIN_PAGE_URL;

        } else if (response.status === 401) { // Статус 401 Unauthorized - Неверные данные
            console.log("Некорректные данные: 401 Unauthorized.");
            // Пока просто лог, как вы просили.
            
            // Если нужно показать ошибку в форме:
            errorMessage.textContent = "Неверный логин или пароль.";
            errorMessage.classList.remove('hidden');

        } else {
            // Другие ошибки (500 Internal Server Error, 404 Not Found и т.д.)
            console.error(`Ошибка API: Статус ${response.status}`);
            errorMessage.textContent = "Произошла ошибка сервера. Попробуйте позже.";
            errorMessage.classList.remove('hidden');
        }

    } catch (error) {
        // Ошибка сети (бэкенд недоступен, CORS и т.д.)
        console.error("Ошибка сети или соединения:", error);
        errorMessage.textContent = "Не удалось подключиться к серверу. Проверьте соединение.";
        errorMessage.classList.remove('hidden');

    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "ВОЙТИ";
    }
});

