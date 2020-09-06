var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var fs = require('fs');


router.get('/', function(req, res, next) {
    res.render('frame', { title: 'FrameManage' });
});

router.get('/upload', function(req, res, next) {
    res.render('frameUpload', { title: 'FrameUpload' });
});



module.exports = router;