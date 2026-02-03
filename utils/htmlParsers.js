/**
 * VLR.GG HTML Parsers
 * Modified by: itznan
 * Original Creator: axsddlr (https://github.com/axsddlr)
 * Common HTML parsing utilities for VLR.GG scrapers
 */

/**
 * Common HTML parsing utilities for VLR.GG scrapers
 */

/**
 * Extract text content from an HTML element safely
 * @param {CheerioElement} element - Cheerio element
 * @param {boolean} strip - Whether to strip whitespace
 * @returns {string} Text content
 */
function extractTextContent(element, strip = true) {
  if (!element) return "";
  try {
    // Use text() without parameters to get plain text
    const text = element.text();
    return String(text || "").trim();
  } catch (error) {
    return "";
  }
}

/**
 * Extract prize value from VLR.GG prize elements.
 * Handles both monetary values ($250,000) and TBD cases.
 * @param {CheerioElement} prizeElem - Prize element
 * @returns {string} Prize value
 */
function extractPrizeValue(prizeElem) {
  if (!prizeElem) return "";
  
  try {
    const fullText = prizeElem.text();
    
    // Ensure fullText is a string
    const textStr = String(fullText || "");
    
    // Split before "Prize Pool" label to get just the value
    const parts = textStr.split(/(?=Prize Pool|prize pool)/i);
    if (!parts.length) return "";
    
    const firstPart = parts[0].replace(/\s+/g, ' ').trim();
    
    // Check for TBD
    if (firstPart.toUpperCase() === "TBD") return "TBD";
    // Check for dollar amounts
    if (/^\$[\d,]+$/.test(firstPart)) return firstPart;
    // Check for numeric values (add $ if missing)
    if (/^[\d,]+$/.test(firstPart) && firstPart.length > 2) return "$" + firstPart;
    
    return "";
  } catch (error) {
    return "";
  }
}

/**
 * Extract date range from VLR.GG date elements.
 * Handles patterns like "Jul 15—Aug 31" and "Sep 15—TBD"
 * @param {CheerioElement} datesElem - Date element
 * @returns {string} Date range
 */
function extractDateRange(datesElem) {
  if (!datesElem) return "";
  
  try {
    const fullText = datesElem.text();
    
    // Ensure fullText is a string
    const textStr = String(fullText || "");
    
    // Try to find date patterns first
    const dateMatch = textStr.search(/[A-Za-z]{3}\s+\d+[—\-–]+[A-Za-z]*\s*\d+/);
    if (dateMatch !== -1) {
      return textStr.match(/[A-Za-z]{3}\s+\d+[—\-–]+[A-Za-z]*\s*\d+/)[0];
    }
    
    // Check for TBD in dates or fallback parsing
    if (/\bTBD\b/i.test(textStr)) return "TBD";
    
    // Fallback: look for month abbreviations
    const lines = textStr.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || ['dates', 'label', 'prize', 'pool'].some(keyword => trimmedLine.toLowerCase().includes(keyword))) {
        continue;
      }
      
      if (['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].some(month => trimmedLine.includes(month)) ||
          trimmedLine.includes('—')) {
        return trimmedLine;
      }
    }
    
    return "";
  } catch (error) {
    return "";
  }
}

/**
 * Extract region code from flag element class attribute
 * @param {CheerioElement} flagElem - Flag element
 * @returns {string} Region code
 */
function extractRegionFromFlag(flagElem) {
  if (!flagElem) return "";
  
  try {
    const classAttr = flagElem.attr("class") || "";
    return String(classAttr).replace("flag mod-", "").trim();
  } catch (error) {
    return "";
  }
}

/**
 * Normalize image URLs to absolute URLs
 * @param {string} src - Image source URL
 * @param {string} baseUrl - Base URL
 * @returns {string} Normalized URL
 */
function normalizeImageUrl(src, baseUrl = "https://www.vlr.gg") {
  if (!src) return "";
  
  try {
    const srcStr = String(src);
    if (srcStr.startsWith("//")) return "https:" + srcStr;
    if (srcStr.startsWith("/")) return baseUrl + srcStr;
    return srcStr;
  } catch (error) {
    return "";
  }
}

/**
 * Build full URL from relative href
 * @param {string} href - Relative href
 * @param {string} baseUrl - Base URL
 * @returns {string} Full URL
 */
function buildFullUrl(href, baseUrl = "https://www.vlr.gg") {
  if (!href) return "";
  
  try {
    const hrefStr = String(href);
    return hrefStr.startsWith("/") ? baseUrl + hrefStr : hrefStr;
  } catch (error) {
    return "";
  }
}

module.exports = {
  extractTextContent,
  extractPrizeValue,
  extractDateRange,
  extractRegionFromFlag,
  normalizeImageUrl,
  buildFullUrl
};
