var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');
var db = require('../db');
var db_agendamento = require('../db_agendamento');
var isAuthenticated = require('../middlewares/authentication');
var schema_signup = require('../models/schema');
var utils = require('../public/javascripts/utils');


module.exports.getDashboard = async function() {
    let agendamentosDoDia = await db_agendamento.getAgendamentos();
    let { result } = await db_agendamento.getAgendamentosPorData();
    await db_agendamento.getTotalCliente();
    let espec = [];
    for (let mes = 1; mes <= 12; mes++) {
        let count = 0;
        result.forEach(element => {
            if ((element.data.getMonth() + 1) === mes && element.data.getFullYear() == new Date().getFullYear()) {
                count++;
            }
        });
        espec.push({mes: mes, qtd: count});
    }
    return { agendamentosDoDia, espec };
}

/* calendário */

module.exports.getCalendario = async function() {
    return await db_agendamento.getPorData();
}

module.exports.postCalendario = async function(initial_date, final_date) {
    return await db_agendamento.getPorData(initial_date, final_date);
}

/* cadastrar */