const express = require('express');
const db = require('../helper/userHelper');





const route = express.Router();

route.get('/', (req, res) => {

    if (req.session.email) {
        res.redirect('/');
    } else {
        const message = req.session.message;
        req.session.message = "";
        res.render('login', { message: message });
    }
})

route.post('/', (req, res) => {

    db.doLogin(req.body).then((data) => {
        if (data.status) {
            req.session.message = "log in success";
            req.session.email = req.body.email
            req.session.username = data.username;

            res.redirect('http://127.0.0.1:5000?username=' + data.username + '&image=' + data.image + '&id=' + data.id);
        }
        else {
            req.session.message = "user name or password is wrong";
         
        }

    }).catch(e => console.log(e));


})

module.exports = route;