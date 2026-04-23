export interface ItemOwner {
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  course: string;
}

export interface Item {
  id: number;
  title: string;
  description: string;
  type: 'lost' | 'found';
  status: 'open' | 'closed';
  moderationStatus: 'pending' | 'approved' | 'rejected';
  moderatorComment: string;
  category: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  owner: ItemOwner;
}
