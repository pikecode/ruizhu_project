/**
 * 咨询响应DTO
 */
export class ConsultationResponseDto {
  id: number;
  productId: number;
  productName: string;
  categoryId: number;
  categoryName: string;
  userName: string;
  userPhone: string;
  userEmail: string | null;
  color: string | null;
  height: string | null;
  weight: string | null;
  chest: string | null;
  waist: string | null;
  hip: string | null;
  shoeSize: string | null;
  ringSize: string | null;
  jewelrySize: string | null;
  jewelryMaterial: string | null;
  perfumePreference: string | null;
  remarks: string | null;
  status: 'unread' | 'read' | 'processing' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}
