-- ============================================================
--  TypeSpeed – MySQL Schema
--  Compatible with Aiven for MySQL (8.x)
-- ============================================================

CREATE DATABASE IF NOT EXISTS typespeed
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE typespeed;

-- ── Users (populated on first Google login) ──────────────────
CREATE TABLE IF NOT EXISTS users (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    google_id   VARCHAR(128)    NOT NULL,
    email       VARCHAR(255)    NOT NULL,
    name        VARCHAR(255),
    avatar_url  TEXT,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_google_id (google_id),
    UNIQUE KEY uq_email     (email)
) ENGINE=InnoDB;

-- ── Typing session scores ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS scores (
    id                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id           INT UNSIGNED,                          -- NULL = guest
    username          VARCHAR(255)    NOT NULL DEFAULT 'Guest',
    net_wpm           DECIMAL(7,2)    NOT NULL,
    accuracy          DECIMAL(5,2)    NOT NULL,              -- 0-100 %
    raw_wpm           DECIMAL(7,2)    NOT NULL,
    duration_seconds  SMALLINT        NOT NULL DEFAULT 60,
    mistakes          SMALLINT        NOT NULL DEFAULT 0,
    wpm_history       JSON,                                  -- [[sec, wpm], …]
    created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY  (id),
    KEY idx_net_wpm    (net_wpm DESC),
    KEY idx_user_id    (user_id),
    KEY idx_created_at (created_at DESC),

    CONSTRAINT fk_scores_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── Leaderboard view (top 10, one row per user – best score) ──
CREATE OR REPLACE VIEW leaderboard_top10 AS
SELECT
    u.id                        AS user_id,
    COALESCE(u.name, 'Guest')   AS username,
    u.avatar_url,
    MAX(s.net_wpm)              AS best_wpm,
    ROUND(AVG(s.accuracy), 2)   AS avg_accuracy,
    COUNT(*)                    AS sessions_played
FROM scores s
LEFT JOIN users u ON s.user_id = u.id
GROUP BY u.id, u.name, u.avatar_url
ORDER BY best_wpm DESC
LIMIT 10;
