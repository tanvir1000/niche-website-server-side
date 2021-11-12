
const express = require('express')
require('dotenv').config();
const cors = require('cors');
const fileupload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectId;
const bodyParser = require('body-parser');
const fs = require('fs-extra')
const app = express()
const port = process.env.PORT || 8000
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static('services'));
app.use(fileupload());

const MongoClient = require('mongodb').MongoClient;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vldbw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });






console.log(uri);
client.connect(err => {
    console.log('error', err)
    const reviewCollection = client.db("batnew").collection("review");
    const serviceCollection = client.db("batnew").collection("services");
    const orderCollection = client.db("batnew").collection("orders");
    const adminCollection = client.db("batnew").collection("admin");

    console.log('DB Connected');

   app.get('/services', (req, res) => {
        serviceCollection.find({})
            .toArray((err, docs) => res.send(docs))
    })

    app.get('/reviews', (req, res) => {
        if (req.query.email) {
            return reviewCollection.find({ email: req.query.email })
                .toArray((err, docs) => res.send(docs[0]))
        }
        reviewCollection.find({})
            .toArray((err, docs) => res.send(docs))
    })

    app.get('/orders', (req, res) => {
        adminCollection.find({ email: req.query.email })
            .toArray((err, docs) => {
                if (docs.length) {
                    orderCollection.find({})
                        .toArray((err, docs) => res.send(docs))
                } else {
                    orderCollection.find({ email: req.query.email })
                        .toArray((err, docs) => res.send(docs))
                }
            })
    })

    app.get('/isAdmin', (req, res) => {
        adminCollection.find({ email: req.query.email })
            .toArray((err, docs) => res.send(!!docs.length))
    })

    app.post('/addService', (req, res) => {
        serviceCollection.insertOne(req.body)
            .then(result => res.send(!!result.insertedCount))
    })

    app.post('/addReview', (req, res) => {
        reviewCollection.insertOne(req.body)
            .then(result => res.send(!!result.insertedCount))
    })

    app.post('/addAdmin', (req, res) => {
        adminCollection.insertOne(req.body)
            .then(result => res.send(!!result.insertedCount))
    })

    app.post('/addOrder', (req, res) => {
        orderCollection.insertOne(req.body)
            .then(result => res.send(!!result.insertedCount))
    })

    app.patch('/updateOrderStatus', (req, res) => {
        const { id, status } = req.body;
        console.log(req.body);
        orderCollection.findOneAndUpdate(
            { _id: ObjectId(id) },
            {
                $set: { status },
            }
        ).then(result => res.send(result.lastErrorObject.updatedExisting))
    })

    app.patch('/update/:id', (req, res) => {
        serviceCollection.updateOne(
            { _id: ObjectId(req.params.id) },
            {
                $set: req.body
            }
        ).then(result => res.send(!!result.modifiedCount))
    })

    app.delete('/delete/:id', (req, res) => {
        serviceCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => res.send(!!result.deletedCount))
    })

    app.patch('/updateReview/:id', (req, res) => {
        reviewCollection.updateOne(
            { _id: ObjectId(req.params.id) },
            {
                $set: req.body
            }
        ).then(result => res.send(!!result.modifiedCount))
    })

    app.delete('/deleteReview/:id', (req, res) => {
        reviewCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => res.send(!!result.deletedCount))
    })




});



app.get('/', (req, res) => {
    res.send("hello form bat");
})



app.listen(port, () => {
    console.log(`listening at ${port}`)
})