/* eslint-env mocha */
const request = require('supertest');
const { expect } = require('chai');
const faker = require('faker');
const App = require('../../app');

let expressApp;
let accessToken;
let user;

describe('Robot module', () => {
  before(function (done) {
    const app = new App();
    expressApp = request(app.getExpress());
    this.timeout(1500);
    setTimeout(done, 900);
  });

  before(() => {
    user = {
      username: faker.internet.userName(),
      password: 'herher',
    };
    expressApp
      .post('/Auth/Register')
      .send(user)
      .expect(200)
      .end((err, res) => {
        expect(res.body).to.have.property('userId');
        expect(res.body).to.not.have.property('error');
        const logUser = {
          ...user, fingerprint: '123',
        };
        expressApp
          .post('/Auth/Login')
          .set('user-agent', 'PostmanRuntime/7.26.8')
          .send(logUser)
          .expect(200)
          .end((LogErr, LogRes) => {
            expect(LogErr).to.not.be.an('Error');
            expect(LogRes.body).to.have.property('tokens');
            expect(LogRes.body.tokens).to.have.property('refreshToken');
            expect(LogRes.body.tokens).to.have.property('accessToken');
            expect(LogRes.body).to.not.have.property('error');
            accessToken = LogRes.body.tokens.accessToken;
          });
      });
  });
  let currentResponse = null;

  afterEach(function () {
    const errorBody = currentResponse && currentResponse.body;

    if (this.currentTest.state === 'failed' && errorBody) {
      console.log(errorBody);
    }

    currentResponse = null;
  });

  afterEach(function () {
    const errorBody = currentResponse && currentResponse.body;

    if (this.currentTest.state === 'failed' && errorBody) {
      console.log(errorBody);
    }

    currentResponse = null;
  });

  describe('POST /robot/robot', () => {
    before(function (done) {
      this.timeout(1500);
      setTimeout(done, 900);
    });
    it('add robot to user', (done) => {
      const robot = {
        robotId: '1234',
      };
      expressApp
        .post('/robot/robot')
        .send(robot)
        .set('authorization', `Bearer ${accessToken}`)
        .expect(200)
        .end((err, res) => {
          currentResponse = res;
          expect(res.body).to.not.have.property('error');
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.have.property('userId');
          expect(res.body.message).to.have.property('robotId');
          return done(err);
        });
    });
  });

  describe('GET /robot/robot', () => {
    before(function (done) {
      this.timeout(1500);
      setTimeout(done, 900);
    });
    it('get robots from user', (done) => {
      expressApp
        .get('/robot/robot')
        .send({})
        .set('authorization', `Bearer ${accessToken}`)
        .expect(200)
        .end((err, res) => {
          currentResponse = res;
          expect(res.body).to.not.have.property('error');
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.have.property('userId');
          expect(res.body.message).to.have.property('robots');
          return done(err);
        });
    });
  });

  describe('DELETE /robot/robot', () => {
    before(function (done) {
      this.timeout(1500);
      setTimeout(done, 900);
    });
    it('remove robot from user', (done) => {
      const robot = {
        robotId: '1234',
      };
      expressApp
        .delete(`/robot/robot/${robot.robotId}`)
        .send({})
        .set('authorization', `Bearer ${accessToken}`)
        .expect(200)
        .end((err, res) => {
          currentResponse = res;
          expect(res.body).to.not.have.property('error');
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.have.property('userId');
          expect(res.body.message).to.have.property('robotId');
          return done(err);
        });
    });
  });
});
