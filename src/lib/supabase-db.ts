import { createClient } from '@supabase/supabase-js';

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Alternative database functions using Supabase client
export class SupabaseDB {
  // Get dashboard statistics
  static async getDashboardStats() {
    try {
      // Get articles stats
      const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select('status, views, scheduled_at');
      
      if (articlesError) throw articlesError;

      // Get users stats
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('role, is_active');
      
      if (usersError) throw usersError;

      // Calculate statistics
      const totalArticles = articles?.length || 0;
      const publishedArticles = articles?.filter(a => a.status === 'PUBLISHED').length || 0;
      const inReviewArticles = articles?.filter(a => a.status === 'IN_REVIEW').length || 0;
      const draftArticles = articles?.filter(a => a.status === 'DRAFT').length || 0;
      const scheduledArticles = articles?.filter(a => a.status === 'SCHEDULED').length || 0;
      const totalViews = articles?.reduce((sum, a) => sum + (a.views || 0), 0) || 0;

      const totalUsers = users?.length || 0;
      const activeUsers = users?.filter(u => u.is_active).length || 0;
      const contributors = users?.filter(u => u.role === 'CONTRIBUTOR').length || 0;
      const editors = users?.filter(u => u.role === 'EDITOR').length || 0;
      const admins = users?.filter(u => u.role === 'ADMIN').length || 0;

      return {
        articles: {
          total: totalArticles,
          published: publishedArticles,
          inReview: inReviewArticles,
          draft: draftArticles,
          scheduled: scheduledArticles,
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          contributors,
          editors,
          admins,
        },
        engagement: {
          totalViews,
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Get articles for review queue (non-published articles, excluding scheduled)
  static async getReviewQueueArticles(limit = 50) {
    try {
      // Get non-published articles that are NOT scheduled
      const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          dek,
          body,
          status,
          views,
          reading_time,
          published_at,
          created_at,
          updated_at,
          author_id,
          section_id,
          scheduled_at
        `)
        .in('status', ['DRAFT', 'IN_REVIEW', 'NEEDS_REVISIONS', 'APPROVED']) // Only include non-published, non-scheduled articles
        .order('created_at', { ascending: false })
        .limit(limit);

      if (articlesError) throw articlesError;

      if (!articles || articles.length === 0) {
        return [];
      }

      // Get unique author and section IDs
      const authorIds = [...new Set(articles.map(a => a.author_id).filter(Boolean))];
      const sectionIds = [...new Set(articles.map(a => a.section_id).filter(Boolean))];

      // Fetch authors and sections separately
      const [authorsResult, sectionsResult] = await Promise.all([
        authorIds.length > 0 ? supabase
          .from('users')
          .select('id, name, email, image')
          .in('id', authorIds) : Promise.resolve({ data: [], error: null }),
        sectionIds.length > 0 ? supabase
          .from('legal_sections')
          .select('id, name, slug, color')
          .in('id', sectionIds) : Promise.resolve({ data: [], error: null })
      ]);

      const authors = authorsResult.data || [];
      const sections = sectionsResult.data || [];

      // Map articles with their related data
      return articles.map(article => {
        const author = authors.find(a => a.id === article.author_id);
        const section = sections.find(s => s.id === article.section_id);

        return {
          id: article.id,
          title: article.title,
          slug: article.slug,
          dek: article.dek,
          body: article.body,
          status: article.status,
          views: article.views || 0,
          readingTime: article.reading_time || 0,
          publishedAt: article.published_at,
          createdAt: article.created_at,
          updatedAt: article.updated_at,
          author: {
            id: author?.id || article.author_id,
            name: author?.name || null,
            email: author?.email || '',
            avatar: author?.image || null
          },
          section: {
            id: section?.id || article.section_id,
            name: section?.name || 'Unknown',
            slug: section?.slug || 'unknown',
            color: section?.color || '#6B7280'
          }
        };
      });
    } catch (error) {
      console.error('Error fetching review queue articles:', error);
      throw error;
    }
  }

  // Get recent articles
  static async getRecentArticles(limit = 5) {
    try {
      // First get articles
      const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          dek,
          status,
          views,
          reading_time,
          published_at,
          created_at,
          updated_at,
          author_id,
          section_id
        `)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (articlesError) throw articlesError;

      if (!articles || articles.length === 0) {
        return [];
      }

      // Get unique author and section IDs
      const authorIds = [...new Set(articles.map(a => a.author_id).filter(Boolean))];
      const sectionIds = [...new Set(articles.map(a => a.section_id).filter(Boolean))];

      // Fetch authors and sections separately
      const [authorsResult, sectionsResult] = await Promise.all([
        authorIds.length > 0 ? supabase
          .from('users')
          .select('id, name, email, image')
          .in('id', authorIds) : Promise.resolve({ data: [], error: null }),
        sectionIds.length > 0 ? supabase
          .from('legal_sections')
          .select('id, name, slug, color')
          .in('id', sectionIds) : Promise.resolve({ data: [], error: null })
      ]);

      const authors = authorsResult.data || [];
      const sections = sectionsResult.data || [];

      // Map articles with their related data
      return articles.map(article => ({
        ...article,
        author: authors.find(a => a.id === article.author_id) || { id: article.author_id, name: 'Unknown Author', email: '', image: null },
        section: sections.find(s => s.id === article.section_id) || { id: article.section_id, name: 'Uncategorized', slug: 'uncategorized', color: '#6B7280' }
      }));
    } catch (error) {
      console.error('Error fetching recent articles:', error);
      throw error;
    }
  }

  // Get all users
  static async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, is_active, created_at, updated_at, bio, image, linkedin_url, personal_email')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map database fields to frontend interface
      return (data || []).map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.is_active, // Map is_active to isActive
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        bio: user.bio,
        image: user.image,
        linkedinUrl: user.linkedin_url,
        personalEmail: user.personal_email
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Create new user
  static async createUser(userData: {
    name: string;
    email: string;
    role: string;
    bio?: string;
    image?: string;
    linkedinUrl?: string;
    personalEmail?: string;
  }) {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Generate UUID
      const userId = crypto.randomUUID();

      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          bio: userData.bio,
          image: userData.image,
          linkedin_url: userData.linkedinUrl,
          personal_email: userData.personalEmail,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      // Map database fields to frontend interface
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.is_active, // Map is_active to isActive
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        bio: data.bio,
        image: data.image,
        linkedinUrl: data.linkedin_url,
        personalEmail: data.personal_email
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Create new user with password (also creates auth account)
  static async createUserWithPassword(userData: {
    name: string;
    email: string;
    role: string;
    password: string;
    bio?: string;
    image?: string;
    linkedinUrl?: string;
    personalEmail?: string;
  }) {
    try {
      // Check if user already exists in our database
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create the auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.name
        }
      });

      if (authError) {
        console.error('Auth user creation error:', authError);
        throw new Error(`Failed to create authentication account: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Failed to create authentication account');
      }

      // Now create the user record in our users table
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          bio: userData.bio,
          image: userData.image,
          linkedin_url: userData.linkedinUrl,
          personal_email: userData.personalEmail,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        // If user record creation fails, clean up the auth user
        console.error('User record creation error:', error);
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw error;
      }
      
      // Map database fields to frontend interface
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        bio: data.bio,
        image: data.image,
        linkedinUrl: data.linkedin_url,
        personalEmail: data.personal_email
      };
    } catch (error) {
      console.error('Error creating user with password:', error);
      throw error;
    }
  }

  // Update user
  static async updateUser(userId: string, updateData: {
    name?: string;
    email?: string;
    role?: string;
    isActive?: boolean;
    bio?: string;
    image?: string;
    linkedinUrl?: string;
    personalEmail?: string;
  }) {
    try {
      const updatePayload: {
        updated_at: string;
        name?: string;
        email?: string;
        role?: string;
        is_active?: boolean;
        bio?: string;
        image?: string;
        linkedin_url?: string;
        personal_email?: string;
      } = {
        updated_at: new Date().toISOString()
      };

      if (updateData.name !== undefined) updatePayload.name = updateData.name;
      if (updateData.email !== undefined) updatePayload.email = updateData.email;
      if (updateData.role !== undefined) updatePayload.role = updateData.role;
      if (updateData.isActive !== undefined) updatePayload.is_active = updateData.isActive;
      if (updateData.bio !== undefined) updatePayload.bio = updateData.bio;
      if (updateData.image !== undefined) updatePayload.image = updateData.image;
      if (updateData.linkedinUrl !== undefined) updatePayload.linkedin_url = updateData.linkedinUrl;
      if (updateData.personalEmail !== undefined) updatePayload.personal_email = updateData.personalEmail;

      const { data, error } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      // Map database fields to frontend interface
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.is_active, // Map is_active to isActive
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        bio: data.bio,
        image: data.image,
        linkedinUrl: data.linkedin_url,
        personalEmail: data.personal_email
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Update user with optional password change
  static async updateUserWithPassword(userId: string, updateData: {
    name?: string;
    email?: string;
    role?: string;
    isActive?: boolean;
    bio?: string;
    image?: string;
    linkedinUrl?: string;
    personalEmail?: string;
  }, newPassword?: string) {
    try {
      // Handle password update if provided
      if (newPassword && newPassword.length >= 6) {
        try {
          // Try to update existing auth user password first
          const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
            password: newPassword
          });

          if (authError) {
            // If user doesn't exist in auth, create auth account
            if (authError.message.includes('User not found') || authError.message.includes('not found')) {
              console.log(`User ${userId} not found in auth, creating auth account...`);
              
              const { data: userRecord } = await supabase
                .from('users')
                .select('email, name')
                .eq('id', userId)
                .single();
                
              if (!userRecord) {
                throw new Error('User not found in users table');
              }

              // Create auth user for existing user
              const { data: newAuthUser, error: createAuthError } = await supabase.auth.admin.createUser({
                email: userRecord.email,
                password: newPassword,
                email_confirm: true,
                user_metadata: {
                  full_name: userRecord.name
                }
              });

              if (createAuthError) {
                console.error('Failed to create auth account for existing user:', createAuthError);
                throw new Error(`Failed to create authentication account: ${createAuthError.message}`);
              }

              console.log(`Successfully created auth account for user: ${userRecord.email}`);
            } else {
              // Some other auth error
              console.error('Auth password update error:', authError);
              throw new Error(`Failed to update password: ${authError.message}`);
            }
          } else {
            console.log(`Successfully updated password for user: ${userId}`);
          }
        } catch (error) {
          console.error('Password update failed:', error);
          throw error;
        }
      }

      // Update user record in our users table
      const updatePayload: {
        updated_at: string;
        name?: string;
        email?: string;
        role?: string;
        is_active?: boolean;
        bio?: string;
        image?: string;
        linkedin_url?: string;
        personal_email?: string;
      } = {
        updated_at: new Date().toISOString()
      };

      if (updateData.name !== undefined) updatePayload.name = updateData.name;
      if (updateData.email !== undefined) updatePayload.email = updateData.email;
      if (updateData.role !== undefined) updatePayload.role = updateData.role;
      if (updateData.isActive !== undefined) updatePayload.is_active = updateData.isActive;
      if (updateData.bio !== undefined) updatePayload.bio = updateData.bio;
      if (updateData.image !== undefined) updatePayload.image = updateData.image;
      if (updateData.linkedinUrl !== undefined) updatePayload.linkedin_url = updateData.linkedinUrl;
      if (updateData.personalEmail !== undefined) updatePayload.personal_email = updateData.personalEmail;

      const { data, error } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      // Map database fields to frontend interface
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        bio: data.bio,
        image: data.image,
        linkedinUrl: data.linkedin_url,
        personalEmail: data.personal_email
      };
    } catch (error) {
      console.error('Error updating user with password:', error);
      throw error;
    }
  }

  // Create PostgreSQL function for admin password updates
  static async setupAdminPasswordFunction() {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION public.admin_change_user_password(
            target_user_id UUID,
            new_plain_password TEXT
          )
          RETURNS VARCHAR
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            -- Update the password for the specified user
            UPDATE auth.users
            SET 
              encrypted_password = crypt(new_plain_password, gen_salt('bf')),
              updated_at = NOW()
            WHERE id = target_user_id;
            
            IF FOUND THEN
              RETURN 'success';
            ELSE
              RETURN 'user_not_found';
            END IF;
          END;
          $$;
        `
      });

      if (error) {
        console.error('Failed to create admin password function:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error setting up admin password function:', error);
      return false;
    }
  }

  // Update user password using admin function (alternative method)
  static async updateUserPasswordViaFunction(userId: string, newPassword: string) {
    try {
      const { data, error } = await supabase.rpc('admin_change_user_password', {
        target_user_id: userId,
        new_plain_password: newPassword
      });

      if (error) {
        console.error('Error updating password via function:', error);
        throw new Error(`Failed to update password: ${error.message}`);
      }

      if (data === 'user_not_found') {
        throw new Error('User not found in authentication system');
      } else if (data === 'success') {
        return true;
      } else {
        throw new Error('Unexpected response from password update function');
      }
    } catch (error) {
      console.error('Password update via function failed:', error);
      throw error;
    }
  }
}
