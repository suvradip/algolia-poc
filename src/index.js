const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const ora = require('ora');

const stichKeywords = require('./parse');
const storedLinks = require('./datasource.json');

(async () => {
   const spinner = ora('Loading process').start();

   const browser = await puppeteer.launch();
   const page = await browser.newPage();

   page.on('error', async err => {
      console.log('Error occuered');
      console.error(err);
      await browser.close();
      process.exit();
   });

   const getData = async link => {
      try {
         await page.goto(link);

         const Result = await page.evaluate(() => {
            function abouProduct(param) {
               if (param.indexOf('fusioncharts-aspnet-visualization/') > -1) {
                  return { name: 'FusionCharts.NET', order: 4 };
               }
               if (param.indexOf('exporting-charts/') > -1) {
                  return { name: 'FusionExport', order: 2 };
               }
               if (param.indexOf('fusiontime/') > -1) {
                  return { name: 'FusionTime', order: 3 };
               }
               return { name: 'FusionCharts Suite XT', order: 1 };
            }

            const { href } = window.location;
            const metaDescription = document.querySelector('meta[name=description]');
            const pageDescription = document.querySelector('.scrollspy-example p:first-of-type');
            const description =
               (metaDescription && metaDescription.content) ||
               (pageDescription && pageDescription.innerText) ||
               '';
            const title = document.querySelector('h1');
            const productInfo = abouProduct(href);

            const pageData = {
               titlePriority: 0,
               title: (title && title.innerText) || '',
               link: `${href + (title && title.id ? `#${title.id}` : '')}`,
               link_without_anchor: href,
               description,
               keywords: [],
               productName: productInfo.name,
               productOrder: productInfo.order,
            };

            const data = [];
            data.push(pageData);

            const hTags = ['H1', 'H2', 'H3', 'H4', 'H5'];
            document.querySelectorAll('h2,h3,h4,h5').forEach(h => {
               const titlePriority = hTags.indexOf(h.tagName);
               data.push({
                  titlePriority,
                  title: h.innerText.split('#').join(''),
                  description: (h.nextElementSibling && h.nextElementSibling.innerText) || '',
                  link: `${href + (h && h.id ? `#${h.id}` : '')}`,
                  link_without_anchor: href,
                  keywords: [],
                  productName: productInfo.name,
                  productOrder: productInfo.order,
               });
            });

            return data;
         });

         return Result;
      } catch (error) {
         await browser.close();
         process.exit();
         return console.log(error);
      }
   };

   let resultSet = [];
   const totalLinks = storedLinks.length;

   async function run(pointer = 0) {
      let start = pointer;
      const link = `http://localhost:3000${storedLinks[start]}`;

      spinner.text = `${start}/${totalLinks - 1} : ${link}`;

      const data = await getData(link);

      resultSet = resultSet.concat(data);

      if (start + 1 !== totalLinks) {
         start += 1;
         await run(start);
      } else {
         fs.writeFileSync(
            path.resolve(__dirname, '../output/result.json'),
            JSON.stringify(resultSet, null, 4),
            'utf8'
         );
         await browser.close();
         debugger;
         await stichKeywords(resultSet);
         process.exit();
      }
   }

   run();
})();
