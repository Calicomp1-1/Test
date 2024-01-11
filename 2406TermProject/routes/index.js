

exports.index = function (request, response){
    // index.html
     response.render('index', { title: 'COMP 2406', body: 'Enter a City name to search for weather'});
}

exports.register = function (request, response){
    response.render('register', { title: 'User Registration', body: 'Fill out the form to register' });
}
