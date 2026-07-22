let refreshPromise: Promise<string> | null = null;

export const refreshState = {
  get isRefreshing(): boolean {
    return refreshPromise !== null;
  },

  run(refreshAccessToken: () => Promise<string>): Promise<string> {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    return refreshPromise;
  },
};
