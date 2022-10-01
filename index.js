//% -> Core Modules
const fs = require('fs'); // builtin node module to read and write files.
const http = require('http'); // builtin node module for building http server and gives networking facility.
const url = require('url'); // builtin node module to get the url

//% -> Third Party Modules
const slugify = require('slugify');

//% -> Own Modules
const replaceTemplate = require('./modules/replaceTemplate');

/////////////////////////////////////////////////////////////
//~^ FILES

/*
//~% BLOCKING, SYNCHRONOUS WAY
//% => code to read the file in utf-8 format using "fs" module.
const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
console.log(textIn);

//% => this is how you create a new file using "fs" module.
//% => first we create a variable containing the text we want to add in the new file.
//% => then using the "fs" module "write" method we create a new file.
const textOut = `This is what we know about the avacado: ${textIn}.\nCreated on ${Date.now()}`;
fs.writeFileSync("./txt/output.txt", textOut);
console.log("File written");

//^ => example to read and write using "fs" module.
const index = fs.readFileSync("./index.js", "utf-8");

const newTextOut = `This is the new file I have created using node js and I have included the code of index.js file in this file : ${index}\nCreated by Dabinder on ${Date.now()}`;
fs.writeFileSync("./txt/newOutput.txt", newTextOut);


//~> NON-BLOCKING, ASYNCHRONOUS WAY

fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
  if (err) return console.log("ERROR! 💥");
  console.log({ data1 }); // this will print second
  fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
    console.log({ data2 }); // print third
    fs.readFile("./txt/append.txt", "utf-8", (err, data3) => {
      console.log({ data3 }); // print fourth
      fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
        console.log("Your file has been written"); // print fifth
        fs.readFile("./txt/final.txt", "utf-8", (err, data4) => {
          console.log({ data4 }); // print sixth
        });
      });
    });
  });
});
console.log("Will read file!"); // this will print first
*/

/////////////////////////////////////////////////////////////
//~^ SERVER & ROUTING

//% => read and store the data from a file into a variable.
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data); //% -> converts the json data into a js object.

dataObj.map((el) => {
  el['slug'] = slugify(el.productName, { lower: true });
});

//% => this built-in method creates a server. This is called whenever there is a request.
const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // Overview page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, {
      'Content-type': 'text/html', //% => for html file
    });
    const cardsHtml = dataObj.map((el) => replaceTemplate(tempCard, el)).join('');
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

    res.end(output);

    // Product page
  } else if (pathname === '/product') {
    res.writeHead(200, {
      'Content-type': 'text/html', //% => for html file
    });

    const [product] = dataObj.filter((el) => el.slug === query.id);
    // const product = dataObj[query.id];

    const output = replaceTemplate(tempProduct, product);
    res.end(output);

    // API
  } else if (pathname === '/api') {
    res.writeHead(200, {
      'Content-type': 'application/json', //% => for json file
    });
    res.end(data);

    // Not found
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html', //% => for html data
      'my-own-header': 'hello-world',
    });
    res.end('<h1>Page not found!</h1>');
  }
});

const PORT = 8000;
const hostname = '127.0.0.1';

server.listen(PORT, hostname, () => {
  console.log(`Listening to request at http://${hostname}:${PORT}`);
});
