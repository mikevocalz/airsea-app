import { InventoryReport, InventoryItem } from '@/types';

export const sampleInventoryItems: InventoryItem[] = [
  {
    itemNumber: '28-001',
    quantity: 1,
    pieces: 1,
    description: '10th Century Wine Opener - Antique Bronze',
    sidemark: 'A-001',
    room: '10th Floor Gallery',
    handlingVideo: {
      videoUrl: 'https://cdn.example.com/handling/28-001.mp4',
      qrValue: 'https://cdn.example.com/handling/28-001.mp4',
    },
    media: {
      photoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    },
    notes: 'Fragile antique. Handle with care. Use cotton gloves.',
  },
  {
    itemNumber: '28-002',
    quantity: 2,
    pieces: 4,
    description: 'Georgian Silver Candelabra Set',
    sidemark: 'B-102',
    room: 'Dining Hall',
    handlingVideo: {
      videoUrl: 'https://cdn.example.com/handling/28-002.mp4',
      qrValue: 'https://cdn.example.com/handling/28-002.mp4',
    },
    media: {
      photoUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=400',
    },
    notes: 'Silver requires polishing before display.',
  },
  {
    itemNumber: '28-003',
    quantity: 1,
    pieces: 1,
    description: 'Ming Dynasty Porcelain Vase',
    sidemark: 'C-203',
    room: 'East Wing',
    handlingVideo: {
      videoUrl: 'https://cdn.example.com/handling/28-003.mp4',
      qrValue: 'https://cdn.example.com/handling/28-003.mp4',
    },
    media: {
      photoUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400',
    },
    notes: 'Museum-grade packaging required. Temperature controlled.',
  },
  {
    itemNumber: '28-004',
    quantity: 4,
    pieces: 4,
    description: 'Victorian Mahogany Dining Chair',
    sidemark: 'D-304',
    room: 'Dining Hall',
    handlingVideo: {
      videoUrl: 'https://cdn.example.com/handling/28-004.mp4',
      qrValue: 'https://cdn.example.com/handling/28-004.mp4',
    },
  },
  {
    itemNumber: '28-005',
    quantity: 1,
    pieces: 3,
    description: 'Art Deco Crystal Chandelier',
    sidemark: 'E-405',
    room: 'Grand Foyer',
    handlingVideo: {
      videoUrl: 'https://cdn.example.com/handling/28-005.mp4',
      qrValue: 'https://cdn.example.com/handling/28-005.mp4',
    },
    media: {
      photoUrl: 'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?w=400',
    },
    notes: 'Disassemble before transport. Crystal elements individually wrapped.',
  },
  {
    itemNumber: '28-006',
    quantity: 1,
    pieces: 1,
    description: 'Renaissance Oil Painting - Landscape',
    sidemark: 'F-506',
    room: 'Main Gallery',
    handlingVideo: {
      videoUrl: 'https://cdn.example.com/handling/28-006.mp4',
      qrValue: 'https://cdn.example.com/handling/28-006.mp4',
    },
    media: {
      photoUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400',
    },
    notes: 'Climate controlled crate required. No direct sunlight.',
  },
  {
    itemNumber: '28-007',
    quantity: 6,
    pieces: 6,
    description: 'Persian Silk Carpet Runner',
    sidemark: 'G-607',
    room: 'Hallway',
    handlingVideo: {
      videoUrl: 'https://cdn.example.com/handling/28-007.mp4',
      qrValue: 'https://cdn.example.com/handling/28-007.mp4',
    },
  },
  {
    itemNumber: '28-008',
    quantity: 1,
    pieces: 1,
    description: 'Baroque Gilded Mirror Frame',
    sidemark: 'H-708',
    room: 'Master Suite',
    handlingVideo: {
      videoUrl: 'https://cdn.example.com/handling/28-008.mp4',
      qrValue: 'https://cdn.example.com/handling/28-008.mp4',
    },
    media: {
      photoUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=400',
    },
    notes: 'Mirror glass extremely fragile. Vertical transport only.',
  },
  {
    itemNumber: '28-009',
    quantity: 2,
    pieces: 2,
    description: 'Japanese Bronze Foo Dog Statues',
    sidemark: 'I-809',
    room: 'Entrance',
    handlingVideo: {
      videoUrl: 'https://cdn.example.com/handling/28-009.mp4',
      qrValue: 'https://cdn.example.com/handling/28-009.mp4',
    },
    notes: 'Heavy items. Requires 2-person lift minimum.',
  },
  {
    itemNumber: '28-010',
    quantity: 1,
    pieces: 8,
    description: 'Chippendale Writing Desk Set',
    sidemark: 'J-910',
    room: 'Library',
    handlingVideo: {
      videoUrl: 'https://cdn.example.com/handling/28-010.mp4',
      qrValue: 'https://cdn.example.com/handling/28-010.mp4',
    },
    media: {
      photoUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
    },
    notes: 'Includes drawers, inkwell, and accessories. Inventory all pieces.',
  },
];

export const sampleInventoryReport: InventoryReport = {
  id: 'INV-2024-001',
  company: {
    name: 'Heritage Fine Art Logistics',
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
  },
  job: {
    jobNumber: 'JOB-2024-0128',
    client: 'Westbrook Estate Collection',
    clientRef: 'WEC-2024',
    projectName: 'Estate Relocation Project',
  },
  meta: {
    generatedAt: new Date().toISOString(),
    page: 1,
    totalPages: 1,
  },
  items: sampleInventoryItems,
};

export function createEmptyReport(companyName: string, jobNumber: string): InventoryReport {
  return {
    id: `INV-${Date.now()}`,
    company: {
      name: companyName,
    },
    job: {
      jobNumber,
      client: '',
      clientRef: '',
      projectName: '',
    },
    meta: {
      generatedAt: new Date().toISOString(),
    },
    items: [],
  };
}

export function addItemToReport(report: InventoryReport, item: Omit<InventoryItem, 'itemNumber'>): InventoryReport {
  const itemNumber = `${report.job.jobNumber.split('-').pop()}-${String(report.items.length + 1).padStart(3, '0')}`;
  return {
    ...report,
    items: [...report.items, { ...item, itemNumber }],
  };
}
