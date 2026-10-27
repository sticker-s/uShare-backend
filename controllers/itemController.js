const Item = require('../models/Item');
const { uploadToCloud, deleteFromCloud } = require('../utils/s3');
const path = require('path');

// helper fnc to convert string to dates

