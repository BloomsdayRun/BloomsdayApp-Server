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
-- RunnerID is numeric (Facebook ID), but FB API could change
-- Create all necessary tables for database (only one to-date)
-- Store location as varchar to avoid floating point errors
CREATE TABLE Runner ( RunnerID VARCHAR(255) NOT NULL PRIMARY KEY,
	Latitude VARCHAR(64),
	Longitude VARCHAR(64),
	Timestamp int );

-- TODO: Should really map token to RunnerID (otherwise, perhaps scan
-- on entire table to find particular token, and have issues with multiple runners with same token)
--   (However, can't have a primary key >~760 bytes)
-- Run into problems if FB OAuth tokens are longer than 2048 characters
CREATE TABLE TokenCache ( RunnerID VARCHAR(255) NOT NULL PRIMARY KEY, 
	Token VARCHAR(2048),
	Expiry int );

-- Can A follow B? (i.e., determine if they are Facebook friends)
CREATE TABLE CanFollow ( FollowerID VARCHAR(255) NOT NULL, 
	FollowedID VARCHAR(255) NOT NULL );

-- Initial data set
-- Fake Oauth token for testing
INSERT INTO TokenCache VALUES(-1, "FAKE_OAUTH_TOKEN", 2000000000);
-- Short-circuit Facebook authentication to allow certain spectator to get ENSC data
INSERT INTO CanFollow VALUES(926211520805768, -1);
-- Some test GPS data
INSERT INTO Runner VALUES (926211520805768, 1, 2, 3); 
