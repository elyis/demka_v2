//Обработка загрузки страницы заявок
document.addEventListener('DOMContentLoaded', function() {
    //Получение всех заявок из базы данных
    fetch('/api/requests')
    .then(response => {
        //Если ответ от сервера 200, то заявка успешно получена
        if(response.status === 200)
        {
            return response.json();
        }
        //Если ответ от сервера 401, то пользователь не авторизован
        else if(response.status === 401)
        {
            window.location.href = '/login.html';
        }
    })
    //Обработка полученных заявок и отображение их на странице
    .then(requests => {
        const requestsList = document.getElementById('requests-list');

            requests.forEach(request => {
                const requestElement = document.createElement('div');
                requestElement.innerHTML = `
                    <h3>Заявка #${request.id}</h3>
                    <p>Услуга: ${request.serviceType}</p>
                    <p>Дата: ${request.serviceDate}</p>
                    <p>Время: ${request.serviceTime}</p>
                    <p>Адрес: ${request.address}</p>
                    <p>Статус: ${request.status}</p>
                `;
                requestsList.appendChild(requestElement);
        });
    })
}); 