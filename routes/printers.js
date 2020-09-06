var express = require('express');
var router = express.Router();
var sharp = require('sharp');
var printer = require('node-native-printer');
// var config = require('../public/javascripts/config.js');

router.post('/print', function(req, res, next) {
    sharp(`./public/merge/merge_${req.body.imgNum}.png`)
        // .resize(1815,1210,{fit:'inside'})
        .rotate(90)
        .toFile(`./public/rotate/rotate_${req.body.imgNum}.png`)
        .then(info => {
            printer.print(`./public/rotate/rotate_${req.body.imgNum}.png`, [{
                    "color": true,
                    "copies": req.body.quantity,
                    "PaperSheets": "6x4 / 152x100mm",
                }])
                .then(res.send(JSON.stringify({ 'status': 1, 'msg': 'print susses.' })))
        });
});

module.exports = router;