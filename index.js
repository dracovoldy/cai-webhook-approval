const express = require('express');
const morgan = require('morgan');
// const helmet = require('helmet');
// const cors = require('cors');
const bodyParser = require('body-parser'); 
// const favicon = require('serve-favicon');

//Require Routes
const home = require('./routes/home');
const cai = require('./routes/cai');


const app = express();
app.use(bodyParser.json());  
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(helmet());
// app.use(cors());
// app.use(express.static('public'));
app.use(morgan('tiny'));
// app.use(favicon(__dirname + '/static/favicon.ico'));

//use - routes
app.post('/errors', function(req, res) {
    console.log(req.body);
    res.sendStatus(200);
  });
  
app.use('/api', home);
app.use('/api/cai', cai)


const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}`));