const userService = require('./user.service');
const { success } = require('../../utils/response');

const getUsers = async (req, res, next) => { try { success(res, await userService.getAll()); } catch (e) { next(e); } };
const getUser = async (req, res, next) => { try { success(res, await userService.getById(req.params.id)); } catch (e) { next(e); } };
const createUser = async (req, res, next) => { try { res.status(201).json({ success: true, data: await userService.create(req.body) }); } catch (e) { next(e); } };
const updateUser = async (req, res, next) => { try { success(res, await userService.update(req.params.id, req.body)); } catch (e) { next(e); } };
const deleteUser = async (req, res, next) => { try { success(res, await userService.remove(req.params.id)); } catch (e) { next(e); } };

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser };
