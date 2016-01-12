A MySQL/Express/Node.js webserver for the Bloomsday application. Hosted on AWS EC2. The relevant code is in WebAPI; the rest of this repo is mostly practice work.

URL: http://52.33.234.200:8080

Routes (all requests should have the header *access-token*):  
GET:  
* /api/runner?id=ID  
POST:  
* /api/runner/?latitude=LAT&longitude=LON&timestamp=TS

Responses - Errors are prefaced with (ERROR::), successes have no prefix :  
GET:  
* "ERROR::FBAUTH error on get (expired token?)"
 - Graph API error (probably expired token)
* "ERROR::Get non-friend or nonexistent user"
 - Requester isn't friends with user
* "ERROR::SQL Output " + err
 - Error in SQL query
* "ERROR::DBMS attempt to access user with no defined location"
 - Requester is friends with user, but query is empty
* A successful request returns a JSON formatted string with: RunnerID, Latitude, Longitude, and Timestamp

POST:  
* "ERROR::FBAUTH error when posting"
 - Graph API error (probably expired token)
* "ERROR::DBMS error when posting::" + err
 - Error in SQL query
* "POST_SUCCESS"
 - Successfully updated position


Good reading:  

Intro to REST - http://rest.elkstein.org/  
Intro to node.js - http://blog.modulus.io/absolute-beginners-guide-to-nodejs  
Making a REST service with node.js - http://www.qat.com/simple-rest-service-node-js-express/  
How to Get Started on the MEAN Stack - https://hackhands.com/how-to-get-started-on-the-mean-stack/  
Mongoose Doc - http://mongoosejs.com/docs/  
Easily Develop Node.js and MongoDB Apps with Mongoose - https://scotch.io/tutorials/using-mongoosejs-in-node-js-and-mongodb-applications  
