const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

function genToken(user){
    const token = jwt.sign({ id : this.id , isAdmin : this.isAdmin } , 'privatekey');
    return token;
}



module.exports = genToken;