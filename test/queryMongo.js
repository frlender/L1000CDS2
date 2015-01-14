var mongoose = require('mongoose');

mongoose.connect('mongodb://readUser:readUser@localhost/LINCS_L1000');
var Schema = mongoose.Schema({"pert_desc":String,"cell_id":String,
    "pert_dose":String,"pert_dose_unit":String,"pert_time":String,
    "pert_time_unit":String},{collection:"cpcd"})
var Expm = mongoose.model('Expm',Schema);


var query = Expm.findOne({})
        .select('-_id sig_id pert_type pert_desc cell_id pert_dose pert_dose_unit pert_time pert_time_unit').lean();
    
query.exec(function(err,queryRes){
    if(err) throw err;
    console.log("===========",queryRes);
 });