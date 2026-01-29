export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: string;
  mainImage: string;
  productImages: string[];
  videoClip: string | null;
  createdAt: string;
  qrCode: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  phone: string;
  avatar: string | null;
}

export interface InventoryItem {
  itemNumber: string;
  quantity: number;
  pieces: number;
  description: string;
  sidemark?: string;
  room?: string;
  handlingVideo?: {
    videoUrl: string;
    qrValue: string;
  };
  media?: {
    photoUrl?: string;
  };
  notes?: string;
}

export interface InventoryReport {
  id: string;
  company: {
    name: string;
    logoUrl?: string;
  };
  job: {
    jobNumber: string;
    client: string;
    clientRef: string;
    projectName: string;
  };
  meta: {
    generatedAt: string;
    page?: number;
    totalPages?: number;
  };
  items: InventoryItem[];
}
