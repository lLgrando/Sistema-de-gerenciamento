const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD
})


/*   -----  FUNCTIONS  -----   */


function getData(date) {
    const time = new Date(date);
    let dia = String(time.getDate()).padStart(2, '0');
    let mes = String(time.getMonth() + 1).padStart(2, '0');
    let ano = String(time.getFullYear());
    return (`${ano}/${mes}/${dia}`);
}

function getDataPlusDays(myLoop, aaAate) {
    let loop = myLoop || 7;
    let data = aaAate || new Date();

    let currentDate = new Date(getData(data));
    currentDate.setDate(currentDate.getDate() + loop);

    let dia = String(currentDate.getDate()).padStart(2, '0');
    let mes = String(currentDate.getMonth() + 1).padStart(2, '0');
    let ano = String(currentDate.getFullYear());

    return (`${ano}/${mes}/${dia}`);
}

function compareDates(data1, data2) {
    let difBetweenDate = new Date(data2) - new Date(data1);
    let difNumber = Math.floor((Number(difBetweenDate) / (1000 * 60 * 60 * 24)));   // 5
    let dates = [];

    let date1 = new Date(getData(data1));
    let date2 = new Date(getDataPlusDays(difNumber, date1));

    while (difNumber > 0) {
        dates.push(date2)
        difNumber--;
        date2 = new Date(getDataPlusDays(difNumber, date1));
    }

    return dates.reverse();
}


/*  -----  QUERYS  -----  */

/* agendamentos */

function getAgendamentos() {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM agendamento;', (err, row) => {
            resolve(row);
        });
    })
}

function insertAgendamento(data) {
    //let new_data = data_format(data.data);

    let values = [
        data.cpf,
        data.cliente,
        data.servico,
        data.data,
        data.horario,
        data.observacoes
    ];

    let sql = 'INSERT INTO agendamento (cpf, cliente, servico, data, horario, observacoes) VALUES (?, ?, ?, ?, ?, ?);';

    connection.query(sql, values, (err, result) => {
        if (result) {
            return result.insertId;
        } else {
            console.log(err);
            return err;
        }
    });
}

function getPorData(initial_date, final_date) {
    let data1 = initial_date || getData(new Date()).replace(/\//g, '-');          // 1969-12-31 
    let data2 = final_date || getDataPlusDays().replace(/\//g, '-');    // 1970-01-07

    let datas = compareDates(data1, data2);

    let db_query = "SELECT cliente, data, horario FROM agendamento WHERE data BETWEEN ? AND ? ORDER BY data";

    return new Promise((resolve, reject) => {
        connection.query(db_query, [data1, data2], (err, row) => {
            resolve({ row, datas });
        });
    })
}


function getAgendamentosPorData() {
    const db_query = 'SELECT data FROM agendamento';

    return new Promise((resolve, reject) => {
        connection.query(db_query, (err, result) => {
            resolve({ result });
        })
    })
}

function getAgendamentos() {
    let day = getData(new Date());

    const db_query = 'SELECT * FROM agendamento WHERE data = ? ORDER BY horario;';

    return new Promise((resolve, reject) => {
        connection.query(db_query, day, (err, row) => {
            resolve(row);
        })
    })
}

/* clientes */

function getTotalCliente() {
    const db_query = 'SELECT COUNT(username) FROM users';

    return new Promise((resolve, reject) => {
        connection.query(db_query, (err, result) => {
            resolve(result);
        })
    })
}

/* serviços */

function getAllServicos() {
    const db_query = 'SELECT * FROM servicos;'

    return new Promise((resolve, reject) => {
        connection.query(db_query, (err, result) => {
            resolve(result);
        });
    })
}

function createServico(data_body) {
    const db_query = 'INSERT INTO servicos (codigo_sku, ncm, servico, preco, preco_custo, funcionario, disponibilidade, categoria, descricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);';

    let values = [
        data_body.codigo_sku, 
        data_body.ncm, 
        data_body.servico, 
        data_body.preco, 
        data_body.preco_custo, 
        data_body.funcionario, 
        data_body.disponibilidade, 
        data_body.categoria, 
        data_body.descricao
    ];

    return new Promise((resolve, reject) => {
        connection.query(db_query, values, (err, result) => {
            resolve(result);
        })
    })
}


module.exports = { 
    getAgendamentos, 
    insertAgendamento, 
    getPorData, 
    getAgendamentosPorData, 
    getTotalCliente,
    createServico,
    getAllServicos,
    getAgendamentos,
 }