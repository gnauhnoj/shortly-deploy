var mongoose = exports.mongoose = require('mongoose');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var connectionString = process.env.CUSTOMCONNSTR_MONGOLAB_URI || 'mongodb://localhost/test';

mongoose.connect(connectionString);
var Schema = mongoose.Schema;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

exports.urlSchema = new Schema({
  url: String,
  base_url: String,
  code: String,
  title: String,
  visits: Number,
});

// this should actually be an event listener
exports.urlSchema.methods.hashLink = exports.hashLink = function(link) {
    var shasum = crypto.createHash('sha1');
    shasum.update(link.url);
    link.code = shasum.digest('hex').slice(0, 5);
};


exports.urlSchema.pre('save', function(next){
  exports.hashLink(this);
  next();
});


exports.userSchema = new Schema({
  username: String,
  password: String,
});

// these should actually be event listeners
exports.userSchema.methods.comparePassword = exports.comparePassword = function(attemptedPassword, user, callback) {
  bcrypt.compare(attemptedPassword, user.password, function(err, isMatch) {
    console.log(err);
    callback(isMatch);
  });
};

exports.userSchema.methods.hashPassword = exports.hashPassword = function(user) {
    user.password = bcrypt.hashSync(user.password, null);
};

exports.userSchema.pre('save', function(next){
  exports.hashPassword(this);
  next();
});
