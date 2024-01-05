module.exports.formatDate = function (dataFromBd) {
    let data = new Date(dataFromBd);
    let day = String(data.getDate()).padStart(2, "0");
    let month = String(data.getMonth() + 1).padStart(2, "0");
    let year = data.getFullYear();
    return `${day}/${month}/${year}`;
}

module.exports.formatHours = function (dataFromBd) {
    let [hours, minutes] = dataFromBd.split(':');
    return `${hours}:${minutes}`;
}

module.exports.middlewareValidationSignup = function (req, res, next) {
    String(req.body.password);
    const { error } = schema_signup.validate(req.body);
    if (error) {
        return res.status(422).json({ error: error.details });
    } else {
        next();
    }
}