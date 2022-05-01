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
	if (req.body.length) {
		const mentors = req.body
		const mentorCount = await client
			.db('day35')
			.collection('mentors')
			.countDocuments()
		var mentorId = mentorCount ? mentorCount + 1 : 1
		const mentor = await client
			.db('day35')
			.collection('mentors')
			.insertMany(
				mentors.map((item) => {
					return {
						mentor_id: mentorId++,
						name: item.name,
						email: item.email,
						students: [],
					}
				})
			)
		res.send(mentor)
	} else {
		const mentor = await client
			.db('day35')
			.collection('mentors')
			.insertOne(req.body)
		res.send(mentor)
	}
})

app.post('/create-student', async (req, res) => {
	if (req.body.length) {
		const students = req.body
		const studentCount = await client
			.db('day35')
			.collection('students')
			.countDocuments()
		var studentId = studentCount ? studentCount + 1 : 1
		const student = await client
			.db('day35')
			.collection('students')
			.insertMany(
				students.map((item) => {
					return {
						student_id: studentId++,
						name: item.name,
						email: item.email,
						mentor_id: null,
					}
				})
			)
		res.send(student)
	} else {
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
	}
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
	const studentswithNoMentor = await client
		.db('day35')
		.collection('students')
		.find({ mentor_id: null, student_id: { $in: studentId } })
		.toArray()

	let mentorstudentArray = (
		await client
			.db('day35')
			.collection('mentors')
			.find({ mentor_id: mentorId }, { students: 1, _id: 0 })
			.toArray()
	)[0].students

	studentId.forEach((item) => {
		mentorstudentArray.push(item)
	})

	console.log(mentorstudentArray)
	const student = await client
		.db('day35')
		.collection('students')
		.updateMany(
			{ student_id: { $in: studentId } },
			{ $set: { mentor_id: mentorId } }
		)
	const mentor = await client
		.db('day35')
		.collection('mentors')
		.updateOne(
			{ mentor_id: mentorId },
			{ $set: { students: mentorstudentArray } }
		)
	res.send({ student, mentor })
})

// Assign A mentor or update mentor for a student
app.put('/assign-mentor', async (req, res) => {
	const { mentorId, studentId } = req.body
	const student = await client
		.db('day35')
		.collection('students')
		.updateOne(
			{
				student_id: studentId,
			},
			{
				$set: {
					mentor_id: mentorId,
				},
			}
		)
	const mentees = (
		await client
			.db('day35')
			.collection('mentors')
			.find({ mentor_id: mentorId }, { students: 1, _id: 0 })
			.toArray()
	)[0].students
	const tobeAddedStudent = [...mentees, studentId]
	const mentor = await client
		.db('day35')
		.collection('mentors')
		.updateOne(
			{
				mentor_id: mentorId,
			},
			{
				$set: {
					students: tobeAddedStudent,
				},
			}
		)
	res.send('Student assigned to mentor')
})

// Get all students of a mentor
app.get('/mentor/:mentorId', async (req, res) => {
	const { mentorId } = req.params

	const students = await client
		.db('day35')
		.collection('students')
		.find(
			{ mentor_id: parseInt(mentorId) },
			{ projection: { name: 1, _id: 0 } }
		)
		.toArray()
	res.send(students)
})

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
