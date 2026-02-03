# VLR.GG API - Node.js Version

An Unofficial REST API for [vlr.gg](https://www.vlr.gg/), a site for Valorant Esports match and news coverage.

**Original Creator:** [axsddlr](https://github.com/axsddlr)  
**Modified by:** itznan

This is a Node.js conversion of the original Python FastAPI version.

## Installation

```bash
npm install
```

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

The API will be available at `http://localhost:3001`

## API Documentation

Once the server is running, visit `http://localhost:3001/` for interactive Swagger documentation.

## Available Endpoints

### News
- `GET /news` - Get latest VLR news

### Stats
- `GET /stats?region={region}&timespan={timespan}` - Get player statistics
  - Regions: na, eu, ap, sa, jp, oce, mn
  - Timespans: 30, 60, 90, all

### Rankings
- `GET /rankings?region={region}` - Get team rankings
  - Regions: na, eu, ap, la, la-s, la-n, oce, kr, mn, gc, br, cn, jp, col

### Matches
- `GET /match?q={type}` - Get match data
  - Types: upcoming, upcoming_extended, live_score, results
  - Additional parameters: num_pages, from_page, to_page, max_retries, request_delay, timeout

### Events
- `GET /events` - Get all events
- `GET /events?q=upcoming` - Get upcoming events
- `GET /events?q=completed&page={page}` - Get completed events with pagination

### Health
- `GET /health` - Check API health

## Example Requests

```bash
# Get latest news
curl http://localhost:3001/news

# Get NA region stats for last 30 days
curl "http://localhost:3001/stats?region=na&timespan=30"

# Get EU rankings
curl "http://localhost:3001/rankings?region=eu"

# Get upcoming matches
curl "http://localhost:3001/match?q=upcoming"

# Get live scores
curl "http://localhost:3001/match?q=live_score"

# Get match results
curl "http://localhost:3001/match?q=results&num_pages=2"

# Get upcoming events
curl "http://localhost:3001/events?q=upcoming"
```

## Features

- ✅ All original Python functionality converted to Node.js
- ✅ Express.js framework with Swagger documentation
- ✅ Rate limiting (600 requests per minute)
- ✅ Robust error handling and retry logic
- ✅ Pagination support for large datasets
- ✅ Comprehensive HTML parsing with Cheerio
- ✅ TypeScript-ready structure

## Dependencies

- express - Web framework
- axios - HTTP client
- cheerio - HTML parsing
- express-rate-limit - Rate limiting
- helmet - Security middleware
- swagger-ui-express - API documentation
- swagger-jsdoc - Swagger integration

## License

MIT
