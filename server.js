const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const {PORT, DATABASE_URL} = require('./config');
const {BlogPost} = require('./models');
const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());

mongoose.Promise = global.Promise;


app.get('/posts', (req, res) => {
    
    
   BlogPost
       .find()
       .limit(5)
       .exec()
       .then(posts => {
        //    res.json(posts.map(post => post.apiRepr()));
        res.json(posts).status(200);
        console.log(posts);
       })
       .catch(err => {
           console.error(err);
           res.status(500).json({error: 'something went wrong'});
       });
});

app.get('/posts/:id', (req, res) => {
   BlogPost
       .findById(req.params.id)
       .exec()
       .then(post => res.json(post.apiRepr()))
       .catch(err => {
           console.error(err);
           res.status(500).json({error: 'something went wrong'});
       });
});

app.post('/posts', (req, res) => {
    const requiredFields = ['title', 'content', 'author'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing "${field}" in request body`
            console.error(message);
            return res.status(400).send(message);
        }
    }
    BlogPost
        .create({
             title: req.body.title,
            content: req.body.content,
            author: req.body.author
        })
        .then(blogPost => res.status(201).json(blogPost.apiRepr()))
        .catch(err => {
            console.error(err);
            res.status(500).json({error: 'Something went wrong'});
        });
});

app.delete('/posts/:id', (req, res) => {
   BlogPost
       .findByIdAndRemove(req.params.id)
       .exec()
       .then(() => {
       res.status(204).json({message: 'success'});
       })
       .catch(err => {
           console.error(err);
           res.status(500).json({error: 'something went wrong'});
       });
});

app.put('/posts/:id', (req, res) => {
   if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
       res.status(400).json({
           error: 'Request path id and request body id values must match'
       });
   }
   const updated = {};
   const updatableFields = ['title', 'content', 'author'];
   updatableFields.forEach(field => {
       if (field in req.body) {
           update[field] = req.body[field];
       }
   });
   BlogPost
       .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
       .exec()
       .then(updatedPost => res.status(200).json(updatedPost.apiRepr()))
       .catch(err => res.status(500).json({message: 'Something went wrong'}));
});

app.delete('/:id', (req, res)=> {
   BlogPost
       .findByIdAndRemove(req.params.id)
       .exec()
       .then(() => {
       console.log(`Deleted blog post with id "${req.params.id}`);
       res.status(204).end();
       });
});

app.use('*', function(req, res) {
    res.status(204).json({message: 'Not Found'});
});

let server;
//function to connect to database then starts server
function runServer(databaseURL = DATABASE_URL, port=PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseURL, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                console.log(`Your app is listening on port ${port}`);
                resolve();
            })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

//function closes the server
function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer().catch(err => console.error(err));
}

module.exports = {runServer, app, closeServer};