-- Records every outbound message attempt. Additive and written to only by the
-- send helpers, so nothing existing changes behaviour.

CREATE TABLE IF NOT EXISTS "message_logs" (
    "id"         TEXT NOT NULL,
    "channel"    TEXT NOT NULL,
    "template"   TEXT NOT NULL,
    "recipient"  TEXT NOT NULL,
    "userId"     TEXT,
    "ok"         BOOLEAN NOT NULL,
    "providerId" TEXT,
    "error"      TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "message_logs_channel_createdAt_idx"  ON "message_logs"("channel", "createdAt");
CREATE INDEX IF NOT EXISTS "message_logs_template_createdAt_idx" ON "message_logs"("template", "createdAt");
CREATE INDEX IF NOT EXISTS "message_logs_userId_createdAt_idx"   ON "message_logs"("userId", "createdAt");
