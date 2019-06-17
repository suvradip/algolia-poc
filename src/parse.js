const csv = require('csv-parser');
const path = require('path');
const fs = require('fs');

module.exports = (prevData = []) =>
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

               console.log(results.length);

               const data = prevData.map(a => {
                  const obj = { ...a };
                  const link = obj.link.replace('http://localhost:3000', '');
                  if (dummy[link]) {
                     obj.keywords = dummy[link];
                  }
                  return obj;
               });

               fs.writeFileSync(
                  path.resolve(__dirname, '../output/result-with-keywords.json'),
                  JSON.stringify(data, null, 4),
                  'utf8'
               );

               resolve(data);
            });
      } catch (error) {
         console.log('error occured in parsing.');
         reject(error);
      }
   });
