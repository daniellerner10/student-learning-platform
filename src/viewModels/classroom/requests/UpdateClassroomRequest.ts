export interface UpdateClassroomRequest {
    id: string;
    name?: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
    status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    maxParticipants?: number;
    meetingLink?: string;
    isRecorded?: boolean;
    recordingUrl?: string;
} 