// Progressão por marcos: repetir um recorde não concede XP novamente.
const milestones = [
  ['primeira', 'Primeira jornada', 'Conclua um quiz', 1, 'completed', 'Insígnia do Aprendiz'],
  ['sabio', 'Provação do saber', 'Alcance 80% em 3 disciplinas', 3, 'mastered', 'Manto do Sábio'],
  ['explorador', 'Explorador dos reinos', 'Conclua quizzes de 5 disciplinas', 5, 'completed', 'Bússola Arcana'],
  ['arena', 'Guardião da arena', 'Acerte 10 questões em uma partida de Matemática Infinita', 10, 'gameBest', 'Espada de Cristal'],
  ['perfeito', 'Conhecimento lendário', 'Alcance 100% em 3 disciplinas', 3, 'perfect', 'Coroa do Conhecimento']
];
function progression(quizzes, gameBest = 0) {
  const best = new Map();
  for (const row of quizzes) {
    const p = Math.max(0, Math.min(100, Number(row.percent) || 0));
    best.set(row.materia, Math.max(best.get(row.materia) || 0, p));
  }
  const values = [...best.values()];
  const stats = {completed: values.length, mastered: values.filter(p => p >= 80).length, perfect: values.filter(p => p === 100).length, gameBest: Math.max(0, Math.floor(Number(gameBest) || 0))};
  const quests = milestones.map(([id,title,description,target,key,reward]) => ({id,title,description,target,reward,current:Math.min(target,stats[key]), unlocked:stats[key]>=target}));
  const xp = values.reduce((sum,p)=>sum+50+Math.floor(p),0) + Math.min(100,stats.gameBest)*5 + quests.filter(q=>q.unlocked).length*100;
  const level = Math.floor(xp/200)+1;
  const rank = level>=10?'Lenda Arcana':level>=7?'Mestre dos Reinos':level>=4?'Guardião do Saber':level>=2?'Aventureiro':'Aprendiz';
  return {xp,level,rank, progress:xp%200,next:200,stats,quests,coins:Math.floor(xp/10)};
}
module.exports = { progression };
