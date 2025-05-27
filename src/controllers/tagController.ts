import { Tag } from '../models/tag'
import tags from '../database/tags.json'
import * as path from "path";
import * as fs from "fs";

export class tagController {
    static getTags(){
        let tagArray: Array<Tag> = new Array();
        tags.forEach((item) => {
            tagArray.push(new Tag(item.ID, item.listaAcciones, item.posterior))
        });
        return tagArray;
    }

    static getTagforID(id: number){
        let tag: Tag|null = null;
        tags.forEach((item) => {
            if (item.ID == id){
                tag = item;
            }
        });
        return tag;
    }

    static postTag(ID: number, listaAcciones: number[], posterior: number){
        tags.push({ID, listaAcciones, posterior});
        this.addTagJSON(ID, listaAcciones, posterior);
        return new Tag (ID, listaAcciones, posterior);
    }

    static addTagJSON(ID: number, listaAcciones: number[], posterior: number){
        let tag: Tag = new Tag(ID, listaAcciones, posterior);
        const filePath = path.join(__dirname, "../database/tags.json");
        const data = fs.readFileSync(filePath, "utf-8");
        const tags: Tag[] = JSON.parse(data);
        tags.push(tag);
        fs.writeFileSync(filePath, JSON.stringify(tags, null, 4));
    }
}