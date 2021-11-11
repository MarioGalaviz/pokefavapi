var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { pool } = require('../config');

passport.use(new LocalStrategy((username, password, cb) => {
    
    pool.query('SELECT id, username, password_hash, type FROM users WHERE username=$1', [username], (err, result) => {
      if(err) {
        return cb(err)
      }
      
      if(result.rows.length > 0) {
        const first = result.rows[0];
        // bcrypt.hash(first.password, 10, function(err, hash) {
        //   // Store hash in your password DB.
        // });
        
        bcrypt.compare(password, first.password_hash, function(err, res) {
          if(res) {
            cb(null, { id: first.id, username: first.username, type: first.type })
           } else {
            cb(null, false, {message: 'Contraseña incorrecta'})
           }
         })
       } else {
         cb(null, false, {message: 'Usuario inexistente'})
       }
    })
  }))

passport.serializeUser((user, done) => {
  return done(null, user.id)
})

passport.deserializeUser((id, cb) => {
  pool.query('SELECT id, username, type FROM users WHERE id = $1', [parseInt(id, 10)], (err, results) => {
    if(err) {
      return cb(err)
    }

    return cb(null, results.rows[0])
  })
})
  