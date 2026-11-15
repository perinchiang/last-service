import http from 'node:http';
import { readFile } from 'node:fs/promises';
const port=Number(process.env.PORT||4173);
http.createServer(async (req,res)=>{try {const path=new URL(req.url,'http://localhost').pathname;if(path!=='/'&&path!=='/index.html'&&path!=='/favicon.ico'){res.writeHead(404);res.end('Not found');return;}if(path==='/favicon.ico'){res.writeHead(204);res.end();return;}const body=await readFile(new URL('../index.html',import.meta.url));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(body);}catch{res.writeHead(503);res.end('Run npm run build first.');}}).listen(port,'0.0.0.0',()=>console.log('LAST SERVICE http://localhost:'+port));
