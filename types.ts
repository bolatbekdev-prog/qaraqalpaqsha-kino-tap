
export type Season = 'winter' | 'spring' | 'summer' | 'autumn';

export interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  quality: string;
  genre: string[];
  imageUrl: string;
  description: string;
  duration: string;
  videoUrl: string; 
  trailerUrl?: string; 
  country: string;
  isQaraqalpaq?: boolean;
  actors?: string[];
  director?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
}

export interface Genre {
  id: string;
  label: string;
}

export type JobApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface JobApplication {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  about: string;
  resumeFileName: string;
  resumeMimeType: string;
  resumeDataUrl: string;
  status: JobApplicationStatus;
  adminNote?: string;
  createdAt: number;
  updatedAt: number;
}

export type NotificationType = 'application' | 'news' | 'teaser';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: number;
  targetUserId?: string | null;
  readBy: string[];
}

export interface Teaser {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  createdAt: number;
}

export type TabType = 'home' | 'movies' | 'cartoons' | 'qaraqalpaq' | 'ai-assistant' | 'admin' | 'favorites' | 'profile' | 'feedback' | 'team';
