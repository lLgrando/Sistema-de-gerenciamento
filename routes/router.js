var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');
var db = require('../db');
var db_agendamento = require('../db_agendamento');
var isAuthenticated = require('../middlewares/authentication');
var utils = require('../public/javascripts/utils');
var controller_admin = require('../controller/admin_panel');
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


// ROTAS

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

router.post('/signup', utils.middlewareValidationSignup, (req, res, next) => {
    let newUser = db.signupConnect(req.body.username, req.body.password);
    if (newUser === true) {
        res.redirect('/');
    } else {
        res.redirect('/signup');
    }
});

/* ADMIN PANEL */

router.get('/admin', isAuthenticated, async (req, res) => {
    let data = await controller_admin.getDashboard();
    res.render('admin_panel/dashboard', { espec: data.espec,agendamentosDoDia: data.agendamentosDoDia });
});

router.get('/admin/calendario', isAuthenticated, async (req, res) => {
    let data = await controller_admin.getCalendario();
    res.render('admin_panel/calendario', { data: data });
})

router.post('/admin/calendario', isAuthenticated, async (req, res) => {
    let data = await controller_admin.postCalendario(req.body.initial_date, req.body.final_date);
    res.render('admin_panel/calendario', { data: data });
})

router.get('/admin/cadastrar', isAuthenticated, (req, res) => {
    res.render('admin_panel/admin_cadastrar_cliente');
})

router.get('/admin/agendamento', isAuthenticated, async (req, res, next) => {
    res.render('admin_panel/novo_servico');
})





router.post('/admin/agendamento', isAuthenticated, (req, res) => {
    let dados = db_agendamento.insertAgendamento(req.body);
    setTimeout(() => {
        res.redirect('/admin/agendamento');
    }, 1000)
})

router.get('/admin/historico', isAuthenticated, async (req, res) => {
    let data = await db_agendamento.getAgendamentos();
    res.render('admin_panel/historico', { data: data, formatDate: utils.formatDate, formatHours: utils.formatHours });
});

router.get('/admin/servicos', isAuthenticated, async (req, res) => {
    let data = await db_agendamento.getAllServicos();
    res.render('admin_panel/servicos', {data: data});
});

router.post('/admin/servicos', isAuthenticated, async (req, res) => {
    let data = await db_agendamento.createServico(req.body);
    res.redirect('/admin/servicos');
});


module.exports = router;