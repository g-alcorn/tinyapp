//GET CURRENT USERNAME BY EMAIL
const getUserByEmail = function(email, database) {
  for (let client in database) {
    if (email === database[client].email) {
      return database[client].id;
    }
  }
};

module.exports = { getUserByEmail };