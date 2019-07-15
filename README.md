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
поправить строку подключения MongoDB. В примере создан экземпляр базы на mlab.com

\<login\> -  логин пользователя
\<password\> - пароль
<your cluster name> - имя вашего кластера на mlab.com

"mongodb+srv://<login>:<password>@<your cluster name>.mongodb.net/test?retryWrites=true&w=majority"

```sh
npm start
```

потом открываем [http://localhost:4000/graphql](http://localhost:4000/graphql)
