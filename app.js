var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();

var cors = require('cors'); //cors

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var imgProcessRouter = require('./routes/imgProcess'); //添加接口
var printerRouter = require('./routes/printers');
var projectRouter = require('./routes/project');
var projectFrameRouter = require('./routes/frame'); //添加接口
var apiRouter = require('./routes/api');

var serveStatic = require('serve-static');


app.use(express.urlencoded()); //解碼form 的 post
app.use(express.json({ limit: '50mb' })); //413 Payload Too Large 限制提交的body大小最大可达50M

//cors
app.use(cors({
    origin: ['http://localhost:8080', 'https://localhost:8080', 'http://192.168.1.178:8081', 'https://192.168.1.178:8081'], //允許這個域的訪問
    methods: ['GET', 'POST'], //只允許GET和POST請求
    alloweHeaders: ['Conten-Type', 'Authorization'] //只允許帶這兩種請求頭的連接方式
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));//靜態圖片路徑顯示
app.use(serveStatic(__dirname + "/dist"));

app.use('/old', indexRouter);
app.use('/users', usersRouter);
app.use('/imgProcess', imgProcessRouter); //添加接口
app.use('/printers', printerRouter);
app.use('/project', projectRouter);
app.use('/project/frame', projectFrameRouter);
app.use('/api', apiRouter);  //添加接口

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;