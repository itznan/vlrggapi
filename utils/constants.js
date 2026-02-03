/**
 * VLR.GG API Constants
 * Modified by: itznan
 * Original Creator: axsddlr (https://github.com/axsddlr)
 * Configuration constants for VLR.GG API
 */

/**
 * Configuration constants for VLR.GG API
 */

// Base URLs
const VLR_BASE_URL = "https://www.vlr.gg";
const VLR_EVENTS_URL = `${VLR_BASE_URL}/events`;

// Rate limiting
const RATE_LIMIT = "600/minute";

// API Settings
const API_TITLE = "vlrggapi";
const API_DESCRIPTION = "An Unofficial REST API for [vlr.gg](https://www.vlr.gg/), a site for Valorant Esports match and news coverage. Made by [axsddlr](https://github.com/axsddlr)";
const API_PORT = 3001;

// Pagination limits
const MAX_PAGE_LIMIT = 100;
const MIN_PAGE_LIMIT = 1;

// Request settings
const DEFAULT_TIMEOUT = 30;
const DEFAULT_RETRIES = 3;
const DEFAULT_REQUEST_DELAY = 1.0;

module.exports = {
  VLR_BASE_URL,
  VLR_EVENTS_URL,
  RATE_LIMIT,
  API_TITLE,
  API_DESCRIPTION,
  API_PORT,
  MAX_PAGE_LIMIT,
  MIN_PAGE_LIMIT,
  DEFAULT_TIMEOUT,
  DEFAULT_RETRIES,
  DEFAULT_REQUEST_DELAY
};
