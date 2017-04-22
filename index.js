// Required Modules
var express    = require("express");
var morgan     = require("morgan");
var bodyParser = require("body-parser");
var jwt        = require("jsonwebtoken");
var mongoose   = require("mongoose");
var app        = express();

var port = process.env.PORT || 3001;
var User     = require('./models/User');
var Places = require('./models/Places');

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