import { expect } from 'chai';
import request from 'request';

import config from '../src/config.js';


const authUrl = `http://${config.host}:${config.port}/login`;
const greetingUrl = `http://${config.host}:${config.port}/greeting`;


describe('Greeting API', function() {

  describe('Authentication', function() {

    it('fails for non-registered user', done => {
      request({
        method: 'POST',
        uri: authUrl,
        json: {
          email: 'qwe@asd.zxc',
          password: '12345'
        }
      }, (error, response, body) => {
        expect(response.statusCode).to.equal(404);
        done();
      });
    });

    it('fails when no credentials present', done => {
      request({
        method: 'POST',
        uri: authUrl
      }, (error, response, body) => {
        expect(response.statusCode).to.equal(400);
        done();
      });
    });

    it('fails on incorrect password', done => {
      request({
        method: 'POST',
        uri: authUrl,
        json: {
          email: 'some_user@domain.com',
          password: '12345'
        }
      }, (error, response, body) => {
        expect(response.statusCode).to.equal(401);
        done();
      });
    });

    it('returns JWT token', done => {
      request({
        method: 'POST',
        uri: authUrl,
        json: {
          email: 'some_user@domain.com',
          password: 'sample-password'
        }
      }, (error, response, body) => {
        expect(response.statusCode).to.equal(200);
        expect(body.token).to.be.a('string');
        done();
      });
    });
  });


  describe('Greeting', function() {

    it('fails on unauthorized user', done => {
      request(greetingUrl, (error, response, body) => {
        expect(response.statusCode).to.equal(401);
        done();
      });
    });

    it('fails when a user has no permission', done => {
      request({
        method: 'POST',
        uri: authUrl,
        json: {
          email: 'guest@mail.ru',
          password: 'qwerty123'
        }
      }, (error, response, body) => {
        request({
          uri: greetingUrl,
          auth: {
            bearer: body.token
          }
        }, (error, response, body) => {
          expect(response.statusCode).to.equal(403);
          done();
        });
      });
    });

    it('greets a user with sufficient permissions', done => {
      request({
        method: 'POST',
        uri: authUrl,
        json: {
          email: 'some_user@domain.com',
          password: 'sample-password'
        }
      }, (error, response, body) => {
        request({
          uri: greetingUrl,
          auth: {
            bearer: body.token
          }
        }, (error, response, body) => {
          expect(response.statusCode).to.equal(200);
          expect(body).to.equals('Hello, John Doe!');
          done();
        });
      });
    });
  });

});
