var express = require('express');
var router = express.Router();
var fs = require('fs');
var mergeImg = require('merge-img');
var config = require('../public/javascripts/config.js');

/* POST save page. */
router.post('/save', function(req, res, next) {
    var base64Data = req.body.base64.replace(/^data:image\/png;base64,/, "");
    fs.writeFile(`public/img/out_${req.body.num}.png`, base64Data, 'base64', function(err) {
        if (err) {
            console.log(err);
        } else {
            res.send(JSON.stringify({ 'status': 1, 'msg': 'Image Saved.' }));
        }
    });
});

/* POST merge page. */
router.post('/merge', function(req, res, next) {
    mergeImg([`./public/img/out_${req.body.imgNum}.png`, `./public/frame/${config.name}/frame_${req.body.frameNum}.png`], { offset: -1800 })
        .then((img) => {
            img.write(`./public/merge/merge_${req.body.imgNum}.png`, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    res.send(JSON.stringify({ 'status': 1, 'msg': 'Merge Susses.', 'picUrl': `${req.protocol}://${req.hostname}/merge/merge_${req.body.imgNum}.png` }));
                }
            });
        });
});

/* GET frame page. */
router.get('/frame', function(req, res, next) {
    fs.readdir(`./public/frame/${config.name}`, (err, data) => {
        if (err) throw err;
        var url = [];
        data.forEach((file) => {
            url.push(`${req.protocol}://${req.hostname}/frame/${config.name}/${file}`);
        })
        res.send(JSON.stringify(url));
    });
});

module.exports = router;