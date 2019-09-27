require('dotenv').config();
const algoliasearch = require('algoliasearch/lite');
const fs = require('fs');
const path = require('path');

const chartAttributes = require('../data/attributes.json');
// const setOne = require('../temp/1-result-with-keywords.json');
// const setTwo = require('../temp/2-result-with-keywords.json');
// const setThree = require('../temp/3-result-with-keywords.json');
// const setFour = require('../temp/4-result-with-keywords.json');
// const setFive = require('../temp/5-result-with-keywords.json');
const resultWithKeyWords = require('../temp/result-with-keywords.json');

const { APP_ID, API_KEY } = process.env;

const client = algoliasearch(APP_ID, API_KEY);
const index = client.initIndex('dev-centre-2');

(async () => {
   /* clear all records */
   await index.clearIndex();

   /* chart attributes */
   index.addObjects(chartAttributes, (err, content) => {
      if (err) {
         throw err;
      }
      console.log(content);
   });

   await index.clearIndex();

   /* dev centre content index upload */
   // const indexValues = [...setOne, ...setTwo, ...setThree, ...setFour, ...setFive];
   index.addObjects(resultWithKeyWords, (err, { objectIDs } = {}) => {
      if (err) {
         throw err;
      } else {
         const indexValuesWithObjectIds = resultWithKeyWords.map((item, i) => ({
            ...item,
            objectID: objectIDs[i],
         }));

         fs.writeFileSync(
            path.resolve(__dirname, '../temp/upload.json'),
            JSON.stringify(indexValuesWithObjectIds, null, 4),
            'utf8'
         );

         console.log('upload complete.');
      }
   });
})();
