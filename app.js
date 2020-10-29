const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
// let passport = require('./libs/passport');

// var indexRouter = require('./routes/index');
const authRouter = require('./routes/Auth');
const robotRouter = require('./routes/Robot');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(passport.initialize());

// app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/robot',robotRouter);

app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    console.log(err);
    res.status(err.status || 500);
    res.json({message:"sosate",error:err.toString()});

});

app.use((req,res)=>{
    res.status(404);
    res.json({message:"no route"});
})

module.exports = app;
