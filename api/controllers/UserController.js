/**
 * UserController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
    // This loads the sign-up page --> new.ejs
    'new': function (req, res) {
        res.view();
    },

    create: function (req, res, next) {

        //Create a user with the parameters sent from
        // the sign up form --> new.ejs
        User.create(req.params.all(), function userCreated(err, user) {

            //If there is an error
            //if (err) return next(err);

            if (err) {
                console.log(err);
                req.session.flash = {
                    err: err
                }

                // If error redirect back to sign-up page
                return res.redirect('/user/new');
            }

            //Log user in
            req.session.authenticated = true;
            req.session.User = user;

            //Change status to online
            user.online = true;
            user.save(function(err, user) {
                if (err) return next(err);

                //After successfully creating the user
                //redirect to the show action

                res.redirect('/user/show/' + user.id);
            });

            //After successfully creating the user
            // redirect to the show action
            //res.json(user);

            res.redirect('/user/show/' + user.id);
        });
    },

    //render the profile view (e.g. /views/show.ejs)
    show: function (req, res, next) {
        User.findOne(req.param('id'), function foundUser(err, user) {
            if (err) return next(err);
            if (!user) return next();
            res.view({
                user: user
            });
        });
    },

    index: function(req, res, next) {


        //Get an array of all users in the User collection (e.g. table)
        User.find(function foundUsers (err, users) {
            if (err) return next(err);
            // pass the array down to the /views/index.ejs page
            res.view({
                users: users
            });
        });
    },

    //render the edit view (e.g. /views/edit.ejs)
    edit: function(req, res, next) {

        //Find the user from the id passed in via parameters
        User.findOne(req.param('id'), function foundUser (err, user) {
            if (err) return next(err);
            if (!user) return next();

            res.view({
                user: user
            });
        });
    },

    // process the info from edit view
    update: function(req, res, next) {

        if(req.session.User.admin) {
            var userObj = {
                name: req.param('name'),
                title: req.param('title'),
                email: req.param('email'),
                admin: req.param('admin')
            }
        } else {
            var userObj = {
                name: req.param('name'),
                title: req.param('title'),
                email: req.param('email')
            }
        }

        User.update(req.param('id'), userObj, function userUpdated (err) {
            if (err) {
                return res.redirect('/user/edit/' + req.param('id'));
            }

            res.redirect('/user/show/' + req.param('id'));
        });
    },

    destroy: function(req, res, next) {

        User.findOne(req.param('id'), function foundUser (err, user) {
            if(err) return next(err);

            if(!user) return next('User doesn\'t exist.');

            User.destroy(req.param('id'), function userDesroyed(err) {
                if(err) return next(err);

            });

        res.redirect('/user');

        });
    },

    subscribe: function(req, res) {

        User.find(function foundUsers(err, users) {
            if (err) return next(err);

            //subscribe this socket to the User model classrooms
            User.subscribe(req.socket);

            //subscribe this socket to the instance rooms
            User.subscribe(req.socket, users);

            //This will avoid a warning from the socket for trying to render
            //html over the socket.
            res.send(200);
        });

    }

};
