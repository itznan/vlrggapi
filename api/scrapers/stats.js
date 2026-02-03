/**
 * VLR.GG Stats Scraper
 * Modified by: itznan
 * Original Creator: axsddlr (https://github.com/axsddlr)
 * Stats scraping functionality for VLR.GG API
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { headers } = require('../../utils/utils');

/**
 * Get VLR stats for a region and timespan
 * @param {string} region - Region shortname
 * @param {string} timespan - Timespan (30, 60, 90, or all)
 * @returns {Object} Stats data
 */
async function vlrStats(region, timespan) {
  const baseUrl = `https://www.vlr.gg/stats/?event_group_id=all&event_id=all&region=${region}&country=all&min_rounds=200&min_rating=1550&agent=all&map_id=all`;
  const url = timespan.toLowerCase() === "all" 
    ? `${baseUrl}&timespan=all`
    : `${baseUrl}&timespan=${timespan}d`;

  try {
    const response = await axios.get(url, { headers });
    const status = response.status;
    
    if (status !== 200) {
      throw new Error(`API response: ${status}`);
    }
    
    const $ = cheerio.load(response.data);
    const result = [];
    
    $("tbody tr").each((index, element) => {
      const $item = $(element);
      const player = $item.text().replace(/\t/g, "").replace(/\n/g, " ").trim().split(/\s+/);
      const playerName = player[0];
      const org = player.length > 1 ? player[1] : "N/A";

      const agents = [];
      $item.find("td.mod-agents img").each((i, agent) => {
        const src = $(agent).attr("src");
        if (src) {
          agents.push(src.split("/").pop().split(".")[0]);
        }
      });

      const colorSq = [];
      $item.find("td.mod-color-sq").each((i, stat) => {
        colorSq.push($(stat).text());
      });

      const rnd = $item.find("td.mod-rnd").text();

      result.push({
        player: playerName,
        org: org,
        agents: agents,
        rounds_played: rnd,
        rating: colorSq[0],
        average_combat_score: colorSq[1],
        kill_deaths: colorSq[2],
        kill_assists_survived_traded: colorSq[3],
        average_damage_per_round: colorSq[4],
        kills_per_round: colorSq[5],
        assists_per_round: colorSq[6],
        first_kills_per_round: colorSq[7],
        first_deaths_per_round: colorSq[8],
        headshot_percentage: colorSq[9],
        clutch_success_percentage: colorSq[10],
      });
    });

    const segments = { status: status, segments: result };
    return { data: segments };
    
  } catch (error) {
    throw new Error(`Failed to fetch stats: ${error.message}`);
  }
}

module.exports = { vlrStats };
