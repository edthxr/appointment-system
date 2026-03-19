import { NextResponse } from 'next/server';

export type APIResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unreadCount?: number;
  };
};

export const apiResponse = {
  success: <T>(data: T, message?: string, status = 200, pagination?: APIResponse['pagination']) => {
    return NextResponse.json({ success: true, data, message, pagination }, { status });
  },
  error: (error: string, status = 400) => {
    return NextResponse.json({ success: false, error }, { status });
  },
};
