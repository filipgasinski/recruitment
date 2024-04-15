const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../index')

chai.use(chaiHttp)
const expect = chai.expect

describe('Registration endpoint', () => {
    it('should register new user', (done) => {
        chai.request(app)
            .post('/registration')
            .send({ username: 'testuser', password: 'testpassword', userType: 'basic' })
            .end((err, res) => {
                expect(res).to.have.status(201)
                expect(res.body).to.have.property('message').equal('User registered succesfully')
                expect(res.body.user).to.have.property('username').equal('testuser')
                done()
            })
    })

    it('should return an error for duplicate user', (done) => {
        chai.request(app)
            .post('/registration')
            .send({ username: 'testuser', password: 'testpassword', userType: 'basic' })
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body).to.have.property('error').equal('Username already exists')
                done()
            })
    })
})