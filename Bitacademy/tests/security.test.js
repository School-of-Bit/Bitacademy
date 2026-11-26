const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Load the real handlers with mocked database/session dependencies. No Neon or secrets required.
function load(file, dependencies) {
  const mod = { exports: {} };
  const code = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  vm.runInNewContext(code, { module: mod, exports: mod.exports,
    require: name => Object.hasOwn(dependencies, name) ? dependencies[name] : require(name),
    console, process }, { filename: file });
  return mod.exports;
}
function response() {
  return { statusCode: 0, headers: {}, data: null,
    setHeader(k,v) { this.headers[k] = v; }, status(n) { this.statusCode = n; return this; },
    json(d) { this.data = d; return this; } };
}
const request = async (handler, method, action, body = {}, query = {}, userId = null) => {
  const res = response(); await handler({ method, query: { action, ...query }, body, userId }, res); return res;
};
const unexpectedSql = async () => { throw Error('Unexpected DB call'); };
const session = { getSessionUserId: async req => req.userId, getSessionSecret: () => 'test-only' };
function quizHandler(sql = unexpectedSql) {
  // JWT mock is a token store: tests verify handler binding and grading, not cryptography.
  const tokens = new Map();
  const jwt = { sign(claims, secret, opts) { const token = opts.jwtid; tokens.set(token, { ...claims, jti: token, exp: 9999999999 }); return token; },
    verify(token) { if (!tokens.has(token)) throw Error('invalid token'); return tokens.get(token); } };
  return load('api/quizzes.js', { '../lib/db': { sql }, '../lib/_auth': session, jsonwebtoken: jwt });
}
const slugs = ['matematica','portugues','ciencias','filosofia','historia','geografia','artes','ingles'];
const answers = () => Array.from({ length: 5 }, (_, questionIndex) => ({ questionIndex, selected: 0 }));
async function round(handler, userId = null, materia = 'matematica') {
  const res = await request(handler, 'GET', 'questions', {}, { materia }, userId);
  assert.equal(res.statusCode, 200); return res.data;
}
test('all eight quizzes return five questions without answer keys or explanations', async () => {
  const handler = quizHandler();
  for (const materia of slugs) {
    const result = await round(handler, null, materia);
    assert.equal(result.quiz.perguntas.length, 5);
    assert.equal(new Set(result.quiz.perguntas.map(q => q.pergunta)).size, 5);
    for (const q of result.quiz.perguntas) {
      assert.equal(q.opcoes.length, 4); assert.deepEqual(Object.keys(q).sort(), ['opcoes','pergunta']);
    }
  }
});
test('guest grading returns consistent score and review without database writes', async () => {
  const handler = quizHandler(); const { token } = await round(handler);
  const res = await request(handler, 'POST', 'result', { materia:'matematica', token, answers:answers(), score:99999 });
  assert.equal(res.statusCode, 200); const r = res.data.result;
  assert.equal(r.practiceOnly, true); assert.equal(r.score, r.review.filter(x => x.acertou).length);
  assert.equal(r.percent, r.score * 20); assert.equal(r.review.length, 5);
  for (const item of r.review) assert.equal(item.acertou, item.correta === item.escolhida);
});
test('invalid token rejected', async () => {
  const res = await request(quizHandler(), 'POST', 'result', { materia:'matematica', token:'invalid', answers:answers() });
  assert.equal(res.statusCode, 400);
});
test('round is bound to user and subject', async () => {
  const h = quizHandler(), { token } = await round(h, 'user-a');
  assert.equal((await request(h,'POST','result',{materia:'matematica',token,answers:answers()},{},'user-b')).statusCode,403);
  assert.equal((await request(h,'POST','result',{materia:'artes',token,answers:answers()},{},'user-a')).statusCode,403);
});
test('duplicate, missing, and out-of-range answers rejected', async () => {
  const h = quizHandler(), { token } = await round(h);
  for (const list of [answers().slice(1), answers().map(x=>({...x,questionIndex:0})), answers().map(x=>({...x,selected:4}))]) {
    assert.equal((await request(h,'POST','result',{materia:'matematica',token,answers:list})).statusCode,400);
  }
});
test('already consumed authenticated round cannot be submitted again', async () => {
  const h = quizHandler(async strings => { assert.match(strings.join(' '), /INSERT INTO quiz_used_rounds/); return []; });
  const { token } = await round(h,'user-a');
  assert.equal((await request(h,'POST','result',{materia:'matematica',token,answers:answers()},{},'user-a')).statusCode,409);
});
test('direct arcade score rejected without database write', async () => {
  const h = load('api/games.js', {'../lib/db':{sql:unexpectedSql}, '../lib/_auth':session, '../lib/math-difficulty': require('../lib/math-difficulty')});
  assert.equal((await request(h,'POST','record',{mode:'ingles-match',score:50000},{},'user-a')).statusCode,403);
  const ranking = await request(h,'GET','ranking',{}, {mode:'ingles-match'});
  assert.equal(ranking.data.practiceOnly,true); assert.equal(ranking.data.ranking.length,0);
});
test('login throttled before password lookup; Retry-After returned', async () => {
  const h = load('api/auth/login.js', {bcryptjs:{compare:async()=>{throw Error('Unexpected password compare');}}, '../../lib/db':{sql:unexpectedSql}, '../../lib/_auth':{setSessionCookie:()=>{}}, '../../lib/login-rate-limit':{checkLoginRateLimit:async()=>600}});
  const res = await request(h,'POST','login',{email:'test@example.com',password:'example'});
  assert.equal(res.statusCode,429); assert.equal(res.headers['Retry-After'],'600');
});
test('rate limit uses database UPSERT and blocks 11th email attempt', async () => {
  let count=0;
  const h = load('lib/login-rate-limit.js', {'./db':{sql:async strings=>{assert.match(strings.join(' '),/ON CONFLICT/); return [{attempts:++count,retry_after:500}];}}});
  for(let i=0;i<10;i++) assert.equal(await h.checkLoginRateLimit({},'test@example.com'),0);
  assert.equal(await h.checkLoginRateLimit({},'test@example.com'),500);
});
test('manual activity past due rejects before enrollment or insertion', async () => {
  let calls=0;
  const sql=async strings=>{calls++; if(calls===1) return [{id:'student'}]; if(calls===2) return [{deadline_expired:true,activity_type:'manual'}]; throw Error('Unexpected DB call');};
  const h=load('api/academic.js',{'../lib/db':{sql},'../lib/_auth':session});
  const res=await request(h,'POST','submit-activity',{activityId:'12345678-1234-1234-1234-123456789abc',content:'Test'},{},'student');
  assert.equal(res.statusCode,409); assert.match(res.data.error,/prazo/); assert.equal(calls,2);
});
test('manual endpoint rejects automatic activity', async () => {
  let calls=0; const sql=async()=>++calls===1?[{id:'student'}]:[{deadline_expired:false,activity_type:'automatic'}];
  const h=load('api/academic.js',{'../lib/db':{sql},'../lib/_auth':session});
  const res=await request(h,'POST','submit-activity',{activityId:'12345678-1234-1234-1234-123456789abc',content:'Test'},{},'student');
  assert.equal(res.statusCode,409); assert.equal(calls,2);
});
