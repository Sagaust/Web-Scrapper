const sanitizeFilename = require("sanitize-filename");
const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
const fs = require("fs");
const https = require("https");
const http = require("http");
const axios = require("axios"); // Add this line to import Axios
const app = express();
const port = 3001;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

function downloadImage(url, path) {
  const file = fs.createWriteStream(path);
  const protocol = url.startsWith("https") ? https : http;
  return new Promise((resolve, reject) => {
    protocol.get(url, (response) => {
      response.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
      file.on("error", (err) => {
        fs.unlink(path);
        reject(err);
      });
    });
  });
}

app.post("/scrape", async (req, res) => {
  const urls = [
"https://www.bbc.com/pidgin/articles/c6p3553lpm1o",
"https://www.bbc.com/pidgin/articles/c519336n1wdo",
"https://www.bbc.com/pidgin/articles/cd1we4x1266o",
"https://www.bbc.com/pidgin/articles/cyrvgp312jdo",
"https://www.bbc.com/pidgin/articles/cj7reyee4nzo",
"https://www.bbc.com/pidgin/articles/c2v8pql7938o",
"https://www.bbc.com/pidgin/articles/c0dpv3983x7o",
"https://www.bbc.com/pidgin/articles/ck59ny6jyklo",
"https://www.bbc.com/pidgin/articles/c6pvg0q0l79o",
  ];

  try {
    const browser = await puppeteer.launch();
    const scrapePromises = urls.map(async (url, index) => {
      const response = await axios.get(url, { timeout: 10000 }); // Increase the timeout to 10 seconds
      const html = response.data;
      const page = await browser.newPage();
      await page.setContent(html);

      const imageUrls = await page.$$eval("img", (images) =>
        images.map((img) => img.src)
      );

      const imagePromises = imageUrls.map(async (imageUrl, imgIndex) => {
        const fileExtension = imageUrl.split(".").pop().split("?")[0];
        const sanitizedFilename = sanitizeFilename(`${index + 1}-${imgIndex + 1}.${fileExtension}`);
        const fileName = `output/${sanitizedFilename}`;
        await downloadImage(imageUrl, fileName);
        return fileName;
      });

      const savedImages = await Promise.all(imagePromises);
      await page.close();
      return savedImages;
    });

    const savedFiles = await Promise.all(scrapePromises);
    await browser.close();

    res.json({ message: `Scraped images saved to: ${JSON.stringify(savedFiles)}` });
  } catch (error) {
    res.status(500).json({ error: "Failed to scrape the websites" });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

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
