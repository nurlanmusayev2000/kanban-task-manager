export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Comment {
  author: string;
  text: string;
  createdAt: string;
}

export interface Card {
  _id: string;
  title: string;
  description?: string;
  list: string;
  board: string;
  assignees: string[];
  labels: string[];
  dueDate?: string;
  position: number;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface List {
  _id: string;
  title: string;
  board: string;
  position: number;
  cards: Card[];
  createdAt: string;
}

export interface Board {
  _id: string;
  title: string;
  description?: string;
  owner: string;
  members: string[];
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardWithLists extends Board {
  lists: List[];
}
