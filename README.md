A simple Node.js webserver for the Bloomsday application. Although I think we'll end up using AWS for the app, the ENSC group can use this server to test their GPS chip.

The IP address of the lab server is 147.222.165.86. If ENSCServer is running, then you should be able to get a list of entries by pointing your web browser to 147.222.165.86:9000. 

Running the server: Ensure you have Node.js and the server dependencies installed and that a MongoDB instance is running on port 27017. Then run "nodejs ENSCServer.js" to start the server. To test the server, you can use the Google Chrome add-on Postman to generate post requests. Make sure you specify the request type as JSON.

(basic_webserver and static_file_server are practice server applications with no database backend)

(DynamoDBPythonScripts contains some scripts for creating, updating, and reading from a DynamoDB table; this is similar to what we'll be doing with the AWS iOS SDK)

Good reading:  

Intro to REST - http://rest.elkstein.org/  
Intro to node.js - http://blog.modulus.io/absolute-beginners-guide-to-nodejs  
Making a REST service with node.js - http://www.qat.com/simple-rest-service-node-js-express/  
How to Get Started on the MEAN Stack - https://hackhands.com/how-to-get-started-on-the-mean-stack/  
Mongoose Doc - http://mongoosejs.com/docs/  
Easily Develop Node.js and MongoDB Apps with Mongoose - https://scotch.io/tutorials/using-mongoosejs-in-node-js-and-mongodb-applications  
