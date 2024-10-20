
export interface MenuItem {
  id?: number;
  label?: string;
  icon?: string;
  link?: string;
  expanded?: boolean;
  subItems?: any;
  isTitle?: boolean;
  badge?: any;
  parentId?: number;
  IsStore?:boolean;
  B2BTYPE?:boolean;
  IsAdmin?:boolean;
  IsStoreAdmin: boolean;
}
