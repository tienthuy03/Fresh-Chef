const axios = require('axios');
const cheerio = require('cheerio');

async function check() {
  try {
    const { data } = await axios.get('https://cookpad.com/vn/tim-kiem/th%E1%BB%8Bt%20b%C3%B2', {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    const $ = cheerio.load(data);
    const firstUrl = $('a[href^="/vn/cong-thuc/"]').filter((i, el) => !$(el).attr('href').includes('tao-moi')).first().attr('href');
    if (!firstUrl) return console.log('No recipe found');
    console.log('Recipe URL:', firstUrl);

    const detail = await axios.get('https://cookpad.com' + firstUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $$ = cheerio.load(detail.data);

    console.log('--- HTML around steps ---');
    console.log($$('#steps').html() || $$('.step').first().parent().html() || $$('div:contains("Cách làm")').parent().html());
  } catch (err) {
    console.error(err);
  }
}

check();
