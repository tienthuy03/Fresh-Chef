const { scrapeRecipes } = require('./services/scraper');
const { sequelize } = require('./models');

const keywords = ['phở', 'bún bò', 'cơm tấm', 'bánh mì', 'gỏi cuốn'];

const runScraper = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.sync(); // Đảm bảo bảng đã tồn tại
    
    console.log('Starting to scrape real recipes from Cookpad...');
    
    for (const keyword of keywords) {
      console.log(`--- Scraping for keyword: ${keyword} ---`);
      await scrapeRecipes(keyword);
    }
    
    console.log('Scraping completed! Check your database or API.');
    process.exit(0);
  } catch (err) {
    console.error('Scraping failed:', err);
    process.exit(1);
  }
};

runScraper();
