const express = require('express');
const route = express.Router();
const bcrypt = require('bcrypt');
const userHelper = require('../helper/userHelper');
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);

route.get('/', (req, res) => {
    const message = req.session.message;
    req.session.message = "";
    res.render('register', { message: message });
})

route.post('/', async (req, res) => {

    const count = await userHelper.userCount(req.body).then(data => data.user);

    if (!count) {
        const hashpass = await bcrypt.hash(req.body.password, 10);

        const obj = {
            "username": req.body.username,
            "email": req.body.email,
            "password": hashpass,
            "dob": req.body.birthday,
            "sex": req.body.gender,
            "phone": req.body.phone,
            "goal": req.body.goal,
            "image": req.body.image
        }

        userHelper.addUser(obj);
        req.session.message = "user data inserted";
        var indigo = [req.body.username, hashpass, req.body.email, req.body.image];
        $.ajax({
            type: "POST", //
            url: "http://127.0.0.1:5000/session", // url to the function
            data: {
               user:indigo
            },
            success: function (response) {
                console.log('session success');
            },
        });
        res.redirect('http://127.0.0.1:5000/');
    }
    else {
        req.session.message = "user already exist";
        res.redirect('http://127.0.0.1:5000/SignUp');
    }



})


module.exports = route;