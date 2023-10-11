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
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://insanelygoodrecipes.com/african-recipes/");

    // Extract text content using Puppeteer's API
    //This code defines a getTextFromNode() function that recursively processes the DOM tree, starting from the document.body. For each text node, it retrieves the text content, trims it, and adds a newline character at the end. If the node is an element node and not in the excludeTags list, the function processes its child nodes recursively.

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


    // Save text content to a text file
    fs.writeFileSync("scraped-text-content.txt", textContent, "utf-8");

    await browser.close();

    res.json({ message: "Scraped text content saved to scraped-text-content.txt" });
  } catch (error) {
    res.status(500).json({ error: "Failed to scrape the website" });
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
