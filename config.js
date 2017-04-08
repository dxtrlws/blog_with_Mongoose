/**
 * Created by Admin on 4/8/2017.
 */
exportsDATABASE_URL = process.env.DATABASE_URL ||
            global.DATABASE_URL ||
            'mongodb:localhost/blobDB';

exports.PORT = process.env.PORT || 8080;