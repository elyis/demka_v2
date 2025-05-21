// Проверка авторизации при загрузке страницы
fetch('/api/admin/requests')
    .then(response => {
        //Проверка на авторизацию администратора
        if (response.status === 401) {
            window.location.href = '/login.html';
        }
        
        //Если авторизация прошла успешно, то получаем данные из запроса
        return response.json();
    })
    .then(requests => {
        //Получение списка заявок и отображение их на странице
        const requestsList = document.getElementById('requests-list');
        requests.forEach(request => {
            const requestElement = document.createElement('div');
            requestElement.innerHTML = `
                <h3>Заявка #${request.id}</h3>
                <p><strong>Адрес:</strong> ${request.address}</p>
                <p><strong>Телефон:</strong> ${request.phone}</p>
                <p><strong>Дата:</strong> ${request.serviceDate}</p>
                <p><strong>Время:</strong> ${request.serviceTime}</p>
                <p><strong>Тип услуги:</strong> ${request.serviceType}</p>
                <p><strong>Способ оплаты:</strong> ${request.paymentType}</p>
                <p><strong>Статус:</strong> ${request.status}</p>
                ${request.cancelReason ? `<p><strong>Причина отмены:</strong> ${request.cancelReason}</p>` : ''}
                <div class="request-actions">
                    <select id="status-${request.id}">
                        <option value="new" ${request.status === 'new' ? 'selected' : ''}>Новая</option>
                        <option value="in_progress" ${request.status === 'in_progress' ? 'selected' : ''}>В работе</option>
                        <option value="completed" ${request.status === 'completed' ? 'selected' : ''}>Выполнена</option>
                        <option value="cancelled" ${request.status === 'cancelled' ? 'selected' : ''}>Отменена</option>
                    </select>
                    <input type="text" id="reason-${request.id}" placeholder="Причина отмены" style="display: none;">
                    <button onclick="updateRequest(${request.id})">Обновить статус</button>
                </div>
            `;
            requestsList.appendChild(requestElement);

            // Показываем поле для причины отмены только если статус "Отменена"
            const statusSelect = document.getElementById(`status-${request.id}`);
            const reasonInput = document.getElementById(`reason-${request.id}`);
            
            statusSelect.addEventListener('change', () => {
                reasonInput.style.display = statusSelect.value === 'cancelled' ? 'block' : 'none';
            });
        });
    })
    .catch(error => {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при загрузке заявок');
    });

//Обновление статуса заявки
function updateRequest(requestId) {
    //Получение данных из запроса в формате JSON: статус и причина отмены
    const status = document.getElementById(`status-${requestId}`).value;
    const reason = document.getElementById(`reason-${requestId}`).value;

    //Отправка данных на сервер для обновления статуса заявки
    fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            requestId,
            status,
            cancelReason: status === 'cancelled' ? reason : null
        })
    })
    .then(response => response.json())
    .then(data => {
        //Если статус заявки обновлен, то перезагружаем страницу для обновления данных (можно просто через обновление страницы f5)
        alert('Статус заявки обновлен');
        location.reload();
    })
} 