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
exports.tableroRouter = void 0;
const express_1 = __importDefault(require("express"));
const tableroController_1 = require("../controllers/tableroController");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
exports.tableroRouter = express_1.default.Router();
exports.tableroRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [status, body] = yield tableroController_1.TableroController.getAll();
    const estado = status;
    res.status(estado).json(body);
}));
exports.tableroRouter.get('/id/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [status, body] = yield tableroController_1.TableroController.getById(req.params.id);
    const estado = status;
    res.status(estado).json(body);
}));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let dir;
        if (file.fieldname.includes('fondo')) {
            dir = path_1.default.join(__dirname, '../documentos/img');
        }
        else {
            dir = path_1.default.join(__dirname, '../documentos/audio');
        }
        fs_1.default.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        let nombreBase;
        if (file.fieldname.includes('mainTag')) {
            nombreBase = file.fieldname;
        }
        else if (file.fieldname.includes('tag-')) {
            nombreBase = file.fieldname;
        }
        else {
            nombreBase = `${Date.now()}-${file.originalname}`;
        }
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${nombreBase}${ext}`);
    }
});
const upload = (0, multer_1.default)({ storage });
exports.tableroRouter.post('/creartablero', upload.any(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        const fileMap = {};
        files.forEach((file) => {
            fileMap[file.fieldname] = file.path;
        });
        const data = JSON.parse(req.body.data);
        const [status, message] = yield tableroController_1.TableroController.createFull(data, fileMap);
        res.status(status).json({ message });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al procesar el tablero' });
    }
}));
exports.tableroRouter.delete('/eliminar/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const [status, body] = yield tableroController_1.TableroController.delete(id);
    res.status(status).json(body);
}));
