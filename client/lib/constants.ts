export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';

export const API_ROUTES = {
  fetchItems: `${API_BASE_URL}/api/item/fetch`,
  users: `${API_BASE_URL}/api/item/users`,
  itemsByUser: (userId: string | number) =>
    `${API_BASE_URL}/api/item/usercreatedby/${userId}`,
  deleteItem: (id: string | number) =>
    `${API_BASE_URL}/api/item/delete/${id}`,
  likeItem: (id: string | number) => `${API_BASE_URL}/api/item/like/${id}`,
  comments: (id: string | number) =>
    `${API_BASE_URL}/api/item/comments/${id}`,
  addComment: `${API_BASE_URL}/api/item/comment`,
  createItem: `${API_BASE_URL}/api/item/create`,
  signup: `${API_BASE_URL}/api/item/signup`,
  login: `${API_BASE_URL}/api/item/login`,
};

export interface UserSummary {
  id: number;
  username: string;
}

export interface CultureItem {
  id: number;
  CultureName: string;
  CultureDescription: string;
  Region: string;
  Significance: string;
  ImageURL?: string | null;
  VideoURL?: string | null;
  Likes?: number | null;
}

export interface CultureComment {
  id: number;
  comment: string;
  username?: string;
}
