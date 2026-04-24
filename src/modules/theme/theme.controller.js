const themeService = require('./theme.service');
const { success } = require('../../utils/response');

const getTheme = async (req, res, next) => { try { success(res, await themeService.get()); } catch (e) { next(e); } };
const updateTheme = async (req, res, next) => { try { success(res, await themeService.upsert(req.body)); } catch (e) { next(e); } };

module.exports = { getTheme, updateTheme };
