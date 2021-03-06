const express = require('express');
const app = express();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const { MongoClient } = require('mongodb');

const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q3g5t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        // console.log('Databse Connected');
        const database = client.db('Attendance');
        const recordTime = database.collection('Record-Time');
        const usersCollection = database.collection('Users');


        // get all starting record api
        app.get("/recordTime", async (req, res) => {
            const result = await recordTime.find({}).toArray();
            console.log(req.body);
            res.send(result);
        });


        // insert starting record time api
        app.post('/recordTime', async (req, res) => {
            const time = req.body;
            const result = await recordTime.insertOne(time);
            console.log(result);

            res.json(result);
        });


        // get my myAttendance api
        app.get('/allAttendance', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = recordTime.find(query);
            const result = await cursor.toArray();
            console.log(result);
            res.send(result);
        });

        // find a single order api
        app.get('/editAttendance/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await recordTime.findOne(query);
            // console.log('Find with id', id);
            res.send(result);
        });

        // update my attendance
        app.put('/editAttendance/:id', async (req, res) => {
            const id = req.params.id;
            const updateData = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    startHour: updateData.startHour,
                    startMin: updateData.startMin,
                    startBreakHour: updateData.startBreakHour,
                    startBreakMin: updateData.startBreakMin,
                    endBreakHour: updateData.endBreakHour,
                    endBreakMin: updateData.endBreakMin,
                    endHour: updateData.endHour,
                    endMin: updateData.endMin,
                    memo: updateData.memo
                },
            };
            const result = await recordTime.updateOne(filter, updateDoc, options);

            console.log(result);
            // console.log(req.body);
            res.json(result);
        })

        // Delete/remove my attendance 
        app.delete("/editAttendance/:id", async (req, res) => {
            console.log(req.params.id);
            const result = await recordTime.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });


        // get admin user
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'Admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })


        //get all users api
        app.get("/members", async (req, res) => {
            const result = await usersCollection.find({}).toArray();
            // console.log(req.body);
            res.send(result);
        });

        // get specific user information api
        app.get('/members/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.findOne(query);
            // console.log('Find with id', id);
            res.send(result);
        });

        // update specific users information api 
        app.put('/members/:id', async (req, res) => {
            const id = req.params.id;
            const updateData = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    displayName: updateData.displayName,
                    email: updateData.email,
                    password: updateData.password,
                    role: updateData.role,
                    entryDate: updateData.entryDate,
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);

            console.log(result);
            // console.log(req.body);
            res.json(result);
        })

        // Delete/remove specific users
        app.delete("/users/:id", async (req, res) => {
            console.log(req.params.id);
            const result = await usersCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });

        // insert a user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });


        // update a user
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    user

                }
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });


        // update user role
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'Admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            console.log('put', result);
            res.json(result);
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Attendance Sheet System Server')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})