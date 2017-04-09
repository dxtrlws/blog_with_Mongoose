/**
 * Created by Admin on 4/8/2017.
 */

exports.DATABASE_URL = process.env.DATABASE_URL ||
    global.DATABASE_URL ||
    'mongodb://localhost/blog-app';

exports.PORT = process.env.PORT || 8080;