import http from 'node:http';
import crypto from 'node:crypto';

const host='127.0.0.1';
const port=Number(process.env.ACTIVITIES_AUTH_PORT||8765);
const accessCode=process.env.ACTIVITIES_ACCESS_CODE||'';
const secret=process.env.ACTIVITIES_SESSION_SECRET||'';
const ttl=3600;
const failures=new Map();

if(!accessCode||secret.length<32)throw new Error('ACTIVITIES_ACCESS_CODE and a 32+ character ACTIVITIES_SESSION_SECRET are required');

const safeEqual=(a,b)=>{const left=Buffer.from(String(a)),right=Buffer.from(String(b));return left.length===right.length&&crypto.timingSafeEqual(left,right)};
const sign=value=>crypto.createHmac('sha256',secret).update(value).digest('base64url');
const cookieValue=()=>{const expires=String(Math.floor(Date.now()/1000)+ttl);return `${expires}.${sign(expires)}`};
const validCookie=request=>{
  const match=(request.headers.cookie||'').match(/(?:^|;\s*)cr_activity=([^;]+)/);
  if(!match)return false;
  const [expires,signature]=match[1].split('.');
  return /^\d+$/.test(expires)&&Number(expires)>Date.now()/1000&&safeEqual(signature||'',sign(expires));
};
const respond=(response,status,headers={})=>{response.writeHead(status,{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers});response.end()};
const clientIp=request=>(request.headers['x-forwarded-for']||request.socket.remoteAddress||'unknown').toString().split(',')[0].trim();
const limited=ip=>{const now=Date.now(),entry=failures.get(ip);if(!entry||entry.reset<now){failures.delete(ip);return false}return entry.count>=5};
const recordFailure=ip=>{const now=Date.now(),entry=failures.get(ip);failures.set(ip,!entry||entry.reset<now?{count:1,reset:now+15*60*1000}:{...entry,count:entry.count+1})};

http.createServer((request,response)=>{
  if(request.url==='/check'&&request.method==='GET')return respond(response,validCookie(request)?204:401);
  if(request.url==='/session'&&request.method==='DELETE')return respond(response,204,{'Set-Cookie':'cr_activity=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict'});
  if(request.url!=='/session'||request.method!=='POST')return respond(response,404);
  const ip=clientIp(request);
  if(limited(ip))return respond(response,429,{'Retry-After':'900'});
  let body='';
  request.on('data',chunk=>{body+=chunk;if(body.length>1024)request.destroy()});
  request.on('end',()=>{
    let supplied='';
    try{supplied=JSON.parse(body).code||''}catch{}
    if(!safeEqual(supplied,accessCode)){recordFailure(ip);return respond(response,401)}
    failures.delete(ip);
    respond(response,204,{'Set-Cookie':`cr_activity=${cookieValue()}; Max-Age=${ttl}; Path=/; HttpOnly; Secure; SameSite=Strict`});
  });
}).listen(port,host,()=>console.log(`Activity authentication listening on ${host}:${port}`));
