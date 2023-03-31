/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

      first_name VARCHAR(30) NOT NULL,
      last_name VARCHAR(30) NOT NULL,
      middle_name VARCHAR(30),
      nickname VARCHAR(30),
      phone VARCHAR(10) NOT NULL UNIQUE,
      email VARCHAR(30) NOT NULL UNIQUE,
      login_passcode VARCHAR(100) NOT NULL,
      one_time_password VARCHAR(6)
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE users;
  `);
};
