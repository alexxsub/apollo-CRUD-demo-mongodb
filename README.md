# <a href='https://www.apollographql.com/'><img src='https://user-images.githubusercontent.com/841294/53402609-b97a2180-39ba-11e9-8100-812bab86357c.png' height='100' alt='Apollo Server'></a>


# apollo-CRUD-demo-mongodb

Пример "бэкенда" для  демо приложения телефонный справочник c хранением данных в MongoDB.
Основные операции CRUD. Создание записи, чтение, обновление, удаление
В качестве хранения данных используется массив

## Установка

```sh
git clone https://github.com/alexxsub/apollo-CRUD-demo-mongodb.git
cd apollo-CRUD-demo-mongodb
npm i
```

## Настройка

### поправить строку MONGO_URI в .env, подключение MongoDB. В примере создан экземпляр базы на mlab.com и база названа "phones_simple"

\<login\> -  логин пользователя </br>
\<password\> - пароль</br>
\<your cluster name\> - имя вашего кластера на mlab.com</br>

"mongodb+srv://\<login\>:\<password\>@\<your cluster name\>.mongodb.net/phones_simple?retryWrites=true&w=majority" </br>

Либо подключить к локальному mongo </br>
"mongodb://localhost:27017/phones_simple"

### Поправьте PORT и HOST в .env для сервера Apollo

или задайте в скрипте package.json
```
"scripts": {
    "start": "nodemon index.js localhost 4000"
  },
```
## Запуск
```sh
npm start
```
Если HOST = localhost и PORT=4000
открываем [http://localhost:4000/graphql](http://localhost:4000/graphql)
