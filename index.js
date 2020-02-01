const fs = require("fs");
const inquirer = require("inquirer");
const axios = require("axios");
const generateHTML = require("./generateHTML");
const puppeteer = require("puppeteer");
//const pdfgen=require("./pdfgenerator");
let myHtml = "";
let htmlContent = "";
inquirer
    .prompt([{
            message: "Enter your Github username",
            name: "username"
        },
        {
            type: "list",
            name: "color",
            message: "What is your fav color?",
            choices: Object.keys(generateHTML.colors),
        }
    ])
    .then(function ({
        username,
        color
    }) {

        var colorChoice = {
            "color": "temp"
        };
        colorChoice["color"] = `${color}`
        myHtml = generateHTML.generateHTML(colorChoice);
        const queryUrl = `https://api.github.com/users/${username}`;
        const queryurl2 = `https://api.github.com/users/${username}/starred`;
        var filePath = "./pdf/" + username + '.pdf';

        axios
            .get(queryUrl)
            .then(function (response) {

                //console.log(response.data.login);
                htmlContent = generateHTML.generateContent(response.data);

                console.log('Generating profile of: ' + username + ' in ' + color + ' color.');
                axios
                    .get(queryurl2)
                    .then(async function (response) {

                        myHtml = myHtml + htmlContent.replace('STAR_COUNT', Object.keys(response.data).length);

                        console.log('Writing html file');

                        fs.writeFile("pdf.html", myHtml, async function () {
                            console.log('Done with HTML file')
                            console.log('Creating PDF file')
                            const browser = await puppeteer.launch();
                            const page = await browser.newPage();
                            const html = fs.readFileSync("pdf.html", "utf8");
                            await page.setContent(html);

                            await page.pdf({
                                path: filePath,
                                pageRanges: "1",
                                format: "A4"
                            });
                            await browser.close();
                            console.log('Done with PDF file')
                        });
                    });
            });
    });