const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const ora = require('ora');
const axios = require('axios');
const stichKeywords = require('./parse');

(async () => {
   const spinner = ora('Loading process').start();

   /* const storedLinks = await axios.get('http://localhost:3000/portal/sidebar/').then(response => {
      const links = [];
      function extract(children) {
         children.forEach(item => {
            if (item.path) {
               links.push(item.path);
            } else if (item.children && item.children.length > 0) {
               extract(item.children);
            }
         });
      }

      extract(response.data);
      return links;
	}); */

   const storedLinks = [
      '/university/creating-a-realtime-bitcoin-ticker-in-javascript',
      '/university/sales-dashboard-using-react',
      '/university/learn-how-to-export-a-dashboard-fusionexport',
      '/university/create-a-funnel-chart-using-fusioncharts-and-dotnet',
      '/university/create-funnel-chart-fusioncharts-mvc-dotnet',
      '/university/create-a-column-chart-using-fusioncharts-and-dotnet',
      '/university/render-fusioncharts-mvc-using-dotnet',
      '/university/create-combination-chart-using-fusioncharts-and-dotnetmvc',
      '/university/create-combination-chart-dotnet-webform',
   ];

   const browser = await puppeteer.launch();
   const page = await browser.newPage();

   page.on('error', async err => {
      console.log('Error occurred');
      console.error(err);
      await browser.close();
      process.exit();
   });

   const getData = async link => {
      try {
         await page.goto(link, {
            timeout: 600000,
            waitUntil: 'networkidle2',
         });

         const Result = await page.evaluate(() => {
            function aboutProduct(param) {
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

            function getHierarchy() {
               const items = [];
               let order;
               document.querySelectorAll('#tree .expanded').forEach(el => {
                  const requiredElement = el.nextElementSibling;
                  if (!order) order = requiredElement.getAttribute('data-order') * 1;
                  items.push(requiredElement.innerText);
               });

               return {
                  order,
                  content: items.join(' > '),
               };
            }

            const { href } = window.location;
            const metaDescription = document.querySelector('meta[name=description]');
            const pageDescription = document.querySelector('.scrollspy-example p:first-of-type');
            const description =
               (metaDescription && metaDescription.content) ||
               (pageDescription && pageDescription.innerText) ||
               '';
            const title = document.querySelector('h1');
            const productInfo = aboutProduct(href);

            const pageData = {
               description,
               hierarchyOrder: getHierarchy().order,
               hierarchy: getHierarchy().content,
               titlePriority: 0,
               title: (title && title.innerText) || '',
               link: `${href + (title && title.id ? `#${title.id}` : '')}`,
               link_without_anchor: href,
               keywords: [],
               productName: productInfo.name,
               productOrder: productInfo.order,
            };

            const data = [];
            data.push(pageData);

            const hTags = ['H1', 'H2', 'H3', 'H4', 'H5'];
            const region = document.querySelector('.page-content');

            function getDescription(target) {
               const { nextElementSibling } = target;
               if (nextElementSibling) {
                  const text = nextElementSibling.innerText || '';
                  return text.substr(0, 4000);
               }
               return '';
            }

            if (region) {
               region.querySelectorAll('h2,h3,h4,h5').forEach(h => {
                  const titlePriority = hTags.indexOf(h.tagName);
                  const titleExtract = h.innerText.split('#').join('');

                  data.push({
                     titlePriority,
                     hierarchyOrder: getHierarchy().order,
                     hierarchy: getHierarchy().content,
                     title: titleExtract,
                     description: getDescription(h),
                     link: `${href + (h && h.id ? `#${h.id}` : '')}`,
                     link_without_anchor: href,
                     keywords: [],
                     productName: productInfo.name,
                     productOrder: productInfo.order,
                  });
               });
            }

            return data;
         });

         return Result;
      } catch (error) {
         await browser.close();
         console.error(error);
         return process.exit();
      }
   };

   let resultSet = [];
   const totalLinks = storedLinks.length;

   async function run(pointer = 0) {
      let start = pointer;
      const link = `http://localhost:3000${storedLinks[start]}`;

      spinner.text = `${start}/${totalLinks - 1} : ${link}\n`;

      const data = await getData(link);

      resultSet = resultSet.concat(data);

      if (start + 1 !== totalLinks) {
         start += 1;
         await run(start);
      } else {
         fs.writeFileSync(
            path.resolve(__dirname, '../temp/result.json'),
            JSON.stringify(resultSet, null, 4),
            'utf8'
         );
         await browser.close();
         await stichKeywords(resultSet);
         process.exit();
      }
   }

   run();
})();
