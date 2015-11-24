var request = require('supertest');
// var path = require('path');

describe("Route Tests :: ", function() {
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

});