/**
 * isAuthenticated
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, ok) {

  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
  if (req.session.authenticated) {
    return ok();
  }

    //User is not allowed
  else {
      var requireLoginError = [{name: 'requireLogin', message: 'You must be signed in.'}]
      req.session.flash = {
          err: requireLoginError
      }
      res.redirect('/session/new');
  }

};
