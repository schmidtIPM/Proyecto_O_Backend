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
jest.mock('../src/services/tableroService');
const supertest_1 = __importDefault(require("supertest"));
const Proyect_O_1 = __importDefault(require("../Proyect_O"));
const tableroService_1 = require("../services/tableroService");
describe('Tablero service ', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('GET / devuelve una lista de tableros', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockTableros = { mensaje: "Hola, bienvenido a la API de tableros" };
        tableroService_1.TableroService.getAllTableros.mockResolvedValue(mockTableros);
        const response = yield (0, supertest_1.default)(Proyect_O_1.default).get('/');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockTableros);
    }));
});
