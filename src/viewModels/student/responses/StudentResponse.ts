export interface StudentResponse {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    hebrewDateOfBirth?: string;
    barMitzvahParasha?: string;
    avatarUrl?: string;
    isVerified: boolean;
    role: string;
    createdAt: Date;
    updatedAt: Date;
} 