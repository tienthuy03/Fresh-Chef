const axios = require('axios');
const cheerio = require('cheerio');
const Recipe = require('../models/Recipe');

const COOKPAD_VN_URL = 'https://cookpad.com/vn';

async function scrapeRecipes(keyword) {
  try {
    const searchUrl = `${COOKPAD_VN_URL}/tim-kiem/${encodeURIComponent(keyword)}`;
    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
      }
    });
    const $ = cheerio.load(data);
    const recipeUrls = [];

    // Extract recipe URLs from search results
    $('a[href^="/vn/cong-thuc/"]').each((i, el) => {
      const url = $(el).attr('href');
      // Tránh lấy link "Tạo mới" và tránh lặp lại /vn
      if (url && !url.includes('tao-moi') && !recipeUrls.includes(url)) {
        recipeUrls.push(url);
      }
    });

    console.log(`Found ${recipeUrls.length} recipes for keyword: ${keyword}`);

    for (const relativeUrl of recipeUrls.slice(0, 5)) {
      // Cookpad URL already starts with /vn, so we just need the domain
      const fullUrl = `https://cookpad.com${relativeUrl}`;
      await getRecipeDetail(fullUrl);
      // Wait to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (err) {
    console.error('Error scraping search results:', err.message);
  }
}

async function getRecipeDetail(url) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
      }
    });
    const $ = cheerio.load(data);

    const title = $('h1').text().trim();
    const servings = $('div[id="servings"]').text().trim();
    const time = $('div[id="cooking_time"]').text().trim();
    const author = $('a[data-user-id]').first().text().trim();
    const cookpad_id = url.split('/').pop();

    const ingredients = [];
    $('.ingredient').each((i, el) => {
      const name = $(el).find('.ingredient__details').text().trim();
      const qty = $(el).find('.ingredient__quantity').text().trim();
      if (name) ingredients.push({ name, qty });
    });

    const steps = [];
    $('.step').each((i, el) => {
      const text = $(el).find('p').text().trim();
      const image = $(el).find('img').attr('src');
      if (text) steps.push({ step: i + 1, text, image });
    });

    const image_url = $('img[id="recipe_image"]').attr('src');

    // Save to database
    await Recipe.upsert({
      cookpad_id,
      title,
      ingredients: JSON.stringify(ingredients),
      steps: JSON.stringify(steps),
      image_url,
      time,
      servings,
      author
    });

    console.log(`Scraped & Saved: ${title}`);
  } catch (err) {
    console.error(`Error scraping recipe at ${url}:`, err.message);
  }
}

module.exports = { scrapeRecipes };
