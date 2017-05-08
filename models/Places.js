var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PlacesSchema   = new Schema({
    name: String,
    type: String,
    address: String,
    contactNo: String,
    locationLat: String,
	locationLong: String,
	imageBase64:String
});

module.exports = mongoose.model('Places', PlacesSchema);