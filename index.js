const express = require('express')
const mongoose = require('mongoose')
const axios = require('axios')
const { RateLimiterMemory } = require('rate-limiter-flexible')
const connect = require('./db')

const port = 3000
connect()

const app = express()
app.use(express.json())

// User schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    userType: { type: String, enum: ['basic', 'premium']}, // User type - basic or premium
})
const User = mongoose.model('User', userSchema)

// Movie schema
const movieSchema = new mongoose.Schema({
    title: String,
    released: Date,
    genre: String,
    Director: String,
    userId: String
})
const Movie = mongoose.model('Movie', movieSchema)

// Basic user limit - 5 movies per month
const userLimiter = new RateLimiterMemory({
    points: 5,  
    duration: 30 * 24 * 60 * 60 // 30 days in seconds
})

// Endpoint - creating movies
app.post('/movies', async (req, res) => {
    try {
        const { title, userId } = req.body
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        const userType = user.userType

        // Checking if user is basic and his limit 5 movies per month
        if (userType === 'basic') {
            const userLimiterResponse = await userLimiter.consume(userId)

            if (userLimiterResponse || userLimiterResponse.remainingPoints <= 0) {
                return res.status(429).json({ error: 'Rate limit exceeded for basic user' })
            }
        }

        // Fetch movies from OMDb API
        const omdbResponse = await axios.get('http://www.omdbapi.com/?i=tt3896198&apikey=a5bb452c')
        const movieDetails = omdbResponse.data

        const newMovie = new Movie({
            title: movieDetails.Title,
            released: movieDetails.Released,
            genre: movieDetails.Genre,
            director: movieDetails.Director,
            userId,
        })

        await newMovie.save()

        res.status(201).json({ message: 'Movie created successfully', movie: newMovie })
    } catch (error) {
        console.error('Error creating movie: ', error)
        if (error instanceof Error && error.message.includes('userLimiter')) {
            res.status(429).json({ error: 'Rate limit exceeded for basic user' })
        } else {
            res.status(500).json({ error: 'Internal server error' })
        }
    }
})

// Endpoint - Get user movies (by user ID)
app.get('/movies/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const movies = await Movie.find({ userId })
        res.status(200).json({ movies })
    } catch (error) {
        console.error('Error fetching movies: ', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Endpoint - user authentication
app.post('/auth', async (req, res) => {
    try {
        const { username, password } = req.bod
        const user = await User.findOne({ username }).exec()
        
        if (!user) {
            res.status(401).json({ success: false, error: 'Invalid username or password' })
        }

        const isPasswordCorrect = password === user.password

        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, error: 'Invalid username or password' })
        }

        res.status(200).json({ success: true, data: { userId: user._id } })
    } catch (error) {
        console.error('Error authenticating user: ', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Endpoint - user registration
app.post('/registration', async (req, res) => {
    try {
        const { username, password, userType } = req.body

        // Checking if username already exists
        const existingUser = await User.findOne({ username }).exec()
        if(existingUser) {
            return res.status(400).json({ error: "Username already exists" })
        }

        // Creating new user
        const newUser = new User({ username, password, userType })
        await newUser.save()

        res.status(201).json({ message: "User registered successfully ", user: newUser })
    } catch (error) {
        console.error('Error registeraring user: ', error)
        res.status(500).json({ error: 'Internal server error '})
    }
})




app.listen(port, () => {
    console.log(`Example app on port ${port}`)
})