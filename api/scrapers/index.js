/**
 * VLR.GG API Scrapers Index
 * Modified by: itznan
 * Original Creator: axsddlr (https://github.com/axsddlr)
 * Central export module for all VLR.GG scrapers
 */

const { vlrNews } = require('./news');
const { vlrRankings } = require('./rankings');
const { vlrStats } = require('./stats');
const { 
  vlrUpcomingMatches, 
  vlrLiveScore, 
  vlrMatchResults, 
  vlrUpcomingMatchesExtended 
} = require('./matches');
const { vlrEvents } = require('./events');
const { checkHealth } = require('./health');

module.exports = {
  vlrNews,
  vlrRankings,
  vlrStats,
  vlrUpcomingMatches,
  vlrLiveScore,
  vlrMatchResults,
  vlrUpcomingMatchesExtended,
  vlrEvents,
  checkHealth
};
