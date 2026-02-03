/**
 * VLR.GG Rankings Scraper
 * Modified by: itznan
 * Original Creator: axsddlr (https://github.com/axsddlr)
 * Rankings scraping functionality for VLR.GG API
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { headers, region } = require('../../utils/utils');

/**
 * Get VLR rankings for a specific region
 * @param {string} regionKey - Region shortname
 * @returns {Object} Rankings data
 */
async function vlrRankings(regionKey) {
  const url = "https://www.vlr.gg/rankings/" + region[regionKey];
  
  try {
    const response = await axios.get(url, { headers });
    const status = response.status;
    
    if (status !== 200) {
      throw new Error(`API response: ${status}`);
    }
    
    const $ = cheerio.load(response.data);
    const result = [];
    
    $("div.rank-item").each((index, element) => {
      const $item = $(element);
      
      const rank = $item.find("div.rank-item-rank-num").text().trim();
      const teamText = $item.find("div.ge-text").text().split("#")[0];
      const logo = $item.find("a.rank-item-team img").attr("src") || "";
      const cleanedLogo = logo.replace(/\/img\/vlr\/tmp\/vlr.png/, "");
      const country = $item.find("div.rank-item-team-country").text();
      
      const lastPlayedText = $item.find("a.rank-item-last").text().replace(/\n/g, "").replace(/\t/g, "");
      const lastPlayed = lastPlayedText.split("v")[0] || "";
      const lastPlayedTeam = lastPlayedText.split("o")[1] ? lastPlayedText.split("o")[1].replace(".", ". ") : "";
      
      const lastPlayedTeamLogo = $item.find("a.rank-item-last img").attr("src") || "";
      
      const record = $item.find("div.rank-item-record").text().replace(/\t/g, "").replace(/\n/g, "");
      const earnings = $item.find("div.rank-item-earnings").text().replace(/\t/g, "").replace(/\n/g, "");

      result.push({
        rank: rank,
        team: teamText.trim(),
        country: country,
        last_played: lastPlayed.trim(),
        last_played_team: lastPlayedTeam.trim(),
        last_played_team_logo: lastPlayedTeamLogo,
        record: record,
        earnings: earnings,
        logo: cleanedLogo,
      });
    });

    return { status: status, data: result };
    
  } catch (error) {
    throw new Error(`Failed to fetch rankings: ${error.message}`);
  }
}

module.exports = { vlrRankings };
