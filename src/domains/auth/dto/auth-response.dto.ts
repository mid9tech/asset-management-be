export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiredAccessToken: number;
  expiredRefreshToken: number;
  user: {
    id: number;
    username: string;
  };
}
