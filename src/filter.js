const fs = require('fs');
const path = require('path');
const data = require('../output/result-with-keywords.json');

let position = 0;
let size = 0;

data.forEach((element, index) => {
   if (element.description.length > size) {
      size = element.description.length;
      position = index;
   }
});

const result = data.filter((a, i) => i !== position);

// console.log(data[position]);

console.log(
   `postition: ${position} | size - ${size} | oldCount - ${data.length} | finalCount - ${
      result.length
   }`
);

fs.writeFileSync(
   path.resolve(__dirname, '../output/result-with-keywords.json'),
   JSON.stringify(result, null, 4),
   'utf8'
);
