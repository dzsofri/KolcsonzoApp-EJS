const express = require('express');
const ejs = require('ejs');
const db = require('./database');
const router = express.Router();
const moment = require('moment');

// CORE routes

// Kezdőlap betöltése
router.get('/', (req, res) => {

    
    ejs.renderFile('./views/index.ejs', { session: req.session }, (err, html) => {
        if (err) {
            console.log(err);
            return;
        }   
        req.session.msg = '';
        res.send(html);
    });
});



router.get('/admin', (req, res) => {
    if (req.session.isLoggedIn) {
        db.query(`
            SELECT * FROM users`,(err, results) => {
            if (err) {
                console.log(err);
                return;
            }
            results.forEach(item => {
                item.user_id = item.user_id
                    item.name = item.name
                    item.email = item.email
                    item.membership_date = moment(item.membership_date).format("yyyy-MM-DD")
                    item.role = item.role
            });
 
            // EJS sablon renderelése
            ejs.renderFile('./views/admin.ejs', { session: req.session, results }, (err, html) => {
                if (err) {
                    console.log(err);
                    return;
                }
                // Üzenet törlése
                req.session.msg = '';
                res.send(html);
            });
        });
        return;
    }
    // Ha a felhasználó nincs bejelentkezve, átirányítjuk a főoldalra
    res.redirect('/');
});



// Regisztrációs oldal betöltése
router.get('/reg', (req, res) => {
    ejs.renderFile('./views/regist.ejs', { session: req.session }, (err, html) => {
        if (err) {
            console.log(err);
            return;
        }
        req.session.msg = '';
        res.send(html);
    });
});


// Kölcsönző oldal betöltése
router.get('/kolcsonzo', (req, res) => {
    if (req.session.isLoggedIn) {
        db.query(`
            SELECT * FROM items WHERE available = 1`,(err, results) => {
            if (err) {
                console.log(err);
                return;
            }
            // Az összes kölcsönzés dátumát formázni
            results.forEach(item => {
                item.title = item.title
                    item.available = 'elérhető'
                    item.item_id = item.item_id
            });
 
            // EJS sablon renderelése
            ejs.renderFile('./views/kolcsonzo.ejs', { session: req.session, results }, (err, html) => {
                if (err) {
                    console.log(err);
                    return;
                }
                // Üzenet törlése
                req.session.msg = '';
                res.send(html);
            });
        });
        return;
    }
    // Ha a felhasználó nincs bejelentkezve, átirányítjuk a főoldalra
    res.redirect('/');
});

// Saját kölcsönzés lekérése
router.get('/own', (req, res) => {

    if (req.session.isLoggedIn) {

        // SQL lekérdezés a saját kölcsönzésekhez, felhasználó nevével és tárgy nevével
        db.query(`
            SELECT rentals.*, users.name AS user_name, items.title AS item_title
            FROM rentals
            JOIN users ON rentals.user_id = users.user_id
            JOIN items ON rentals.item_id = items.item_id
            WHERE rentals.user_id = ?
            
        `, [req.session.userID], (err, results) => {
            if (err) {

                console.log(err);
                return;
            }
console.log('User ID:', req.session.userID);

            // Ellenőrizd, hogy a 'results' tartalmaz adatokat
            console.log(results); // Ez segít megérteni, hogy miért nem jelennek meg az adatok

            // Az összes kölcsönzés dátumát formázni
            results.forEach(item => {
                item.rental_id = item.rental_id;
                item.rental_date = moment(item.rental_date).format('YYYY.MM.DD.');
                if (item.return_date) {
                    item.return_date = moment(item.return_date).format('YYYY.MM.DD.');
                }
            });

            // EJS sablon renderelése
            ejs.renderFile('./views/sajatkolcsonzo.ejs', { session: req.session, results }, (err, html) => {
                if (err) {
                    console.log(err);
                    return;
                }

                // Üzenet törlése
                req.session.msg = '';
                res.send(html);
            });
        });

        return;
    }

    // Ha a felhasználó nincs bejelentkezve, átirányítjuk a főoldalra
    res.redirect('/');
});





/*

// Új adat bevitele
router.get('/newdata', (req, res) => {
    if (req.session.isLoggedIn) {
        ejs.renderFile('./views/kolcsonzo.ejs', { session: req.session }, (err, html) => {
            if (err) {
                console.log(err);
                return;
            }
            req.session.msg = '';
            res.send(html);
        });
        return;
    }
    res.redirect('/');
});
*/



// Kijelentkezés
router.get('/logout', (req, res) => {
    req.session.isLoggedIn = false;
    req.session.isAdmin = false;
    req.session.userID = null;
    req.session.userName = null;
    req.session.userEmail = null;
    req.session.userRole = null;
    req.session.msg = 'You are logged out!';
    req.session.severity = 'info';
    res.redirect('/');
});

module.exports = router;
