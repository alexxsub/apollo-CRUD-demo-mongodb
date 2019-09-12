const { ApolloServer, gql } = require("apollo-server");
const mongoose = require("mongoose");

const PhoneSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  }
});

PhoneSchema.index({
  "$**": "text"
});

// Create presave trigger for example
PhoneSchema.pre("save", function(next) {
  //this.<fieldname>
  next();
});

const Phone = mongoose.model("Phone", PhoneSchema);

mongoose
  .connect(
    "mongodb+srv://admin:admin2019@testmongodb-kgrku.mongodb.net/test?retryWrites=true&w=majority",
    { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false }
  )
  .then(() => console.log("🚀   База взлетела!"))
  .catch(err => console.error(err));

//types for graphql
const typeDefs = gql`
  type Query {
    """
    Get all phones
    """
    Phones: [Phone]
    """
    Search phones
    """
    searchPhones(searchTerm: String): [Phone]
    """
    Find name of person in phone list
    """
    findName(number: String): Phone
  }
  type Phone {
    id: ID
    """
    Number of phone
    """
    number: String
    """
    Name of person
    """
    name: String
  }
  input inputPhone {
    number: String!
    name: String
  }
  type Mutation {
    addPhone(number: String, name: String): Phone!
    addPhoneByInput(input: inputPhone): Phone! #example with input type
    deletePhone(number: String): [Phone]
    deletePhoneByID(id: ID): Boolean
    updatePhoneByID(id: ID, number: String, name: String): Phone!
    updatePhone(number: String, name: String): Phone! #example with separated params
  }
`;
//resolvers for graphql
const resolvers = {
  Phone: {
    name: root => {
      if (root.number === "5555") {
        //find number 5555 and hide name of person
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
      //console.log(searchTerm);
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
    findName: async (_, { number }, { Phone }) =>
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
      //console.log(input);
      await new Phone({
        number: input.number,
        name: input.name
      }).save();
      return await Phone.find({});
    },
    deletePhone: async (_, { number }, { Phone }) => {
      await Phone.findOneAndRemove({ number });
      return await Phone.find({});
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
      // return await Phone.find({});
      return updatedPhone;
    },
    updatePhoneByID: async (_, { id, number, name }, { Phone }) => {
      const updatedPhone = await Phone.findOneAndUpdate(
        { _id: id },
        { $set: { number, name } },
        { new: true },
        (err, res) => {
          if (err) console.error(err);
        }
      );
      return updatedPhone;
    }
  }
};
//create new Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: { Phone }
});
//start it
const HOST = process.argv[2];
const PORT = process.argv[3];

server.listen({ host: HOST, port: PORT }).then(({ url }) => {
  console.log(`🚀   Взлетел ${url}`);
});
