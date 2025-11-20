// Since backend is now in the same Next.js app, use relative API paths
export const API_BASE_URL = '';

export const API_ROUTES = {
  fetchItems: `/api/items`,
  users: `/api/users`,
  itemsByUser: (userId: string | number) => `/api/items/user/${userId}`,
  deleteItem: (id: string | number) => `/api/items/${id}`,
  likeItem: (id: string | number) => `/api/items/${id}/like`,
  comments: (id: string | number) => `/api/items/${id}/comments`,
  addComment: (id: string | number) => `/api/items/${id}/comments`,
  createItem: `/api/items`,
  updateItem: `/api/items`,
  signup: `/api/auth/signup`,
  login: `/api/auth/login`,
  LOGOUT: `/api/auth/logout`,
};

export interface UserSummary {
  id: string;
  username: string;
}

export interface CultureItem {
  id: string;
  CultureName: string;
  CultureDescription: string;
  Region: string;
  Significance: string;
  ImageURL?: string | null;
  VideoURL?: string | null;
  Likes?: number | null;
  created_by?: string | null;
  likedByCurrentUser?: boolean;
}

export interface CultureComment {
  id: string;
  comment: string;
  username?: string | null;
}
