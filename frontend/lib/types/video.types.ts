// ─── Video Guide Types ──────────────────────────────────────
export interface VideoGuide {
  id: number;
  thumbnail: string;
  title: string;
  youtubeUrl: string;
  duration: string;
}

export interface VideoState {
  videos: VideoGuide[];
  isLoading: boolean;

  // Actions
  fetchVideos: () => Promise<void>;
}
