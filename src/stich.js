const fs = require("fs");
const path = require("path");

function readFiles(dirname, onFileContent, onError) {
	fs.readdir(path.resolve(dirname), (err, filenames) => {
		if (err) {
			onError(err);
			return;
		}

		filenames.forEach(filename => {
			fs.readFile(path.resolve(dirname, filename), "utf-8", (err, content) => {
				if (err) {
					onError(err);
					return;
				}
				onFileContent(filename, content);
			});
		});
	});
}

let data = [];
readFiles(
	path.resolve(__dirname, "../data/set_2/"),
	(filename, content) => {
		if (filename !== "algolia.json") {
			if (content.length > 0) data = data.concat(JSON.parse(content));

			fs.writeFileSync(
				path.resolve(__dirname, "../data/set_2/algolia.json"),
				JSON.stringify(data, null, 4),
				"utf8"
			);
		}
	},
	err => {
		throw err;
	}
);
