// This code sets up a basic Express server on port 3001 and adds the CORS middleware to allow cross-origin requests.
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3001;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// This code creates a new POST route that accepts a URL query parameter and uses Puppeteer to fetch the website's content. You can modify the Puppeteer code to extract the specific content you need https://insanelygoodrecipes.com/african-recipes/.

const puppeteer = require("puppeteer");

app.post("/scrape", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://insanelygoodrecipes.com/african-recipes/');

    // Extract content using Puppeteer's API
    const content = await page.content();

    await browser.close();

    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: "Failed to scrape the website" });
  }
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});