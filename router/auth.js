const express = require('express');
const router = express.Router();
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const dotenv = require('dotenv');

dotenv.config({path: '.env'})
const JWT_SECRET = process.env.JWT_SECRET




router.post('/login', async (req, res) => {
    const {error} = loginvalidation(req.body);
    if (error) {
        res.status(404).json({'error': error.details[0].message});
        return;
    };

    let user = await prisma.user.findFirst({where: {email: req.body.email}});
    if (!user) {
        res.status(404).json({'error': 'invalid email or password!'});
        return;
    }

    const {email,password} = req.body;
    if (!bcrypt.compareSync(password.bcrypt.hashSync(password , 10), user.password)) {
        res.status(404).json({'error': 'invalid email or password!'});
        return;
    }
    const token = jwt.sign({id: user.id,isAdmin: user.isAdmin}, JWT_SECRET);
    res.header('x-auth-togenerationToken', token)
    res.json({'token': token});

})





function loginvalidation(user) {
    const schema = {
        email: Joi.string().required().email(),
        password: Joi.string().required()
    };
    return Joi.validate(user, schema);
}



module.exports = router;
