const mysql = require('mysql2');
var crypto = require('crypto');
const { promiseHooks } = require('v8');
require('dotenv').config();


const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD
});

function conn() {
    return connection;
}

function connect() {
    connection.query('SELECT * FROM pet;',
        function (err, results, fields) {
            console.log(results);
            console.log(fields);
        }
    );
};

function signupConnect(user, password) {
    var salt = crypto.randomBytes(16);
    crypto.pbkdf2(password, salt, 310000, 32, 'sha256', function (err, hashedPassword) {
        if (err) { return next(err); }
        let newUser = connection.query('INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
            user,
            hashedPassword,
            salt
        ]);
        return newUser;
    });
}

function getData() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM users;", (err, row) => {
            let nomes = row.map(row => row.username);
            resolve(nomes);
        });
    })
}



module.exports = { conn, connect, signupConnect, getData };
