/**
 * VLR.GG Matches Scraper
 * Modified by: itznan
 * Original Creator: axsddlr (https://github.com/axsddlr)
 * Matches scraping functionality for VLR.GG API
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { headers } = require('../../utils/utils');

/**
 * Get upcoming matches from VLR.GG homepage
 * @param {number} numPages - Number of pages to scrape (ignored for homepage)
 * @param {number} fromPage - Starting page number (ignored for homepage)
 * @param {number} toPage - Ending page number (ignored for homepage)
 * @returns {Object} Upcoming matches data
 */
async function vlrUpcomingMatches(numPages = 1, fromPage = null, toPage = null) {
  const url = "https://www.vlr.gg";
  
  try {
    const response = await axios.get(url, { headers });
    const status = response.status;
    
    if (status !== 200) {
      throw new Error(`API response: ${status}`);
    }
    
    const $ = cheerio.load(response.data);
    const result = [];
    
    $(".js-home-matches-upcoming a.wf-module-item").each((index, element) => {
      const $item = $(element);
      const isUpcoming = $item.find(".h-match-eta.mod-upcoming").length > 0;
      
      if (isUpcoming) {
        const teams = [];
        const flags = [];
        const scores = [];
        
        $item.find(".h-match-team").each((i, team) => {
          const $team = $(team);
          teams.push($team.find(".h-match-team-name").text().trim());
          flags.push(
            $team.find(".flag")
              .attr("class")
              .replace(" mod-", "")
              .replace("16", "_")
          );
          scores.push($team.find(".h-match-team-score").text().trim());
        });

        let eta = $item.find(".h-match-eta").text().trim();
        if (eta !== "LIVE") {
          eta = eta + " from now";
        }

        const matchEvent = $item.find(".h-match-preview-event").text().trim();
        const matchSeries = $item.find(".h-match-preview-series").text().trim();
        const timestamp = new Date(parseInt($item.find(".moment-tz-convert").attr("data-utc-ts")) * 1000)
          .toISOString()
          .replace('T', ' ')
          .substring(0, 19);
        const urlPath = "https://www.vlr.gg/" + $item.attr("href");

        result.push({
          team1: teams[0],
          team2: teams[1],
          flag1: flags[0],
          flag2: flags[1],
          time_until_match: eta,
          match_series: matchSeries,
          match_event: matchEvent,
          unix_timestamp: timestamp,
          match_page: urlPath,
        });
      }
    });

    const segments = { status: status, segments: result };
    return { data: segments };
    
  } catch (error) {
    throw new Error(`Failed to fetch upcoming matches: ${error.message}`);
  }
}

/**
 * Get live match scores from VLR.GG homepage
 * @param {number} numPages - Number of pages to scrape (ignored for homepage)
 * @param {number} fromPage - Starting page number (ignored for homepage)
 * @param {number} toPage - Ending page number (ignored for homepage)
 * @returns {Object} Live match scores data
 */
