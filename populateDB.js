require('dotenv').config();
const { getDb, connectToMongo, client } = require('./mongodb');
const statesData = require('./models/statesData.json');

const funfactsData = {
    KS: [
        "Kansas is geographically the center of the U.S.",
        "Dodge City is the windiest city in the United States.",
        "Kansas is the largest producer of wheat in the country.",
        "The first Pizza Hut was opened in Wichita, Kansas in 1958.",
        "Amelia Earhart, the famous aviator, was born in Atchison, Kansas."
    ],
    MO: [
        "Missouri is known as the 'Show Me State'.",
        "The Gateway Arch in St. Louis is the tallest man-made monument in the U.S.",
        "Missouri is home to more than 6,000 caves.",
        "Kansas City, Missouri, has more boulevards than Paris and more fountains than any city except Rome.",
        "The ice cream cone was invented in St. Louis, Missouri, during the 1904 World's Fair."
    ],
    OK: [
        "Oklahoma has the largest Native American population of any state.",
        "The National Cowboy Hall of Fame is located in Oklahoma.",
        "Oklahoma is the third largest gas-producing state in the nation.",
        "The world's first installed parking meter was in Oklahoma City, Oklahoma, in 1935.",
        "Oklahoma's state vegetable is the watermelon."
    ],
    NE: [
        "Nebraska has more miles of river than any other state.",
        "The largest mammoth fossil ever found was discovered in Nebraska.",
        "Nebraska's state insect is the honeybee.",
        "Kool-Aid was invented in Hastings, Nebraska, in 1927.",
        "Nebraska is the birthplace of the Reuben sandwich."
    ],
    CO: [
        "Colorado contains 75% of the land area of the U.S. with an altitude over 10,000 feet.",
        "Colorado has the highest paved road in North America.",
        "The world's largest flat-top mountain is in Grand Mesa, Colorado.",
        "Denver, Colorado, lays claim to the invention of the cheeseburger.",
        "Colorado is home to the world's first rodeo, held in Deer Trail, Colorado, in 1869."
    ]
};


async function populateDatabase() {
    try {
        await connectToMongo(); 
        const db = getDb(); 
        const states = db.collection("states");
        await states.deleteMany({});

        const insertPromises = statesData.map(state => {
            const funfacts = funfactsData[state.code] || null;
            if (funfacts != null) {
                return states.insertOne({
                    stateCode: state.code,
                    funfacts: funfacts
                });
            }
            else{
                return states.insertOne({
                    stateCode: state.code
                });
            }
        });

        await Promise.all(insertPromises);
        console.log('Database populated!');
    } catch (err) {
        console.error('Error populating database:', err);
    } finally {
        await client.close();
    }
}

populateDatabase();