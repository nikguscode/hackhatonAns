// stand_selector.js - Управление выбором стенда для суперадмина

const STANDS_API_URL = 'http://127.0.0.1:8081/api/stands';
const SELECTED_STAND_KEY = 'selectedStandId';

class StandSelector {
    constructor() {
        this.standSelector = document.getElementById('standSelector');
        this.standSelect = document.getElementById('standSelect');
        this.userRole = sessionStorage.getItem('userRole');
        this.selectedStandId = null;
        this.stands = [];
        
        this.init();
    }

    init() {
        // Показываем селектор только для суперадмина
        if (this.userRole === 'super_admin' && this.standSelector) {
            this.standSelector.classList.remove('hidden');
            this.loadStands();
            this.setupEventListeners();
            this.loadSelectedStand();
        }
    }

    async loadStands() {
        try {
            const response = await fetch(STANDS_API_URL, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Ошибка загрузки стендов: ${response.status}`);
            }

            this.stands = await response.json();
            this.populateStandSelect(this.stands);
        } catch (error) {
            console.error('Ошибка загрузки стендов:', error);
            this.showError('');
        }
    }

    populateStandSelect(stands) {
        if (!this.standSelect) return;

        // Очищаем селектор
        this.standSelect.innerHTML = '<option value="">Выберите стенд...</option>';

        // Добавляем стенды в селектор
        stands.forEach(stand => {
            const option = document.createElement('option');
            option.value = stand.id;
            option.textContent = `${stand.title} (${stand.owner})`;
            this.standSelect.appendChild(option);
        });

        // Восстанавливаем выбранный стенд
        this.loadSelectedStand();
    }

    setupEventListeners() {
        if (this.standSelect) {
            this.standSelect.addEventListener('change', (e) => {
                this.selectStand(e.target.value);
            });
        }
    }

    selectStand(standId) {
        this.selectedStandId = standId;
        
        // Сохраняем выбранный стенд в localStorage
        if (standId) {
            localStorage.setItem(SELECTED_STAND_KEY, standId);
            this.updateStandInfo(standId);
        } else {
            localStorage.removeItem(SELECTED_STAND_KEY);
            this.hideStandInfo();
        }

        // Уведомляем другие компоненты об изменении стенда
        this.dispatchStandChangeEvent(standId);
    }

    updateStandInfo(standId) {
        const standInfo = document.getElementById('selectedStandInfo');
        const standName = document.getElementById('selectedStandName');
        const standOwner = document.getElementById('selectedStandOwner');
        
        if (standInfo && standName && standOwner) {
            // Находим стенд по ID
            const stand = this.stands ? this.stands.find(s => s.id == standId) : null;
            if (stand) {
                standName.textContent = stand.title;
                standOwner.textContent = stand.owner;
                standInfo.classList.remove('hidden');
            }
        }
    }

    hideStandInfo() {
        const standInfo = document.getElementById('selectedStandInfo');
        if (standInfo) {
            standInfo.classList.add('hidden');
        }
    }

    loadSelectedStand() {
        const savedStandId = localStorage.getItem(SELECTED_STAND_KEY);
        if (savedStandId && this.standSelect) {
            this.standSelect.value = savedStandId;
            this.selectedStandId = savedStandId;
            this.updateStandInfo(savedStandId);
        }
    }

    getSelectedStandId() {
        return this.selectedStandId || localStorage.getItem(SELECTED_STAND_KEY);
    }

    dispatchStandChangeEvent(standId) {
        const event = new CustomEvent('standChanged', {
            detail: { standId: standId }
        });
        window.dispatchEvent(event);
    }

    showError(message) {
        if (this.standSelect) {
            this.standSelect.innerHTML = `<option value="">${message}</option>`;
        }
    }

    // Метод для получения информации о текущем стенде
    async getCurrentStandInfo() {
        const standId = this.getSelectedStandId();
        if (!standId) return null;

        try {
            const response = await fetch(`${STANDS_API_URL}/${standId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Ошибка загрузки стенда: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка получения информации о стенде:', error);
            return null;
        }
    }
}

// Инициализируем селектор стенда при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.standSelector = new StandSelector();
});

// Экспортируем класс для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StandSelector;
}
