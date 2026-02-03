/**
 * VLR.GG Events Scraper
 * Modified by: itznan
 * Original Creator: axsddlr (https://github.com/axsddlr)
 * Events scraping functionality for VLR.GG API
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { headers } = require('../../utils/utils');
const { VLR_EVENTS_URL } = require('../../utils/constants');
const {
  extractTextContent,
  extractPrizeValue,
  extractDateRange,
  extractRegionFromFlag,
  normalizeImageUrl,
  buildFullUrl
} = require('../../utils/htmlParsers');

/**
 * Get Valorant events from VLR.GG
 * @param {boolean} upcoming - If true, include upcoming events
 * @param {boolean} completed - If true, include completed events
 * @param {number} page - Page number for pagination (only applies to completed events)
 * @returns {Object} Response with status code and events data
 */
async function vlrEvents(upcoming = true, completed = true, page = 1) {
  // Build URL with pagination for completed events
  const url = completed && page > 1 ? `${VLR_EVENTS_URL}/?page=${page}` : VLR_EVENTS_URL;
  
  try {
    const response = await axios.get(url, { headers });
    const status = response.status;
    
    if (status !== 200) {
      throw new Error(`API response: ${status}`);
    }
    
    const $ = cheerio.load(response.data);
    
    // If both are False, show both (default behavior)
    if (!upcoming && !completed) {
      upcoming = true;
      completed = true;
    }

    const events = [];

    /**
     * Helper function to parse event cards
     * @param {Cheerio} container - Container element
     */
    function parseEvents(container) {
      container.find("a.event-item").each((index, eventItem) => {
        const $eventItem = $(eventItem);
        
        // Extract basic information using utility functions
        const title = extractTextContent($eventItem.find(".event-item-title").first());
        const eventStatus = extractTextContent($eventItem.find(".event-item-desc-item-status").first());
        
        // Extract complex parsed data
        const prize = extractPrizeValue($eventItem.find(".event-item-desc-item.mod-prize").first());
        const dates = extractDateRange($eventItem.find(".event-item-desc-item.mod-dates").first());
        const region = extractRegionFromFlag($eventItem.find(".event-item-desc-item.mod-location .flag").first());
        
        // Extract and normalize URLs
        const imgElem = $eventItem.find(".event-item-thumb img").first();
        const imgSrc = imgElem.attr("src") || "";
        const thumb = normalizeImageUrl(imgSrc);
        const href = $eventItem.attr("href") || "";
        const fullUrl = buildFullUrl(href);

        events.push({
          title: title,
          status: eventStatus,
          prize: prize,
          dates: dates,
          region: region,
          thumb: thumb,
          url_path: fullUrl,
        });
      });
    }

    // Parse upcoming events
    if (upcoming) {
      $("div.wf-label.mod-large.mod-upcoming").each((index, section) => {
        const $section = $(section);
        const parent = $section.parent();
        if (parent && parent.find("a.event-item").length > 0) {
          parseEvents(parent);
        }
      });
    }

    // Parse completed events
    if (completed) {
      $("div.wf-label.mod-large.mod-completed").each((index, section) => {
        const $section = $(section);
        const parent = $section.parent();
        if (parent && parent.find("a.event-item").length > 0) {
          parseEvents(parent);
        }
      });
    }

    return { data: { status: status, segments: events } };
    
  } catch (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }
}

module.exports = { vlrEvents };
