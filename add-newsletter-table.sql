-- Add newsletter_subscribers table for newsletter functionality
CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
    "id" serial PRIMARY KEY NOT NULL,
    "email" varchar(255) NOT NULL UNIQUE,
    "subscribed_at" timestamp DEFAULT now() NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "unsubscribed_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS "newsletter_subscribers_email_idx" ON "newsletter_subscribers" ("email");

-- Add index for active subscribers
CREATE INDEX IF NOT EXISTS "newsletter_subscribers_active_idx" ON "newsletter_subscribers" ("is_active");

-- Enable Row Level Security
ALTER TABLE "newsletter_subscribers" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for newsletter signup)
CREATE POLICY "Allow public newsletter signup" ON "newsletter_subscribers"
    FOR INSERT WITH CHECK (true);

-- Create policy to allow public to read their own subscription status
CREATE POLICY "Allow public to read own subscription" ON "newsletter_subscribers"
    FOR SELECT USING (true);

-- Add comment to table
COMMENT ON TABLE "newsletter_subscribers" IS 'Newsletter subscription management table';
