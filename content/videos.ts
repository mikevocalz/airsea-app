/**
 * AirSea video catalog.
 * Add new videos here — the gallery scales automatically.
 * Set comingSoon: true for any video not yet ready to stream.
 */

export interface AirSeaVideo {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  playbackId: string;
  is360: boolean;
  category: string;
  duration?: string;
  sortOrder: number;
  comingSoon?: boolean;
  thumbnailTime?: number;
}

export const AIRSEA_VIDEOS: AirSeaVideo[] = [
  {
    id: "ryan",
    title: "Ryan",
    subtitle: "AirSea CT",
    description: "Step inside AirSea's white-glove logistics operation.",
    playbackId: "Yrv02Q00VmKyoYgJ7VntPArMYEHFGCS0002IuksSkFEAjvU",
    is360: true,
    category: "Operations",
    sortOrder: 0,
    thumbnailTime: 69,
  },
  {
    id: "kevorn-devon",
    title: "Kevorn & Devon",
    subtitle: "AirSea 22nd & 35th ST",
    description: "Museum-grade care for every piece.",
    playbackId: "007qxYvEIGuu00WGic02hZqmtESdvx501aZ3L00BnN6G9Eso",
    is360: true,
    category: "Services",
    sortOrder: 1,
  },
  {
    id: "sean",
    title: "Sean",
    subtitle: "AirSea CT",
    description: "Full-residence moves handled with care.",
    playbackId: "u4O9YHS39hq800vrcDz00Z9n1wjlZWV95bImQeB59a7Ic",
    is360: true,
    category: "Services",
    sortOrder: 2,
  },
  {
    id: "storage-facility",
    title: "Storage & Receiving",
    description: "Climate-controlled, catalogued, ready when you are.",
    playbackId: "",
    is360: true,
    category: "Facility",
    sortOrder: 3,
    comingSoon: true,
  },
  {
    id: "nyc-operations",
    title: "New York Hub",
    description: "Our primary operations facility serving the Tri-State area.",
    playbackId: "",
    is360: true,
    category: "Facility",
    sortOrder: 4,
    comingSoon: true,
  },
  {
    id: "installation-services",
    title: "Installation",
    description: "We don't just deliver. We place.",
    playbackId: "",
    is360: true,
    category: "Services",
    sortOrder: 5,
    comingSoon: true,
  },
];
