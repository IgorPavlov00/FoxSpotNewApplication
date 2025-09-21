// app/(auth)/_layout.tsx
import { Stack, Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export default function AuthLayout() {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        const fetchSession = async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
            setLoading(false);
        };
        fetchSession();
    }, []);

    if (loading) return null;

    // Always redirect to landing after login
    if (session) return <Redirect href="/landing" />;

    return <Stack screenOptions={{ headerShown: false }} />;
}