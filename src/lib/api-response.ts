import { NextResponse } from 'next/server';

export type APIResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export const apiResponse = {
  success: <T>(data: T, message?: string, status = 200) => {
    return NextResponse.json({ success: true, data, message }, { status });
  },
  error: (error: string, status = 400) => {
    return NextResponse.json({ success: false, error }, { status });
  },
};
