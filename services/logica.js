const { pool } = require('../config');
const bcrypt = require('bcrypt');

const getUsers = (request, response) => {
    pool.query('SELECT username FROM users', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }

const getPokemons = (req,res) => {
    pool.query(
        'SELECT usersxpokes.id_user ,usersxpokes.id_pokedex, usersxpokes.place, pokemons.name, usersxpokes.justification from usersxpokes left join pokemons on usersxpokes.id_pokedex = pokemons.id_pokedex where id_user = $1',
        [req.session.passport.user],
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).json(results.rows)
        }
    )
}


const getPokemonsOther = (req, res) => {
    pool.query(
        'SELECT usersxpokes.id_user ,usersxpokes.id_pokedex, usersxpokes.place, pokemons.name, usersxpokes.justification \
        from usersxpokes \
        left join pokemons on usersxpokes.id_pokedex = pokemons.id_pokedex \
        left join users on usersxpokes.id_user = users.id \
        where users.username = $1',
        [req.params.username],
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).json(results.rows)
        }
    )
}

//para aleatorizar la lsita de usuarios en cada request
function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

const getOtherUsers = (req,res) => {
    pool.query(
        'SELECT users.id, users.username, poke1.id_pokedex as id1, poke1.name as name1, poke1.justification as just1, poke2.id_pokedex as id2, poke2.name as name2, poke2.justification as just2, poke3.id_pokedex as id3, poke3.name as name3, poke3.justification as just3 \
        from users left join (select id_user, pokemons.id_pokedex, name, justification  from usersxpokes left join pokemons on usersxpokes.id_pokedex = pokemons.id_pokedex where place = 1) poke1 on users.id = poke1.id_user \
        left join (select id_user, pokemons.id_pokedex, name, justification from usersxpokes left join pokemons on usersxpokes.id_pokedex = pokemons.id_pokedex where place = 2) poke2 on users.id = poke2.id_user \
        left join (select id_user, pokemons.id_pokedex, name, justification  from usersxpokes left join pokemons on usersxpokes.id_pokedex = pokemons.id_pokedex where place = 3) poke3 on users.id = poke3.id_user \
        where users.id <> $1',
        [req.session.passport.user],
        (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).json(shuffle(results.rows));
        }
    );
    
}

const signIn = (req, res) => {
    //verificar si no hay otro usuario
    pool.query(
        'SELECT id from users where username = $1',
        [req.body.username],
        (error, results) => {
            if (error) {
                throw error
            }

            if(results.rows.length > 0) {
                res.status(403).json(results.rows);
            } else {
                //hacer sign in
                
                let userType = 'user' 

                const iniciaConTest = new RegExp('^test')
                if (iniciaConTest.test(req.body.username)) {
                    userType = 'test'
                }

                pool.query(
                    'INSERT INTO users (username, type) \
                    VALUES ($1, $2)',
                    [req.body.username, userType],
                    (error,results) => {
                        if (error) {
                            throw error
                        }
                    }
                )

                bcrypt.hash(req.body.password, 10, function(err, hash) {
                    pool.query(
                        'UPDATE users \
                        SET password_hash = $1 \
                        WHERE username = $2',
                        [hash, req.body.username],
                        (error,results) => {
                            if (error) {
                                throw error
                            }
                        }
                    );
                });
                res.status(200).json({username: req.body.username});
            }
        }
    )

    

}

const check = (req,res) => {
    pool.query(
        'SELECT username from users where id=$1',
        [req.session.passport.user],
        (error,results) => {
            if (error) {
                throw error
            }
            res.status(200).json(results.rows)
        }
    )
    
}

const addPokemon = (req, res) => {
    // parámetros necesario: place, id, name, justification

    //checar si debemos agregar registro a tabla: pokemons. Si sí, agregar
    pool.query(
        'SELECT * FROM pokemons WHERE id_pokedex = $1',
        [req.body.id],
        (error,results) => {
            if (error) {
                throw error
            }
            if (results.rows.length === 0) {
                pool.query(
                    'INSERT INTO "pokemons" (id_pokedex, name) \
                    VALUES ($1,$2)',
                    [req.body.id,req.body.name],
                    (error,results) => {
                        if (error) {
                            throw error
                        }
                    }
                )
            }
        }
    )
    //agregar a tabla usersxpokes
    pool.query(
        'INSERT INTO "usersxpokes" (id_user, id_pokedex, place, justification)\
        VALUES ($1,$2,$3,$4)',
        [req.session.passport.user,req.body.id,req.body.place,req.body.justification],
        (error,results) => {
            if (error) {
                throw error
            }
            res.status(200).json(results.rows);
        }
    )
    
}

module.exports = {
    getUsers,
    getPokemons,
    getOtherUsers,
    signIn,
    addPokemon,
    getPokemonsOther,
    check
}