export interface AboutContent {
  id?: string;
  history: string;
  mission: string;
  vision: string;
  historyImageUrl?: string;
  yearsOfService: number;
}

export interface Slider {
  id?: string;
  imageUrl: string;
  title: string;
  description: string;
  order: number;
}

export interface Program {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  date: string;
}

export interface GalleryItem {
  id?: string;
  type: 'photo' | 'video';
  url: string;
  title: string;
  date: string;
}

export interface Meeting {
  id?: string;
  title: string;
  date: string;
  pdfUrl?: string;
  notes?: string;
}

export interface Post {
  id?: string;
  title: string;
  content: string;
  author: string;
  date: string;
  imageUrl?: string;
}

export interface Contact {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  date: string;
  createdAt?: any; // Firestore Timestamp
}

export interface Member {
  id?: string;
  name: string;
  phone: string;
  designation: string;
  photoUrl: string;
  address: string;
  order: number;
}

export interface Notice {
  id?: string;
  text: string;
  date: string;
}

export interface SiteSettings {
  id?: string;
  siteName: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  footerText: string;
}

export interface Certificate {
  id?: string;
  title: string;
  description: string;
  url?: string;
  order: number;
}

export interface QuickLink {
  id?: string;
  title: string;
  url: string;
  order: number;
}

export interface DonationInfo {
  id?: string;
  upiId: string;
  qrScannerUrl?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  description?: string;
}

export interface JoinUsInfo {
  id?: string;
  title: string;
  description: string;
  buttonText?: string;
  benefits?: string[];
  imageUrl?: string;
}
