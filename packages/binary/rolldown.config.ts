import {defineConfig} from "../../rolldown.config";
import {dependencies} from "./package.json" with {type: "json"};

export default defineConfig({main:"./src/main.ts"}, dependencies);