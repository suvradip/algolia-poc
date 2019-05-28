const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const ora = require("ora");

const storedLinks = require("./datasource.json");

(async () => {
	const spinner = ora("Loading process").start();

	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	page.on("error", () => {
		console.log("Error occuered");
	});

	const getData = async link => {
		try {
			await page.goto(link);
			// Get the "viewport" of the page, as reported by the page.

			const Result = await page.evaluate(() => {
				function abouProduct(path) {
					if (path.indexOf("fusioncharts-aspnet-visualization/") > -1) {
						return { name: "FusionCharts.NET", order: 4 };
					}
					if (path.indexOf("exporting-charts/") > -1) {
						return { name: "FusionExport", order: 2 };
					}
					if (path.indexOf("fusiontime/") > -1) {
						return { name: "FusionTime", order: 3 };
					}
					return { name: "FusionCharts Suite XT", order: 1 };
				}

				const link = window.location.href;
				const metaDescription = document.querySelector(
					"meta[name=description]"
				);
				const pageDescription = document.querySelector(
					".scrollspy-example p:first-of-type"
				);
				const description =
					(metaDescription && metaDescription.content) ||
					(pageDescription && pageDescription.innerText) ||
					"";
				const title = document.querySelector("h1");
				const productInfo = abouProduct(link);

				const pageData = {
					title: (title && title.innerText) || "",
					link: `${link + (title && title.id ? "#" + title.id : "")}`,
					link_without_anchor: link,
					description,
					keywords: [],
					productName: productInfo.name,
					productOrder: productInfo.order
				};

				var data = [];
				data.push(pageData);

				document.querySelectorAll("h2").forEach(h => {
					data.push({
						title: h.innerText.split("#").join(""),
						description:
							(h.nextElementSibling && h.nextElementSibling.innerText) || "",
						link: `${link + (h && h.id ? "#" + h.id : "")}`,
						link_without_anchor: link,
						keywords: [],
						productName: productInfo.name,
						productOrder: productInfo.order
					});
				});

				return data;
			});

			return Result;
		} catch (error) {
			console.log(error);
			fs.writeFileSync(
				path.resolve(__dirname, "../result.json"),
				JSON.stringify(resultSet, null, 4),
				"utf8"
			);
			await browser.close();
			process.exit();
		}
	};

	let resultSet = [];
	const totalLinks = storedLinks.length;

	async function run(pointer = 0) {
		const link = "http://localhost:3000" + storedLinks[pointer];

		spinner.text = `${pointer}/${totalLinks - 1} : ${link}`;

		const data = await getData(link);

		resultSet = resultSet.concat(data);

		if (pointer + 1 !== totalLinks) {
			pointer += 1;
			await run(pointer);
		} else {
			fs.writeFileSync(
				path.resolve(__dirname, "../result.json"),
				JSON.stringify(resultSet, null, 4),
				"utf8"
			);
			await browser.close();
			process.exit();
		}
	}

	run();
})();
