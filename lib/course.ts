// Public navigation metadata only. No reference answers or error plans.
export const chapterTwoId='chapter-2';
export const chapterTwoTitle='Describing Motion: Kinematics in One Dimension';
export const defaultChapterTwoProblem='ch2-driving-home';
export const chapterTwoNumbers=[5,11,13,17,19,21,33,41,55,63];
export const pendingGraphProblem={number:17,title:'Reading a position–time graph',description:'Constant velocity, greatest velocity, zero velocity, and direction of motion.',reason:'Waiting for Fig. 2–40. Add the graph to make this problem available.'};

export type PendingProblem={number:number;title:string;reason:string;status:'Needs figure'|'Needs question'};
export const courseChapters=[
 {id:chapterTwoId,number:2,title:chapterTwoTitle,shortTitle:'Motion in 1D',pending:[{...pendingGraphProblem,status:'Needs figure' as const}]},
 {id:'chapter-3',number:3,title:'Kinematics in Two or Three Dimensions; Vectors',shortTitle:'Vectors & projectiles',pending:[
  {number:11,title:'Subtracting vectors',reason:'Needs Fig. 3–41 to determine A and B.',status:'Needs figure' as const},
  {number:13,title:'Combining three vectors',reason:'Needs Fig. 3–41 to determine A, B, and C.',status:'Needs figure' as const},
  ...[15,45,55].map(number=>({number,title:`Problem ${number}`,reason:'The question text has not been added yet.',status:'Needs question' as const}))
 ]},
 {id:'chapter-4',number:4,title:'Dynamics: Newton’s Laws of Motion',shortTitle:'Newton’s laws',pending:[]},
 {id:'chapter-5',number:5,title:'Using Newton’s Laws: Friction, Circular Motion',shortTitle:'Friction & circular motion',pending:[]}
] satisfies {id:string;number:number;title:string;shortTitle:string;pending:PendingProblem[]}[];
export function courseChapter(id:string|undefined){return courseChapters.find(chapter=>chapter.id===id)??courseChapters[0];}
export function problemLibraryHref(chapterId?:string,studentId?:string){
 const params=new URLSearchParams();
 if(chapterId&&chapterId!==chapterTwoId)params.set('chapter',courseChapter(chapterId).id);
 if(studentId)params.set('student',studentId);
 return `/library${params.size?`?${params}`:''}`;
}
