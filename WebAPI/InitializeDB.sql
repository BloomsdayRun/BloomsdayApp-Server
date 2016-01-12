-- Create database/schema
CREATE DATABASE bloomsday;

-- Make a user with all privileges on dbms
INSERT INTO mysql.user (User, Host, Password) 
	VALUES('USERNAME','localhost',PASSWORD('PASSWORD'));
FLUSH PRIVILEGES;

-- TODO: Is it okay to have MySQL server on localhost?
GRANT ALL PRIVILEGES ON bloomsday.* TO USERNAME@localhost;
FLUSH PRIVILEGES;


USE bloomsday;
-- Create all necessary tables for database (only one to-date)
CREATE TABLE Runner ( RunnerID VARCHAR(255) NOT NULL PRIMARY KEY,
	Latitude float,
	Longitude float,
	Timestamp int );

-- TODO: Friends table, token cache table
