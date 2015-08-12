/**
 * Created by Alex Zalewski on 10/08/2015.
 */
var bcrypt = require('bcryptjs'),
    Q = require('q'),
    config = require('./config.js'), // config file contains all tokens and other private info
    db = require('orchestrate')(config.db); //config.db holds Orchestrate token

//used in local-signup strategy

exports.localReg = function (username, password, avatar) {
    var deferred = Q.defer();
    var hash = bcrypt.hashSync(password, 8);
    var user = {
        "username" : username,
        "password" : hash,
        "avatar" : avatar
    }
    //check if username is already assigned in our database
    db.get('local-users', username)
        .then(function (result) {
            console.log('username already exists');
            deferred.resolve(false);

        })
        .fail(function (result) {
            console.log(result.body);
            if (result.body.message == 'The requested items could not be found.') {
                console.log('Username is free for use');
                db.put('local-users', username, user)
                    .then(function () {
                        console.log("USER: ", user);
                        deferred.resolve(user);

                    })
                    .fail(function (err) {
                        console.lgo("PUT FAIL: ", err.body);
                        deferred.reject(new Error(err.body));
                    });

            } else {
                deferred.reject(new Error(result.body));

            }
        });
    return deferred.promise;
};


//check if user exists
    //if user exists check if passwords match (use bcryp.compareSync(password, hash); //true
//where 'hash' is password in DB)
    // if password matches take into website
    // if user doesn't exist or password doesn't match tell them it failed

exports.localAuth = function(username, password){
    var deferred = Q.defer();

    db.get('local-users', username)
        .then(function(result){
            console.log("Found User");
            var hash = result.body.password;
            console.log(hash);
            console.log(bcrypt.compareSync(password, hash));
            if(bcrypt.compareSync(password, hash)){
                deferred.resolve(result.body);

            }else{
                console.log("PASSWORDS DO NOT MATCH");
                deferred.resolve(false);

            }
        }).fail(function(err){
            if(err.body.message == 'The requested items could not be found.') {
                console.log("COULD NOT FIND USER IN DB FOR SIGNIN");
                deferred.resolve(false);
            }else{
                deferred.reject(new Error(err));

            }
        });

    return deferred.promise;
    }
