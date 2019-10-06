const { assert } = require('chai');
const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "extremely-insecure"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expected = "userRandomID";

    assert.equal(user, expected);
  });

  it('should fail to return user for invalid email', function() {
    const user = getUserByEmail("Idontexist", testUsers);
    assert.equal(user, undefined);
  })
});