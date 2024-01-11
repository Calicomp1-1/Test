//requirements
var http = require('http');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
const bodyParser = require('body-parser');

var sqlite3 = require('sqlite3').verbose(); //verbose provides more detailed stack trace
var db = new sqlite3.Database('data/database');

let API_KEY = 'b1af84765d5a425c559725c8eec1ecd8';

var app = express();
app.use(express.static('routes'));

const PORT = process.env.PORT || 3000;//launches port
const userbaseRoute = require('./routes/userbase');
const indexRoute = require('./routes/index');

app.set('views', path.join(__dirname, 'views'));//joins route
app.set('view engine', 'hbs'); //use hbs handlebars wrapper
app.locals.pretty = true;
app.use(bodyParser.urlencoded({ extended: true }));

//=========================WEATHER STUFF==========================
app.get('/weather', (request, response) => {
    let city = request.query.city
    if(!city) {
      //send json response to client using response.json() feature
      //of express
      response.json({message: 'Please enter a city name'})
      return
    }
  
    let options = {
      host: 'api.openweathermap.org',
      path: '/data/2.5/weather?q=' + city +
        '&appid=' + API_KEY
    }
    //create the actual http request and set up
    //its handlers
    http.request(options, function(apiResponse) {
      let weatherData = ''
      apiResponse.on('data', function(chunk) {
        weatherData += chunk
      })
      apiResponse.on('end', function() {
        response.contentType('application/json').json(JSON.parse(weatherData))
      })
    }).end() //important to end the request
             //to actually send the message
  })
//================================================================

//using the routes
app.get('', userbaseRoute.authenticate, indexRoute.index);
app.get('/users', userbaseRoute.authenticate, userbaseRoute.users);
app.get('/register', indexRoute.register);

app.post('/submitForm', register);

//start server
app.listen(PORT, err => {
    if(err) console.log(err)
    else {
          console.log(`Server listening on port: ${PORT} CNTL:-C to stop`)
          console.log(`To Test:`)
          console.log('Admin login:  ADMIN password')
          console.log('http://localhost:3000')
      }
  })

//This function is responsible for regestering users 
function register(req,res){

    const username = req.body.username;
    const password = req.body.password;

    db.run("INSERT INTO users (userid, password, role) VALUES (?, ?, ?)", [username, password, 'guest'], function(err) {//does the actuall insertion
    if (err) {
        console.error(err.message);
        res.status(500).send('Internal Server Error');
        return;
    }

     res.render('register', { title: 'User Registration', body: 'Fill out the form to register', confirmationMessage: 'Form submitted successfully!' });
    });

}