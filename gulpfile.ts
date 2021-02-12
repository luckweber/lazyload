import { series, dest, src, watch as watchTask } from "gulp";
import ts from "gulp-typescript";
import uglify from "gulp-uglify";
import rename from "gulp-rename";
import { readFileSync } from "fs";
import { create  } from "browser-sync";
import { config } from "dotenv";

import { replaceHtmlBody } from "./middleware";

config()

const tsProject = ts.createProject('tsconfig.json');
const { name, accountName, secureUrl } = JSON.parse(readFileSync('package.json', 'utf8'));    
const browserSync  = create()

const URL_PROXY = `https://${accountName}.vtexcommercestable.com.br`
const URL_HOST = `${accountName}.vtexlocal.com.br`
const PATH_DEST =  `./dist/arquivos/`

const build = () => {
    const tsResult = src('src/index.ts').pipe(tsProject());

    return tsResult.js
        .pipe(uglify())
        .pipe(rename({basename:name,suffix:'.min'}))
        .pipe(dest(PATH_DEST))
        .pipe(browserSync.stream());
}

const watchFiles = (cb:any) => {
    watchTask('src/**/*.ts', build);
}



const server = (cb:any) => {

    browserSync.init({
        open: "external",
        https: false,
        browser:"firefox",
        ui: {
            port: 8080,
            weinre: {
                port: 9090
            }
        },
        host: URL_HOST,
        proxy: URL_PROXY,
        port: 443,
        serveStatic: [
            {   

                route: '/arquivos',
                dir: './dist/arquivos',

            },
        ],
        middleware: [
            replaceHtmlBody(URL_HOST, 'vtexcommercestable')
        ]
        
    });

    watchTask('src/**/*.ts', build)

    cb();
}


export const watch = watchFiles
export const start = server
export default series(build)

