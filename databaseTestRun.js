var mongoose = require('mongoose');


mongoose.connect(process.env.MONGODB);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log('yay');
});

var kittySchema = mongoose.Schema({
    name: String,
    timeStamp: Date
});

var puppySchema = mongoose.Schema({
    name: String,
    breed: String
});


var Kitten = mongoose.model('Kitten', kittySchema);
var Dogs = mongoose.model('Dog', puppySchema);
var silence = new Kitten({name: 'Silence'});
console.log(silence.name);

kittySchema.methods.speak = function(){
    var greeting = this.name ? "Meow name is " + this.name : "I don't have a name";
    console.log(greeting);

};



var fluffy = new Kitten({name: 'fluffy', timeStamp: new Date()});
var stopThat = new Dogs ({name: 'StopThat', breed: 'Mutt'});
//stopThat.save(function(err, cb){
//    if (err){
//        return console.error(err);
//    }
//
//})

fluffy.save(function (err, fluffy) {
    if (err) {
        return console.error(err);

    }
    fluffy.speak();

});

Kitten.find(function (err, kittens) {
    if (err) {
        return console.error(err);

    }
    console.log(kittens);

});


console.log('Last Part');
Dogs.find(function (err, dogs) {
    if (err) {
        return console.error(err);
    }
    console.log(dogs);
});


Kitten.find({name: 'fluffy'});
