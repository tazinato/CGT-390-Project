-- CreateIndex
CREATE INDEX "AlbumDetails_primaryArtistName_idx" ON "AlbumDetails"("primaryArtistName");

-- CreateIndex
CREATE INDEX "BlobAsset_uploadedById_idx" ON "BlobAsset"("uploadedById");

-- CreateIndex
CREATE INDEX "BlobAsset_purpose_idx" ON "BlobAsset"("purpose");

-- CreateIndex
CREATE INDEX "BlobAsset_createdAt_idx" ON "BlobAsset"("createdAt");

-- CreateIndex
CREATE INDEX "Friendship_status_idx" ON "Friendship"("status");

-- CreateIndex
CREATE INDEX "Friendship_userAId_status_idx" ON "Friendship"("userAId", "status");

-- CreateIndex
CREATE INDEX "Friendship_userBId_status_idx" ON "Friendship"("userBId", "status");

-- CreateIndex
CREATE INDEX "Friendship_actionUserId_status_idx" ON "Friendship"("actionUserId", "status");

-- CreateIndex
CREATE INDEX "Friendship_createdAt_idx" ON "Friendship"("createdAt");

-- CreateIndex
CREATE INDEX "Friendship_updatedAt_idx" ON "Friendship"("updatedAt");

-- CreateIndex
CREATE INDEX "MediaCredit_creditRole_idx" ON "MediaCredit"("creditRole");

-- CreateIndex
CREATE INDEX "MediaCredit_personId_creditRole_idx" ON "MediaCredit"("personId", "creditRole");

-- CreateIndex
CREATE INDEX "MediaCredit_mediaId_billingOrder_idx" ON "MediaCredit"("mediaId", "billingOrder");

-- CreateIndex
CREATE INDEX "MediaExternalRef_provider_idx" ON "MediaExternalRef"("provider");

-- CreateIndex
CREATE INDEX "MediaExternalRef_externalId_idx" ON "MediaExternalRef"("externalId");

-- CreateIndex
CREATE INDEX "MediaExternalRef_provider_externalId_idx" ON "MediaExternalRef"("provider", "externalId");

-- CreateIndex
CREATE INDEX "MediaExternalRef_lastSyncedAt_idx" ON "MediaExternalRef"("lastSyncedAt");

-- CreateIndex
CREATE INDEX "MediaGenre_genreId_idx" ON "MediaGenre"("genreId");

-- CreateIndex
CREATE INDEX "MediaItem_updatedAt_idx" ON "MediaItem"("updatedAt");

-- CreateIndex
CREATE INDEX "MediaItem_type_updatedAt_idx" ON "MediaItem"("type", "updatedAt");

-- CreateIndex
CREATE INDEX "Person_fullName_idx" ON "Person"("fullName");

-- CreateIndex
CREATE INDEX "Person_updatedAt_idx" ON "Person"("updatedAt");

-- CreateIndex
CREATE INDEX "UserMediaEntry_userId_idx" ON "UserMediaEntry"("userId");

-- CreateIndex
CREATE INDEX "UserMediaEntry_status_idx" ON "UserMediaEntry"("status");

-- CreateIndex
CREATE INDEX "UserMediaEntry_lastActivityAt_idx" ON "UserMediaEntry"("lastActivityAt");

-- CreateIndex
CREATE INDEX "UserMediaEntry_createdAt_idx" ON "UserMediaEntry"("createdAt");

-- CreateIndex
CREATE INDEX "UserMediaEntry_updatedAt_idx" ON "UserMediaEntry"("updatedAt");

-- CreateIndex
CREATE INDEX "UserMediaEntry_userId_updatedAt_idx" ON "UserMediaEntry"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "UserMediaEntry_mediaId_updatedAt_idx" ON "UserMediaEntry"("mediaId", "updatedAt");

-- CreateIndex
CREATE INDEX "UserMediaLogEvent_eventType_idx" ON "UserMediaLogEvent"("eventType");

-- CreateIndex
CREATE INDEX "UserMediaLogEvent_userId_createdAt_idx" ON "UserMediaLogEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserMediaLogEvent_mediaId_createdAt_idx" ON "UserMediaLogEvent"("mediaId", "createdAt");

-- CreateIndex
CREATE INDEX "UserMediaLogEvent_entryId_createdAt_idx" ON "UserMediaLogEvent"("entryId", "createdAt");

-- CreateIndex
CREATE INDEX "UserProfile_createdAt_idx" ON "UserProfile"("createdAt");

-- CreateIndex
CREATE INDEX "UserProfile_updatedAt_idx" ON "UserProfile"("updatedAt");

-- CreateIndex
CREATE INDEX "UserProfileFavorite_mediaId_idx" ON "UserProfileFavorite"("mediaId");

-- CreateIndex
CREATE INDEX "UserProfileFavorite_updatedAt_idx" ON "UserProfileFavorite"("updatedAt");
