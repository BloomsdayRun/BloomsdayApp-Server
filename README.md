Here is some initial work on a node.js webserver for the Bloomsday application. Although I think we'll end up using AWS for the app, it would be nice to have a server for the ENSC to test their GPS chip.

The IP address of the lab server is 147.222.165.86

Usage: Ensure you have node.js installed, then run node [insert file name].js to start the server. Then point your web browser to localhost:8080 for the basic webserver, or localhost:8080/hi.txt for the static file server.

Good reading:  

Intro to REST - http://rest.elkstein.org/  
Intro to node.js - http://blog.modulus.io/absolute-beginners-guide-to-nodejs  
Making a REST service with node.js - http://www.qat.com/simple-rest-service-node-js-express/  
