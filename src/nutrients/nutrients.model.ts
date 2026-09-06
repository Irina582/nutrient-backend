export type NutrientStatus = 'черновик' | 'опубликован' | 'удален';

export interface Nutrient {
  id: number;
  name: string;          
  category: string;    
  dailyNorm: number;    
  unit: string;        
  description: string;   
  status: NutrientStatus;
  imageKey: string;      
  videoKey: string;    
  likedByUserIds: number[];
}