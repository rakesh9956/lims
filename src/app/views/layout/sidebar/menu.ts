
import { MenuItem } from './menu.model';
export const MENU: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: 'home',
    link: '/dashboard',
    IsStore:false,
    B2BTYPE:false,
    IsAdmin:true,
    IsStoreAdmin:true,
  },
  {
    label: 'Items',
    icon: 'layers',
    IsStore:false,
    B2BTYPE:false,
    IsAdmin:true,
    IsStoreAdmin:true,
    subItems: [
      {
        label: 'All Items',
        link: '/items',
        IsStore:true,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'Item Types',
        link: '/items/item-types',
        IsStore:true,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'Stock Return Form',
        link: '/items/stock-return-form',
        IsStore:false,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'Scrap Items',
        link: '/items/scrap-items',
        IsStore:true,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'Adjust Items',
        link: '/items/adjust-items',
        IsStore:true,
        B2BTYPE:false,
        IsAdmin:false,
        IsStoreAdmin:true
      },
      {
        label: 'Pending Indents',
        link: '/items/si-pending-items',
        IsStore:false,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
    ]
  },
  {
    label: 'Quotations',
    icon: 'package',
    link: '/quotations',
    IsStore:true,
    B2BTYPE:false,
    IsAdmin:true,
    IsStoreAdmin:true,
  },
  {
    label: 'Store Master',
    icon: 'file-text',
    IsStore:false,
    B2BTYPE:true,
    IsAdmin:true,
    IsStoreAdmin:true,
    subItems: [
      {
        label: 'Indents',
        link: '/requests',
        IsStore:false,
        B2BTYPE:true,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'Purchase Orders',
        link: '/purchase-orders',
        IsStore:true,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },     
      {
        label: 'Goods Receipt Notes',
        link: '/grn',
        IsStore:true,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'Material Dispatch',
        link: '/material-dispatched',
        IsStore:false,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'DP Consumption',
        link: '/dp-consumption',
        IsStore:false,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'NRDC',
        link: '/stores/nrdc',
        IsStore:true,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
    ]
  },  
  {
    label: 'Suppliers',
    icon: 'box',
    link: '/suppliers',
    IsStore:true,
    B2BTYPE:false,
    IsAdmin:false,
    IsStoreAdmin:true,
  },
  {
    label: 'Manufacturers',
    icon: 'database',
    link: '/manufacturers',
    IsStore:true,
    B2BTYPE:false,
    IsAdmin:false,
    IsStoreAdmin:true,
  },
  {
    label: 'Locations',
    icon: 'package',
    IsStore:false,
    B2BTYPE:false,
    IsAdmin:false,
    IsStoreAdmin:true,
    subItems: [
      {
        label: 'All Locations',
        link: '/stores',
        IsStore:false,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'Centers',
        link: '/stores/centers',
        IsStore:true,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      }
    ]
  },
  // {
  //   label: 'Requests',
  //   icon: 'zap',
  //   subItems: [
  //     {
  //       label: 'All Requests',
  //       link: '/requests',
  //     },
  //     {
  //       label: 'Pending Requests',
  //       link: '/requests/pending-requests',
  //     },
  //     {
  //       label: 'Fulfilled Requests',
  //       link: '/requests/fulfilled-requests',
  //     },
  //     {
  //       label: 'Returns',
  //       link: '/requests/returns',
  //     },
  //   ]
  // },
  
  // {
  //   label: 'Purchase Orders',
  //   icon: 'package',
  //   link: '/purchase-orders',
  // },
  // {
  //   label: 'GRN',
  //   icon: 'file-text',
  //   subItems: [
  //     {
  //       label: 'GRN Status Report',
  //       link: '/grn',
  //     },
  //     {
  //       label: 'New GRN',
  //       link: '/grn/new-grn',
  //     },
  //     {
  //       label: 'GRN Against PO',
  //       link: '/grn/grn-against-po',
  //     },
  //   ]
  // },
  {
    label: 'Reports',
    icon: 'pie-chart',
    link: '/reports',
    IsStore:false,
    B2BTYPE:false,
    IsAdmin:true,
    IsStoreAdmin:true,
    subItems: [
      {
        label: 'Quotations Report',
        link: '/reports/approval-quotations-report',
        IsStore:true,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'Consume Report',
        link: '/reports/consume-report',
        IsStore:false,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'GRN Report',
        link: '/reports/grn-report',
        IsStore:true,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'Indent Report',
        link: '/reports/indent-report',
        IsStore:false,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'Issue Report',
        link: '/reports/issue-report',
        IsStore:true,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'Low Stock Report',
        link: '/reports/low-stock-report',
        IsStore:true,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'Purchase Order Report',
        link: '/reports/po-report',
        IsStore:true,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'Stock Expiry Report',
        link: '/reports/stock-expiry-report',
        IsStore:false,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'Stock In Hand Report',
        link: '/reports/stock-in-hand-report',
      },
      {
        label: 'Indent vs PO vs GRN Report',
        link: '/reports/stock-ledger-report',
        IsStore:true,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'Stock Statement Report',
        link: '/reports/stock-status-report',
        IsStore:false,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'Stock Status Report',
        link: '/reports/stock-verification-report',
        IsStore:true,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'Purchase Item Report',
        link: '/reports/purchase-item-report',
        IsStore:true,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'Stock Ledger Report',
        link: '/reports/stock-transaction-report',
        IsStore:true,
        B2BTYPE:true,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'Live CPT Report',
        link: '/reports/live-cpt-report',
        IsStore:true,
        B2BTYPE:true,
        IsAdmin:true,
        IsStoreAdmin:true
      }
    ]
  },
  {
    label: 'User Management',
    icon: 'users',
    link: '/user-management',
    IsStore:true,
    B2BTYPE:false,
    IsAdmin:false,
    IsStoreAdmin:false,
  },
  {
    label: 'Po PaymentHistory',
    icon: 'users',
    link: 'purchase-orders/po-payhistory',
    IsStore:true,
    B2BTYPE:false,
    IsAdmin:true,
    IsStoreAdmin:true,
  },
  {
    label: 'CPT',
    icon: 'layers',
    IsStore:false,
    B2BTYPE:false,
    IsAdmin:true,
    IsStoreAdmin:true,
    subItems: [
      {
        label: 'All-CPT',
        link: '/items/all-cpt',
        IsStore:true,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      },
      {
        label: 'Live-CPT',
        link: '/items/all-live-cpt',
        IsStore:true,
        B2BTYPE:false,
        IsAdmin:true,
        IsStoreAdmin:true
      }
    ]
  },
];
