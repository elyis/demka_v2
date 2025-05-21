
//Обработка отправки формы авторизации при нажатии на кнопку "Войти"
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();

    //Получение значений из полей ввода
    let login = document.getElementById('login').value;
    let password = document.getElementById('password').value;

    //Преобразование данных в формат JSON
    let body = JSON.stringify({ login, password });

    //Отправка данных на сервер для авторизации
    fetch('/api/login', {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json'
        }
    })
    //Обработка ответа от сервера
    .then(async response => {
        //Если ответ от сервера 200, то авторизация прошла успешно
        if(response.status === 200)
        {
            let data = await response.json();
            
            //Если пользователь является администратором, то перенаправляем на страницу администратора
            if(data.isAdmin)
            {
                window.location.href = '/admin.html';
            }
            //Если пользователь не является администратором, то перенаправляем на страницу заявок
            else
            {   
                window.location.href = '/requests.html';
            }
        }
        //Если ответ от сервера 400, то неверный логин или пароль
        else if(response.status === 400)
        {
            alert('Неверный логин или пароль');
        }
    })
})
