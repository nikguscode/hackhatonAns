// scan.js

// API, который должен вернуть уникальную ссылку для регистрации в очереди
const QR_LINK_API = "http://localhost:8080/api/queue/link"; 
// Предполагаемая API-ссылка, которую получит участник (может быть частью вышеуказанного API)
const QUEUE_FRONTEND_URL = "http://your-event-site.com/join/"; 

let qrcodeInstance = null; // Переменная для хранения экземпляра QR-кода

/**
 * Запрашивает ссылку у сервера и генерирует QR-код.
 */
async function generateQrCode() {
    const qrContainer = document.getElementById('qrcode');
    const qrLinkDisplay = document.getElementById('qrLinkDisplay');
    const qrLinkText = document.getElementById('qrLinkText');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    // Очищаем предыдущие состояния
    qrContainer.innerHTML = '';
    qrLinkDisplay.classList.add('hidden');
    errorMessage.classList.add('hidden');

    try {
        // 1. Запрос уникального ID/токена для текущей очереди
        const response = await fetch(QR_LINK_API);
        
        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }

        // Ожидается, что сервер вернет JSON с уникальным токеном: { "token": "UNIQUE_TOKEN_123" }
        const data = await response.json();
        const uniqueToken = data.token; 
        
        if (!uniqueToken) {
            throw new Error("Сервер не вернул токен.");
        }

        // 2. Формирование полной ссылки
        const finalUrl = `${QUEUE_FRONTEND_URL}${uniqueToken}`;

        // 3. Генерация QR-кода
        // Если экземпляр qrcode уже существует, уничтожаем его, чтобы избежать дублирования
        if (qrcodeInstance) {
            qrcodeInstance.clear();
        }
        
        // Создаем новый экземпляр qrcode с увеличенным размером
        qrcodeInstance = new QRCode(qrContainer, {
            text: finalUrl,
            width: 320,
            height: 320,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
        
        // 4. Отображение ссылки
        qrLinkText.textContent = finalUrl;
        qrLinkDisplay.classList.remove('hidden');

    } catch (error) {
        console.error("Ошибка генерации QR-кода:", error);
        
        // Показываем красивое сообщение об ошибке
        qrContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center text-red-500 p-8">
                <svg class="w-16 h-16 mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <p class="text-lg font-medium">Не удалось создать QR-код</p>
                <p class="text-sm text-gray-500 mt-2">Проверьте подключение к серверу</p>
            </div>
        `;
        
        errorMessage.classList.remove('hidden');
        errorText.textContent = error.message;
    }
}

// Автоматически генерируем QR-код при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    generateQrCode();
});