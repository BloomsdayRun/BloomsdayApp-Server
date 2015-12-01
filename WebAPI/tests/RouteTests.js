var request = require('supertest');
// var path = require('path');

describe("Basic Route Tests :: ", function() {
    var server;
    beforeEach(function () {
        //Erase server from cache to ensure it is reloaded for each test
        delete require.cache[require.resolve("../AWSServer.js")];
        server = require("../AWSServer.js");
    });
    afterEach(function(done) {
        server.close(done);
    });

    it("Root", function testRoot(done) {
        request(server)
         .get("/")
         .expect(200, done);
    });

    it("404", function testBroken(done) {
        request(server)
         .get("/not/a/route")
         .expect(404, done);
    });

    var fakeId = 12345;
    //No Access Token
    //TODO: When error/success messages are determined, parse & verify response body
    it("GET - No Access Token", function testGet(done) {
        request(server)
         .get("/api/runner/?id=" + fakeId)
         // .get("/api/runner/")
         // .field("id", fakeId)
         // .send({id: fakeId})
         .expect(200, done);
    });

    //TODO: Insert URL parameters programatically
    it("POST - No Access Token", function testPost(done) {
        request(server)         
         .post("/api/runner/?id=" + fakeId + "&latitude=20&longitude=30&timestamp=99999")
         .expect(200, done);
    });

    //With access token
    //TODO: Acquire this token programatically!
    var token = "CAAXtWPCfDWsBAKBrSgcZAu9ScVdWi6VtwVHJEXyDMhkb0jVI7gsc32HAESilCGNTNxZBjisB4iSWI866XGUmJ2Hv0UnJTUzBFw3KhAkFRJ0E1PjtolAQXvzqr45UsI9ZBLUzpnejFEvmR7AGGv7SX7ZASof8DPT14MPRCgpyR3fpc2jLJVI0j3k7ZCDmWffZCWo7zLTWKHE8xdmbIEGR51";
    //TODO: Decide what JSON errors server should generate, then validate output
    //No Access Token
    //TODO: When error/success messages are determined, parse & verify response body
    it("GET - Valid Access Token", function testGet(done) {
        request(server)
         .get("/api/runner/?id=" + fakeId)
         .set("Access-Token", token)
         .expect(200, done);
    });

    //TODO: Insert URL parameters programatically
    it("POST - Valid Access Token", function testPost(done) {
        request(server)         
         .post("/api/runner/?id=" + fakeId + "&latitude=3&longitude=1&timestamp=499999")
         .set("Access-Token", token)
         .expect(200, done);
    });

});
