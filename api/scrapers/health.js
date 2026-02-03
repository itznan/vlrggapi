/**
 * VLR.GG Health Check Scraper
 * Modified by: itznan
 * Original Creator: axsddlr (https://github.com/axsddlr)
 * Health check functionality for VLR.GG API
 */

const axios = require('axios');

/**
 * Check health of various sites
 * @returns {Object} Health check results
 */
async function checkHealth() {
  const sites = ["https://vlr.gg"];
  const results = {};
  
  for (const site of sites) {
    try {
      const response = await axios.get(site, { timeout: 5000 });
      results[site] = {
        status: response.status === 200 ? "Healthy" : "Unhealthy",
        status_code: response.status,
      };
    } catch (error) {
      results[site] = { status: "Unhealthy", status_code: null };
    }
  }
  
  return results;
}

module.exports = { checkHealth };
