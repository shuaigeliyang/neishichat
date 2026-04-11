import { Request, Response, NextFunction } from 'express'
import type { ApiResponse } from '../types/index.js'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void {
  console.error('Error:', err)

  const response: ApiResponse = {
    success: false,
    error: err.message || 'Internal server error',
  }

  res.status(500).json(response)
}
