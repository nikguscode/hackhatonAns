const BACKEND_PING_URL = 'http://127.0.0.1:8081/api/ping'; 
const LOGIN_PATH = 'login.html'; 

const PAGE_ROLES = {
    'main.html': ['super_admin', 'volunteer'], 
    'scan.html': ['super_admin', 'volunteer'],
    'stands_add.html': ['super_admin'], 
    'stands.html': ['super_admin'],
    'vueue.html': ['super_admin', 'volunteer'],
    'watch.html': ['super_admin', 'volunteer']
};

async function runBackendCheck() {
    // Если мы уже на странице логина, просто переходим к проверке доступа
    if (window.location.pathname.split('/').pop() === LOGIN_PATH) {
        // Мы вызываем checkAccess через DOMContentLoaded, чтобы убедиться, что DOM готов
        // до того, как checkAccess вызовет updateNavigationVisibility
        document.addEventListener('DOMContentLoaded', checkAccess);
        return;
    }

    try {
        const response = await fetch(BACKEND_PING_URL, {
            method: 'GET',
            credentials: 'include'
        });

        // Бэкенд возвращает 302/307, если сессия истекла или не существует
        if (response.status === 302 || response.status === 307) {
            window.location.replace(LOGIN_PATH);
            return; 
        }
        
        if (response.ok) {
            const body = document.body;
            body.classList.remove('auth-loading');
            body.classList.add('auth-loaded');
            
            checkAccess(); 
            // document.addEventListener('DOMContentLoaded', checkAccess);
            
            window.dispatchEvent(new Event('authLoaded')); 
            
            return;
        }

        // Если ответ не 200 и не 302/307, считаем это ошибкой
        if (response.status !== 200) {
            console.error(`Бэкенд вернул ошибку ${response.status}. Перенаправление на логин.`);
            window.location.replace(LOGIN_PATH);
        }
    } catch (e) {
        console.error("Нет соединения с бэкендом, перенаправление:", e);
        window.location.replace(LOGIN_PATH);
    }
}

runBackendCheck();

function checkAccess() {
    const userRole = sessionStorage.getItem('userRole');
    // Получаем имя текущего файла: 'index.html', 'main.html', и т.д.
    const currentPage = window.location.pathname.split('/').pop();
    
    // 1. Проверка авторизации: если нет роли и не на логине -> на логин.
    if (!userRole) {
        if (currentPage !== LOGIN_PATH) {
            console.log("Нет роли. Перенаправление на логин.");
            window.location.replace(LOGIN_PATH);
        }
        return;
    }

    // 2. Логика перенаправления после входа (для волонтера)
    // Если пользователь - волонтер и находится на главной или логине/индексе.
    if (userRole === 'volunteer' && 
        (currentPage === 'main.html' || currentPage === 'index.html' || currentPage === LOGIN_PATH)) {
        
        // Перенаправляем волонтера сразу на "Вахту"
        console.log("Волонтер зашел. Перенаправление на watch.html");
        window.location.replace('watch.html'); 
        return;
    }
    
    // 3. Проверка прав доступа для остальных пользователей
    // Если пользователь авторизован, но пытается зайти на страницу без доступа
    const allowedRoles = PAGE_ROLES[currentPage];
    
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        alert("У вас нет прав доступа к этой странице. Вы будете перенаправлены на разрешенную страницу.");
        
        // Если доступ запрещен, перенаправляем в соответствии с ролью
        if (userRole === 'volunteer') {
            // Волонтера перенаправляем на "Вахту"
            window.location.replace('watch.html'); 
        } else {
            // Администратора/Других - на Главную
            window.location.replace('main.html');
        }
        return;
    }
    
    // 4. Обновляем навигационное меню (скрываем ненужные пункты)
    console.log(`Доступ разрешен. Роль: ${userRole}. Обновление навигации.`);
    updateNavigationVisibility(userRole);
}

/**
 * Скрывает пункты меню, недоступные для данной роли.
 * @param {string} role - Роль пользователя
 */
function updateNavigationVisibility(role) {
    const navMain = document.getElementById('nav-main');
    const navStandsAdd = document.getElementById('nav-stands-add');
    const navStands = document.getElementById('nav-stands');

    // Если пользователь - Волонтер, скрываем Главную и Добавление стенда
    if (role === 'volunteer') {
        if (navMain) {
            navMain.style.display = 'none';
        }
        if (navStandsAdd) { navStandsAdd.style.display = 'none'; }
        if (navStands) { navStands.style.display = 'none'; }
    }
}
