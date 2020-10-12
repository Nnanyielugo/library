const chai = require('chai');
const chaiHttp = require('chai-http');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const connect_mongoose = require('../../api/utils/mongoose_utils');
const app = require('../../app');

const { valid_review, alternate_review } = require('../mocks/review');
const { valid_book, alternate_book } = require('../mocks/book');
const { valid_signup_user, admin_user, alternate_signup_user } = require('../mocks/user');
const { valid_author, alternate_author } = require('../mocks/author');

chai.use(chaiHttp);
const { expect } = chai;

describe('Review tests', () => {
  let mongoServer;
  let user;
  let alternate_user;
  let superuser;
  let author;
  let review;
  let book;

  beforeEach(async () => {
    mongoServer = new MongoMemoryServer();
    const mongo_uri = await mongoServer.getUri();
    await connect_mongoose(mongo_uri);

    // create 3 users
    const user_resp = await chai
      .request(app)
      .post('/api/users/')
      .send({ user: valid_signup_user });
    user = user_resp.body.user;

    const alternate_user_resp = await chai
      .request(app)
      .post('/api/users/')
      .send({ user: alternate_signup_user });
    alternate_user = alternate_user_resp.body.user;

    const superuser_resp = await chai
      .request(app)
      .post('/api/users/')
      .send({ user: admin_user });
    superuser = superuser_resp.body.user;

    // create author
    const author_resp = await chai
      .request(app)
      .post('/api/authors/')
      .set('authorization', `Bearer ${user.token}`)
      .send({ author: valid_author });
    author = author_resp.body.author;

    // create book
    const valid_book_resp = await chai
      .request(app)
      .post('/api/books/')
      .set('authorization', `Bearer ${user.token}`)
      .send({
        book: {
          ...valid_book,
          author_id: author._id,
        },
      });
    book = valid_book_resp.body.book;

    // create review
    const valid_review_resp = await chai
      .request(app)
      .post('/api/reviews/')
      .set('authorization', `Bearer ${user.token}`)
      .send({
        review: {
          ...valid_review,
          book_id: book._id,
        },
      });
    review = valid_review_resp;
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe.only('passing tests', () => {
    it('fetches list of reviews', async () => {
      const response = await chai
        .request(app)
        .get('/api/reviews/');

      expect(response.body.reviews).to.be.an('array');
      expect(response.body.reviewsCount).to.equal(1);
      expect(response.body.reviews[0].slug).to.equal(review.body.review.slug);
    });

    it('creates a single review', () => {
      expect(review.body.error).to.be.undefined;
      expect(review.status).to.equal(201);
      expect(review.body.review.content).to.equal(valid_review.content);
    });
  });
});
