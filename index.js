import express from 'express'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import cors from 'cors'
const app = express()

dotenv.config()

console.log(process.env)

const PORT = process.env.PORT

const MONGO_URL = process.env.MONGO_URL

// const MONGO_URL = 'mongodb://localhost'

// Connect to MongoDB

async function createConnection() {
	const client = new MongoClient(MONGO_URL)
	await client.connect()
	console.log('Connected to MongoDB')
	return client
}

const client = await createConnection()

// Add express middleware to parse JSON bodies automatically

app.use(express.json())

app.use(cors())

// Basic request handler
app.get('/', function (req, res) {
	res.send('Hello World')
})

app.get('/movies', async function (req, res) {
	const filter = req.query

	if (filter.rating) {
		filter.rating = +filter.rating
	}
	filter
		? res.send(
				await client
					.db('classMongo')
					.collection('movies')
					.find(filter)
					.toArray()
		  )
		: res.send(
				await client.db('classMongo').collection('movies').find().toArray()
		  )
})

app.post('/movies', async function (req, res) {
	const newMovies = req.body
	console.log(newMovies)
	const result = await client
		.db('classMongo')
		.collection('movies')
		.insertMany(newMovies)
	res.send(result)
})

app.get('/movies/:id', async function (req, res) {
	const { id } = req.params
	const movie = await client.db('classMongo').collection('movies').findOne({
		id: id,
	})
	movie
		? res.send(movie)
		: res
				.status(404)
				.send(
					'<h1 style="text-align:center">Error 404<br/><hr/>Movie not found</h1>'
				)
})

app.delete('/movies/deletemovie/:id', async function (req, res) {
	const { id } = req.params
	const result = await client
		.db('classMongo')
		.collection('movies')
		.deleteOne({ id: id })
	res.send(result)
})

app.put('/movies/editmovie/:id', async function (req, res) {
	const { id } = req.params
	const movObj = req.body

	if (movObj.rating) {
		movObj.rating = +movObj.rating
	}

	const result = await client
		.db('classMongo')
		.collection('movies')
		.updateOne({ id: id }, { $set: movObj })
	res.send(result)
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