async function vlrLiveScore(numPages = 1, fromPage = null, toPage = null) {
  const url = "https://www.vlr.gg";
  
  try {
    const response = await axios.get(url, { headers });
    const status = response.status;
    
    if (status !== 200) {
      throw new Error(`API response: ${status}`);
    }
    
    const $ = cheerio.load(response.data);
    const result = [];
    
    $(".js-home-matches-upcoming a.wf-module-item").each(async (index, element) => {
      const $match = $(element);
      const isLive = $match.find(".h-match-eta.mod-live").length > 0;
      
      if (isLive) {
        const teams = [];
        const flags = [];
        const scores = [];
        const roundTexts = [];
        
        $match.find(".h-match-team").each((i, team) => {
          const $team = $(team);
          teams.push($team.find(".h-match-team-name").text().trim());
          flags.push(
            $team.find(".flag")
              .attr("class")
              .replace(" mod-", "")
              .replace("16", "_")
          );
          scores.push($team.find(".h-match-team-score").text().trim());
          
          const roundInfoCt = $team.find(".h-match-team-rounds .mod-ct");
          const roundInfoT = $team.find(".h-match-team-rounds .mod-t");
          const roundTextCt = roundInfoCt.length > 0 ? roundInfoCt.first().text().trim() : "N/A";
          const roundTextT = roundInfoT.length > 0 ? roundInfoT.first().text().trim() : "N/A";
          roundTexts.push({ ct: roundTextCt, t: roundTextT });
        });

        const eta = "LIVE";
        const matchEvent = $match.find(".h-match-preview-event").text().trim();
        const matchSeries = $match.find(".h-match-preview-series").text().trim();
        const timestamp = new Date(parseInt($match.find(".moment-tz-convert").attr("data-utc-ts")) * 1000)
          .toISOString()
          .replace('T', ' ')
          .substring(0, 19);
        const urlPath = "https://www.vlr.gg/" + $match.attr("href");

        try {
          const matchPageResponse = await axios.get(urlPath, { headers });
          const matchHtml = cheerio.load(matchPageResponse.data);
          
          const teamLogos = [];
          matchHtml.find(".match-header-vs img").each((i, img) => {
            const logoUrl = "https:" + $(img).attr("src");
            teamLogos.push(logoUrl);
          });

          let currentMap = "Unknown";
          let mapNumber = "Unknown";
          const currentMapElement = matchHtml.find(".vm-stats-gamesnav-item.js-map-switch.mod-active.mod-live");
          
          if (currentMapElement.length > 0) {
            const mapText = currentMapElement.find("div").first().text().trim().replace(/[\n\t]/g, "");
            currentMap = mapText.replace(/^\d+/, "");
            const mapNumberMatch = mapText.match(/^\d+/);
            mapNumber = mapNumberMatch ? mapNumberMatch[0] : "Unknown";
          }

          const team1RoundCt = roundTexts.length > 0 ? roundTexts[0].ct : "N/A";
          const team1RoundT = roundTexts.length > 0 ? roundTexts[0].t : "N/A";
          const team2RoundCt = roundTexts.length > 1 ? roundTexts[1].ct : "N/A";
          const team2RoundT = roundTexts.length > 1 ? roundTexts[1].t : "N/A";
          
          result.push({
            team1: teams[0],
            team2: teams[1],
            flag1: flags[0],
            flag2: flags[1],
            team1_logo: teamLogos.length > 0 ? teamLogos[0] : "",
            team2_logo: teamLogos.length > 1 ? teamLogos[1] : "",
            score1: scores[0],
            score2: scores[1],
            team1_round_ct: team1RoundCt,
            team1_round_t: team1RoundT,
            team2_round_ct: team2RoundCt,
            team2_round_t: team2RoundT,
            map_number: mapNumber,
            current_map: currentMap,
            time_until_match: eta,
            match_event: matchEvent,
            match_series: matchSeries,
            unix_timestamp: timestamp,
            match_page: urlPath,
          });
        } catch (matchError) {
          console.warn(`Failed to fetch match details for ${urlPath}: ${matchError.message}`);
        }
      }
    });

    const segments = { status: status, segments: result };
    return { data: segments };
    
  } catch (error) {
    throw new Error(`Failed to fetch live scores: ${error.message}`);
  }
}

/**
 * Sleep function for delays
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Scrape upcoming matches from the paginated matches page with robust error handling
 * @param {number} numPages - Number of pages to scrape from page 1
 * @param {number} fromPage - Starting page number (1-based)
 * @param {number} toPage - Ending page number (1-based, inclusive)
 * @param {number} maxRetries - Maximum retry attempts per page
 * @param {number} requestDelay - Delay between requests in seconds
 * @param {number} timeout - Request timeout in seconds
 * @returns {Object} API response with match data
 */
