const mongoose = require('mongoose')

if (process.argv.length<3) {
    console.log('give password as an argument')
    process.exit(1)
  }  

const password = process.argv[2]

const url = `mongodb+srv://funnicus:${password}@cluster0-opztu.mongodb.net/phonebook-app?retryWrites=true&w=majority`
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
    date: Date,
    id: Number,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {

    Person.find({}).then(result => {
        console.log("phonebook:")
        result.forEach(pers => {
            console.log(`${pers.name} ${pers.number}`)
        })
        mongoose.connection.close()
    })
}
else if(process.argv.length < 6) {
    const peronName = process.argv[3]
    const personNumber = process.argv[4]

        const person = new Person({
            name: peronName,
            number: personNumber,
            date: new Date(),
            id: Math.floor(Math.random()*10000),
        })

        person.save().then(response => {
            console.log(`added ${response.name} number ${response.number} to phonebook`)
            mongoose.connection.close()
        })
}
else {
    console.log('Invalid amount of arguments.')
    process.exit(1)
}