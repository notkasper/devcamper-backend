const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const colors = require('colors');
const fileupload = require('express-fileupload');
dotenv.config({ path: './config/config.env' });

const connectDb = require('./config/db');
const errorHandler = require('./middleware/error');
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');

connectDb();

const app = express();
app.use(express.json());

if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Set static folder
app.use(express.static(path.join(__dirname, './public')));

app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

process.on('unhandledRejection', (error, promise) => {
  console.log(`Error: ${error.message}.red`);
  server.close(() => {
    process.exit(1);
  });
});
