export interface CreateStudentRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    hebrewDateOfBirth?: string;
    barMitzvahParasha: string;
    avatarUrl?: string;
} 