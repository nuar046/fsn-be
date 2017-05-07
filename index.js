// Required Modules
var express    = require("express");
var morgan     = require("morgan");
var bodyParser = require("body-parser");
var jwt        = require("jsonwebtoken");
var mongoose   = require("mongoose");
var GenericApi = require('generic_api');
var app        = express();
 
var api = new GenericApi.UserApi(); 
var port = process.env.PORT || 3001;
var User     = require('./models/User');
var Places = require('./models/Places');
var PersonalizedApi = require('personalized_api');

var api = new PersonalizedApi.ApiManagerApi();
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
// Connect to DB
mongoose.connect(process.env.MONGOLAB_URI);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

app.post('/forgotUsername', function(req, res) {
var email = req.body.email;
var fullname = req.body.fullname;    
var callback = function(error, data, response) {
  if (error) {
       res.json({
             type: false,
             error:error
            });
  } else {
       res.json({
             type: true,
             data:data
            });
  }
};
api.apiManagerForgotUserUsername(email, fullname, callback);
});


app.post('/authenticate', function(req, res) {
    console.log(req.body.email);
	console.log(req.body.password);
	if(typeof req.body.password === 'undefined' || typeof req.body.email === 'undefined')
	{
		res.json({
                    type: false,
                    data: "Incorrect email/password"
                });
	}
	
	else{
	User.findOne({email: req.body.email, password: req.body.password}, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
			console.log(user);
            if (user) {
               res.json({
                    type: true,
                    data: user,
                    token: user.token
                }); 
            } else {
                res.json({
                    type: false,
                    data: "Incorrect email/password"
                });    
            }
        }
    });	
	}
});


app.post('/forgotPassword', function(req, res) {
var username = req.body.username; // {String}  
var fullname = req.body.fullname; // {String}  

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
	   res.json({
                            type:false,
							data:error
                        });
  } else {
    console.log('API called successfully. Returned data: ' + data);
	      res.json({
                            type: true,
                            return_data: data
                        });
  }
};
api.userForgotPassword(username, fullname, callback);
});



app.post('/signin', function(req, res) {
    User.findOne({email: req.body.email, password: req.body.password}, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
                res.json({
                    type: false,
                    data: "User already exists!"
                });
            } else {
                var userModel = new User();
                userModel.email = req.body.email;
                userModel.password = req.body.password;
                userModel.save(function(err, user) {
                    user.token = jwt.sign(user,'shhhhh');
                    user.save(function(err, user1) {
                        res.json({
                            type: true,
                            data: user1,
                            token: user1.token
                        });
                    });
                })
            }
        }
    });
});


app.post('/postin', function(req, res) {
    var placesModel = new Places();
    placesModel.name = req.body.name;
    placesModel.type = req.body.type;
    placesModel.address = req.body.address;
    placesModel.contactNo = req.body.contactNo;
    placesModel.locationLat = req.body.locationLat;
	placesModel.locationLong = req.body.locationLong;
    placesModel.save(function(err, place) {
        res.json({
             type: true,
             status: "Success save" 
            });
    })
});

app.get('/me', ensureAuthorized, function(req, res) {
    User.findOne({token: req.token}, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            res.json({
                type: true,
                data: user
            });
        }
    });
});

function ensureAuthorized(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.send(403);
    }
}

process.on('uncaughtException', function(err) {
    console.log(err);
});

// Start Server
app.listen(port, function () {
    console.log( "Express server listening on port " + port);
});