import 'dotenv/config';
import { db } from '../lib/db';
import { demoProblems } from '../lib/content';
import {chapterTwoProblems} from '../lib/chapter-two';
import {chapterThreeProblems} from '../lib/chapter-three';
import {originalPracticeProblems} from '../lib/original-practice';
import {chapterSevenProblems} from '../lib/chapter-seven';
import {courseChapters} from '../lib/course';
import { sessionPersonas,rubricWeights } from '../lib/domain';
async function seed(){
 await db.chapter.upsert({where:{id:'circular-motion'},create:{id:'circular-motion',title:'Circular Motion and Newton’s Laws',source:'Original demo chapter'},update:{}});
 for(const chapter of courseChapters)await db.chapter.upsert({where:{id:chapter.id},create:{id:chapter.id,title:chapter.title,source:`Chapter ${chapter.number} course content provided by the user`},update:{}});
 await db.rubricVersion.upsert({where:{id:'instructor-v1'},create:{id:'instructor-v1',data:rubricWeights},update:{}});
 for(const p of sessionPersonas)await db.personaVersion.upsert({where:{id:p.id},create:{id:p.id,data:p},update:{}});
 for(const p of [...demoProblems,...chapterTwoProblems,...chapterThreeProblems,...originalPracticeProblems,...chapterSevenProblems]){
  await db.problem.upsert({where:{id:p.id},create:{id:p.id,chapterId:p.data.chapterId??'circular-motion'},update:{}});
  await db.problemVersion.upsert({where:{problemId_version:{problemId:p.id,version:1}},create:{id:`${p.id}-v1`,problemId:p.id,version:1,status:'published',data:p.data,reviewedAt:new Date(),reviewedBy:'Original demo regression review'},update:{}});
  for(const t of p.data.templates)await db.errorTemplate.upsert({where:{id:t.id},create:{id:t.id,data:t},update:{}});
 }
 console.log(`Seeded ${courseChapters.length} course chapters, including ${chapterSevenProblems.length} Chapter 7 references. Existing published versions and conversation history are preserved.`);
}
seed().finally(()=>db.$disconnect());