async function vlrUpcomingMatchesExtended(numPages = 1, fromPage = null, toPage = null, maxRetries = 3, requestDelay = 1.0, timeout = 30) {
  const result = [];
  let status = 200;
  const failedPages = [];

  // Determine page range
  let startPage, endPage, totalPages;
  
  if (fromPage !== null && toPage !== null) {
    if (fromPage < 1) throw new Error("from_page must be >= 1");
    if (toPage < fromPage) throw new Error("to_page must be >= from_page");
    startPage = fromPage;
    endPage = toPage;
    totalPages = endPage - startPage + 1;
  } else if (fromPage !== null) {
    if (fromPage < 1) throw new Error("from_page must be >= 1");
    startPage = fromPage;
    endPage = fromPage + numPages - 1;
    totalPages = numPages;
  } else if (toPage !== null) {
    if (toPage < 1) throw new Error("to_page must be >= 1");
    startPage = Math.max(1, toPage - numPages + 1);
    endPage = toPage;
    totalPages = endPage - startPage + 1;
  } else {
    startPage = 1;
    endPage = numPages;
    totalPages = numPages;
  }

  console.log(`Starting to scrape pages ${startPage}-${endPage} (${totalPages} pages) with ${requestDelay}s delay between requests...`);

  for (let page = startPage; page <= endPage; page++) {
    let pageSuccess = false;
    let retryCount = 0;

    while (!pageSuccess && retryCount < maxRetries) {
      try {
        const url = page === 1 ? "https://www.vlr.gg/matches" : `https://www.vlr.gg/matches/?page=${page}`;
        const currentPageNum = page - startPage + 1;
        console.log(`Scraping page ${page} (${currentPageNum}/${totalPages}) (attempt ${retryCount + 1}/${maxRetries})`);

        const response = await axios.get(url, { 
          headers, 
          timeout: timeout * 1000 
        });
        
        const $ = cheerio.load(response.data);
        const currentStatus = response.status;

        if (currentStatus !== 200) {
          console.log(`Warning: Page ${page} returned status ${currentStatus}`);
          retryCount++;
          if (retryCount < maxRetries) {
            await sleep(requestDelay * Math.pow(2, retryCount) * 1000);
          }
          continue;
        }

        const pageResults = [];
        const items = $("a.wf-module-item");

        if (items.length === 0) {
          console.log(`Warning: No match items found on page ${page}`);
          pageSuccess = true;
          break;
        }

        items.each((index, element) => {
          try {
            const $item = $(element);
            
            // Skip completed matches - only get upcoming/live matches
            const etaElement = $item.find(".ml-eta");
            if (etaElement.length > 0 && etaElement.text().includes("ago")) {
              return;
            }

            const href = $item.attr("href") || "";
            const urlPath = href ? "https://www.vlr.gg" + href : "";

            // Get match status/eta
            let eta = "";
            const statusElement = $item.find(".ml-status");
            if (statusElement.length > 0) {
              eta = statusElement.text().trim();
            } else {
              const etaElem = $item.find(".ml-eta");
              if (etaElem.length > 0) {
                const etaText = etaElem.text().trim();
                if (etaText && !etaText.includes("ago")) {
                  eta = etaText;
                }
              }
            }

            // Get teams
            const teams = [];
            const flags = [];
            const scores = [];

            $item.find(".match-item-vs-team").each((i, teamDiv) => {
              const $teamDiv = $(teamDiv);
              const teamNameElem = $teamDiv.find(".match-item-vs-team-name");
              teams.push(teamNameElem.length > 0 ? teamNameElem.text().trim() : "TBD");

              // Get flag
              const flagElem = $teamDiv.find(".flag");
              if (flagElem.length > 0) {
                const flagClass = flagElem.attr("class") || "";
                const flag = flagClass.replace("flag ", "").replace(" mod-", "_");
                flags.push(flag);
              } else {
                flags.push("");
              }

              // Get score
              const scoreElem = $teamDiv.find(".match-item-vs-team-score");
              scores.push(scoreElem.length > 0 ? scoreElem.text().trim() : "");
            });

            // Handle case where teams list might be incomplete
            while (teams.length < 2) teams.push("TBD");
            while (flags.length < 2) flags.push("");
            while (scores.length < 2) scores.push("");

            // Get match event and series info
            let matchSeries = "";
            const matchEventElem = $item.find(".match-item-event-series");
            if (matchEventElem.length > 0) {
              const eventText = matchEventElem.text().replace(/[\n\t]/g, "").trim();
              matchSeries = eventText;
            }

            // Get tournament name
            let tourney = "";
            const tourneyElem = $item.find(".match-item-event");
            if (tourneyElem.length > 0) {
              const tourneyLines = tourneyElem.text().split("\n")
                .map(line => line.trim())
                .filter(line => line);
              tourney = tourneyLines.length > 0 ? tourneyLines[tourneyLines.length - 1] : "";
            }

            // Get tournament icon
            let tourneyIconUrl = "";
            const tourneyIconElem = $item.find(".match-item-icon img");
            if (tourneyIconElem.length > 0) {
              const iconSrc = tourneyIconElem.attr("src") || "";
              if (iconSrc) {
                tourneyIconUrl = iconSrc.startsWith("//") ? `https:${iconSrc}` : iconSrc;
              }
            }

            // Get timestamp if available
            let timestamp = "";
            const timestampElem = $item.find(".moment-tz-convert");
            if (timestampElem.length > 0) {
              const unixTs = timestampElem.attr("data-utc-ts");
              if (unixTs) {
                timestamp = new Date(parseInt(unixTs) * 1000)
                  .toISOString()
                  .replace('T', ' ')
                  .substring(0, 19);
              }
            }

            pageResults.push({
              team1: teams[0],
              team2: teams[1],
              flag1: flags[0],
              flag2: flags[1],
              score1: scores[0],
              score2: scores[1],
              time_until_match: eta,
              match_series: matchSeries,
              match_event: tourney,
              unix_timestamp: timestamp,
              match_page: urlPath,
              tournament_icon: tourneyIconUrl,
              page_number: page,
            });
          } catch (e) {
            console.log(`Warning: Failed to parse match item on page ${page}: ${e.message}`);
          }
        });

        result.push(...pageResults);
        console.log(`Successfully scraped page ${page}: ${pageResults.length} matches`);
        pageSuccess = true;

        // Rate limiting between successful requests
        if (page < endPage) {
          await sleep(requestDelay * 1000);
        }

      } catch (error) {
        retryCount++;
        if (error.code === 'ECONNABORTED') {
          console.log(`Timeout error on page ${page}, attempt ${retryCount}/${maxRetries}`);
        } else if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
          console.log(`Connection error on page ${page}, attempt ${retryCount}/${maxRetries}`);
        } else {
          console.log(`Unexpected error on page ${page}: ${error.message}`);
        }
        
        if (retryCount < maxRetries) {
          const backoffTime = requestDelay * Math.pow(2, retryCount);
          console.log(`Retrying page ${page} in ${backoffTime.toFixed(1)} seconds...`);
          await sleep(backoffTime * 1000);
        }
      }
    }

    if (!pageSuccess) {
      failedPages.push(page);
      console.log(`Failed to scrape page ${page} after ${maxRetries} attempts`);
    }
  }

  // Report results
  const totalMatches = result.length;
  const successfulPages = totalPages - failedPages.length;

  console.log(`\nScraping completed:`);
  console.log(`  Page range: ${startPage}-${endPage}`);
  console.log(`  Total matches: ${totalMatches}`);
  console.log(`  Successful pages: ${successfulPages}/${totalPages}`);

  if (failedPages.length > 0) {
    console.log(`  Failed pages: ${failedPages}`);
    console.log(`  Consider retrying failed pages or adjusting parameters`);
  }

  const segments = {
    status: status,
    segments: result,
    meta: {
      page_range: `${startPage}-${endPage}`,
      total_pages_requested: totalPages,
      successful_pages: successfulPages,
      failed_pages: failedPages,
      total_matches: totalMatches
    }
  };

  if (result.length === 0) {
    throw new Error(`No data retrieved. Failed pages: ${failedPages}`);
  }

  return { data: segments };
}

