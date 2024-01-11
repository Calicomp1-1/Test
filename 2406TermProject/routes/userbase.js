var url = require('url');
var express = require('express');
var sqlite3 = require('sqlite3').verbose(); //verbose provides more detailed stack trace
var db = new sqlite3.Database('data/database');
const app = express();

exports.authenticate = function(request, response, next) {
	/*
	  Middleware to do BASIC http 401 authentication
	  */
	let auth = request.headers.authorization
	// auth is a base64 representation of (username:password)
	//so we will need to decode the base64
	if (!auth) {
	  //note here the setHeader must be before the writeHead
	  response.setHeader('WWW-Authenticate', 'Basic realm="need to login"')
	  response.writeHead(401, {
		'Content-Type': 'text/html'
	  })
	  console.log('No authorization found, send 401.')
	  response.end();
	} else {
	  console.log("Authorization Header: " + auth)
	  //decode authorization header
	  // Split on a space, the original auth
	  //looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part
	  var tmp = auth.split(' ')
  
	  // create a buffer and tell it the data coming in is base64
	  var buf = Buffer.from(tmp[1], 'base64');
  
	  // read it back out as a string
	  //should look like 'ldnel:secret'
	  var plain_auth = buf.toString()
	  console.log("Decoded Authorization ", plain_auth)
  
	  //extract the userid and password as separate strings
	  var credentials = plain_auth.split(':') // split on a ':'
	  var username = credentials[0]
	  var password = credentials[1]
	  console.log("User: ", username)
	  console.log("Password: ", password)
  
	  var authorized = false
	  var userRole;
	  //check database users table for user
	  db.all("SELECT userid, password, role FROM users WHERE userid = ? AND password = ?", [username, password], function(err, rows) {
		for (var i = 0; i < rows.length; i++) {
		  if (rows[i].userid == username & rows[i].password == password){
			authorized = true;
			userRole = rows[i].role;
		  }
		}
		if (authorized == false) {
		  //we had an authorization header by the user:password is not valid
		  response.setHeader('WWW-Authenticate', 'Basic realm="need to login"')
		  response.writeHead(401, {
			'Content-Type': 'text/html'
		  })
		  console.log('No authorization found, send 401.')
		  response.end()
		} else {
		  request.user_role = userRole;
		  next()
		}
	  })
	}
  
}

//gets the list of users
exports.users = function(request, response) {

	if (request.user_role !== 'admin') {//user has access if they are an admin
		response.writeHead(403, { 'Content-Type': 'text/html' });
		console.log(request.user_role);
		response.end('You do not have access to this content');
		return;
	}

	db.all("SELECT userid, password FROM users", function(err, rows){
		response.render('users', {title : 'Users:', userEntries: rows});//gets and renders the users into users.hbs
	})

}




