const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xezokrr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const productCollection = client.db('warehouseManagement').collection('inventory');

        const bannerCollection = client.db('warehouseManagement').collection('banner');

        const sellersCollection = client.db('warehouseManagement').collection('topsellers')

        app.get('/banner', async (req, res) => {
            const query = {};
            const cursor = bannerCollection.find(query);
            const result = await cursor.toArray();
            // console.log(result)
            res.send(result)
        })

        app.get('/inventory', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            
            const email = req.query.email;
            let query = {}
            if (email) {
                query = { email: email }
            }
            const cursor = productCollection.find(query);
            let result;
            if (page || size) {
                result = await cursor.skip(page * size).limit(size).toArray();
            }
            else if(email) {
                result = await cursor.toArray();
            }
            else {
                result = await cursor.limit(3).toArray();
            }
            res.send(result)
        })
        app.get('/productCount', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const count = await cursor.count();
            res.send({ count });
        })
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.findOne(query);
            res.send(result)
        })

        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const updateQuantity = req.body;
            console.log(updateQuantity);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updateQuantity.quantity,
                }
            };
            const result = await productCollection.updateOne(filter, updatedDoc, options);
            res.send(result)
            console.log(result)
        })

        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

        app.post('/inventory', async (req, res) => {
            const newItem = req.body;
            console.log(newItem)
            const result = await productCollection.insertOne(newItem);
            console.log(result)
            res.send(result)
        })
        app.get('/topsellers', async (req, res) => {
            const query = {};
            const cursor = sellersCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
    }
    catch {

    }
}
run().catch(console.dir)





app.get('/', (req, res) => {
    res.send("Running the server")
});
app.listen(port, () => {
    console.log('Server port is ', port)
})