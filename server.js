require('dotenv').config();
const express = require('express');
const stateRoutes = require('./routes/stateRoutes');
const { connectToMongo } = require('./mongodb');
const {join} = require("path");
const path = require("path");
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'views')));

app.use(cors());

const PORT = process.env.PORT || 3000;

app.use('/states', stateRoutes);
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'views', 'home.html')); });


app.use((req, res, next) => {
    res.status(404).sendFile(join(__dirname, 'views', '404.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

connectToMongo().catch(console.error);

process.on('SIGINT', async () => {
    const { client } = require('./mongodb');
    await client.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
});