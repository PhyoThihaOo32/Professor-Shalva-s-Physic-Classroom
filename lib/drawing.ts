import {z} from 'zod';
const x=z.number().min(0).max(1000),y=z.number().min(0).max(600);
const color=z.enum(['ink','teal','violet','coral']);
const point=z.object({x,y}).strict();
export const DrawingElementSchema=z.discriminatedUnion('kind',[
 z.object({kind:z.literal('line'),x1:x,y1:y,x2:x,y2:y,color}).strict(),
 z.object({kind:z.literal('arrow'),x1:x,y1:y,x2:x,y2:y,color}).strict(),
 z.object({kind:z.literal('circle'),cx:x,cy:y,r:z.number().min(1).max(300),color}).strict(),
 z.object({kind:z.literal('text'),x,y,text:z.string().min(1).max(140),color}).strict(),
 z.object({kind:z.literal('path'),points:z.array(point).min(2).max(80),color}).strict(),
]);
export const DrawingSchema=z.object({title:z.string().max(100),description:z.string().max(500),elements:z.array(DrawingElementSchema).max(30)}).strict();
export type BoardDrawing=z.infer<typeof DrawingSchema>;
export type DrawingElement=z.infer<typeof DrawingElementSchema>;
export const drawingColors={ink:'#364965',teal:'#4c8986',violet:'#8570a7',coral:'#bb746f'};
