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
-- TODO: RunnerID is numeric; don't need varchar
-- Create all necessary tables for database (only one to-date)
CREATE TABLE Runner ( RunnerID VARCHAR(255) NOT NULL PRIMARY KEY,
	Latitude float,
	Longitude float,
	Timestamp int );

-- Run into problems if FB OAuth tokens are longer than 2048 characters
CREATE TABLE TokenCache ( RunnerID VARCHAR(255) NOT NULL PRIMARY KEY, 
	Token VARCHAR(2048),
	Expiry int );

-- Can A follow B? (i.e., determine if they are Facebook friends)
CREATE TABLE CanFollow ( FollowerID VARCHAR(255) NOT NULL, 
	FollowedID VARCHAR(255) NOT NULL );
