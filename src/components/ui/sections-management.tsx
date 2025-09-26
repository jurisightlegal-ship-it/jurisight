'use client';

import { useState, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { 
  X, 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen,
  Save,
  Search,
  AlertTriangle,
  Palette
} from 'lucide-react';

interface Section {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string | null;
  created_at: string;
  articleCount?: number;
}

interface SectionsManagementProps {
  onClose: () => void;
}

const colorOptions = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6B7280', // Gray
];

export const SectionsManagement = ({ onClose }: SectionsManagementProps) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: colorOptions[0],
    icon: ''
  });

  // Error handling
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch sections
  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sections');
      if (response.ok) {
        const data = await response.json();
        setSections(data.sections || []);
      } else {
        setError('Failed to fetch sections');
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setError('Failed to fetch sections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const resetForm = () => {
    setFormData({ 
      name: '', 
      description: '', 
      color: colorOptions[0], 
      icon: '' 
    });
    setShowAddForm(false);
    setEditingSection(null);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const url = editingSection ? `/api/sections/${editingSection.id}` : '/api/sections';
      const method = editingSection ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(editingSection ? 'Section updated successfully!' : 'Section created successfully!');
        await fetchSections();
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save section');
      }
    } catch (error) {
      console.error('Error saving section:', error);
      setError('Failed to save section');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      description: section.description || '',
      color: section.color,
      icon: section.icon || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (section: Section) => {
    if (!confirm(`Are you sure you want to delete the section "${section.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/sections/${section.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess('Section deleted successfully!');
        await fetchSections();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete section');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      setError('Failed to delete section');
    }
  };

  const filteredSections = sections.filter(section =>
    section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (section.description && section.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Manage Legal Sections
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Create and manage legal practice areas for content organization
            </p>
          </div>
          
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          
          {/* Sections List */}
          <div className="flex-1 p-6 overflow-y-auto">
            
            {/* Search and Add Button */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search sections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            {/* Sections Grid */}
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading sections...</div>
            ) : filteredSections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No sections found matching your search.' : 'No sections created yet.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSections.map((section) => (
                  <Card key={section.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: section.color }}
                            />
                            <CardTitle className="text-base">{section.name}</CardTitle>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {section.articleCount || 0} articles
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(section)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(section)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {section.description && (
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600">{section.description}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Add/Edit Form Sidebar */}
          {showAddForm && (
            <div className="w-80 border-l border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingSection ? 'Edit Section' : 'Add New Section'}
                </h3>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Section Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Constitutional Law"
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL slug will be auto-generated
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this legal section"
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Section Color *
                  </Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                  <Input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#3B82F6"
                    className="mt-2 text-sm"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>

                <div>
                  <Label htmlFor="icon">Icon (optional)</Label>
                  <Input
                    id="icon"
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="e.g., scale, gavel, book"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Icon name for display (optional)
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Saving...' : editingSection ? 'Update' : 'Create'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
