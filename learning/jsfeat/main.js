/*var jsfeat = require("./inspirit-jsfeat/build/jsfeat.js");
define(["./index.html"], function(require) {
    var jsfeat = require("./inspirit-jsfeat/build/jsfeat.js");
});*/

define(['./inspirit-jsfeat/build/jsfeat.js'], function(jsfeat) {
    require(jsfeat, function(){
        // use arguments since you don't know how many modules you're getting in the callback
        for (var i = 0; i < arguments.length; i++){
            var mymodule = arguments[i];
            // do something with mymodule...
        }
    });
});


//core data structure for jsfeat project
var columns = 320, rows = 240, data_type = jsfeat.U8_t | jsfeat.C1_t;
//alert(typeof(jsfeat))
var my_matrix = new jsfeat.matrix_t(columns, rows, data_type);

var my_matrix_data = my_matrix.data;

alert(typeof(jsfeat))
console.log(my_matrix_data)
