
//Обработка отправки формы создания заявки при нажатии на кнопку "Создать заявку"
document.getElementById('request-form').addEventListener('submit', function(e) {
    e.preventDefault();

    //Получение значений из полей ввода
    const requestData = {
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        serviceDate: document.getElementById('date').value,
        serviceTime: document.getElementById('time').value,
        serviceType: document.getElementById('service').value,
        paymentType: document.getElementById('payment').value
    };

    //Отправка данных на сервер для создания заявки
    fetch('/api/requests', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
    })
    //Обработка ответа от сервера
    .then(response => {
        //Если ответ от сервера 200, то заявка успешно создана
        if (response.status === 200) {
            alert('Заявка успешно создана');
            window.location.href = '/requests.html';
        } 
        //Если ответ от сервера 401, то пользователь не авторизован
        else if(response.status === 401)
        {
            alert('Ошибка при создании заявки');
            window.location.href = '/login.html';
        }
    })
}); 