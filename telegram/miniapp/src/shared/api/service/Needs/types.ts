export interface DetailsNeedsRequest {
  id: string;
}

export interface DetailsNeedsResponse {
  budget: number;
  deadlineEnd: string;
  deadlineStart: string;
  description: string;
  id: number;
  name: string;
  publicationId: number;
  tags: {
    id: number;
    name: string;
  }[];
}
