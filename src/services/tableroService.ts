import { TableroController } from "../controllers/tableroController";

export class TableroService {
    static async getAllTableros() {
        return await TableroController.getAll();
    }
}