// let Auth = require('./libs/Auth');
// let config = require('./config');
//
// let redisClient = new (require('./libs/redis'))(config.get('redis'));
// //
//
// async function her()
// {
//     // let user = await Auth.register("herhersome","herher@gmail.com","herher");
//     // let pairOfTokens = await Auth.login({username:"herhersome",password:"herher"});
// eslint-disable-next-line max-len
//     // let anotherPair = await Auth.refreshAccessToken({refreshToken:pairOfTokens.refreshToken,accessToken:pairOfTokens.accessToken})
//     // return [pairOfTokens,anotherPair];
//
//     // let token = await sessionStorage.createToken({userId:"2",
//     // expiresIn:Math.floor(Date.now()/1000)+10000});
//     // return await sessionStorage.deleteToken("2","d96531ec-951f-455f-8d29-58908c2237ac");
//     // return sessionStorage.getTokenDescription("2","d96531ec-951f-455f-8d29-58908c2237ac");
//     let keys = await redisClient.keysAsync("*");
//     for (let key of keys){
//         await redisClient.delAsync(key);
//     }
//     // return token;
// };
// her().then(console.log).catch(console.log);
//
// const WebSocket = require('ws');
//
//
//
// let clients = []
// for(let i=0;i<100;i++){
//
//     clients[i] = new WebSocket('ws://37.77.104.201:1337');
//
//     clients[i].on("open",()=>{
//         clients[i].send(JSON.stringify({type:"authRobot",uuid:i.toString()}));
//
//
//     })
//     clients[i].on("error",console.error);
// }
//
// let axios = require("axios");
// let Users = []
// for(let i=0;i<100;i++){
//
//
//     axios.post("http://37.77.104.201:3000/auth/login",{
//         username:"username"+i,
//         password:"password"+i,
//         fingerprint:"axios"
//     }).then((res)=>{
//         let tokens = res.data.tokens;
//         Users[i] = new WebSocket('ws://37.77.104.201:1337');
//         Users[i].on("open",()=>{
//             Users[i].send(JSON.stringify({type:"authUser",token:tokens.accessToken}));
//             setTimeout(()=>{
//                 Users[i].send(JSON.stringify({type:"changeRobot",uuid:i.toString()}));
//                 setTimeout(()=>{
//                     setInterval(()=>{
//                         Users[i].send(JSON.stringify({type:"cmd",body:Date.now()}));
//                     },300)
//                 },500)
//             },1000);
//
//
//         })
//
//     })
//
//
//
// }
//
// clients[8].on("message",(msg)=>{
//     let date = Date.now()
//     let jsonMsg = JSON.parse(msg.toString());
//     let newDate = new Date(jsonMsg.cmd);
//     console.log(date-newDate);
// });
//
//

const WsSocket = require('ws');

const socket = new WsSocket('ws://127.0.0.1:1337');
socket.on('error', console.log);
