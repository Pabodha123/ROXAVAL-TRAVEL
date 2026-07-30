const { v4: uuidv4 } = require('uuid');

/**
 * Generates short, human-friendly, sortable reference numbers.
 * Format: PREFIX-YYMMDD-XXXX  e.g. BK-260727-A1B2
 */
const generateReference = (prefix = 'REF') => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const random = uuidv4().split('-')[0].slice(0, 4).toUpperCase();
  return `${prefix}-${yy}${mm}${dd}-${random}`;
};

module.exports = generateReference;
