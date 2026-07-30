const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');

/**
 * Factory that produces standard getAll/getOne/create/update/delete
 * handlers for a Mongoose model. Individual controllers can still add
 * bespoke handlers alongside these where the resource needs custom logic
 * (e.g. TourPackage publish/archive, CustomTourRequest workflow).
 */
const factory = (Model, { searchableFields = [], populate = [], baseFilter = () => ({}) } = {}) => ({
  getAll: catchAsync(async (req, res) => {
    const filter = baseFilter(req);
    let query = Model.find(filter);
    const features = new ApiFeatures(query, req.query).search(searchableFields).filter().sort().limitFields().paginate();
    if (populate.length) populate.forEach((p) => (features.query = features.query.populate(p)));

    const [docs, meta] = await Promise.all([features.query, features.getMeta(Model, filter)]);
    new ApiResponse(200, docs, `${Model.modelName} list fetched`, meta).send(res);
  }),

  getOne: catchAsync(async (req, res) => {
    let query = Model.findById(req.params.id);
    populate.forEach((p) => (query = query.populate(p)));
    const doc = await query;
    if (!doc) throw ApiError.notFound(`${Model.modelName} not found`);
    new ApiResponse(200, doc, `${Model.modelName} fetched`).send(res);
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
