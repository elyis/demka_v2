//Обработка отправки формы регистрации при нажатии на кнопку "Зарегистрироваться"
document.getElementById("register-form").addEventListener("submit", (e) => {
  e.preventDefault();

  // Получение значений из полей ввода
  let login = document.getElementById("login").value;
  let password = document.getElementById("password").value;
  let phone = document.getElementById("phone").value;
  let email = document.getElementById("email").value;
  let fullName = document.getElementById("fullName").value;

  // Создание JSON строки с данными пользователя
  let body = JSON.stringify({ login, password, phone, email, fullName });

  // Отправка данных на сервер
  //Метод POST -- отправка данных на сервер на создание пользователя
  //Сервер принимает данные в формате JSON, поэтому мы преобразуем данные в JSON строку и в headers указываем Content-Type: application/json
  fetch("/api/register", {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": "application/json",
    },
  })
  //Обработка ответа от сервера
    .then((response) => {
        //Если ответ от сервера 200, то пользователь успешно зарегистрирован
      if(response.status === 200)
      {
        window.location.href = '/requests.html';
      }

      //Если ответ от сервера 409, то пользователь с таким логином уже существует
      else if(response.status === 409)
      {
        alert("Пользователь с таким логином уже существует");
      }
    })
});
