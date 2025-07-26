-- Create accessibility profiles table for user preferences
CREATE TABLE IF NOT EXISTS accessibility_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    high_contrast BOOLEAN DEFAULT false,
    haptic_feedback BOOLEAN DEFAULT true,
    audio_feedback BOOLEAN DEFAULT true,
    font_size VARCHAR(10) DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_accessibility_profiles_user_id ON accessibility_profiles(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE accessibility_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only access their own accessibility profiles
CREATE POLICY "Users can view their own accessibility profiles" ON accessibility_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own accessibility profiles" ON accessibility_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accessibility profiles" ON accessibility_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create accessibility profile for new users
CREATE OR REPLACE FUNCTION create_accessibility_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO accessibility_profiles (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create accessibility profile when user signs up
CREATE TRIGGER create_accessibility_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_accessibility_profile();
