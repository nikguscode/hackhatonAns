document.addEventListener('DOMContentLoaded', () => {
    // Получаем элементы сайдбара и кнопки переключения
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');

    if (sidebar && menuToggle) {
        // Добавляем слушатель события на кнопку-гамбургер
        menuToggle.addEventListener('click', () => {
            // Переключаем класс '-translate-x-full' на сайдбаре.
            // Если класс есть, меню скрыто. Если класса нет, меню выдвинуто (translate-x-0).
            sidebar.classList.toggle('-translate-x-full');
        });

        // Улучшение UX: Закрываем меню при клике на любую ссылку внутри сайдбара
        const navLinks = sidebar.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Скрываем меню
                sidebar.classList.add('-translate-x-full');
            });
        });
    }
});