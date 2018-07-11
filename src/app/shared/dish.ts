import { Comment } from './comment';

export class Dish {
    id: number;
    name: String;
    image: String;
    category: String;
    label: String;
    price: String;
    featured: boolean;
    description: String;
    comments: Comment[];
}