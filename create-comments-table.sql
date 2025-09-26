-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_is_approved ON comments(is_approved);

-- Create RLS policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read approved comments
CREATE POLICY "Anyone can read approved comments" ON comments
  FOR SELECT USING (is_approved = true);

-- Policy: Anyone can insert comments (they will be pending approval)
CREATE POLICY "Anyone can insert comments" ON comments
  FOR INSERT WITH CHECK (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_comments_updated_at 
  BEFORE UPDATE ON comments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
