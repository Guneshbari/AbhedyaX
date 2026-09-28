export interface NavItem {
  label: string;
  route: string;
  iconName: string;
  badge?: string;
  description?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
