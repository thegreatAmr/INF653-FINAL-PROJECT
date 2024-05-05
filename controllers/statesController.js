const { getDb } = require('../mongodb');
const statesData = require('../models/statesData.json');



exports.getAllStates = async (req, res) => {
    const { contig } = req.query;
    let filteredStates = statesData;
    if (contig === 'true') {
        filteredStates = statesData.filter(state => state.code !== 'AK' && state.code !== 'HI');
    } else if (contig === 'false') {
        filteredStates = statesData.filter(state => state.code === 'AK' || state.code === 'HI');
    }

    const db = await getDb();
    const collection = db.collection('states');

    try {
        const statesWithFunFacts = await Promise.all(filteredStates.map(async (state) => {
            const funFactData = await collection.findOne({ stateCode: state.code });
            return {
                ...state,
                funfacts: funFactData ? funFactData.funfacts : []
            };
        }));

        res.json(statesWithFunFacts);
    } catch (error) {
        console.error('Database query failed:', error);
        res.status(500).send('Error fetching data from database');
    }
};

exports.getStateByCode = async (req, res) => {
    const { state } = req.params;
    const stateData = statesData.find(s => s.code.toUpperCase() === state.toUpperCase());

    if (!stateData) {
        return res.status(404).send('State not found');
    }

    const db = await getDb();
    const collection = db.collection('states');
    try {
        const funFactData = await collection.findOne({ stateCode: state.toUpperCase() });
        const completeStateData = {
            ...stateData,
            funfacts: funFactData ? funFactData.funfacts : []
        };

        res.json(completeStateData);
    } catch (error) {
        console.error('Database query failed:', error);
        res.status(500).send('Database query failed');
    }
};

exports.getRandomFunFact = async (req, res) => {
    const { state } = req.params;
    const db = await getDb();
    const collection = db.collection('states');

    const stateInfo = statesData.find(s => s.code.toUpperCase() === state.toUpperCase());

    if (!stateInfo) {
        return res.status(404).send('State not found in JSON data');
    }

    try {
        const stateData = await collection.findOne({ stateCode: state.toUpperCase() });
        if (!stateData) {
            return res.status(404).send('State not found in database');
        }
        if (!stateData.funfacts || stateData.funfacts.length === 0) {
            return res.status(404).json({ message: `No Fun Facts found for ${stateInfo.state}` });
        }
        const funFact = stateData.funfacts[Math.floor(Math.random() * stateData.funfacts.length)];
        res.json({ state: stateInfo.name, funfact: funFact });
    } catch (error) {
        console.error('Database query failed:', error);
        res.status(500).send('Database query failed');
    }
};

exports.getCapital = (req, res) => {
    const { state } = req.params;
    const stateData = statesData.find(s => s.code === state.toUpperCase());
    if (!stateData) {
        return res.status(404).send('State not found');
    }
    res.json({ state: stateData.state, capital: stateData.capital_city });
};

exports.getNickname = (req, res) => {
    const { state } = req.params;
    const stateData = statesData.find(s => s.code === state.toUpperCase());
    if (!stateData) {
        return res.status(404).send('State not found');
    }
    res.json({ state: stateData.state, nickname: stateData.nickname });
};

exports.getPopulation = (req, res) => {
    const { state } = req.params;
    const stateData = statesData.find(s => s.code.toUpperCase() === state.toUpperCase());
    if (!stateData) {
        return res.status(404).send('State not found');
    }
    const formattedPopulation = stateData.population.toLocaleString('en-US');
    res.json({ state: stateData.state, population: formattedPopulation });
};

exports.getAdmissionDate = (req, res) => {
    const { state } = req.params;
    const stateData = statesData.find(s => s.code === state.toUpperCase());
    if (!stateData) {
        return res.status(404).send('State not found');
    }
    res.json({ state: stateData.state, admitted: stateData.admission_date });
};


