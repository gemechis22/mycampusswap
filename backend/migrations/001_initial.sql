-- 001_initial.sql
-- Core schema for MyCampusSwap (C2C Marketplace with light admin oversight)
-- Focus: simplicity + clarity for learning and EECS4413 presentation.

CREATE TABLE app_user (
  id            SERIAL PRIMARY KEY,
  university_email VARCHAR(120) UNIQUE NOT NULL,
  display_name  VARCHAR(60) NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student','admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE category (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(200)
);

CREATE TABLE listing (
  id              SERIAL PRIMARY KEY,
  seller_id       INT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  category_id     INT REFERENCES category(id),
  title           VARCHAR(120) NOT NULL,
  description     TEXT,
  price_cents     INT NOT NULL CHECK (price_cents >= 0),
  condition       VARCHAR(20) NOT NULL DEFAULT 'unknown' CHECK (condition IN ('new','like_new','good','fair','poor','unknown')),
  status          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','active','reserved','sold')), 
  quantity        INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listing_status ON listing(status);
CREATE INDEX idx_listing_category ON listing(category_id);
CREATE INDEX idx_listing_title_tsv ON listing USING GIN (to_tsvector('english', title || ' ' || COALESCE(description,'')));

CREATE TABLE listing_image (
  id         SERIAL PRIMARY KEY,
  listing_id INT NOT NULL REFERENCES listing(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  position   INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE buy_request (
  id            SERIAL PRIMARY KEY,
  listing_id    INT NOT NULL REFERENCES listing(id) ON DELETE CASCADE,
  buyer_id      INT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  status        VARCHAR(20) NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','accepted','declined','cancelled','completed')),
  message       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(listing_id, buyer_id)  -- prevent duplicate active requests per buyer/listing
);

CREATE INDEX idx_buy_request_status ON buy_request(status);

CREATE TABLE transaction_record (
  id              SERIAL PRIMARY KEY,
  listing_id      INT NOT NULL REFERENCES listing(id) ON DELETE SET NULL,
  buyer_id        INT NOT NULL REFERENCES app_user(id) ON DELETE SET NULL,
  seller_id       INT NOT NULL REFERENCES app_user(id) ON DELETE SET NULL,
  agreed_price_cents INT NOT NULL CHECK (agreed_price_cents >= 0),
  quantity        INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status          VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','disputed','reversed')),
  completed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transaction_seller ON transaction_record(seller_id);
CREATE INDEX idx_transaction_buyer ON transaction_record(buyer_id);
CREATE INDEX idx_transaction_listing ON transaction_record(listing_id);

CREATE TABLE user_review (
  id          SERIAL PRIMARY KEY,
  reviewer_id INT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  reviewee_id INT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(reviewer_id, reviewee_id)
);

CREATE TABLE admin_action_log (
  id          SERIAL PRIMARY KEY,
  admin_id    INT NOT NULL REFERENCES app_user(id) ON DELETE SET NULL,
  action_type VARCHAR(40) NOT NULL,
  target_type VARCHAR(40) NOT NULL,
  target_id   INT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Basic trigger to auto-update updated_at on mutable tables
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_touch_listing BEFORE UPDATE ON listing
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER trg_touch_buy_request BEFORE UPDATE ON buy_request
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Seed minimal categories (example)
INSERT INTO category(name, description) VALUES
  ('Textbooks','Course required and reference materials'),
  ('Electronics','Laptops, tablets, calculators'),
  ('Furniture','Dorm and apartment items')
ON CONFLICT DO NOTHING;

-- Notes:
-- 1. We skip payment integration; transactions are logged post-meetup.
-- 2. listing.status workflow: pending->approved->active->reserved->sold.
-- 3. buy_request drives reservation & eventual transaction creation (to be implemented in service layer).
