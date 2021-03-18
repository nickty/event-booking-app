const express = require('express')
const bodyParser = require('body-parser')
const {graphqlHTTP} = require('express-graphql')
const { buildSchema } = require('graphql')

const Event = require('./models/event')

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

    input EventInput {
        title: String!
        description: String!
        price: String!
        date: String!
    }
    
    type RootQuery {
        events: [Event!]!
    }

    type RootMutation {
        createEvent(eventInput: EventInput): Event
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
                date: new Date(args.eventInput.date)
            })

            event.save().then( result => {
                console.log(result)
                return {
                    ...result._doc
                }
            }).catch(err => {
                console.log(err)
                throw err
            })

            return event
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

