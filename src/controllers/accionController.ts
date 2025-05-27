import { Accion } from '../models/accion'
import acciones from '../database/acciones.json'
import * as path from "path";
import * as fs from "fs";

export class accionController {
    static getAcciones(){
        let accionArray: Array<Accion> = new Array();
        acciones.forEach((item) => {
            accionArray.push(new Accion(item.id, item.tipo))
        });
        return accionArray;
    }

    static getAccionforID(id: number){
        let accion: Accion|null = null;
        acciones.forEach((item) => {
            if (item.id == id){
                accion = item;
            }
        });
        return accion;
    }

    static postTablero(id: number, tipo: string){
        acciones.push({id, tipo});
        this.addAccionJSON(id, tipo);
        return new Accion (id, tipo);
    }

    static addAccionJSON(id: number, tipo: string){
        let accion: Accion = new Accion(id, tipo);
        const filePath = path.join(__dirname, "../database/acciones.json");
        const data = fs.readFileSync(filePath, "utf-8");
        const acciones: Accion[] = JSON.parse(data);
        acciones.push(accion);
        fs.writeFileSync(filePath, JSON.stringify(acciones, null, 4));
    }
}