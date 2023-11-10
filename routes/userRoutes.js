const express = require('express')
const router = express.Router()

const usersController = require('../controllers/usersController')

router.route('/')
    //CRUD method
    .get(usersController.getAllUsers)  //red
    .post(usersController.createNewUser) //create
    .patch(usersController.updateUser) //update
    .delete(usersController.deleteUser) //delete

module.exports = router