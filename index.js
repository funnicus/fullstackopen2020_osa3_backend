require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

app.use(express.json())
app.use(cors())
app.use(express.static('build'))

let count = 0

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, res) => {
  let info = `<p>Phonebook has info for ${count} people</p>`
  let time = new Date()
  res.send(info.concat(`<p>${time}</p>`))
})
  
app.get('/api/phonebook', (req, res) => {
  Person.find({}).then(phonebook => {
    count = phonebook.length
    res.json(phonebook.map(person => person.toJSON()))
  })
})

app.get('/api/phonebook/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person){
        response.json(person.toJSON())
      }
      else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/phonebook/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

/*===========================
  Morgan middleware for POST
=============================*/

morgan.token('content',  (req) => {
  return JSON.stringify(req.body)
})
  
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content')) // This is a modified version of morgan's tiny predefined format string.

//==============================

app.post('/api/phonebook', (request, response, next) => {
  const name = request.body.name
  const number = request.body.number
  
  if (!name || !number) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }
  
  const person = new Person({
    name: name,
    number: number,
    date: new Date(),
  })
  
  person.save()
    .then(savedPerson => savedPerson.toJSON())
    .then(savedAndFormattedPerson => {
      response.json(savedAndFormattedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/phonebook/:id', (request, response, next) => {
  const body = request.body
  
  const person = {
    name: body.name,
    number: body.number,
    date: new Date(),
  }
  
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Unknown endpoint middleware
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
  
app.use(unknownEndpoint)

// errorHandler middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  
  next(error)
}
  
app.use(errorHandler)

//commit