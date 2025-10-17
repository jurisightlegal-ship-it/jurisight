'use client';

import { useState } from 'react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

export default function TestEditorPage() {
  const [value, setValue] = useState('');
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Editor Test Page</h1>
      <RichTextEditor
        content=""
        onChange={setValue}
        userId="test-user"
      />
      <div id="editor-html" className="mt-4 text-sm text-gray-600" data-html={value}>
        {value}
      </div>
    </div>
  );
}


