const express = require('express');
const router = express.Router();
const statesController = require('../controllers/statesController');
const validateStateCode = require('../middleware/validateStateCode');
const validateFunfacts = require('../middleware/validateFunfacts');
const validateFunfactUpdate = require('../middleware/validateFunfactUpdate');
const validateFunfactIndex = require('../middleware/validateFunfactIndex');
const {join} = require("path");

router.get('/', statesController.getAllStates);

router.get('/:state', validateStateCode, statesController.getStateByCode);
router.get('/:state/funfact', validateStateCode, statesController.getRandomFunFact);
router.get('/:state/capital', validateStateCode, statesController.getCapital);
router.get('/:state/nickname', validateStateCode, statesController.getNickname);
router.get('/:state/population', validateStateCode, statesController.getPopulation);
router.get('/:state/admission', validateStateCode, statesController.getAdmissionDate);

router.post('/:state/funfact', validateStateCode, validateFunfacts, statesController.addFunFact);

router.patch('/:state/funfact', validateStateCode, validateFunfactUpdate, statesController.updateFunFact);

router.delete('/:state/funfact', validateStateCode, validateFunfactIndex, statesController.deleteFunFact);

router.all('*', (req, res) => {
    res.status(404).sendFile(join(__dirname, 'views', '404.html'));
});

module.exports = router;