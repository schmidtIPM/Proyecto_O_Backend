"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableroController = void 0;
const tablero_model_1 = require("../models/tablero.model");
const tag_model_1 = require("../models/tag.model");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class TableroController {
    static formatTablero(tablero) {
        if (tablero.fondo && TableroController.isFilePath(tablero.fondo)) {
            const normalizedPath = path_1.default.normalize(tablero.fondo);
            const filename = path_1.default.basename(normalizedPath);
            tablero.fondo = `/static/img/${filename}`;
        }
        const formatTag = (tag) => {
            const tagJson = JSON.parse(JSON.stringify(tag));
            if (tagJson.fondo && TableroController.isFilePath(tagJson.fondo)) {
                const normalizedPath = path_1.default.normalize(tagJson.fondo);
                const filename = path_1.default.basename(normalizedPath);
                tag.fondo = `/static/img/${filename}`;
            }
            if (!Array.isArray(tag.listaAcciones)) {
                tag.listaAcciones = [];
            }
            tag.listaAcciones.forEach((accion) => {
                if (accion && accion.tipo === 'audio') {
                    const accionJson = JSON.parse(JSON.stringify(accion));
                    if (accionJson.archivo) {
                        const normalizedPath = path_1.default.normalize(accionJson.archivo);
                        const filename = path_1.default.basename(normalizedPath);
                        accion.archivo = `/static/audio/${filename}`;
                    }
                    else {
                        console.warn('Archivo de audio no es una cadena:', accionJson.archivo);
                    }
                }
            });
            return tag;
        };
        tablero.mainTag = formatTag(tablero.mainTag);
        tablero.listaTags = tablero.listaTags.map(formatTag);
        return tablero;
    }
    static isFilePath(fondo) {
        return /\.(png|jpg|jpeg|gif|webp)$/i.test(fondo);
    }
    static moveImageFile(tempPath, fileName) {
        const ext = path_1.default.extname(tempPath);
        const destDir = path_1.default.join(__dirname, '..', 'documentos', 'img');
        const destPath = path_1.default.join(destDir, fileName);
        if (!fs_1.default.existsSync(destDir)) {
            fs_1.default.mkdirSync(destDir, { recursive: true });
        }
        fs_1.default.copyFileSync(tempPath, destPath);
        return `./documentos/img/${fileName}`;
    }
    static getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tableros = yield tablero_model_1.TableroModel.find()
                    .populate({
                    path: 'mainTag',
                    populate: { path: 'listaAcciones' },
                })
                    .populate({
                    path: 'listaTags',
                    populate: { path: 'listaAcciones' },
                }).lean();
                const formatted = tableros.map(TableroController.formatTablero);
                return [200, formatted];
            }
            catch (err) {
                return [500, { error: 'Error al obtener tableros', details: err }];
            }
        });
    }
    static getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tablero = yield tablero_model_1.TableroModel.findOne({ _id: id })
                    .populate({
                    path: 'mainTag',
                    populate: { path: 'listaAcciones' },
                })
                    .populate({
                    path: 'listaTags',
                    populate: { path: 'listaAcciones' },
                }).lean();
                if (!tablero)
                    return [404, { error: 'Tablero no encontrado' }];
                const tableroForm = yield TableroController.formatTablero(tablero);
                return [200, tableroForm];
            }
            catch (err) {
                return [500, { error: 'Error al buscar tablero', details: err }];
            }
        });
    }
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tablero = yield tablero_model_1.TableroModel.findOne({ _id: id });
                if (!tablero) {
                    return [404, { error: 'Tablero no encontrado' }];
                }
                if (tablero.fondo && TableroController.isFilePath(tablero.fondo)) {
                    const archivo = tablero.fondo;
                    if (archivo) {
                        fs_1.default.unlinkSync(archivo);
                    }
                }
                const allTagIds = [
                    tablero.mainTag,
                    ...(tablero.listaTags || [])
                ];
                const tags = yield tag_model_1.TagModel.find({ _id: { $in: allTagIds } });
                for (const tag of tags) {
                    if (tag.fondo && TableroController.isFilePath(tag.fondo.toString())) {
                        const archivo = tag.fondo;
                        if (archivo) {
                            fs_1.default.unlinkSync(archivo.toString());
                        }
                    }
                    for (const accion of tag.listaAcciones || []) {
                        const accionJson = JSON.parse(JSON.stringify(accion));
                        if (accion.tipo === 'audio' && accionJson.archivo) {
                            const archivo = accionJson.archivo;
                            if (archivo) {
                                fs_1.default.unlinkSync(archivo);
                            }
                        }
                    }
                    yield tag_model_1.TagModel.deleteOne({ _id: tag._id });
                }
                const result = yield tablero_model_1.TableroModel.deleteOne({ _id: id });
                return [200, { message: 'Tablero y datos asociados eliminados' }];
            }
            catch (err) {
                return [500, { error: 'Error al eliminar tablero y datos relacionados', details: err }];
            }
        });
    }
    static createFull(data, fileMap) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (fileMap['tablero-fondo']) {
                    data.fondo = fileMap['tablero-fondo'];
                }
                if (fileMap['mainTag-fondo']) {
                    data.mainTag.fondo = fileMap['mainTag-fondo'];
                }
                if (data.mainTag.listaAcciones) {
                    data.mainTag.listaAcciones.forEach((accion, index) => {
                        const fieldKey = `mainTag-${index}`;
                        if (fileMap[fieldKey]) {
                            accion.archivo = fileMap[fieldKey];
                        }
                    });
                }
                if (data.listaTags) {
                    data.listaTags.forEach((tag, tagIndex) => {
                        const tagKey = `tag-${tagIndex}-fondo`;
                        if (fileMap[tagKey]) {
                            tag.fondo = fileMap[tagKey];
                        }
                        if (tag.listaAcciones) {
                            tag.listaAcciones.forEach((accion, accionIndex) => {
                                const accionKey = `tag-${tagIndex}-accion-${accionIndex}`;
                                if (fileMap[accionKey]) {
                                    accion.archivo = fileMap[accionKey];
                                }
                            });
                        }
                    });
                }
                const allTags = [data.mainTag, ...(data.listaTags || [])];
                const savedTags = [];
                for (const tag of allTags) {
                    const tagDoc = new tag_model_1.TagModel(tag);
                    const savedTag = yield tagDoc.save();
                    savedTags.push(savedTag);
                }
                const tableroFinal = new tablero_model_1.TableroModel(Object.assign(Object.assign({}, data), { mainTag: savedTags[0]._id, listaTags: savedTags.slice(1).map((t) => t._id) }));
                yield tableroFinal.save();
                return [200, 'Tablero guardado con éxito'];
            }
            catch (error) {
                console.error('Error en createFull:', error);
                return [500, 'Error al guardar el tablero'];
            }
        });
    }
    static updateFav(tableroId, ponerFavorito) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tablero = yield tablero_model_1.TableroModel.findById({ _id: tableroId });
                if (!tablero) {
                    return [404, 'Tablero no encontrado'];
                }
                tablero.favoritos = ponerFavorito;
                yield tablero.save();
                return [200, 'Estado de favoritos actualizado'];
            }
            catch (error) {
                return [500, 'Error al actualizar favoritos'];
            }
        });
    }
}
exports.TableroController = TableroController;
