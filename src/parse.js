const csv = require('csv-parser');
const path = require('path');
const fs = require('fs');
// const dataTempo = require('../output/result.json');

const operation = (prevData = []) =>
   new Promise((resolve, reject) => {
      const results = [];
      const dummy = {};
      try {
         fs.createReadStream(path.resolve(__dirname, '../csv/keywords.csv'))
            .pipe(
               csv({
                  headers: false,
                  separator: ',',
               })
            )
            .on('data', data => results.push(data))
            .on('end', () => {
               results.forEach(a => {
                  const key = a['0'] && a['0'].trim();
                  const value = a['1'] && a['1'].trim();
                  if (key && value) {
                     const keywords = value.split(',').map(k => k.trim());
                     if (dummy[key]) {
                        dummy[key] = dummy[key].concat(keywords);
                     } else {
                        dummy[key] = keywords;
                     }
                  }
               });

               const data = prevData.map(a => {
                  const obj = { ...a };
                  const link = obj.link.replace('http://localhost:3000', '');
                  if (dummy[link]) {
                     obj.keywords = dummy[link];
                  }
                  return obj;
               });

               let finalData = JSON.stringify(data, null, 4);
               finalData = finalData.replace(
                  /http:\/\/localhost:3000/gi,
                  'https://www.fusioncharts.com/dev'
               );
               fs.writeFileSync(
                  path.resolve(__dirname, '../output/result-with-keywords.json'),
                  finalData,
                  'utf8'
               );

               resolve(data);
            });
      } catch (error) {
         console.log('error occured in parsing.');
         reject(error);
      }
   });

module.exports = operation;

// operation(dataTempo);
