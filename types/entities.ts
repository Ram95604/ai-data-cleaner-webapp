export interface Client {
  ClientID: string;
  ClientName: string;
  PriorityLevel: number;
  RequestedTaskIDs: string;
  GroupTag: string;
  AttributesJSON: string;
  [key: string]: unknown;  
}

export interface Worker {
  WorkerID: string;
  WorkerName: string;
  Skills: string;
  AvailableSlots: string;
  MaxLoadPerPhase: number;
  WorkerGroup: string;
  QualificationLevel: number;
  [key: string]: unknown;  
}

export interface Task {
  TaskID: string;
  TaskName: string;
  Category: string;
  Duration: number;
  RequiredSkills: string;
  PreferredPhases: string;
  MaxConcurrent: number;
  [key: string]: unknown;  
}
export type Operator = "=" | ">" | "<" | "includes" | "contains";

export interface Rule {
  field: string;
  operator: Operator;
  value: string;
  weight?: number; 
}