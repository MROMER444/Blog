//hello from fedor

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


router.get('/allpost', async (req , res) => {
    const allUser = await prisma.post.findMany();
        res.json(allUser);
});



router.get('/alluser',  async (req, res) => {
    const allUser = await prisma.user.findMany();
    res.json(allUser);
});


router.post('/create-account', async (req, res) => {
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
        res.status(400).json({"msg" : "cant process this one"})
    }
});



router.post('/create-post', auth, async (req, res) => {
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




router.post('/create-comment', auth , async (req , res) => {
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



router.delete('/delete-post', async (req, res) => {
    try {
        const postId = req.body.id;

        // Delete comments associated with the post
        await prisma.comment.deleteMany({ where: { postId } });

        // Delete the post
        const deletepost = await prisma.post.delete({ where: { id: postId } });

        if (deletepost !== null) {
            return res.status(202).json({ 'msg': "post deleted" , "success" : true });
        } else {
            return res.status(404).json({ 'msg': "can't delete this one" })
        }
        
    } catch (error) {
        console.error(error);  // Log the error
        res.status(500).json({ "msg": "Internal Server Error" });
    }
});



router.get('/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
    const result = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (result) {
        res.status(200).json({ "data": result });
    } else {
        res.status(404).json({ "data": {"records" : result} });
    }
    } catch (error) {
        res.status(500).json({"msg" : "Internal Server Error"})
    }
});





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


// function deletevalidation(user){
//     const schema = {
//         deletedPost : Joi.required()
//     };
//     return Joi.validate(user , schema)
// }



module.exports = router;
