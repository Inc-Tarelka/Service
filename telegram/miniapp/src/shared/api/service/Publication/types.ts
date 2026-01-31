// Presign Types
export interface PresignFileRequest {
  contentType: string;
}

export interface PresignRequest {
  files: PresignFileRequest[];
}

export interface PresignItem {
  key: string;
  uploadUrl: string;
  publicUrl: string;
  headers: {
    'Content-Type': string;
  };
}

export interface PresignResponse {
  items: PresignItem[];
}

// Publication Types
export interface PublicationNeed {
  name: string;
  description?: string;
  budget?: number;
  deadlineStart?: string;
  deadlineEnd?: string;
  cityId?: number;
  tagIds?: number[];
}

export interface CreatePublicationRequest {
  name: string;
  type: 'PROJECT' | 'SERVICE';
  description?: string;
  imageUrls?: string[];
  cityId?: number;
  tagIds?: number[];
  coAuthorIds?: number[];
  needs?: PublicationNeed[];
}

export interface Publication {
  id: number;
  name: string;
  type: 'PROJECT' | 'SERVICE';
  description?: string;
  imageUrls: string[];
  cityId?: number;
  tagIds?: number[];
  coAuthorIds?: number[];
  needs?: PublicationNeed[];
  createdAt: string;
  updatedAt: string;
}
