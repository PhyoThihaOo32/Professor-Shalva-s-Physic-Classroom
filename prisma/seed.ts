import 'dotenv/config';
import { db } from '../lib/db';
import { demoProblems } from '../lib/content';
import {chapterTwoProblems} from '../lib/chapter-two';
import {chapterTwoId,chapterTwoTitle} from '../lib/course';
import { sessionPersonas,rubricWeights } from '../lib/domain';
async function seed(){
 await db.chapter.upsert({where:{id:'circular-motion'},create:{id:'circular-motion',title:'Circular Motion and Newton’s Laws',source:'Original demo chapter'},update:{}});
 await db.chapter.upsert({where:{id:chapterTwoId},create:{id:chapterTwoId,title:chapterTwoTitle,source:'Chapter 2 exercises provided by the user'},update:{}});
 await db.rubricVersion.upsert({where:{id:'instructor-v1'},create:{id:'instructor-v1',data:rubricWeights},update:{}});
 for(const p of sessionPersonas)await db.personaVersion.upsert({where:{id:p.id},create:{id:p.id,data:p},update:{}});
 for(const p of [...demoProblems,...chapterTwoProblems]){
  await db.problem.upsert({where:{id:p.id},create:{id:p.id,chapterId:p.data.chapterId??'circular-motion'},update:{}});
  await db.problemVersion.upsert({where:{problemId_version:{problemId:p.id,version:1}},create:{id:`${p.id}-v1`,problemId:p.id,version:1,status:'published',data:p.data,reviewedAt:new Date(),reviewedBy:'Original demo regression review'},update:{}});
  for(const t of p.data.templates)await db.errorTemplate.upsert({where:{id:t.id},create:{id:t.id,data:t},update:{}});
 }
 console.log('Seeded Chapter 2 with 9 available exercises, 6 preserved demo problems, and character students. Problem 17 awaits its supplied graph.');
}
seed().finally(()=>db.$disconnect());
