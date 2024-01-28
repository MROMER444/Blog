const express = require('express');
const app = express();
const { PrismaClient } = require('@prisma/client')
// const prisma = new PrismaClient()
const morgan = require('morgan')
require('dotenv').config();
//test

const user = require('./router/user');
const auth = require('./router/auth');



app.use(express.json());
app.use('/api' , user);
app.use('/api/auth', auth);

if (app.get('env') === 'development'){
    process.env.DATABASE_URL = process.env.DATABASE_URL_DEV
    app.use(morgan('tiny'));
}else{
    process.env.DATABASE_URL = process.env.DATABASE_URL_PROD
}


console.log('Environment:', app.get('env'));


const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger-output.json')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 5000;
app.listen(PORT , ()=> console.log('Listening on port' , PORT));