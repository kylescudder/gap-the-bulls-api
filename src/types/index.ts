export interface CreateUserRequest {
  name: string;
  teamId: number;
}

export interface UpdateUserRequest {
  name?: string;
  teamId?: number;
}

export interface CreateTeamRequest {
  name: string;
}

export interface UpdateTeamRequest {
  name?: string;
}

export interface CreateScoreRequest {
  userId: number;
  score: number;
}

export interface UpdateScoreRequest {
  score?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
