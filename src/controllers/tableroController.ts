import { Tablero } from '../models/tablero'
import tableros from '../database/tableros.json'
import * as path from "path";
import * as fs from "fs";

export class tableroController {
    static getTableros(){
        let tableroArray: Array<any> = new Array();
        tableros.forEach((item) => {
            tableroArray.push(new Tablero(item.id, item.nombre, item.filas, item.columnas, item.mainTag, item.listaTags))
        });
        return tableroArray;
    }

    static getTableroforID(id: number){
        let tablero: Tablero|null = null;
        tableros.forEach((item) => {
            if (item.id == id){
                tablero = item;
            }
        });
        return tablero;
    }

    static getTableroforName(nombre: string){
        let tablero: Tablero|null = null;
        tableros.forEach((item) => {
            if (item.nombre == nombre){
                tablero = item;
            }
        });
        return tablero;
    }

    static postTablero(id: number, nombre: string, filas: number, columnas: number, mainTag: number, listaTags: number[]){
        tableros.push({id, nombre, filas, columnas, mainTag, listaTags});
        this.addTableroJSON(id, nombre, filas, columnas, mainTag, listaTags);
        return new Tablero (id, nombre, filas, columnas, mainTag, listaTags);
    }

    static addTableroJSON(id: number, nombre: string, filas: number, columnas: number, mainTag: number, listaTags: number[]){
        let tablero: Tablero = new Tablero(id, nombre, filas, columnas, mainTag, listaTags);
        const filePath = path.join(__dirname, "../database/tableros.json");
        const data = fs.readFileSync(filePath, "utf-8");
        const tableros: Tablero[] = JSON.parse(data);
        tableros.push(tablero);
        fs.writeFileSync(filePath, JSON.stringify(tableros, null, 4));
    }
}