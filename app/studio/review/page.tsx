import { StudioReviewWorkspace } from "@/app/studio/_components/StudioReviewWorkspace";
import { loadUnresolvedNoteReviewItems } from "@/lib/builder/review/unresolvedNotes";

export default function StudioReviewPage() {
  try {
    const reviewResult = loadUnresolvedNoteReviewItems(20);

    return (
      <StudioReviewWorkspace
        reviewItems={reviewResult.items}
        pendingReviews={reviewResult.pendingReviews}
        knowledgeHealth={reviewResult.knowledgeHealth}
        currentDatasetVersion={reviewResult.currentDatasetVersion}
        builderVersion={reviewResult.builderVersion}
        knowledgeVersion={reviewResult.knowledgeVersion}
      />
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error while loading review items.";

    return (
      <StudioReviewWorkspace
        reviewItems={[]}
        pendingReviews={0}
        knowledgeHealth="review-required"
        currentDatasetVersion="unknown"
        builderVersion="unknown"
        knowledgeVersion="unknown"
        loadError={message}
      />
    );
  }
}
