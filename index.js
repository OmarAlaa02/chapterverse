const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const mongoose = require("mongoose");
const session = require('express-session');
const MONGODB = require('connect-mongodb-session')(session);
const url='mongodb+srv://asser337:nodejs_11.11@cluster0.ceji32w.mongodb.net/chapterverse?'
const compression=require('compression');
const Store = new MONGODB({
    uri: url,
    collection: 'sessions'
});

const userRouter = require('./routes/user');

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(compression());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images')));



app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());



app.use(session({
    secret: '5jRektAqprHPSiu/G!xvtxmmbrl4a4915R6?t?I8o8slUl4HPG0FEyVeu30WL0!u',
    resave: false,
    saveUninitialized: false,
    store: Store
}));
 
app.use((req,res,next)=>{
    res.locals.userProfile=req.session.profilepicture;
    next();
})

app.use(userRouter);

app.use('/', (req, res) => {
    res.send('<h1>Not found</h1>');
    res.end();
})

mongoose.connect(url,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
        app.listen(3000, () => console.log('listeing'));
    })
    .catch(err => console.log(err));