// Public navigation metadata only. No reference answers or error plans.
export const chapterTwoId='chapter-2';
export const chapterTwoTitle='Describing Motion: Kinematics in One Dimension';
export const defaultChapterTwoProblem='ch2-driving-home';
export const chapterTwoNumbers=[5,11,13,17,19,21,33,41,55,63];
export type PendingProblem={number:number;title:string;reason:string;status:'Needs figure'|'Needs question'};
export type CourseChapter={id:string;number:number;title:string;shortTitle:string;pending:PendingProblem[]};
export const courseChapters:CourseChapter[]=[
 {id:chapterTwoId,number:2,title:chapterTwoTitle,shortTitle:'Motion in 1D',pending:[]},
 {id:'chapter-3',number:3,title:'Kinematics in Two or Three Dimensions; Vectors',shortTitle:'Vectors & projectiles',pending:[]},
 {id:'chapter-4',number:4,title:'Dynamics: Newton’s Laws of Motion',shortTitle:'Newton’s laws',pending:[]},
 {id:'chapter-5',number:5,title:'Using Newton’s Laws: Friction, Circular Motion',shortTitle:'Friction & circular motion',pending:[]},
 {id:'chapter-7',number:7,title:'Work and Energy',shortTitle:'Work & energy',pending:[]}
];
export function courseChapter(id:string|undefined){return courseChapters.find(chapter=>chapter.id===id)??courseChapters[0];}
export function problemLibraryHref(chapterId?:string,studentId?:string){
 const params=new URLSearchParams();
 if(chapterId&&chapterId!==chapterTwoId)params.set('chapter',courseChapter(chapterId).id);
 if(studentId)params.set('student',studentId);
 return `/library${params.size?`?${params}`:''}`;
}
