CREATE TABLE "users" (
  "id" bigserial PRIMARY KEY,
  "username" varchar(12) UNIQUE,
  "password_hash" varchar(255),
  "type" varchar(50)
);

INSERT INTO "users" (username, password_hash, type)
VALUES
  ('test', '$2b$10$1Pvb81oBIdC4ZSRE1RK//ODwOT1uF2FPz9lOVkspmVk8dHx1l/nYq','test'),
  ('test2', '$2b$10$1Pvb81oBIdC4ZSRE1RK//ODwOT1uF2FPz9lOVkspmVk8dHx1l/nYq','test'),
  ('test3', '$2b$10$1Pvb81oBIdC4ZSRE1RK//ODwOT1uF2FPz9lOVkspmVk8dHx1l/nYq', 'test');


CREATE TABLE "pokemons" (
  "id_pokedex" int UNIQUE PRIMARY KEY,
  "name" varchar(255) UNIQUE
);

INSERT INTO "pokemons" (id_pokedex, name)
VALUES 
  (149,'dragonite'),
  (7,'squirtle'),
  (246,'larvitar'),
  (158,'totodile'),
  (143,'snorlax'),
  (128,'tauros');

CREATE TABLE "usersxpokes" (
  "id_user" int ,
  "id_pokedex" int,
  "place" int,
  "justification" varchar(255),
  FOREIGN KEY (id_user) REFERENCES users(id),
  FOREIGN KEY (id_pokedex) REFERENCES pokemons(id_pokedex),
  PRIMARY KEY (id_user, id_pokedex)
);

INSERT INTO usersxpokes
VALUES
  (1,7,1,'está bien bonito'),
  (1,149,2,'es un dragón poderoso pero buen pedo'),
  (1,246,3,'hace ruidos cute'),
  (2,158,1,'toto toto'),
  (2,143,2,'snooorlax'),
  (3,128,1,'pinche toro chingón');