// ─── Store Barrel Index ─────────────────────────────────────
// Import all stores from a single path:
//   import { useAuthStore, useTenderStore } from "@/store"

// ── Stores ──────────────────────────────────────────────────
export { useAuthStore } from "./auth/auth.store";
export { useVendorStore } from "./vendor/vendor.store";
export { useTenderStore } from "./tender/tender.store";
export { useEvaluationStore } from "./evaluation/evaluation.store";
export { useNotificationStore } from "./notification/notification.store";
export { useNewsStore } from "./news/news.store";
export { useVideoStore } from "./video/video.store";
export { useHeroStore } from "./hero/hero.store";

// ── Auth selectors ───────────────────────────────────────────
export {
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectAuthLoading,
} from "./auth/auth.store";

// ── Vendor selectors ─────────────────────────────────────────
export {
  selectVendors,
  selectSelectedVendor,
  selectVendorLoading,
  selectKycStatus,
} from "./vendor/vendor.store";

// ── Tender selectors ─────────────────────────────────────────
export {
  selectTenders,
  selectSelectedTender,
  selectTenderFilters,
  selectTenderLoading,
  selectOpenTenders,
} from "./tender/tender.store";

// ── Evaluation selectors ─────────────────────────────────────
export {
  selectScores,
  selectCriteria,
  selectCommitteeInputs,
  selectEvaluationLoading,
} from "./evaluation/evaluation.store";

// ── Notification selectors ───────────────────────────────────
export {
  selectNotifications,
  selectUnreadCount,
  selectUnread,
  selectNotificationLoading,
} from "./notification/notification.store";

// ── News selectors ───────────────────────────────────────────
export {
  selectAllNewsItems,
  selectActiveTab,
  selectFilteredNews,
  selectNewsLoading,
} from "./news/news.store";

// ── Video selectors ──────────────────────────────────────────
export {
  selectVideos,
  selectVideoLoading,
} from "./video/video.store";

// ── Hero selectors ───────────────────────────────────────────
export {
  selectSlides,
  selectCategories,
  selectCurrentSlide,
  selectCurrentSlideIndex,
  selectSearchQuery,
  selectSelectedCategory,
} from "./hero/hero.store";
