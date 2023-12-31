var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');
var db = require('../db');
var db_agendamento = require('../db_agendamento');
var isAuthenticated = require('../middlewares/authentication');
var schema_signup = require('../models/schema');

var router = express.Router();


// AUTENTICAÇÃO

passport.use(new LocalStrategy(function verify(username, password, cb) {
    let database = db.conn();
    let base = database.query('SELECT * FROM users WHERE username = ?', [username], function (err, row) {
        if (err) { return cb(err); }
        if (!row) { return cb(null, false, { message: 'Incorrect username or password.' }); }

        crypto.pbkdf2(password, row[0].salt, 310000, 32, 'sha256', function (err, hashedPassword) {
            if (err) { return cb(err); }
            if (!crypto.timingSafeEqual(row[0].hashed_password, hashedPassword)) {
                return cb(null, false, { message: 'Incorrect username or password.' });
            }
            return cb(null, row);
        });
    });
}));

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id, username: user.username });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});


// FUNCTION & MIDDLEWARES

function formatDate(dataFromBd) {
    let data = new Date(dataFromBd);
    let day = String(data.getDate()).padStart(2, "0");
    let month = data.getMonth() + 1;
    let year = data.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatHours(dataFromBd) {
    let [hours, minutes] = dataFromBd.split(':');
    return `${hours}:${minutes}`;
}

function middlewareValidationSignup(req, res, next) {
    String(req.body.password);
    const { error } = schema_signup.validate(req.body);
    if (error) {
        return res.status(422).json({ error: error.details });
    } else {
        next();
    }
}


// ROTEAMENTO

router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/login', (req, res, next) => {
    res.render('login');
});

router.post('/login/password', passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/login'
}));

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

router.get('/signup', (req, res, next) => {
    res.render('signup');
});

router.post('/signup', middlewareValidationSignup, (req, res, next) => {
    let newUser = db.signupConnect(req.body.username, req.body.password);
    if (newUser === true) {
        res.redirect('/');
    } else {
        res.redirect('/signup');
    }
});

/* ADMIN PANEL */

router.get('/admin', isAuthenticated, async (req, res, next) => {
    let { result } = await db_agendamento.getAgendamentosPorData();
    await db_agendamento.getTotalCliente();
    let espec = [];
    for (let mes = 1; mes <= 12; mes++) {
        let count = 0;
        result.forEach(element => {
            if ((element.data.getMonth() + 1) === mes) {
                count++;
            }
        });
        espec.push({mes: mes, qtd: count});
    }
    res.render('admin_panel/dashboard', {espec: espec});
});


router.get('/admin/calendario', isAuthenticated, async (req, res, next) => {
    let data = await db_agendamento.getPorData();
    console.log(data.row[0].data + " " + typeof (data.row[0].data));
    console.log(data.datas[0] + " " + typeof (data.datas[0]));
    res.render('admin_panel/calendario', { data: data, formatDate: formatDate, formatHours: formatHours });
})

router.post('/admin/calendario', isAuthenticated, async (req, res, next) => {
    let data = await db_agendamento.getPorData(req.body.initial_date, req.body.final_date);
    res.render('admin_panel/calendario', { data: data, formatDate: formatDate, formatHours: formatHours });
})

router.get('/admin/cadastrar', isAuthenticated, (req, res, next) => {
    res.render('admin_panel/admin_cadastrar_cliente');
})

router.get('/admin/agendamento', isAuthenticated, async (req, res, next) => {
    let data = await db_agendamento.getAgendamentos();
    res.render('admin_panel/novo_servico', { data: data });
})

router.post('/admin/agendamento', isAuthenticated, (req, res, next) => {
    let dados = db_agendamento.insertAgendamento(req.body);
    setTimeout(() => {
        res.redirect('/admin/agendamento');
    }, 1000)
})

router.get('/admin/historico', isAuthenticated, async (req, res, next) => {
    let data = await db_agendamento.getAgendamentos();
    res.render('admin_panel/historico', { data: data, formatDate: formatDate, formatHours: formatHours });
})

router.get('/admin/servicos', isAuthenticated, (req, res, next) => {
    res.render('admin_panel/servicos');
})

module.exports = router;