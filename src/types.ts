export interface User {
  id: string;
  name: string;
  email: string;
  accountNumber: string;
  avatarUrl?: string;
  balance: number;
  currency: string;
  createdAt?: string;
}

export interface RecipientUser {
  id: string;
  name: string;
  email: string;
  accountNumber: string;
  avatarUrl?: string;
}

export interface Transaction {
  id: string;
  senderId: string;
  senderName: string;
  senderAccount: string;
  receiverId: string;
  receiverName: string;
  receiverAccount: string;
  amount: number;
  currency: string;
  status: 'SUCCESSFUL' | 'FAILED' | 'REJECTED';
  type: 'TRANSFER' | 'DEPOSIT';
  note: string;
  date: string;
  time: string;
  timestamp: number;
  signature: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  userName: string;
  details: string;
  ip: string;
  securityLevel: 'INFO' | 'WARNING' | 'SECURITY_ALERT';
}

export interface SecurityTestReport {
  attackName: string;
  vulnerability: string;
  beforeControl: string;
  afterControl: string;
  statusCode: number;
  statusText: string;
  outcome: 'PREVENTED' | 'FAILED';
  technicalDetails: string;
}

export interface StorageInspectionUser {
  id: string;
  name: string;
  email: string;
  accountNumber: string;
  hasPlaintextPassword: boolean;
  passwordHashPreview: string;
  salt: string;
  algorithm: string;
  rounds: number;
  keyLength: string;
  storageSafetyStatus: string;
}

export interface StorageInspectionResponse {
  description: string;
  timestamp: string;
  users: StorageInspectionUser[];
  ledgerTamperProtection: string;
}
