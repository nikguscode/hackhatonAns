// Helper to generate random strings
function generateRandomString(length, charset) {
    const availableChars = charset || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    const array = new Uint32Array(length);
    if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(array);
        for (let i = 0; i < length; i++) {
            result += availableChars[array[i] % availableChars.length];
        }
    } else {
        for (let i = 0; i < length; i++) {
            result += availableChars[Math.floor(Math.random() * availableChars.length)];
        }
    }
    return result;
}

document.getElementById("standForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    const form = e.target;

    const formData = {
        name: form.title.value.trim(),
        volunteerFullName: form.owner.value.trim(),
        activityType: form.activity.value,
        date: form.date.value,
        start_time: form.start_time?.value || "",
        end_time: form.end_time?.value || "",
        count: parseInt(form.count.value, 10)
    };

    // Парсим дату и время
    let startAtISO = null;
    let endAtISO = null;
    if (formData.date && formData.start_time) {
        const [y, mo, d] = formData.date.split('-').map(Number);
        const [sh, sm] = formData.start_time.split(':').map(Number);
        const startLocal = new Date(y, (mo || 1) - 1, d || 1, sh || 0, sm || 0, 0, 0);
        startAtISO = startLocal.toISOString();
    }
    if (formData.date && formData.end_time) {
        const [y, mo, d] = formData.date.split('-').map(Number);
        const [eh, em] = formData.end_time.split(':').map(Number);
        const endLocal = new Date(y, (mo || 1) - 1, d || 1, eh || 0, em || 0, 0, 0);
        endAtISO = endLocal.toISOString();
    }

    // Генерация логина и пароля
    const generatedLogin = `stand_${generateRandomString(6, "abcdefghijklmnopqrstuvwxyz0123456789")}`;
    const generatedPassword = generateRandomString(12);

    // Валидация
    let isValid = true;
    let errorMessage = "";

    if (formData.name.length < 5) {
        errorMessage += "Название стенда должно содержать не менее 5 символов.\n";
        isValid = false;
    }

    const ownerWords = formData.volunteerFullName.split(/\s+/).filter(word => word.length > 0);
    if (ownerWords.length !== 3) {
        errorMessage += "ФИО сотрудника должно состоять из трех слов.\n";
        isValid = false;
    }

    if (isNaN(formData.count) || formData.count < 1) {
        errorMessage += "Количество участников должно быть положительным числом.\n";
        isValid = false;
    }

    if (!formData.date) {
        errorMessage += "Укажите дату мероприятия.\n";
        isValid = false;
    }
    if (!formData.start_time) {
        errorMessage += "Укажите время начала.\n";
        isValid = false;
    }
    if (!formData.end_time) {
        errorMessage += "Укажите время конца.\n";
        isValid = false;
    }
    if (startAtISO && endAtISO) {
        if (new Date(endAtISO).getTime() <= new Date(startAtISO).getTime()) {
            errorMessage += "Время конца должно быть позже времени начала.\n";
            isValid = false;
        }
    }

    if (!isValid) {
        alert("Пожалуйста, исправьте ошибки:\n" + errorMessage);
        return;
    }

    // Блокировка кнопки
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "СОЗДАНИЕ...";
    }

    try {
        // 1. Создаём стенд
        const standResponse = await fetch("http://127.0.0.1:8081/api/stands", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify({
                name: formData.name,
                volunteerFullName: formData.volunteerFullName,
                activityType: formData.activityType,
                startDateTime: startAtISO,
                endDateTime: endAtISO,
                count: formData.count
            })
        });

        if (!standResponse.ok) {
            throw new Error(`Ошибка при создании стенда: ${standResponse.status}`);
        }

        const standId = await standResponse.text();

        if (!standId) {
            throw new Error("Сервер не вернул ID стенда");
        }

        const [firstName, secondName, lastName] = ownerWords;

        const employeeResponse = await fetch("http://localhost:8081/api/employees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify({
                login: generatedLogin,
                password: generatedPassword,
                firstName: firstName,
                secondName: secondName,
                lastName: lastName,
                standId: standId
            })
        });

        if (!employeeResponse.ok) {
            throw new Error(`Ошибка при создании работника: ${employeeResponse.status}`);
        }

        // Успех!
        alert(`Стенд успешно создан!\nЛогин: ${generatedLogin}\nПароль: ${generatedPassword}`);
        form.reset();

    } catch (error) {
        console.error("Ошибка при отправке:", error);
        alert("Не удалось создать стенд или работника: " + error.message);
    } finally {
        // Разблокировка кнопки
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "СОЗДАТЬ СТЕНД";
        }
    }
});