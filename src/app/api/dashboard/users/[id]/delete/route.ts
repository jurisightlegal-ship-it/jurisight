import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase-db';

// DELETE /api/dashboard/users/[id]/delete - Delete user and all their articles (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if user is authenticated and has admin role
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user's role
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('email', session.user.email)
      .single();

    if (userError || !currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get the user to be deleted
    const { data: userToDelete, error: getUserError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', id)
      .single();

    if (getUserError || !userToDelete) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent admins from deleting other admins
    if (userToDelete.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    // Prevent users from deleting themselves
    if (userToDelete.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 403 }
      );
    }

    // Get articles authored by this user
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, status')
      .eq('author_id', id);

    if (articlesError) {
      console.error('Error fetching articles:', articlesError);
      return NextResponse.json(
        { error: 'Failed to fetch user articles' },
        { status: 500 }
      );
    }

    const articleCount = articles?.length || 0;

    // Delete all articles authored by this user
    if (articleCount > 0) {
      const { error: deleteArticlesError } = await supabase
        .from('articles')
        .delete()
        .eq('author_id', id);

      if (deleteArticlesError) {
        console.error('Error deleting articles:', deleteArticlesError);
        return NextResponse.json(
          { error: 'Failed to delete user articles' },
          { status: 500 }
        );
      }
    }

    // Delete the user from users table
    const { error: deleteUserError } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (deleteUserError) {
      console.error('Error deleting user:', deleteUserError);
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    // Try to delete from auth system
    try {
      await supabase.auth.admin.deleteUser(id);
    } catch (authError) {
      // Auth deletion might fail if user doesn't exist in auth system
      console.log('Auth deletion result:', authError);
    }

    return NextResponse.json({
      success: true,
      message: `User ${userToDelete.name} and ${articleCount} articles deleted successfully`,
      deletedUser: {
        id: userToDelete.id,
        name: userToDelete.name,
        email: userToDelete.email,
        role: userToDelete.role
      },
      deletedArticles: articleCount
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
