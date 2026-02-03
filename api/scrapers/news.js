/**
 * VLR.GG News Scraper
 * Modified by: itznan
 * Original Creator: axsddlr (https://github.com/axsddlr)
 * News scraping functionality for VLR.GG API
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { headers } = require('../../utils/utils');

/**
 * Get VLR news
 * @returns {Object} News data
 */
async function vlrNews() {
  const url = "https://www.vlr.gg/news";
  
  try {
    const response = await axios.get(url, { headers });
    const status = response.status;
    
    if (status !== 200) {
      throw new Error(`API response: ${status}`);
    }
    
    const $ = cheerio.load(response.data);
    const result = [];
    
    $("a.wf-module-item").each((index, element) => {
      const $item = $(element);
      
      const dateAuthor = $item.find("div.ge-text-light").text();
      const [datePart, author] = dateAuthor.split("by");
      
      const desc = $item.find("div").eq(1).text().trim();
      
      const title = $item.find("div:nth-child(1)").text().trim().split("\n")[0].replace(/\t/g, "");
      
      const url = $item.attr("href");
      
      result.push({
        title: title,
        description: desc,
        date: datePart.split("•")[1].trim(),
        author: author.trim(),
        url_path: "https://vlr.gg" + url,
      });
    });
    
    return { data: { status: status, segments: result } };
    
  } catch (error) {
    throw new Error(`Failed to fetch news: ${error.message}`);
  }
}

module.exports = { vlrNews };
