const fs = require("fs");
const path = require("path");
const data = require("../algolia");

let position = 0;
let size = 0;

const result = data.filter((a, i) => i !== 1480);
// data.forEach((element, index) => {
// 	if (element.description.length > size) {
// 		size = element.description.length;
// 		position = index;
// 	}
// });

// console.log(position, size);
// console.log(data[position]);

fs.writeFileSync(
	path.resolve(__dirname, "../algolia.json"),
	JSON.stringify(result, null, 4),
	"utf8"
);
