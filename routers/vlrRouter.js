/**
 * VLR.GG API Router
 * Modified by: itznan
 * Original Creator: axsddlr (https://github.com/axsddlr)
 * Routes for VLR.GG Valorant Esports API
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  vlrNews,
  vlrRankings,
  vlrStats,
  vlrUpcomingMatches,
  vlrLiveScore,
  vlrMatchResults,
  vlrUpcomingMatchesExtended,
  vlrEvents,
  checkHealth
} = require('../api/scrapers');

const router = express.Router();

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 600, // Limit each IP to 600 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

router.use(limiter);

/**
 * @swagger
 * /news:
 *   get:
 *     summary: Get VLR news
 *     description: Fetch latest news from VLR.GG
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: integer
 *                     segments:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get('/news', async (req, res) => {
  try {
    const result = await vlrNews();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /stats:
 *   get:
 *     summary: Get VLR stats
 *     description: Get player statistics for a specific region and timespan
 *     parameters:
 *       - in: query
 *         name: region
 *         required: true
 *         schema:
 *           type: string
 *         description: Region shortname (na, eu, ap, sa, jp, oce, mn)
 *       - in: query
 *         name: timespan
 *         required: true
 *         schema:
 *           type: string
 *         description: Timespan (30, 60, 90, or all)
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/stats', async (req, res) => {
  try {
    const { region, timespan } = req.query;
    
    if (!region || !timespan) {
      return res.status(400).json({ 
        error: 'Missing required parameters: region and timespan' 
      });
    }
    
    const result = await vlrStats(region, timespan);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /rankings:
 *   get:
 *     summary: Get VLR rankings
 *     description: Get team rankings for a specific region
 *     parameters:
 *       - in: query
 *         name: region
 *         required: true
 *         schema:
 *           type: string
 *         description: Region shortname (na, eu, ap, la, la-s, la-n, oce, kr, mn, gc, br, cn, jp, col)
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/rankings', async (req, res) => {
  try {
    const { region } = req.query;
    
    if (!region) {
      return res.status(400).json({ 
        error: 'Missing required parameter: region' 
      });
    }
    
    const result = await vlrRankings(region);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /match:
 *   get:
 *     summary: Get VLR match data
 *     description: Get upcoming matches, live scores, or match results
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           enum: [upcoming, upcoming_extended, live_score, results]
 *         description: Query parameter type
 *       - in: query
 *         name: num_pages
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *           maximum: 600
 *         description: Number of pages to scrape
 *       - in: query
 *         name: from_page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 600
 *         description: Starting page number
 *       - in: query
 *         name: to_page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 600
 *         description: Ending page number
 *       - in: query
 *         name: max_retries
 *         schema:
 *           type: integer
 *           default: 3
 *           minimum: 1
 *           maximum: 5
 *         description: Maximum retry attempts per page
 *       - in: query
 *         name: request_delay
 *         schema:
 *           type: number
 *           default: 1.0
 *           minimum: 0.5
 *           maximum: 5.0
 *         description: Delay between requests in seconds
 *       - in: query
 *         name: timeout
 *         schema:
 *           type: integer
 *           default: 30
 *           minimum: 10
 *           maximum: 120
 *         description: Request timeout in seconds
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/match', async (req, res) => {
  try {
    const { 
      q, 
      num_pages = 1, 
      from_page, 
      to_page, 
      max_retries = 3, 
      request_delay = 1.0, 
      timeout = 30 
    } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        error: 'Missing required parameter: q' 
      });
    }
    
    let result;
    const numPagesInt = parseInt(num_pages);
    const maxRetriesInt = parseInt(max_retries);
    const requestDelayFloat = parseFloat(request_delay);
    const timeoutInt = parseInt(timeout);
    
    switch (q) {
      case 'upcoming':
        result = await vlrUpcomingMatches(numPagesInt, from_page ? parseInt(from_page) : null, to_page ? parseInt(to_page) : null);
        break;
      case 'upcoming_extended':
        result = await vlrUpcomingMatchesExtended(
          numPagesInt, 
          from_page ? parseInt(from_page) : null, 
          to_page ? parseInt(to_page) : null, 
          maxRetriesInt, 
          requestDelayFloat, 
          timeoutInt
        );
        break;
      case 'live_score':
        result = await vlrLiveScore(numPagesInt, from_page ? parseInt(from_page) : null, to_page ? parseInt(to_page) : null);
        break;
      case 'results':
        result = await vlrMatchResults(
          numPagesInt, 
          from_page ? parseInt(from_page) : null, 
          to_page ? parseInt(to_page) : null, 
          maxRetriesInt, 
          requestDelayFloat, 
          timeoutInt
        );
        break;
      default:
        return res.status(400).json({ error: 'Invalid query parameter' });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get Valorant events
 *     description: Get Valorant events from VLR.GG with optional filtering and pagination
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           enum: [upcoming, completed]
 *         description: Event type filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *           maximum: 100
 *         description: Page number for pagination (only applies to completed events)
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/events', async (req, res) => {
  try {
    const { q, page = 1 } = req.query;
    const pageInt = parseInt(page);
    
    let upcoming = true;
    let completed = true;
    
    if (q === 'upcoming') {
      upcoming = true;
      completed = false;
    } else if (q === 'completed') {
      upcoming = false;
      completed = true;
    }
    
    const result = await vlrEvents(upcoming, completed, pageInt);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Check the health of various sites
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/health', async (req, res) => {
  try {
    const result = await checkHealth();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
