const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(cors())

let phonebook = [
    {
      name: "Arto Hellas",
      number: "050 466 7879",
      date: "2020-01-10T17:30:31.098Z",
      id: 1
    },
    {
      name: "Ada Lovelace",
      number: "050 466 7979",
      date: "2020-01-10T18:39:34.091Z",
      id: 2
    },
    {
      name: "Dan Abramov",
      number: "050 455 7879",
      date: "2020-01-10T19:20:14.298Z",
      id: 3
    }
  ]

  app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
  })

  app.get('/info', (req, res) => {
    let info = `<p>Phonebook has info for ${phonebook.length} people</p>`;
    let time = new Date();
    res.send(info.concat(`<p>${time}</p>`));
  })
  
  app.get('/api/phonebook', (req, res) => {
    res.json(phonebook)
  })

  app.get('/api/phonebook/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = phonebook.find(info => info.id === id)

    if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
  })

  app.delete('/api/phonebook/:id', (request, response) => {
    const id = Number(request.params.id)
    phonebook = phonebook.filter(info => info.id !== id)
  
    response.status(204).end()
  })
  
  const generateId = () => {
    const maxId = phonebook.length > 0
      ? Math.max(...phonebook.map(n => n.id))
      : 0
    return maxId + 1
  }

  /*===========================
    Morgan middleware for POST
  =============================*/

  morgan.token('content',  (req, res) => {
    return JSON.stringify(req.body)
  })
  
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content')); // This is a modified version of morgan's tiny predefined format string.

  //==============================

  app.post('/api/phonebook', (request, response) => {
    const name = request.body.name
    const number = request.body.number
  
    if (!name || !number) {
      return response.status(400).json({ 
        error: 'content missing' 
      })
    }

    if (phonebook.find(info => info.name === name) !== undefined) {
      return response.status(400).json({ 
        error: 'name must be unique' 
      })
    }
  
    const note = {
      name: name,
      number: number,
      date: new Date(),
      id: generateId(),
    }
  
    phonebook = phonebook.concat(note)
  
    response.json(note)
  })

  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })

  // Unknown endpoint middleware
  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  app.use(unknownEndpoint)