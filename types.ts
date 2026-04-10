
export type DocType = 'SOAP' | 'PATIENT_LETTER' | 'GP_LETTER';

export interface Provider {
  name: string;
  practice: string;
  id: string;
}

export interface Consultation {
  id: string;
  patientName: string;
  patientAge: string;
  transcript: string;
  selectedDocTypes: DocType[];
  documents: Partial<Record<DocType, string>>;
  status: 'IDLE' | 'RECORDING' | 'PROCESSING' | 'REVIEW';
  createdAt: Date;
}

export interface DocumentPrompt {
  type: DocType;
  title: string;
  description: string;
}

export interface BackendStructureInfo {
  endpoints: {
    path: string;
    method: string;
    description: string;
  }[];
  models: string[];
}
