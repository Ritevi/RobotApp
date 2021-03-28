/* eslint-env mocha */
const request = require('supertest');
const { expect } = require('chai');
const faker = require('faker');
const App = require('../../app');

let expressApp;
let user;

describe('Auth module', () => {
  before(function (done) {
    const app = new App();
    expressApp = request(app.getExpress());
    this.timeout(1500);
    setTimeout(done, 900);
  });
  // so much time to connect to DB

  let currentResponse = null;

  afterEach(function () {
    const errorBody = currentResponse && currentResponse.body;

    if (this.currentTest.state === 'failed' && errorBody) {
      console.log(errorBody);
    }

    currentResponse = null;
  });
  describe('POST /Auth/Register', () => {
    it('register classic user', (done) => {
      user = {
        username: faker.internet.userName(),
        password: 'herher',
      };

      expressApp
        .post('/Auth/Register')
        .send(user)
        .expect(200)
        .end((err, res) => {
          currentResponse = res;
          expect(res.body).to.have.property('userId');
          expect(res.body).to.not.have.property('error');
          return done(err);
        });
    });
  });

  describe('POST /Auth/Login', () => {
    before(function (done) {
      this.timeout(1500);
      setTimeout(done, 900);
    });
    it('login classic user', (done) => {
      const LogUser = {
        username: user.username,
        password: 'herher',
        fingerprint: '123',
      };

      expressApp
        .post('/Auth/Login')
        .set('user-agent', 'PostmanRuntime/7.26.8')
        .send(LogUser)
        .expect(200)
        .end((err, res) => {
          currentResponse = res;
          expect(err).to.not.be.an('Error');
          expect(res.body).to.have.property('tokens');
          expect(res.body.tokens).to.have.property('refreshToken');
          expect(res.body.tokens).to.have.property('accessToken');
          expect(res.body).to.not.have.property('error');
          return done(err);
        });
    });

    it('login wrong password', (done) => {
      const LogUser = {
        username: user.username,
        password: 'wrong',
        fingerprint: '123',
      };

      expressApp
        .post('/Auth/Login')
        .set('user-agent', 'PostmanRuntime/7.26.8')
        .send(LogUser)
        .expect(400)
        .end((err, res) => {
          currentResponse = res;
          expect(res.status).to.be.within(400, 500, 'no error status');
          expect(res.body).to.have.property('error');
          expect(res.body.error).to.have.string('AUTH');
          return done(err);
        });
    });

    it('login validation check without fingerprint', (done) => {
      const LogUser = {
        username: user.username,
        password: 'herher',
      };

      expressApp
        .post('/Auth/Login')
        .send(LogUser)
        .end((err, res) => {
          currentResponse = res;
          expect(res.status).to.be.within(400, 500, 'no error status');
          expect(res.body).to.have.property('error');
          expect(res.body.error).to.have.string('ValidationError');
          return done(err);
        });
    });
  });

  describe('POST /Auth/refresh', () => {
    before(function (done) {
      this.timeout(1500);
      setTimeout(done, 900);
    });
    it('refresh previous token', (done) => {
      const loginUser = {
        username: user.username,
        password: 'herher',
        fingerprint: '123',
      };

      expressApp
        .post('/Auth/Login')
        .set('user-agent', 'PostmanRuntime/7.26.8')
        .send(loginUser)
        .expect(200)
        .end((err, res) => {
          currentResponse = res;
          const { tokens } = res.body;
          if (!tokens) {
            return done(err);
          }
          const body = {
            refreshToken: tokens.refreshToken,
            fingerprint: loginUser.fingerprint,
          };
          expressApp
            .post('/Auth/refresh')
            .set('user-agent', 'PostmanRuntime/7.26.8')
            .set('authorization', `Bearer ${res.body.tokens.accessToken}`)
            .send(body)
            .expect(200)
            .end((refreshErr, refreshRes) => {
              currentResponse = refreshRes;
              // eslint-disable-next-line no-unused-expressions
              expect(refreshErr).to.be.null;
              expect(refreshRes.body).to.have.property('tokens');
              expect(refreshRes.body.tokens).to.have.property('refreshToken');
              expect(refreshRes.body.tokens).to.have.property('accessToken');
              expect(refreshRes.body).to.not.have.property('error');
              done(refreshErr);
            });
        });
    });
  });
});
