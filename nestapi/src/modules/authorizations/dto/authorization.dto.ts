/**
 * Authorization Response DTO
 * Returned when fetching user's authorization settings
 */
export class AuthorizationDto {
  id: number;
  userId: number;
  registration: number;
  analysis: number;
  marketing: number;
  transfer: number;
  createdAt: Date;
  updatedAt: Date;
}
