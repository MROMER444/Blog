//test

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const admin = require('../midlleware/admin');
const auth = require('../midlleware/user_auth');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' })
const JWT_SECRET = process.env.JWT_SECRET


router.get('/allpost', auth , async (req, res) => {
    try {
        const allUser = await prisma.post.findMany();
        if (allUser.length === 0) {
            const token = jwt.sign({ id: req.user.id, isAdmin: req.user.isAdmin }, JWT_SECRET);
            res.header('x-auth-togenerationToken', token)
            res.status(200).json({ "record": [] })
        } else {
            const token = jwt.sign({ id: req.user.id, isAdmin: req.user.isAdmin }, JWT_SECRET);
            res.header('x-auth-togenerationToken', token)
            res.status(200).json({ "records": allUser })
        }

    } catch (error) {
        res.status(500).json({ "msg": "Internal Server Error" })
    }
});



router.get('/alluser', auth, async (req, res) => {
    try {
        const allUser = await prisma.user.findMany();
        if (allUser.length === 0) {
            const token = jwt.sign({ id: req.user.id, isAdmin: req.user.isAdmin }, JWT_SECRET);
            res.header('x-auth-togenerationToken', token)
            res.status(200).json({ "record": [] })
        } else {
            const token = jwt.sign({ id: req.user.id, isAdmin: req.user.isAdmin }, JWT_SECRET);
            res.header('x-auth-togenerationToken', token)
            res.status(200).json({ "records": allUser })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ "msg": "Internal Server Error" })
    }
});


router.post('/create-account', async (req, res) => {
    try {
        const { error } = uservalidation(req.body);
        if (error) {
            res.status(404).json({ "error": error.details[0].message });
            return;
        }

        let user = await prisma.user.findFirst({ where: { email: req.body.email } });
        if (user) {
            res.status(404).json({ "error": "User already registred!" });
            return;
        }

        const { firstName, lastName, age, password, email } = req.body;
        user = await prisma.user.create({ data: { firstName, lastName, age, password: bcrypt.hashSync(password, 10), email } });
        const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, JWT_SECRET);
        res.status(201).json({ "records": { "user": user, "token": { token } } })
    } catch (error) {
        res.status(500).json({ "msg": "Internal Server Error" })
    }
});



router.post('/create-post', auth, async (req, res) => {
    try {
        const { error } = postvalidation(req.body);
        if (error) {
            res.status(404).json({ 'error': error.details[0].message });
            return;
        }
        const { title, content } = req.body;
        const token = req.header('x-auth-token');
        decodeToken = jwt.verify(token, JWT_SECRET);
        const authorId = decodeToken.id;
        const post = await prisma.post.create({ data: { title, content, authorId } })
        if (post) {
            const token = jwt.sign({ id: req.user.id, isAdmin: req.user.isAdmin }, JWT_SECRET);
            res.header('x-auth-togenerationToken', token)
            res.status(201).json({ "record": { "post": post }, "success": true });
        } else {
            const token = jwt.sign({ id: req.user.id, isAdmin: req.user.isAdmin }, JWT_SECRET);
            res.header('x-auth-togenerationToken', token)
            res.status(404).json({ "record": { "post": [], "success": false } })
        }
    } catch (error) {
        res.status(500).json({ "msg": "Internal Server Error" })
    }
})




router.post('/create-comment', auth, async (req, res) => {
    try {
        const { error } = commentvalidation(req.body);
        if (error) {
            res.status(404).json({ 'error': error.details[0].message });
            return;
        }
        const { content, postId } = req.body;
        const token = req.header('x-auth-token');
        const decodeToken = jwt.verify(token, JWT_SECRET);
        const authorId = decodeToken.id;
        const comment = await prisma.comment.create({ data: { content, postId, authorId } });
        if (comment) {
            const token = jwt.sign({ id: req.user.id, isAdmin: req.user.isAdmin }, JWT_SECRET);
            res.header('x-auth-togenerationToken', token)
            res.status(201).json({ 'data': { "comment": comment }, "success": true });
        } else {
            const token = jwt.sign({ id: req.user.id, isAdmin: req.user.isAdmin }, JWT_SECRET);
            res.header('x-auth-togenerationToken', token)
            res.status(404).json({ 'data': { "comment": "" }, "success": false });
        }
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ "msg": "Internal Server Error" })
    }
})



router.delete('/delete-post', auth , async (req, res) => {
    try {
        const postId = req.body.id;
        await prisma.comment.deleteMany({ where: { postId } });
        const deletepost = await prisma.post.delete({ where: { id: postId } });

        if (deletepost !== null) {
            const token = jwt.sign({ id: req.user.id, isAdmin: req.user.isAdmin }, JWT_SECRET);
            res.header('x-auth-togenerationToken', token)
            return res.status(202).json({ 'msg': "post deleted", "success": true });
        } else {
            const token = jwt.sign({ id: req.user.id, isAdmin: req.user.isAdmin }, JWT_SECRET);
            res.header('x-auth-togenerationToken', token)
            return res.status(404).json({ 'msg': "can't delete this one", "success": false })
        }

    } catch (error) {
        res.status(500).json({ "msg": "Internal Server Error" });
    }
});



router.get('/user/:id', auth , async (req, res) => {
    try {
        const userId = req.params.id;
        const result = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
        if (!result) {
            const token = jwt.sign({ id: req.user.id, isAdmin: req.user.isAdmin }, JWT_SECRET);
            res.header('x-auth-togenerationToken', token)
            res.status(200).json({ "record": { "user": [], "msg": `there is no user with this ID ${userId}` }, "success": false });
        } else {
            const token = jwt.sign({ id: req.user.id, isAdmin: req.user.isAdmin }, JWT_SECRET);
            res.header('x-auth-togenerationToken', token)
            res.status(200).json({ "record": { "user": result }, "success": true });
        }
    } catch (error) {
        res.status(500).json({ "msg": "Internal Server Error" })
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
