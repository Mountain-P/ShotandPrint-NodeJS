//require
var express = require('express');
var router = express.Router();
var fs = require('fs');
var config = require('../public/javascripts/config');
var sharp = require('sharp');
const multer = require('multer');
const path = require('path');
var chokidar = require('chokidar');
var printer = require('node-native-printer');

//config project path
var projectFolder = "frame";
var projectPath = `./public/${projectFolder}`;

//debug
const util = require('util');




router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/project/getCount', function (req, res, next) {
    fs.readdir(projectPath, function (err, files) {
        if (err) {
            console.log(err);
            res.send('error');
            return;
        }
        var projectCount = files.length;
        res.json({ projectCount: projectCount });
    });
});

router.get('/project/getSelected', function (req, res, next) {
    res.json({ projectSelected: config.projectSelected });
});

router.get('/project/getList', function (req, res, next) {
    fs.readdir(projectPath, function (err, files) {
        if (err) {
            console.log(err);
            res.status(500).send({ error: 'Cloud not read project folder!' });
            return;
        }
        var sendJSON = {
            projectName: []
        }
        sendJSON.projectName = files;
        res.json(sendJSON);
    });
});

router.post('/project/setProject', function (req, res, next) {
    var setProjectName = req.body.projectName;
    console.log('setProject:' + setProjectName);
    config.projectSelected = setProjectName;
    res.status(200).send('succeed')
});

router.post('/project/delProject', function (req, res, next) {
    var delProjectName = req.body.projectName;
    console.log('delProject:' + delProjectName);
    fs.rmdir(projectPath + `/${delProjectName}`, { recursive: true }, (err) => {
        if (err) {
            console.log(err)
            res.status(500).send({ error: err });
            throw err;
        }
        console.log(projectPath + `/${delProjectName}` + " Delete Succeed!");
        res.status(200).send('succeed')
    });

});

router.post('/project/addProject', function (req, res, next) {
    var addProjectName = req.body.projectName;
    console.log('addProject:' + addProjectName);
    fs.mkdir(`${projectPath}/${addProjectName}`, { recursive: true }, (err) => {
        if (err) {
            console.log(err);
            res.status(500).send({ error: err });
            throw err;
        } else {
            fs.mkdir(`${projectPath}/${addProjectName}/監看資料夾`, { recursive: true }, (err) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({ error: err });
                    throw err;
                }
            });
            fs.mkdir(`${projectPath}/${addProjectName}/輸出`, { recursive: true }, (err) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({ error: err });
                    throw err;
                }

            });
            fs.mkdir(`${projectPath}/${addProjectName}/列印`, { recursive: true }, (err) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({ error: err });
                    throw err;
                }

            });
            fs.mkdir(`${projectPath}/${addProjectName}/原圖`, { recursive: true }, (err) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({ error: err });
                    throw err;
                }

            });
        }

        res.status(200).send('succeed');

    });
});

var upload = multer({ dest: 'uploads/' })
router.post('/project/frameUpload', upload.single('file'), async function (req, res) {
    let frameCount = 0;
    var framePath = projectPath + '/' + req.body.projectName + `/frame_${frameCount}.png`;
    console.log(framePath);
    while (true) {
        if (!fs.existsSync(framePath)) {
            break;
        }
        else {
            frameCount = frameCount + 1;
            framePath = projectPath + '/' + req.body.projectName + `/frame_${frameCount}.png`
        }
    }
    await sharp(req.file.path)
        .resize(1800, 1200)
        .png()
        .toFile(framePath);
    console.log('Frame Upload! ProjectName:' + req.body.projectName + ' Path:' + framePath);
    res.status(200).send('succeed');

});



router.post('/project/getProjectFrame', function (req, res, next) {
    fs.readdir(projectPath + '/' + req.body.projectName, function (err, files) {
        if (err) {
            console.log(err);
            res.status(500).send({ error: 'Cloud not read project folder!' });
            return;
        }
        frameList = files.filter(function (e) {
            return path.extname(e).toLowerCase() === '.png'
        });
        console.log(frameList);
        console.log(req.body.apiBaseURL);
        var sendJSON = {
            frameLists: []
        }
        frameList.forEach(element => sendJSON.frameLists.push({ 'title': element, 'src': req.body.apiBaseURL + '/' + projectFolder + '/' + req.body.projectName + '/' + element }));




        console.log(sendJSON);
        res.json(sendJSON);
    });
});
router.post('/project/delProjectFrame', function (req, res, next) {
    var delFrameName = req.body.frameName;
    var projectName = req.body.projectName;
    var delpath = projectPath + '/' + projectName + '/' + delFrameName;
    console.log(delpath);
    fs.unlink(delpath, (err) => {
        if (err) {
            console.log(err)
            res.status(500).send('delFrameFail');
            throw err;
        }
        console.log(delpath + ' Has Delete');
        res.status(200).send('succeed');
    });

});

var watcher;
router.post('/project/printPhoto', function (req, res, next) {
    var projectName = req.body.projectName;
    var FrameName = req.body.frameName;
    var watchPath = projectPath + '/' + projectName + '/監看資料夾';
    var framePath = projectPath + '/' + projectName + '/' + FrameName;
    var photoPath = projectPath + '/' + projectName + '/原圖';
    var outputPath = projectPath + '/' + projectName + '/輸出';
    var printPath = projectPath + '/' + projectName + '/列印';

    var getName = function (path, front, end) {
        var count;
        var name;
        var files = fs.readdirSync(path);
        count = files.length;
        name = front + '_' + count + '.' + end;
        return name
    };

    console.log('OK');

    console.log('watchPath:' + watchPath);
    console.log('frameath:' + framePath);
    console.log('outputPath:' + outputPath);

    res.status(200).send('succeed')


    watcher = chokidar.watch(watchPath, { ignored: /^\./, persistent: true, awaitWriteFinish: true });
    watcher
        .on('add', function (path, event) {
            console.log('檔案:', path, '已經被偵測到!');
            var tempoutpath = outputPath + '/' + getName(outputPath, 'output', 'png');
            var tempprintpath = printPath + '/' + getName(printPath, 'print', 'png');
            console.log('輸出資料夾:' + tempoutpath);
            console.log('列印資料夾:' + tempprintpath);
            sharp(path)
                .resize(1800, 1200)
                .composite([{ input: framePath }])
                .toFile(tempoutpath)
                .then(data => {
                    fs.renameSync(path, photoPath + '/' + getName(photoPath, 'orginal', 'png'));
                    sharp(tempoutpath)
                        .rotate(90)
                        .extend({
                            top: 13,
                            bottom: 32,
                            left: 18,
                            right: 18,
                            background: { r: 255, g: 255, b: 255, alpha: 1 }
                        })
                        .toFile(tempprintpath)
                        .then(info => {

                            printer.print(tempprintpath, [{
                                "color": true,
                                "PaperSheets": "6x4 / 152x100mm",
                            }])
                                .then(console.log('列印成功!'))

                        });
                });
        });
       
        
        router.get('/project/stopprintPhoto', function (req, res, next) 
        {
            watcher.close().then(() =>res.status(200).send('stop!'),watcher=null);
        });
        

});
router.get('/project/ifprintPhoto', function (req, res, next) 
        {
           console.log(watcher);
            if(watcher==undefined){
                res.status(200).send('0');

            }else{
                res.status(200).send('1');
            }

        });




module.exports = router;