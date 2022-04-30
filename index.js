import express from 'express'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000

const MONGO_URL = process.env.MONGO_URL

async function createConnection() {
	const client = new MongoClient(MONGO_URL)
	await client.connect()
	console.log('Connected to MongoDB')
	return client
}

const client = await createConnection()

app.get('/', (req, res) => {
	res.send('Hello World!')
})

app.post('/create-mentor', async (req, res) => {
	const { name, email } = req.body
	const mentorCount = await client
		.db('day35')
		.collection('mentors')
		.countDocuments()
	const mentorId = mentorCount ? mentorCount + 1 : 1

	const mentor = await client.db('day35').collection('mentors').insertOne({
		mentor_id: mentorId,
		name: name,
		email: email,
		students: [],
	})
	res.send(mentor)
})

app.post('/create-student', async (req, res) => {
	const { name, email, batch } = req.body
	const studentCount = await client
		.db('day35')
		.collection('students')
		.countDocuments()
	const studentId = studentCount ? studentCount + 1 : 1

	const student = await client.db('day35').collection('students').insertOne({
		student_id: studentId,
		name: name,
		email: email,
		batch: batch,
		mentor: null,
	})
	res.send(student)
})

app.get('/mentors', async (req, res) => {
	const mentors = await client
		.db('day35')
		.collection('mentors')
		.find()
		.toArray()
	res.send(mentors)
})

app.get('/students', async (req, res) => {
	const students = await client
		.db('day35')
		.collection('students')
		.find()
		.toArray()
	res.send(students)
})

app.put('/assign-student', async (req, res) => {
	const { studentId, mentorId } = req.body
	const students = await client
		.db('day35')
		.collection('students')
		.find({ mentor: null })
		.toArray()

	const filteredStudents = students.filter((student) => {
		return student.student_id === studentId
	})

	if (studentId.isArray) {
		const mentor = await client
			.db('day35')
			.collection('mentors')
			.updateOne(
				{ mentor_id: mentorId },
				{ $push: { students: { $each: studentId } } }
			)
		res.send(mentor)
		studentId.forEach(async (id) => {
			await client
				.db('day35')
				.collection('students')
				.updateOne(
					{
						student_id: id,
					},
					{
						$set: {
							mentor: mentorId,
						},
					}
				)
		})
	} else {
		await client
			.db('day35')
			.collection('mentors')
			.updateOne(
				{
					mentor_id: mentorId,
				},
				{
					$push: {
						students: studentId,
					},
				}
			)

		await client
			.db('day35')
			.collection('students')
			.updateOne(
				{
					student_id: studentId,
				},
				{
					$set: {
						mentor: mentorId,
					},
				}
			)
	}
	res.send('Student assigned to mentor')
})

app.put('/assign-mentor', async (req, res) => {
	const { mentorId, studentId } = req.body
	await client
		.db('day35')
		.collection('students')
		.updateOne(
			{
				student_id: studentId,
			},
			{
				$set: {
					mentor: mentorId,
				},
			}
		)
	res.send('Student assigned to mentor')
})

app.get('/mentor/:mentorId', async (req, res) => {
	const { mentorId } = req.params

	const students = await client
		.db('day35')
		.collection('students')
		.find({ mentor: parseInt(mentorId) }, { projection: { name: 1 } })
		.toArray()
	res.send(students)
})

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
