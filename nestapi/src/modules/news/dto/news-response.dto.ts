export class NewsResponseDto {
  id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  coverImageUrl: string | null;
  detailImageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export class NewsListResponseDto {
  items: NewsResponseDto[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
