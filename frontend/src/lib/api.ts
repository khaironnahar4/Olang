import { axiosInstance } from "./axios";

export interface SignupData {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  password: string,
  bio: string,
  profilePicture: string;
  nativeLanguage: string;
  learningLanguage: string;
  location: string;
  isOnboarded: boolean;
  friends: string[];
}

export interface FriendRequest {
  _id: string;
  sender: User;
}

export interface AcceptedRequest {
  _id: string;
  recipient: User;
}

export const signup = async (signupData : SignupData): Promise<User> => {
  const res = await axiosInstance.post("/auth/signup", signupData);
  return res?.data;
};

export const login = async (loginData:LoginData): Promise<User> => {
  const res = await axiosInstance.post("/auth/login", loginData);
  return res?.data;
};

export const logout = async () => {
  const res = await axiosInstance.post("/auth/logout");
  return res?.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("error in get auth user: ", error);
    return null;
  }
};

export const completeOnboarding = async (userData: Partial<User>) => {
  const res = await axiosInstance.post("/auth/onboarding", userData);
  return res?.data;
};

export const getUserFriends = async () => {
  const res = await axiosInstance.get("/users/friends");
  return res?.data;
};

export const getRecomendedUsers = async () => {
  const res = await axiosInstance.get("/users");
  return res?.data;
};

export const getOutgoingFriendRequests = async () => {
  const res = await axiosInstance.get("/users/outgoing-friend-requests");
  return res?.data;
};

export const sendFriendRequest = async (userId: string) => {
  const res = await axiosInstance.post(`/users/friend-request/${userId}`);
  return res?.data;
};

export const getFriendRequests = async () => {
  const res = await axiosInstance.get(`/users/friend-requests`);
  return res?.data;
};

export const acceptFriendRequest = async (requestId: string) => {
  const res = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return res?.data;
};

export const getStreamToken = async () => {
  const res = await axiosInstance.get(`/chat/token`);
  return res?.data;
};