import { describe, it } from 'mocha';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';

import app from '../server/app';

chai.should();

chai.use(chaiHttp);
let token = 'bearer ';

describe('Vehicles', () => {
  describe('POST /api/v1/vehicles', () => {
    it('should sign in', (done) => {
      chai.request(app)
        .post('/api/v1/auth/signin')
        .send({
          email: 'non@test.co',
          password: 'Qwerty',
        })
        .then((res) => {
          const { body } = res;
          token += body.data.token;
          done();
        });
    });

    it('should add a vehicle', (done) => {
      chai.request(app)
        .post('/api/v1/vehicles')
        .set('authorization', token)
        .field('number_plate', 'ABC12')
        .field('manufacturer', 'Way')
        .field('model', 'Farer')
        .field('year', '1234')
        .field('capacity', '5')
        .attach('image', './test/files/autograder.png', 'autograder.png')
        .then((res) => {
          const { body } = res;
          expect(res.status).to.equal(201);
          expect(body).to.contain.property('status');
          expect(body).to.contain.property('data');
          expect(body.status).to.equal('success');
          expect(body.data).to.be.an('object');
          done();
        });
    });

    it('should check for bus that already exists', (done) => {
      chai.request(app)
        .post('/api/v1/vehicles')
        .set('authorization', token)
        .field('number_plate', 'ABC12')
        .field('manufacturer', 'Way')
        .field('model', 'Farer')
        .field('year', '1234')
        .field('capacity', '5')
        .then((res) => {
          const { body } = res;
          expect(res.status).to.equal(409);
          expect(body).to.contain.property('status');
          expect(body).to.contain.property('error');
          expect(body.status).to.equal('error');
          expect(body.error).to.be.a('string');
          expect(body.error).to.equal('A vehicle with same plate number already exists');
          done();
        });
    });

    it('should validate vehicle plate number', (done) => {
      chai.request(app)
        .post(`/api/v1/vehicles`)
        .set('authorization', token)
          .field('color', 'W')
          .then((res) => {
              const body = res.body;
              expect(res.status).to.equal(422);
              expect(body).to.contain.property('error');
              expect(body.error).to.be.a("string");
              expect(body.error).to.equal('"number_plate" is required');
              done()
          })
    });
  });

});
