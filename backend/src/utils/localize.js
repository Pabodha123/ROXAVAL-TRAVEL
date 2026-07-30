/**
 * Flattens `{en, de, fr}` localized-field shapes into a plain string (or
 * array of strings) for a given language, with English as the fallback for
 * any locale an admin hasn't translated yet. Applied by `factory.js` after
 * fetching catalog docs so existing frontend rendering code keeps receiving
 * plain strings — it just gets the right language.
 */
function isLocalizedObject(val) {
  return Boolean(val) && typeof val === 'object' && !Array.isArray(val) && ('en' in val || 'de' in val || 'fr' in val);
}

function localizeValue(val, lang) {
  if (Array.isArray(val)) {
    if (val.length && isLocalizedObject(val[0])) return val.map((v) => localizeValue(v, lang));
    return val;
  }
  if (isLocalizedObject(val)) return val[lang] || val.en || '';
  return val;
}

function applyFieldPath(obj, pathParts, lang) {
  if (!obj || typeof obj !== 'object') return;
  const [head, ...rest] = pathParts;
  if (head === undefined) return;
  if (Array.isArray(obj)) {
    obj.forEach((item) => applyFieldPath(item, pathParts, lang));
    return;
  }
  if (rest.length === 0) {
    if (head in obj) obj[head] = localizeValue(obj[head], lang);
    return;
  }
  if (obj[head] !== undefined) applyFieldPath(obj[head], rest, lang);
}

function toPlain(doc) {
  if (!doc) return doc;
  return typeof doc.toObject === 'function' ? doc.toObject() : doc;
}

function localizeDoc(doc, lang, fields = []) {
  if (!doc) return doc;
  const plain = toPlain(doc);
  fields.forEach((path) => applyFieldPath(plain, path.split('.'), lang));
  return plain;
}

function localizeList(docs, lang, fields = []) {
  return (docs || []).map((d) => localizeDoc(d, lang, fields));
}

// Expands e.g. 'name' -> ['name.en', 'name.de', 'name.fr'] so search works
// against a translatable field regardless of which language it matches in.
function expandSearchableFields(fields = [], translatableFields = []) {
  const translatableSet = new Set(translatableFields);
  return fields.flatMap((field) =>
    translatableSet.has(field) ? [`${field}.en`, `${field}.de`, `${field}.fr`] : [field]
  );
}

module.exports = { localizeDoc, localizeList, localizeValue, expandSearchableFields };
