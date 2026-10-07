import type {Step,DiscussionTurn} from './domain';
import type {TeacherInstinct} from './teacher-instinct';
export type OpenTurn=DiscussionTurn & {instinct:TeacherInstinct|null;instinctStatus:'checked'|'unavailable'|'not-needed'};
export type OpenClassroom={id:string;kind:'open-classroom';personaId:string;revision:number;state:string;discussion:OpenTurn[]};
export const emptyStudentWork=():Step=>({id:'live',title:'Student attempt',text:'',equation:'',value:null,unit:'',diagram:false,drawing:null,solution:null});
