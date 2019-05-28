const csv = require("csv-parser");
const path = require("path");
const fs = require("fs");
const prevData = require("../algolia.json");

const results = [];

const dummy = {};
fs.createReadStream(path.resolve(__dirname, "../csv/fc-components.csv"))
	.pipe(
		csv({
			headers: false,
			separator: "$"
		})
	)
	.on("data", data => results.push(data))
	.on("end", () => {
		results.forEach(a => {
			const key = a["0"] && a["0"].trim();
			const value = a["1"] && a["1"].trim();
			if (key && value) {
				if (dummy[key]) {
					dummy[key].push(value);
				} else {
					dummy[key] = value.split(",").map(k => k.trim());
				}
			}
		});

		const data = prevData.map(a => {
			const link = a.link.replace("http://localhost:3000", "");
			if (dummy[link]) {
				a.keywords = dummy[link];
			}
			return a;
		});
	});
