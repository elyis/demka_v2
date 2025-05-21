const express = require('express');
const session = require('express-session');
const { Sequelize, DataTypes } = require('sequelize');

// Подключение к базе данных
//dialect: 'postgres' - тип базы данных
//host: 'localhost' - хост базы данных
//username: 'postgres' - имя пользователя
//password: 'postgres' - пароль пользователя
//database: 'clean_house' - название базы данных, должна быть создана вручную в pgAdmin

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'postgres',
  database: 'clean_house',
});

//Определение модели пользователя
const User = sequelize.define('User', {
    login: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'client'
    }
  });

//Определение модели заявки
const Request = sequelize.define('Request', {
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    serviceDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    serviceTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    serviceType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    paymentType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'new'
    },
    cancelReason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
  });

User.hasMany(Request);
Request.belongsTo(User);

sequelize.sync();



const app = express();
const PORT = 3000;

// Подключение статических файлов (HTML, CSS, JS) из папки public
app.use(express.static('public'));

// Подключение JSON парсера для получения данных из запроса в формате JSON
app.use(express.json());

// Подключение сессии для хранения данных о пользователе
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
    const { login, password, fullName, phone, email } = req.body;

    // Проверка на наличие пользователя с таким логином
    const user = await User.findOne({ where: { login } });

    // Если пользователь не найден, то создаем нового пользователя
    if(user == null)
    {
        // Создание пользователя
        await User.create({ login, password, fullName, phone, email });
        console.log("Пользователь успешно зарегистрирован");
        return res.status(200).json({ message: "Пользователь успешно зарегистрирован" });
    }

    // Если пользователь найден, то возвращаем ошибку 409 -- пользователь уже существует
    res.status(409).json({ message: "Пользователь с таким логином уже существует" });
})

// Авторизация пользователя
app.post('/api/login', async (req, res) => {
    const { login, password } = req.body;
    //Проверка на учетку администратора
    if(login == 'adminka' && password == 'password')
    {
        req.session.isAdmin = true;
        return res.status(200).json({ isAdmin: true });
    }

    // Проверка на наличие пользователя с таким логином
    const user = await User.findOne({ where: { login } });

    // Если пользователь не найден или пароль не совпадает, то возвращаем ошибку 400 -- неверный логин или пароль
    if(user == null || user.password != password)
    {
        return res.status(400).json({ message: "Неверный логин или пароль" });
    }

    // Создание сессии для пользователя -- сохраняем id и роль пользователя в сессию
    req.session.userId = user.id;
    req.session.isAdmin = user.role == 'admin';

    // Возвращаем статус 200 -- авторизация прошла успешно
    return res.status(200).json({ isAdmin: false });
})

// Создание заявки авторизованным пользователем
app.post('/api/requests', async (req, res) => {
    //Получение данных из запроса в формате JSON
    const { address, phone, serviceDate, serviceTime, serviceType, paymentType } = req.body;

    // Проверка на наличие пользователя в сессии
    if(!req.session.userId)
    {
        return res.status(401).json({ message: "Пользователь не авторизован" });
    }

    // Создание заявки с привязкой к пользователю
    await Request.create({ 
        address, 
        phone, 
        serviceDate, 
        serviceTime, 
        serviceType, 
        paymentType,
        UserId: req.session.userId  // Добавляем связь с пользователем
    });

    // Возвращаем статус 200 -- заявка успешно создана
    return res.status(200).json({ message: "Заявка успешно создана" });
})

// Получение всех заявок пользователя
app.get('/api/requests', async (req, res) => {
    let userId = req.session.userId;

    // Проверка на наличие пользователя в сессии
    if(!userId)
    {
        return res.status(401).json({ message: "Пользователь не авторизован" });
    }

    //Получение всех заявок пользователя по его id
    const requests = await Request.findAll({
        where: {
            UserId: userId
        }
    });

    // Возвращаем статус 200 -- заявка успешно получена
    return res.status(200).json(requests);
})

// Получение всех заявок администратором  
app.get('/api/admin/requests', async (req, res) => {
    // Проверка на наличие администратора в сессии
    if(!req.session.isAdmin)
    {
        return res.status(401).json({ message: "Пользователь не является администратором" });
    }

    //Получение всех заявок из базы данных
    const requests = await Request.findAll();

    // Возвращаем статус 200 -- заявка успешно получена
    return res.status(200).json(requests);
})

// Обновление статуса заявки администратором
app.patch('/api/admin/requests', async (req, res) => {
    // Проверка на наличие администратора в сессии
    if(!req.session.isAdmin)
    {
        return res.status(401).json({ message: "Пользователь не является администратором" });
    }

    //Получение данных из запроса в формате JSON
    const { status, cancelReason, requestId } = req.body;

    //Обновление статуса заявки в базе данных на основе id заявки
    await Request.update({ status, cancelReason }, { where: { id: requestId } });

    // Возвращаем статус 200 -- заявка успешно обновлена
    return res.status(200).json({ message: "Заявка успешно обновлена" });
})

// Выход из системы и удаление сессии
app.post('/logout', (req, res) => {
    req.session.destroy();
    return res.status(200).json({ message: "Выход из системы прошел успешно" });
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
