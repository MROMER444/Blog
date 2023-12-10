const express = require('express');
const app = express();
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const user = require('./router/user');
const auth = require('./router/auth');

app.use(express.json());
app.use('/api' , user);
app.use('/api/auth', auth);





const PORT = process.env.PORT || 4000;
app.listen(PORT , ()=> console.log('Listening on port' , PORT));