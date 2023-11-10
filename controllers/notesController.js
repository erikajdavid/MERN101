const User = require('../models/User')
const Note = require('../models/Note')

const asyncHandler = require('express-async-handler')

const getAllNotes = asyncHandler(async(req, res) => {
    const notes = await Note.find().lean()

    if(!notes.length) {
        return res.status(400).json({ message: 'No notes found.' })
    }

    //add username to note
    const notesWithUser = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec()
        return { ...note, username: user.username}
    }))

    res.json(notesWithUser)
})

const createNewNote = asyncHandler(async(req, res) => {
    const { user, title, text } = req.body

    if (!user || !title || !text) {
        return res.status(400).json({ message: 'All fields are required.' })
    }

    const duplicate = await Note.findOne({ title }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate user' })
    }

    const note = await Note.create({ user, title, text })

    if (note) {
        return res.status(201).json({ message: 'New note created' })
    } else {
        return res.status(400).json({ message: 'Invalid note data received' })
    }
})

const updateNote = asyncHandler(async(req, res) => {
    const { id, user, title, text, completed } = req.body
    
    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required.' })
    }

    //confirm note exits

    const note = await Note.findById(id)

    if (!note) {
        return res.status(400).json({ message: 'Note not found.' })
    }

    //check for duplications

    const duplicate = await Note.findOne({ title })

    if (duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({ message: 'Duplicate user' })
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed
    
    const updatedNote = await note.save()

    res.json(`${updatedNote.title} updated`)
})

const deleteNote = asyncHandler(async(res, req) => {
   const { id } = req.body

   if (!id) {
    return res.status(400).json({ message: 'Note ID required.' })
   }

   const note = await Note.findById(id).exec()

   if (!note) {
    return res.status(400).json({ message: 'Note not found' })
   }

   const result = await note.findOneAndDelete({_id: id})

   const reply = `Note ${result.title} with ID ${result._id} deleted`

   res.json(reply)
})

module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}

