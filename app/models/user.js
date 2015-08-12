/**
 * Created by Alex Zalewski on 11/08/2015.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://malamute29:CryingWolf29@ds045001.mongolab.com:45001/captinslow');


var userSchema = new Schema({
    name: String,
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    admin: Boolean,
    location: String,
    meta: {
        age: Number,
        website: String
    },
    created_at: Date,
    updated_at: Date

});
//custom method to add string to end of name
//you can create more important methods like name validations or formatting
// you can also do queries and find similar users
userSchema.methods.dudify = function () {
    // add some stuff to the users name
    this.name = this.name + '-dude';
    return this.name();
};

userSchema.pre('save', function (next) {
    //get the current date
    var currentDate = new Date();
    // change the updated_at field to current date
    this.updated_at = currentDate;
    //if created_at doesn't exist add to that field
    if (!this.created_at) {
        this.created_at = currentDate;
    }
    next();
});



var User = mongoose.model('User', userSchema);
// make this available to our users in our Node Application
module.exports = User;