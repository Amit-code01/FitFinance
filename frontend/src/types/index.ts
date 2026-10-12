export type Entry = { id:number; kind:string; title:string; amount:number|null; category:string|null; date:string; description:string|null; durationMinutes:number|null; caloriesBurned:number|null; weight:number|null; steps:number|null; calories:number|null; targetValue:number|null; currentValue:number|null; unit:string|null; deadline:string|null; status:string|null };
export type EntryInput = Omit<Entry, 'id'|'kind'>;
export type AuthResponse = { token:string; userId:number; name:string; email:string };
