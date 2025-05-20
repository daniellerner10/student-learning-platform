export interface UpdateStudentRequest {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    hebrewDateOfBirth?: string;
    barMitzvahParasha?: string;
    avatarUrl?: string;
} 