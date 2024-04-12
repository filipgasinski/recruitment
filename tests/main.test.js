//haslo123
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../index')
const mongoose = require('mongoose')

chai.use(chaiHttp)
const expect = chai.expect

describe('Express API Tests', () => {
    before((done) => {
        // Connecting testDatabase before tests
        mongoose.connect('mongodb+srv://filipg2137:haslo123@cluster0.rpsef45.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
        { useNewUrlParser: true, useUnifiedTopology: true }, () => {
            mongoose.connection.dropDatabase(() => {
                done()
            })
        })
    })
})

after((done) => {
    // After tests disconnect with database
    mongoose.connection.close(() => {
        done()
    })
})