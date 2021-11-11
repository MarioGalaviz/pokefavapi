const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { pool } = require('./config')
const logica = require('./services/logica')
const passport = require('passport');
const session = require("express-session");
const cookieParser = require("cookie-parser");
require('./config/passport');

const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(session({ 
  secret: 'juan the keyboard cat',
  resave: true,
  cookie: { maxAge: 1000*60*60*24 },
  saveUninitialized: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "frontendURL");
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
  "Access-Control-Allow-Headers",
  "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
  });



app.get('/users',logica.getUsers);

//obtener los pokemons del usuario en sesión
app.get('/pokes',logica.getPokemons);

//obtener los pokemons de otro usuario
app.get('/pokes/:username',logica.getPokemonsOther);

//obtener los pokemons de todos los usuarios menos del que hizo el request
app.get('/pokesusers',logica.getOtherUsers);

//hacer login con passport js
app.post('/login',passport.authenticate('local'),function(req, res) {
  res.json({ id: req.user.id, username: req.user.username, type: req.user.type });
})

//hacer signin, hacer registro en BD
app.post('/signin',logica.signIn)

//hacer log out
app.get('/logout', function(req, res){
  req.logout();
  res.status(200).json([{message: 'exito'}]);
});

//checar si el usuario está logeado
app.get('/check', logica.check)

//agregar un pokemon al top 3 pokes del usuario
//parametros necesarios: nombre, id, place
app.post('/agregar',logica.addPokemon)

// Start server
app.listen(process.env.PORT || 3002, () => {
  console.log(`Server listening in ${process.env.PORT}`)
})