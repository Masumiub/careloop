export interface ParticipantDTO {
  id: string;
  name: string;
  preferredName: string | null;
  email: string;
  phone: string;
  suburb: string;
  state: string;
  postcode: string;
  ndisNumber: string | null;
  supportNeeds: string[];
  accessibilityNotes: string | null;
  color: string;
  createdAt: string;
}

export interface StaffDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  region: string;
  specialities: string[];
  active: boolean;
  color: string;
  createdAt: string;
}

export interface RequestDTO {
  id: string;
  participantId: string;
  serviceType: string;
  title: string;
  description: string;
  suburb: string;
  preferredDate: string | null;
  preferredTime: string;
  priority: string;
  status: string;
  assignedStaffId: string | null;
  staffNotes: string | null;
  createdAt: string;
  updatedAt: string;
  participantName: string | null;
  participantSuburb: string | null;
  participantState: string | null;
  participantColor: string | null;
  staffName: string | null;
  staffRole: string | null;
  staffColor: string | null;
}
