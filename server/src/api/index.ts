import expressWs from 'express-ws';
import express from "express";

// import syntax, from 
// https://stackoverflow.com/questions/46531934/express-ws-alternative-in-typescript/51476990
// option 1
// const { app, getWss, applyTo } = expressWs(express());

// option 2
const app = expressWs(express()).app;

app.use(function (req: any, res:any, next: any) {
  console.log('middleware');
  req.testing = 'testing';
  return next();
});

app.get('/', function(req: any, res: any, next: any){
  console.log('get route', req.testing);
  res.end();
});

app.ws('/', function(ws: any, req: any) {
  ws.on('message', function(msg: any) {
    console.log(msg);
  });
  console.log('socket', req.testing);
});

app.listen(3000);
console.info("listening on port 3000")