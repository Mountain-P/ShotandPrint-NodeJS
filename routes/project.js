var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
const framePath = path.join(__dirname, '../public/frame');
var formidable = require('formidable');
var currentSelprofectName = require('../public/javascripts/config');
var sharp = require('sharp');
var chokidar = require('chokidar');
var mergeImg = require('merge-img');
var printer = require('node-native-printer');

router.get('/', function (req, res, next) {
    res.render('projectIndex', { title: 'ProjectManage', selprojectname: currentSelprofectName.name });
});
router.get('/new', function (req, res, next) {
    res.render('projectNew', { title: 'Creat New Project' });
});
router.post('/createProject', function (req, res) {
    var newProjectName = req.body.newProjectName;
    fs.access(`./public/frame/${newProjectName}`, fs.constants.F_OK, error => {
        if (!error) {
            res.write('<a href="/project/new">Project Name Has Been Used!</a>');
            res.end();
        } else {
            fs.mkdir('./public/frame/' + newProjectName, { recursive: true }, (err) => {
                if (err) { throw err; } else {
                    fs.mkdir('./public/frame/' + newProjectName + '/photowatch', { recursive: true }, (err) => {
                        if (err) { throw err; } else { }
                    });
                    res.write('<a href="/project">Create</a>');
                    res.end();

                }
            });
        }
    });
});
router.get('/selproject', function (req, res) {
    console.log(framePath);
    fs.readdir('./public/frame', function (err, files) {
        if (err) { return; }
        res.render('projectSel', { title: 'Select Project', selprojectname: currentSelprofectName.name, projectNames: files });
    });

});
router.get('/selprojectname', function (req, res, next) {
    var selproject = req.query.projectname;
    currentSelprofectName.name = selproject;
    console.log(selproject);
    res.write('<a href="/project">Project Set!</a>');
    res.end();

});
router.get('/View', function (req, res, next) {
    console.log(framePath);
    fs.readdir('./public/frame', function (err, files) {
        if (err) {
            console.log(err);
            res.render('projectView', { title: 'Error To Read Folder' });
            return;
        }
        console.log('Folder Readed!'); //確認有讀到資料夾
        var count = files.length;
        console.log('Folder Count:' + count); //列出資料夾總數
        //列出存在的Frame資料夾
        var currentcount = 0;
        while (currentcount < count) {
            console.log(files[currentcount]);
            currentcount++;
        }
        res.render('projectView', { title: 'Projects View', foldernames: files });
    });
});
router.get('/photowatch', function (req, res, next) {
    var selproject = req.query.projectname;
    var watcher = chokidar.watch(`./public/frame/${selproject}/photowatch`, { ignored: /^\./, persistent: true, awaitWriteFinish: true });
    watcher
        .on('add', function (path) {
            console.log('File', path, 'has been added');
            var outnum, newpath;
            fs.readdir(`./public/img`, function (err, files) {
                if (err) {
                    console.log(err);
                    return;
                }
                outnum = files.length;
                newpath = './public/img/out_' + outnum + '.jpg';
                sharp(path)
                    .resize(1800, 1200)
                    .toFile(newpath)
                    .then(data => {
                        fs.unlinksync(path);
                        mergeImg([`./public/img/out_${outnum}.jpg`, `./public${currentSelprofectName.framePath}`], { offset: -1800 })
                            .then((img) => {
                                img.write(`./public/merge/merge_${outnum}.png`, function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        sharp(`./public/merge/merge_${outnum}.png`)
                                            .rotate(90)
                                            .extend({
                                                top: 13,
                                                bottom: 32,
                                                left: 18,
                                                right: 18,
                                                background: { r: 255, g: 255, b: 255, alpha: 1 }
                                            })
                                            .toFile(`./public/rotate/rotate_${outnum}.png`)
                                            .then(info => {
                                                printer.print(`./public/rotate/rotate_${outnum}.png`, [{
                                                    "color": true,
                                                    "PaperSheets": "6x4 / 152x100mm",
                                                }])
                                                    .then(console.log('print secess!'))
                                                    
                                            });
                                    }
                                });
                            })
                    })

            });
            


        })
    res.write('<a href="photowatch/stop">StopWatch<a>');
    res.end();
    router.get('/photowatch/stop', function (req, res, next) {
        watcher.close();
        res.write('<a href="/project/view/projectname/?projectname=' + selproject + '">back<a>');
        res.end();
    });
});



router.get('/View/projectname', function (req, res, next) {
    var selproject = req.query.projectname;
    fs.readdir(`./public/frame/${selproject}`, function (err, files) {
        if (err) {
            console.log(err);
            res.render('projectViewByName', { title: 'Error To Read Project Folder' });
            return;
        }
        console.log('Project Folder Readed!'); //確認有讀到Project資料夾
        var count = files.length;
        currentSelprofectName.frameNum = count;
        console.log('Frame Count:' + count); //列出frame檔案總數
        console.log(currentSelprofectName.frameNum);
        //列出存在的Frame資料夾
        var currentcount = 0;
        var frameFilePaths = new Array();
        while (currentcount < count) {
            console.log(files[currentcount]);
            frameFilePaths[currentcount] = "/frame/" + selproject + "/" + files[currentcount];
            currentcount++;
        }
        console.log(frameFilePaths);
        frameFilePaths.pop();
        console.log(frameFilePaths);
        res.render('projectViewByName', { title: selproject, framepaths: frameFilePaths });
    });
});

router.get('/cameraFrame', function (req, res, next) {
    var selframe = req.query.frame;
    currentSelprofectName.framePath = selframe;
    console.log(currentSelprofectName.framePath);
    res.write(`<a href="/project/view/projectname/?projectname=${currentSelprofectName.name}">Back</a>`);
    res.end();
});

router.post('/View/projectname/uploaded', function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var selproject = (fields.foldername);
        var oldpath = files.filetoupload.path;
        console.log(oldpath);
        console.log("==========");
        // var newpath = './public/frame/' + fields.foldername + '/' + files.filetoupload.name;
        var newpath = './public/frame/' + fields.foldername + '/frame_' + currentSelprofectName.frameNum + '.png';
        console.log(newpath);
        // fs.rename(oldpath, newpath, function(err) {
        // if (err) throw err;
        sharp(oldpath)
            .resize(1800, 1200)
            .toFile(newpath);
        currentSelprofectName.frameNum += 1;
        res.write('<a href="/project/view/projectname/?projectname=' + selproject + '""target="_blank" title="Back">Back</a>');
        res.end();
        // });
    });
});

module.exports = router;