export interface Message {
  _id: string;
  customTourRequest: string;
  sender: { _id: string; fullName: string };
  senderRole: 'customer' | 'admin';
  text: string;
  createdAt: string;
}
