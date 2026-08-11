const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');
const { localizeDoc, localizeList, expandSearchableFields } = require('../utils/localize');

/**
 * Factory that produces standard getAll/getOne/create/update/delete
 * handlers for a Mongoose model. Individual controllers can still add
 * bespoke handlers alongside these where the resource needs custom logic
 * (e.g. TourPackage publish/archive, CustomTourRequest workflow).
 *
 * `translatableFields` lists dot-paths (e.g. 'name', 'itinerary.title')
 * holding `{en,de,fr}` catalog content — getAll/getOne flatten them to a
 * plain string in `req.lang`, unless the caller passes `?raw=true` (admin
 * forms editing all three languages at once).
 */
const factory = (Model, { searchableFields = [], populate = [], baseFilter = () => ({}), translatableFields = [] } = {}) => ({
  getAll: catchAsync(async (req, res) => {
    const filter = baseFilter(req);
    let query = Model.find(filter);
    const expandedSearchable = expandSearchableFields(searchableFields, translatableFields);
    const features = new ApiFeatures(query, req.query).search(expandedSearchable).filter().sort().limitFields().paginate();
    if (populate.length) populate.forEach((p) => (features.query = features.query.populate(p)));

    const [docs, meta] = await Promise.all([features.query, features.getMeta(Model)]);
    const raw = req.query.raw === 'true';
    const data = raw || !translatableFields.length ? docs : localizeList(docs, req.lang || 'en', translatableFields);
    new ApiResponse(200, data, `${Model.modelName} list fetched`, meta).send(res);
  }),

  getOne: catchAsync(async (req, res) => {
    let query = Model.findById(req.params.id);
    populate.forEach((p) => (query = query.populate(p)));
    const doc = await query;
    if (!doc) throw ApiError.notFound(`${Model.modelName} not found`);
    const raw = req.query.raw === 'true';
    const data = raw || !translatableFields.length ? doc : localizeDoc(doc, req.lang || 'en', translatableFields);
    new ApiResponse(200, data, `${Model.modelName} fetched`).send(res);
  }),

  create: catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);
    new ApiResponse(201, doc, `${Model.modelName} created`).send(res);
  }),

  update: catchAsync(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) throw ApiError.notFound(`${Model.modelName} not found`);
    new ApiResponse(200, doc, `${Model.modelName} updated`).send(res);
  }),

  remove: catchAsync(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) throw ApiError.notFound(`${Model.modelName} not found`);
    new ApiResponse(200, null, `${Model.modelName} deleted`).send(res);
  }),
});

module.exports = factory;
