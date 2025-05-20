export interface CreateClassroomRequest {
    name: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    maxParticipants?: number;
    instructorId: string;
    meetingLink?: string;
    isRecorded?: boolean;
    recordingUrl?: string;
} 