const express = require('express')
const bodyParser = require('body-parser')
const {graphqlHTTP} = require('express-graphql')
const { buildSchema } = require('graphql')

const bcrypt = require('bcryptjs')

const Event = require('./models/event')
const User = require('./models/user')

const mongoose = require('mongoose')


const app = express()

app.use(bodyParser.json())

app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`

    type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String
    }

    type User {
        _id: ID!
        email: String!
        password: String
        price: Float!
        date: String
    }


    input EventInput {
        title: String!
        description: String!
        price: String!
        date: String!
    }

    input UserInput {
        email: String!
        password: String!
    }
    
    type RootQuery {
        events: [Event!]!
        users: [User!]!
    }

    type RootMutation {
        createEvent(eventInput: EventInput): Event
        createUser(userInput: UserInput): User
    }
    schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
        return Event.find()
           .then( events => {
               return events.map(event =>{
                   return {...event._doc}
               })
           })
           .catch(err => {
               throw err
           })
        },
        createEvent: (args) => {
        
            const event = new Event({
                
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date),
                creator: "605374fb54b6a12d7c699e26"
            })

            event.save().then( result => {
                createEvent = {...result._doc}
                return User.findById('605374fb54b6a12d7c699e26')
                console.log(result)
               
            })
            .then(user=>{
                if(user){
                    throw new Error('User exist already')
                }
                user.createEvent.push(event);
                return user.save()
            })
            .then(result => {
                return createdEvent
            })
            .catch(err => {
                console.log(err)
                throw err
            })

            return event
        },
        createUser: args => {

            User.findOne({email: args.userInput.email})
            .then(user => {
                if(user){
                    throw new Error('User exist already')
                }
                return  bcrypt.hash(args.userInput.password, 12)
            })           
                .then( hashedPassword => {

                    const user = new User({
                        email: args.userInput.email,
                        password: hashedPassword
                    })

                    return user.save()

                })
                .then (result => {
                    return {
                        ...result._doc, password: null, _id: result.id
                    }
                })
                .catch(err => {
                    throw err
                })
            
        }
    },
    graphiql: true
}))

mongoose.connect(`mongodb+srv://mizan:${process.env.MONGO_PASSWORD}@cluster0.s8caj.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
    .then(()=>{
        app.listen(4000, () => console.log('DB connected'))
    })
    .catch(err => {
        console.log(err)
    })


    //mongodb+srv://mizan:${process.env.MONGO_PASSWORD}@cluster0.s8caj.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority
