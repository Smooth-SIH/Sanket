import { getNowcastPrediction } from '../services/mlProxyService.js';

export const getPrediction = async (req, res, next) => {
  try {
    const params = req.body;
    const result = await getNowcastPrediction(params);
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getShapAttribution = async (req, res, next) => {
  try {
    const params = req.body;
    const result = await getNowcastPrediction(params);
    return res.json(result.shap_explanation || {});
  } catch (err) {
    next(err);
  }
};
