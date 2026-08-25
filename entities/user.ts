type Permission =
  | 'can_add_products'
  | 'can_edit_products'
  | 'can_delete_products'
  | 'can_add_category'
  | 'can_edit_category'
  | 'can_deactivate_category'
  | 'can_view_orders';

export type User = {
  id: number;
  profilepicture: string;
  firstname: string;
  lastname: string;
  email: string;
  lastLoggedIn: string;
  status: boolean;
  role: string;
  permissions: Permission[] | null;
  is_superuser: boolean;
  profile: { id: number; name: string; permissions: string[] } | null;
};

export type CustomerQueryParameters = {
  sort?: string;
  limit?: number;
  offset?: number;
  search?: string;
  role?: string;
};
