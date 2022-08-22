const { ApolloServer, gql } = require("apollo-server");
const mongoose = require("mongoose");
// создаем новую схему БД
// creating new schema of data base
const PhoneSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true, // number - должен быть уникальным в случае поиска по нему как ключу
    trim: true
  },
  name: {
    type: String,
    required: true
  }
});
//Добавляем индекс для текстового поиска
PhoneSchema.index({
  "$**": "text"
});

// Create presave trigger for example
// пример, как описать триггер на событие. Например, можно шифровать данные пере сохранением в БД, пароль, как вариант
PhoneSchema.pre("save", function(next) {
  //this.<fieldname>
  next();
});

// переменная контекста
// context variable
const Phone = mongoose.model("Phone", PhoneSchema);

mongoose
  .connect(
    "mongodb://localhost:27017/phones_simple",
    { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false }
  )
  .then(() => console.log("🚀   База взлетела!"))
  .catch(err => console.error(err));

//types for graphql
// Описываем API на gql языке. 
const typeDefs = gql`
  type Query {
    """
    Get all phones
    Получить все записи
    """
    Phones: [Phone]
    """
    Search phones
    Поиск телефона
    """
    searchPhones(searchTerm: String): [Phone]
    """
    Find record of phone list by number
    Поиск записи по номеру
    """
    findNamber(number: String): Phone
  }
  type Phone {
    id: ID
    """
    Number of phone
    Номер телефона
    """
    number: String
    """
    Name of person
    Имя персоны
    """
    name: String
  }
  # type for creating new record, all creation params are required
  # тип ввода для создания записи, все параметры обязательны
  input AddInputPhone {
    number: String!
    name: String!
  }
  # type for updating record, params are not required that is how it differs from creation parameters AddInputPhone
  # тип ввода длдя изменений, параметры не обязательны, тем и отличается от параметров создания
  input UpdateInputPhone {
    number: String
    name: String
  }
  type Mutation {
    #example with separated params
    #Пример передачи параметров раздельно
    addPhone(number: String, name: String): Phone!
    
    #example with input type
    #Пример передачи параметров объектом, отдельный тип
    addPhoneByInput(input: AddInputPhone): Phone! 
    
    # deleting record after find number that must be uniqie
    # Удаление записи при условии, что номер - это уникальное значение
    deletePhone(number: String): [Phone] 
    
    # id - primary key and unique
    # id  -это основной уникальный ключ, по нему можно идентифицировать однозначно запись
    deletePhoneByID(id: ID): Boolean 

    # Обновление записи
    updatePhoneByID(id: ID, input:UpdateInputPhone): Phone!
    #example with separated params
    #Обновление через раздельные параметры
    updatePhone(number: String, name: String): Phone! 
  }
`;
//resolvers for graphql API
// реализация методов API
const resolvers = {
  Phone: {
    name: root => {
      if (root.number === "5555") {
        //find number 5555 and hide name of person
        // пример, как поменять данные на выоде. Например, можно не показывать нежелательные
        return "*censored*";
      } else {
        return root.name;
      }
    }
  },
  Query: {
    //https://docs.mongodb.com/master/reference/operator/query/regex/#op._S_regex
    //https://docs.mongodb.com/manual/reference/operator/query/text/#text-query-examples
    Phones: async (_, args, { Phone }) => {
      const phones = await Phone.find({}).limit(50);

      return phones;
    },
    searchPhones: async (_, { searchTerm }, { Phone }) => {
      var phones = [];

      if (searchTerm) {
        phones = await Phone.find(
          { $text: { $search: searchTerm } },
          { score: { $meta: "textScore" } }
        )
          .sort({
            score: { $meta: "textScore" }
          })
          .limit(50);
        //.sort({ <field>: "desc" });
      } else phones = await Phone.find().limit(50);

      return phones;
    },
    findNamber: async (_, { number }, { Phone }) =>
      await Phone.findOne({ number })
  },
  Mutation: {
    addPhone: async (_, { number, name }, { Phone }) => {
      const newPhone = await new Phone({
        number,
        name
      }).save();
      return newPhone;
    },
    addPhoneByInput: async (_, { input }, { Phone }) => {
      return await  new Phone(input).save();
      
    },
    deletePhone: async (_, { number }, { Phone }) => {
     return await Phone.findOneAndRemove({ number });
      
    },
    deletePhoneByID: async (_, { id }, { Phone }) => {
      const phone = await Phone.findByIdAndRemove({ _id: id });
      return phone ? true : false;
    },
    updatePhone: async (_, { number, name }, { Phone }) => {
      const updatedPhone = await Phone.findOneAndUpdate(
        { $or: [{ number }, { name }] },
        { $set: { number, name } },
        { new: true }
      );
    
      return updatedPhone;
    },
    updatePhoneByID: async (_, { id, input }, { Phone }) => {
      const updatedPhone = await Phone.findByIdAndUpdate(
        { _id: id },
          input ,
        { new: true },
        (err, res) => {
          if (err) console.error(err);
        }
      );
      return updatedPhone;
    }
  }
};
//Новый экземпляр аполло
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: { Phone }
});
//Читаем параметры из скрипта запуска
const HOST = process.argv[2];
const PORT = process.argv[3];

server.listen({ host: HOST, port: PORT }).then(({ url }) => {
  console.log(`🚀   Взлетел сервер ${url}`);
});
//  sudo netstat -tulpn|grep 4000