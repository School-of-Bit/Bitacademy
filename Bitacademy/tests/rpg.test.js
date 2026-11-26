const test = require('node:test');
const assert = require('node:assert/strict');
const { progression } = require('../lib/rpg');
test('new character',()=>{const p=progression([]); assert.equal(p.xp,0);assert.equal(p.level,1);});
test('quiz mastery and first quest award XP once',()=>{const p=progression([{materia:'a',percent:100},{materia:'a',percent:80}]);assert.equal(p.xp,250);assert.equal(p.level,2);assert.equal(p.quests[0].unlocked,true);});
test('arena cap and quest',()=>{assert.equal(progression([],1000).xp,600);assert.equal(progression([],10).xp,150);});
test('higher records never lower XP',()=>{const a=progression([{materia:'a',percent:20}],3);const b=progression([{materia:'a',percent:90}],10);assert.ok(b.xp>a.xp);});
test('three perfect subjects unlock both mastery rewards',()=>{const p=progression(['a','b','c'].map(materia=>({materia,percent:100})));assert.equal(p.quests.filter(q=>q.unlocked).length,3);assert.equal(p.xp,750);});