exports.addFunFact = async (req, res) => {
    const { state } = req.params;
    const { funfacts } = req.body;

    const db = await getDb();
    const collection = db.collection('states');

    try {
        const updateResult = await collection.updateOne(
            { stateCode: state.toUpperCase() },
            { $push: { funfacts: { $each: funfacts } } },
            { upsert: true }
        );

        const updatedStateData = await collection.findOne({ stateCode: state.toUpperCase() });

        if (updatedStateData) {
            res.json({
                acknowledged: updateResult.acknowledged,
                funfacts: updatedStateData.funfacts,
                modifiedCount: updateResult.modifiedCount,
                funfactsLength: updatedStateData.funfacts.length
            });
        } else {
            res.status(404).json({ message: "State not found after update." });
        }
    } catch (error) {
        console.error('Database query failed:', error);
        res.status(500).send('Database operation failed');
    }
};


exports.updateFunFact = async (req, res) => {
    const { state } = req.params;
    const { index, funfact } = req.body;
    const db = await getDb();
    const collection = db.collection('states');

    const stateInfo = statesData.find(s => s.code.toUpperCase() === state.toUpperCase());

    if (!stateInfo) {
        return res.status(404).send('State not found in JSON data');
    }

    try {
        const stateData = await collection.findOne({ stateCode: state.toUpperCase() });

        if (!stateData) {
            return res.status(404).json({ message: `No Fun Facts found for ${stateInfo.state}` });
        }

        if (!stateData.funfacts || stateData.funfacts.length === 0) {
            return res.status(404).json({ message: `No Fun Facts found for ${stateInfo.state}` });
        }

        const arrayIndex = index - 1;
        if (index < 1 || index > stateData.funfacts.length) {
            return res.status(404).json({ message: `No Fun Fact found at that index for ${stateInfo.state}` });
        }

        const updateQuery = { $set: { [`funfacts.${arrayIndex}`]: funfact } };
        const result = await collection.updateOne({ stateCode: state.toUpperCase() }, updateQuery);

        const updatedStateData = await collection.findOne({ stateCode: state.toUpperCase() });

        res.json({
            acknowledged: true,
            state: state,
            funfacts: updatedStateData.funfacts,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Database query failed:', error);
        res.status(500).send('Database operation failed');
    }
};


exports.deleteFunFact = async (req, res) => {
    const { state } = req.params;
    const { index } = req.body;
    const db = await getDb();
    const collection = db.collection('states');

    const stateInfo = statesData.find(s => s.code.toUpperCase() === state.toUpperCase());
    if (!stateInfo) {
        return res.status(404).json({ message: `State not found in JSON data` });
    }

    try {
        const stateData = await collection.findOne({ stateCode: state.toUpperCase() });
        if (!stateData) {
            return res.status(404).json({ message: `No Fun Facts found for ${stateInfo.state}` });
        }

        if (!stateData.funfacts || stateData.funfacts.length === 0) {
            return res.status(404).json({ message: `No Fun Facts found for ${stateInfo.state}` });
        }
        if (index < 1 || index > stateData.funfacts.length) {
            return res.status(404).json({ message: `No Fun Fact found at that index for ${stateInfo.state}` });
        }

        const arrayIndex = index - 1; 
        const updateResult = await collection.updateOne(
            { stateCode: state.toUpperCase() },
            { $unset: { [`funfacts.${arrayIndex}`]: "" } } 
        );

        if (updateResult.modifiedCount > 0) {
            await collection.updateOne(
                { stateCode: state.toUpperCase() },
                { $pull: { funfacts: null } }
            );
        }

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ message: `No Fun Fact found at that index for ${stateInfo.state}` });
        }

        const updatedStateData = await collection.findOne({ stateCode: state.toUpperCase() });
        res.json({
            acknowledged: true,
            state: stateInfo.state,
            funfacts: updatedStateData.funfacts,
            modifiedCount: updateResult.modifiedCount
        });
    } catch (error) {
        console.error('Database query failed:', error);
        res.status(500).send('Database operation failed');
    }
};