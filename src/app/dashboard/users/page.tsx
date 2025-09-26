'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/ui/image-upload';
import { getImageDisplayUrl } from '@/lib/client-storage-utils';
import { 
  Users, 
  UserCheck, 
  UserX,
  Mail,
  Calendar,
  Shield,
  Plus,
  X,
  Edit,
  Key
} from 'lucide-react';
import { userUpdateEvents } from '@/lib/user-updates';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  bio: string | null;
  image: string | null;
  linkedinUrl: string | null;
  personalEmail: string | null;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'CONTRIBUTOR',
    password: '',
    bio: '',
    image: '',
    linkedinUrl: '',
    personalEmail: ''
  });
  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    role: 'CONTRIBUTOR',
    password: '',
    bio: '',
    image: '',
    linkedinUrl: '',
    personalEmail: '',
    isActive: true
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [addingUser, setAddingUser] = useState(false);
  const [updatingUser, setUpdatingUser] = useState(false);
  const [resolvedImageUrls, setResolvedImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/dashboard/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    } else {
      fetchUsers();
    }
  }, [status, session, router]);

  // Resolve image URLs when users are loaded
  useEffect(() => {
    const resolveImageUrls = async () => {
      const resolvedUrls: Record<string, string> = {};
      
      for (const user of users) {
        if (user.image) {
          try {
            const resolvedUrl = await getImageDisplayUrl(user.image);
            if (resolvedUrl) {
              resolvedUrls[user.id] = resolvedUrl;
            }
          } catch (error) {
            console.error(`Error resolving image for user ${user.id}:`, error);
            // Continue with other users even if one fails
          }
        }
      }
      
      setResolvedImageUrls(resolvedUrls);
    };

    if (users.length > 0) {
      resolveImageUrls();
    }
  }, [users]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-jurisight-royal"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      CONTRIBUTOR: { color: 'bg-blue-100 text-blue-800', icon: Users },
      EDITOR: { color: 'bg-purple-100 text-purple-800', icon: Shield },
      ADMIN: { color: 'bg-red-100 text-red-800', icon: Shield },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.CONTRIBUTOR;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {role}
      </Badge>
    );
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const user = users.find(u => u.id === userId);
    const action = currentStatus ? 'deactivate' : 'activate';
    const newStatus = currentStatus ? 'inactive' : 'active';
    
    if (!confirm(`Are you sure you want to ${action} ${user?.name || 'this user'}? They will be ${newStatus} and ${currentStatus ? 'unable to access the platform' : 'able to access the platform'}.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/dashboard/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      
      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, isActive: !currentStatus } : user
        ));
        
        // Emit user update event to notify other components
        const updatedUser = { ...user, isActive: !currentStatus };
        const updateData = {
          name: user?.name || undefined,
          email: user?.email,
          role: user?.role,
          isActive: !currentStatus,
          bio: user?.bio || undefined,
          image: user?.image || undefined,
          linkedinUrl: user?.linkedinUrl || undefined,
          personalEmail: user?.personalEmail || undefined
        };
        userUpdateEvents.emit('userUpdated', userId, updateData);
        localStorage.setItem('userUpdated', JSON.stringify(updatedUser));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/dashboard/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      
      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);
    
    try {
      const response = await fetch('/api/dashboard/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers([data.user, ...users]);
        setNewUser({ name: '', email: '', role: 'CONTRIBUTOR', password: '', bio: '', image: '', linkedinUrl: '', personalEmail: '' });
        setShowAddUser(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to create user');
    } finally {
      setAddingUser(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUserId(user.id);
    const editData = {
      name: user.name || '',
      email: user.email,
      role: user.role,
      password: '', // Empty password for existing users (only fill when updating)
      bio: user.bio || '',
      image: user.image || '',
      linkedinUrl: user.linkedinUrl || '',
      personalEmail: user.personalEmail || '',
      isActive: user.isActive
    };
    setEditUser(editData);
    setShowEditUser(true);
  };

  const handleUpdatePassword = async (userId: string, password: string) => {
    if (!password || password.length < 6) {
      alert('Password must be at least 6 characters long');
      return false;
    }

    setIsUpdatingPassword(true);
    try {
      const response = await fetch(`/api/dashboard/users/${userId}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Password updated successfully!');
        return true;
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update password');
        return false;
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password');
      return false;
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    
    setUpdatingUser(true);
    
    try {
      // Handle password update separately if provided
      let passwordUpdated = false;
      if (editUser.password && editUser.password.length >= 6) {
        passwordUpdated = await handleUpdatePassword(editingUserId, editUser.password);
        if (!passwordUpdated) {
          setUpdatingUser(false);
          return; // Stop if password update failed
        }
      }

      // Update other user fields (excluding password)
      const { password: _, ...userDataWithoutPassword } = editUser;
      const response = await fetch(`/api/dashboard/users/${editingUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userDataWithoutPassword)
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(users.map(u => u.id === editingUserId ? data.user : u));
        
        // Emit user update event to notify other components
        const updateData = {
          name: data.user.name || undefined,
          email: data.user.email,
          role: data.user.role,
          isActive: data.user.isActive,
          bio: data.user.bio || undefined,
          image: data.user.image || undefined,
          linkedinUrl: data.user.linkedinUrl || undefined,
          personalEmail: data.user.personalEmail || undefined
        };
        userUpdateEvents.emit('userUpdated', editingUserId, updateData);
        
        // Also store in localStorage for cross-tab communication
        localStorage.setItem('userUpdated', JSON.stringify(data.user));
        
        // If the current logged-in user was edited, trigger session refresh
        if (session?.user?.id === editingUserId) {
          // Force session refresh by reloading the page
          window.location.reload();
        }
        
        const successMessage = passwordUpdated 
          ? 'User updated successfully! Password has been changed.' 
          : 'User updated successfully!';
        alert(successMessage);
        
        setShowEditUser(false);
        setEditingUserId(null);
        setEditUser({ name: '', email: '', role: 'CONTRIBUTOR', password: '', bio: '', image: '', linkedinUrl: '', personalEmail: '', isActive: true });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditUser(false);
    setEditingUserId(null);
    setEditUser({ name: '', email: '', role: 'CONTRIBUTOR', password: '', bio: '', image: '', linkedinUrl: '', personalEmail: '', isActive: true });
  };

  const handleQuickPasswordUpdate = (userId: string) => {
    setPasswordUserId(userId);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const handlePasswordModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUserId || !newPassword) return;

    const success = await handleUpdatePassword(passwordUserId, newPassword);
    if (success) {
      setShowPasswordModal(false);
      setPasswordUserId(null);
      setNewPassword('');
    }
  };

  const userStats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    contributors: users.filter(u => u.role === 'CONTRIBUTOR').length,
    editors: users.filter(u => u.role === 'EDITOR').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="mr-4"
              >
                ← Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-jurisight-navy">User Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{userStats.total} total users</span>
              <Button
                onClick={() => setShowAddUser(true)}
                className="bg-jurisight-royal text-black hover:bg-jurisight-royal-dark"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-jurisight-royal/10 rounded-lg">
                    <Users className="h-6 w-6 text-jurisight-royal" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-jurisight-navy">{userStats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-jurisight-navy">{userStats.active}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Contributors</p>
                    <p className="text-2xl font-bold text-jurisight-navy">{userStats.contributors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Editors & Admins</p>
                    <p className="text-2xl font-bold text-jurisight-navy">{userStats.editors + userStats.admins}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Users</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-jurisight-royal/10 rounded-full flex items-center justify-center">
                          {resolvedImageUrls[user.id] ? (
                            <Image 
                              src={resolvedImageUrls[user.id]} 
                              alt={user.name || 'User'} 
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full"
                              onError={(e) => {
                                console.error(`Image load error for user ${user.id}:`, e);
                                setResolvedImageUrls(prev => {
                                  const updated = { ...prev };
                                  delete updated[user.id];
                                  return updated;
                                });
                              }}
                            />
                          ) : (
                            <span className="text-jurisight-royal font-semibold text-lg">
                              {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-jurisight-navy">
                            {user.name || 'No name set'}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          {getRoleBadge(user.role)}
                          <div className="mt-2">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              <div className={`w-2 h-2 rounded-full mr-1 ${
                                user.isActive ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            title="Edit user"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickPasswordUpdate(user.id)}
                            className="text-purple-600 border-purple-200 hover:bg-purple-50"
                            title="Update password"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                            className={`transition-colors ${
                              user.isActive 
                                ? 'text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300' 
                                : 'text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300'
                            }`}
                            title={user.isActive ? 'Deactivate user' : 'Activate user'}
                          >
                            {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          <select
                            value={user.role}
                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                            className="text-xs border rounded px-2 py-1"
                          >
                            <option value="CONTRIBUTOR">Contributor</option>
                            <option value="EDITOR">Editor</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-jurisight-navy">Add New User</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowAddUser(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <form onSubmit={handleAddUser} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal"
                      required
                      minLength={6}
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal"
                    >
                      <option value="CONTRIBUTOR">Contributor</option>
                      <option value="EDITOR">Editor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>

                {/* Right Column - Additional Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio (Optional)
                    </label>
                    <textarea
                      value={newUser.bio}
                      onChange={(e) => setNewUser({ ...newUser, bio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal"
                      rows={4}
                      placeholder="Brief description about the user..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Avatar Image (Optional)
                    </label>
                    <ImageUpload
                      currentImage={newUser.image}
                      onImageChange={(imageUrl) => setNewUser({ ...newUser, image: imageUrl })}
                      userId={`temp-${Date.now()}`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={newUser.linkedinUrl}
                      onChange={(e) => setNewUser({ ...newUser, linkedinUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Personal Email ID (Optional)
                    </label>
                    <input
                      type="email"
                      value={newUser.personalEmail}
                      onChange={(e) => setNewUser({ ...newUser, personalEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal"
                      placeholder="personal@example.com"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddUser(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addingUser}
                  className="bg-jurisight-royal text-black hover:bg-jurisight-royal-dark"
                >
                  {addingUser ? 'Adding...' : 'Add User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-jurisight-navy">Edit User</h2>
                <Button variant="ghost" onClick={handleCancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={editUser.name}
                      onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editUser.email}
                      onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={editUser.role}
                      onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal"
                    >
                      <option value="CONTRIBUTOR">Contributor</option>
                      <option value="EDITOR">Editor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setEditUser({ ...editUser, isActive: true })}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          editUser.isActive
                            ? 'bg-green-100 text-green-800 border-2 border-green-300'
                            : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        <UserCheck className="h-4 w-4 inline mr-2" />
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditUser({ ...editUser, isActive: false })}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          !editUser.isActive
                            ? 'bg-red-100 text-red-800 border-2 border-red-300'
                            : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        <UserX className="h-4 w-4 inline mr-2" />
                        Inactive
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password (Optional)
                    </label>
                    <input
                      type="password"
                      value={editUser.password}
                      onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal"
                      minLength={6}
                      placeholder="Leave blank to keep current password"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Only fill this field if you want to change the user&apos;s password
                    </p>
                  </div>
                </div>

                {/* Right Column - Additional Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio (Optional)</label>
                    <textarea
                      value={editUser.bio}
                      onChange={(e) => setEditUser({ ...editUser, bio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal"
                      rows={4}
                      placeholder="Brief description about the user..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Avatar Image (Optional)
                    </label>
                    <ImageUpload
                      currentImage={editUser.image}
                      onImageChange={(imageUrl) => setEditUser({ ...editUser, image: imageUrl })}
                      userId={editingUserId || `edit-${Date.now()}`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL (Optional)</label>
                    <input
                      type="url"
                      value={editUser.linkedinUrl}
                      onChange={(e) => setEditUser({ ...editUser, linkedinUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Personal Email ID (Optional)</label>
                    <input
                      type="email"
                      value={editUser.personalEmail}
                      onChange={(e) => setEditUser({ ...editUser, personalEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal"
                      placeholder="personal@example.com"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updatingUser}
                  className="bg-jurisight-royal text-black hover:bg-jurisight-royal-dark"
                >
                  {updatingUser ? 'Updating...' : 'Update User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Update Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-jurisight-navy">Update Password</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowPasswordModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <form onSubmit={handlePasswordModalSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jurisight-royal"
                    required
                    minLength={6}
                    placeholder="Enter new password (minimum 6 characters)"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  This will update the password for the selected user. They will be able to sign in with this new password.
                </p>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatingPassword || newPassword.length < 6}
                  className="bg-jurisight-royal text-black hover:bg-jurisight-royal-dark"
                >
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