/**
 * Scrape match results with robust error handling for large page counts
 * @param {number} numPages - Number of pages to scrape from page 1
 * @param {number} fromPage - Starting page number (1-based)
 * @param {number} toPage - Ending page number (1-based, inclusive)
 * @param {number} maxRetries - Maximum retry attempts per page
 * @param {number} requestDelay - Delay between requests in seconds
 * @param {number} timeout - Request timeout in seconds
 * @returns {Object} API response with match data
 */
async function vlrMatchResults(numPages = 1, fromPage = null, toPage = null, maxRetries = 3, requestDelay = 1.0, timeout = 30) {
  const result = [];
  let status = 200;
  const failedPages = [];
  
  // Determine page range
  let startPage, endPage, totalPages;
  
  if (fromPage !== null && toPage !== null) {
    if (fromPage < 1) throw new Error("from_page must be >= 1");
    if (toPage < fromPage) throw new Error("to_page must be >= from_page");
    startPage = fromPage;
    endPage = toPage;
    totalPages = endPage - startPage + 1;
  } else if (fromPage !== null) {
    if (fromPage < 1) throw new Error("from_page must be >= 1");
    startPage = fromPage;
    endPage = fromPage + numPages - 1;
    totalPages = numPages;
  } else if (toPage !== null) {
    if (toPage < 1) throw new Error("to_page must be >= 1");
    startPage = Math.max(1, toPage - numPages + 1);
    endPage = toPage;
    totalPages = endPage - startPage + 1;
  } else {
    startPage = 1;
    endPage = numPages;
    totalPages = numPages;
  }
  
  console.log(`Starting to scrape pages ${startPage}-${endPage} (${totalPages} pages) with ${requestDelay}s delay between requests...`);
  
  for (let page = startPage; page <= endPage; page++) {
    let pageSuccess = false;
    let retryCount = 0;
    
    while (!pageSuccess && retryCount < maxRetries) {
      try {
        const url = page === 1 ? "https://www.vlr.gg/matches/results" : `https://www.vlr.gg/matches/results/?page=${page}`;
        const currentPageNum = page - startPage + 1;
        console.log(`Scraping page ${page} (${currentPageNum}/${totalPages}) (attempt ${retryCount + 1}/${maxRetries})`);
        
        const response = await axios.get(url, { 
          headers, 
          timeout: timeout * 1000 
        });
        
        const $ = cheerio.load(response.data);
        const currentStatus = response.status;
        
        if (currentStatus !== 200) {
          console.log(`Warning: Page ${page} returned status ${currentStatus}`);
          retryCount++;
          if (retryCount < maxRetries) {
            await sleep(requestDelay * Math.pow(2, retryCount) * 1000);
          }
          continue;
        }
        
        const pageResults = [];
        const items = $("a.wf-module-item");
        
        if (items.length === 0) {
          console.log(`Warning: No match items found on page ${page}`);
          pageSuccess = true;
          break;
        }
        
        items.each((index, element) => {
          try {
            const $item = $(element);
            
            const urlPath = $item.attr("href") || "";
            const eta = $item.find("div.ml-eta").text() + " ago";
            const rounds = $item.find("div.match-item-event-series")
              .text()
              .replace(/–/g, "-")
              .replace(/[\n\t]/g, "");
            
            const tourneyText = $item.find("div.match-item-event").text();
            const tourneyLines = tourneyText.split("\n").map(line => line.trim()).filter(line => line);
            const tourney = tourneyLines.length > 1 ? tourneyLines[1] : "";
            
            const tourneyIconUrl = $item.find('img').length > 0 
              ? `https:${$item.find('img').first().attr('src')}` 
              : "";

            let teamArray = "TBD";
            try {
              teamArray = $item.find("div.match-item-vs > div:nth-child(2)").text();
            } catch (e) {
              teamArray = "TBD";
            }
            
            teamArray = teamArray
              .replace(/\t/g, " ")
              .replace(/\n/g, " ")
              .trim()
              .split("                                  ");
            
            const team1 = teamArray[0] || "";
            const score1 = (teamArray[1] || "").replace(/\s/g, "");
            const team2 = teamArray[4] || "";
            const score2 = (teamArray[teamArray.length - 1] || "").replace(/\s/g, "");

            const flagList = [];
            $item.find(".flag").each((i, flag) => {
              const flagClass = $(flag).attr("class") || "";
              flagList.push(flagClass.replace(" mod-", "_"));
            });
            
            const flag1 = flagList.length > 0 ? flagList[0] : "";
            const flag2 = flagList.length > 1 ? flagList[1] : "";

            pageResults.push({
              team1: team1,
              team2: team2,
              score1: score1,
              score2: score2,
              flag1: flag1,
              flag2: flag2,
              time_completed: eta,
              round_info: rounds,
              tournament_name: tourney,
              match_page: urlPath,
              tournament_icon: tourneyIconUrl,
              page_number: page,
            });
          } catch (e) {
            console.log(`Warning: Failed to parse match item on page ${page}: ${e.message}`);
          }
        });
        
        result.push(...pageResults);
        console.log(`Successfully scraped page ${page}: ${pageResults.length} matches`);
        pageSuccess = true;
        
        // Rate limiting between successful requests
        if (page < endPage) {
          await sleep(requestDelay * 1000);
        }
        
      } catch (error) {
        retryCount++;
        if (error.code === 'ECONNABORTED') {
          console.log(`Timeout error on page ${page}, attempt ${retryCount}/${maxRetries}`);
        } else if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
          console.log(`Connection error on page ${page}, attempt ${retryCount}/${maxRetries}`);
        } else {
          console.log(`Unexpected error on page ${page}: ${error.message}`);
        }
        
        if (retryCount < maxRetries) {
          const backoffTime = requestDelay * Math.pow(2, retryCount);
          console.log(`Retrying page ${page} in ${backoffTime.toFixed(1)} seconds...`);
          await sleep(backoffTime * 1000);
        }
      }
    }
    
    if (!pageSuccess) {
      failedPages.push(page);
      console.log(`Failed to scrape page ${page} after ${maxRetries} attempts`);
    }
  }
  
  // Report results
  const totalMatches = result.length;
  const successfulPages = totalPages - failedPages.length;
  
  console.log(`\nScraping completed:`);
  console.log(`  Page range: ${startPage}-${endPage}`);
  console.log(`  Total matches: ${totalMatches}`);
  console.log(`  Successful pages: ${successfulPages}/${totalPages}`);
  
  if (failedPages.length > 0) {
    console.log(`  Failed pages: ${failedPages}`);
    console.log(`  Consider retrying failed pages or adjusting parameters`);
  }
  
  const segments = {
    status: status, 
    segments: result,
    meta: {
      page_range: `${startPage}-${endPage}`,
      total_pages_requested: totalPages,
      successful_pages: successfulPages,
      failed_pages: failedPages,
      total_matches: totalMatches
    }
  };

  if (result.length === 0) {
    throw new Error(`No data retrieved. Failed pages: ${failedPages}`);
  }
  
  return { data: segments };
}

module.exports = {
  vlrUpcomingMatches,
  vlrLiveScore,
  vlrUpcomingMatchesExtended,
  vlrMatchResults
};
