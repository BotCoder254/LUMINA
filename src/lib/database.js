import { supabase } from './supabaseClient';

// Available categories
export const POST_CATEGORIES = [
    'technology',
    'lifestyle',
    'travel',
    'food',
    'health',
    'business',
    'other'
];

// Available post statuses
export const POST_STATUSES = [
    'draft',
    'published',
    'archived'
];

export async function resetDatabase() {
    try {
        // Create profiles table
        const { error: profileError } = await supabase.from('profiles')
            .upsert([
                {
                    id: '00000000-0000-0000-0000-000000000000',
                    username: 'system',
                    full_name: 'System Account',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ], { ignoreDuplicates: true });

        if (profileError) {
            console.error('Error setting up profiles:', profileError);
            return { success: false, error: profileError.message };
        }

        // Enable RLS on profiles
        await supabase.rpc('enable_rls', { table_name: 'profiles' });

        // Create RLS policies for profiles
        await supabase.rpc('create_policy', {
            table_name: 'profiles',
            policy_name: 'Public profiles are viewable by everyone',
            definition: 'true',
            command: 'SELECT'
        });

        await supabase.rpc('create_policy', {
            table_name: 'profiles',
            policy_name: 'Users can update own profile',
            definition: 'auth.uid() = id',
            command: 'UPDATE'
        });

        console.log('Database setup successful');
        return { success: true, error: null };
    } catch (error) {
        console.error('Database setup failed:', error);
        return { success: false, error: error.message };
    }
}

export async function createProfile(user) {
    try {
        if (!user) throw new Error('No user provided');

        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
                full_name: user.user_metadata?.full_name || null,
                avatar_url: user.user_metadata?.avatar_url || null,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error creating profile:', error);
        return { data: null, error };
    }
}

export async function getProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching profile:', error);
        return { data: null, error };
    }
}

export async function getUserPosts(userId) {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                author:author_id (
                    id,
                    username,
                    full_name,
                    avatar_url
                )
            `)
            .eq('author_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching user posts:', error);
        return { data: null, error };
    }
}

export async function getAllPosts() {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                author:author_id (
                    id,
                    username,
                    full_name,
                    avatar_url
                )
            `)
            .eq('status', 'published')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching posts:', error);
        return { data: null, error };
    }
}

export async function getPostsByCategory(category) {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                author:author_id (
                    id,
                    username,
                    full_name,
                    avatar_url
                )
            `)
            .eq('category', category)
            .eq('status', 'published')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching posts by category:', error);
        return { data: null, error };
    }
}

export async function createPost({ title, content, category = 'other', image_url = null, status = 'published' }) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Validate category
        if (!POST_CATEGORIES.includes(category)) {
            category = 'other';
        }

        // Validate status
        if (!POST_STATUSES.includes(status)) {
            status = 'published';
        }

        const { data, error } = await supabase
            .from('posts')
            .insert([
                {
                    title,
                    content,
                    category,
                    image_url,
                    status,
                    author_id: user.id
                }
            ])
            .select(`
                *,
                author:author_id (
                    id,
                    username,
                    full_name,
                    avatar_url
                )
            `)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error creating post:', error);
        return { data: null, error };
    }
}

export async function updatePost(postId, updates) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Validate category if provided
        if (updates.category && !POST_CATEGORIES.includes(updates.category)) {
            updates.category = 'other';
        }

        // Validate status if provided
        if (updates.status && !POST_STATUSES.includes(updates.status)) {
            updates.status = 'published';
        }

        const { data, error } = await supabase
            .from('posts')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', postId)
            .eq('author_id', user.id)
            .select(`
                *,
                author:author_id (
                    id,
                    username,
                    full_name,
                    avatar_url
                )
            `)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error updating post:', error);
        return { data: null, error };
    }
}

export async function updateProfile(profile) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                ...profile,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error updating profile:', error);
        return { data: null, error };
    }
}

export async function getPost(postId) {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                author:author_id (
                    id,
                    username,
                    full_name,
                    avatar_url
                )
            `)
            .eq('id', postId)
            .single();
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching post:', error);
        return { data: null, error };
    }
}

export async function deletePost(postId) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId)
            .eq('author_id', user.id);

        if (error) throw error;
        return { success: true, error: null };
    } catch (error) {
        console.error('Error deleting post:', error);
        return { success: false, error };
    }
}