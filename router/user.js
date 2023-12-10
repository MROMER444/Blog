const express = require('express');
const router = express.Router();
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const admin = require('../midlleware/admin');
const auth = require('../midlleware/user_auth');
const dotenv = require('dotenv');




dotenv.config({path: '.env'})
const JWT_SECRET = process.env.JWT_SECRET






router.get('/', [auth, admin], async (req , res) => {
    const allUser = await prisma.post.findMany({include: {author: true}});
        res.json(allUser);
});





router.get('/us', [auth, admin], async (req, res) => {
    const allUser = await prisma.user.findMany({include: {Post: true}});
    res.json(allUser);
});




router.post('/', async (req, res) => {
    try {
        const {error} = uservalidation(req.body);
        if (error) {
            res.status(404).json({"error": error.details[0].message});
            return;
        }

        let user = await prisma.user.findFirst({where: {email: req.body.email}});
        if (user) {
            res.status(404).json({"error": "User already registred!"});
            return;
        }

        const {firstName,lastName,age,password,email} = req.body;
        user = await prisma.user.create({data: {firstName,lastName,age,password: bcrypt.hashSync(password, 10),email}});
        const token = jwt.sign({id: user.id,isAdmin: user.isAdmin}, JWT_SECRET);
        res.status(201).json({user: user,token});
    } catch (error) {
        res.status(400).json("cant process this one")
    }
});






router.post('/post', auth, async (req, res) => {
    const {error} = postvalidation(req.body);
    if (error) {
        res.status(404).json({'error': error.details[0].message});
        return;
    }
    const {title,content} = req.body;
    const token = req.header('x-auth-token');
    decodeToken = jwt.verify(token, JWT_SECRET);
    const authorId = decodeToken.id;
    const post = await prisma.post.create({data: {title,content,authorId}})
    if (post) {
        res.status(201).json({'post': post});
    }
})



router.post('/comment', auth , async (req , res) => {
    const { error } = commentvalidation(req.body);
    if(error){
        res.status(404).json({'error' : error.details[0].message});
        return;
    }
    const {content , postId} = req.body;
    const token = req.header('x-auth-token');
    const decodeToken = jwt.verify(token , JWT_SECRET);
    const authorId = decodeToken.id;
    const comment = await prisma.comment.create({data : {content , postId , authorId}});
    if(comment){
        res.status(200).json({'comment' : comment});
    }
})





function postvalidation(post) {
    const schema = {
        title: Joi.string(),
        content: Joi.string(),
        authorId: Joi.number().integer()
    };
    return Joi.validate(post, schema);
}



function commentvalidation(comment) {
    const schema = {
        content: Joi.string(),
        postId: Joi.number().integer(),
        authorId: Joi.number().integer()
    };
    return Joi.validate(comment, schema);
}


function uservalidation(user) {
    const schema = {
        firstName: Joi.string().min(3).max(20),
        lastName: Joi.string().min(3).max(20),
        age: Joi.string(),
        password: Joi.string().required(),
        email: Joi.string().required().email(),
        isAdmin: Joi.boolean()
    };
    return Joi.validate(user, schema);
}



module.exports = router;