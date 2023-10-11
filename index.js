const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
const fs = require("fs");
const app = express();
const port = 3001;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/scrape", async (req, res) => {
  const urls = ["https://www.chimamanda.com/welcome/"



  ];

  try {
    const browser = await puppeteer.launch();

    // Scrape content from each URL concurrently
    const scrapePromises = urls.map(async (url, index) => {
      const page = await browser.newPage();
      await page.goto(url);

    const textContent = await page.evaluate(() => {
    function getTextFromNode(node) {
        let result = "";
        const excludeTags = ["SCRIPT", "STYLE", "NOSCRIPT"];

        if (node.nodeType === Node.TEXT_NODE) {
        result = node.textContent.trim();
        } else if (
        node.nodeType === Node.ELEMENT_NODE &&
        !excludeTags.includes(node.tagName)
        ) {
        for (const childNode of node.childNodes) {
            result += getTextFromNode(childNode);
        }
        }

        return result ? result + "\n" : "";
    }

    return getTextFromNode(document.body);
    });


      const fileName = `scraped-text-content-${index + 1}.txt`;
      fs.writeFileSync(fileName, textContent, "utf-8");

      await page.close();
      return fileName;
    });

    const savedFiles = await Promise.all(scrapePromises);
    await browser.close();

    res.json({ message: `Scraped content saved to: ${savedFiles.join(", ")}` });
  } catch (error) {
    res.status(500).json({ error: "Failed to scrape the websites" });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// This code makes a POST request to the /scrape endpoint and logs the JSON response message. When you run this function, it will trigger the scraping process on the server, and the server will save the scraped content to a text file and return a JSON response indicating that the content has been saved.

async function triggerScrape() {
  try {
    const response = await fetch("http://localhost:3001/scrape", { method: "POST" });
    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error("Failed to trigger scraping", error);
  }
}

triggerScrape();
