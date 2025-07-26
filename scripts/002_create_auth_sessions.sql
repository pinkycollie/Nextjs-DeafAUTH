-- Create auth sessions table for enhanced session management
CREATE TABLE IF NOT EXISTS auth_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_active ON auth_sessions(is_active);

-- Enable RLS
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own sessions" ON auth_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON auth_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM auth_sessions 
    WHERE expires_at < NOW() OR last_activity < (NOW() - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql;

-- Create function to update last activity
CREATE OR REPLACE FUNCTION update_session_activity(session_token_param VARCHAR)
RETURNS void AS $$
BEGIN
    UPDATE auth_sessions 
    SET last_activity = NOW()
    WHERE session_token = session_token_param AND is_active = true;
END;
$$ LANGUAGE plpgsql;
