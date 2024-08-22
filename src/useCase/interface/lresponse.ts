import User from "../../domain/user";

export interface SignUpResponse {
    status: number;
    data?: {
      status: boolean;
      message: string;
    };
  }

export interface LoginResponse {
    status: number;
    data?: {
      status: boolean;
      message: string;
      payload?: {}
    };
  }