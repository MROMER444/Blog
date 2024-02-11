const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const dotenv = require('dotenv');

dotenv.config({ path: '.env' })
const JWT_SECRET = process.env.JWT_SECRET




router.post('/login', async (req, res) => {
    try {
        const { error } = loginvalidation(req.body);
        if (error) {
            return res.status(404).json({ error: error.details[0].message });
        }

        const { email, password } = req.body;
        let user = await prisma.user.findFirst({ where: { email: email } });
        if (!user) {
            return res.status(404).json({ "msg": { "Invalid email or password": { "success": false } } });
        }

        const passwordMatch = bcrypt.compareSync(password, user.password);
        if (!passwordMatch) {
            return res.status(404).json({ "msg": { "Invalid email or password!": { "success": false } } });
        }

        const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, JWT_SECRET);
        res.header('x-auth-togenerationToken', token);
        res.status(200).json({ "token": token, "success": true })
    } catch (error) {
        res.status(400).json({ "msg": "Internal Server Error" })
    }
});






function loginvalidation(user) {
    const schema = {
        email: Joi.string().required().email(),
        password: Joi.string().required()
    };
    return Joi.validate(user, schema);
}



module.exports = router;
