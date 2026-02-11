import React from 'react'

const TagPreview = ({ watchTag }) => {
  return (
    <div className="form-row">
      <div className="form-field">
        <span className="preview-label">Preview</span>
        <div className="tag-preview-container">
          <span
            className="tag-preview-badge"
            style={{
              '--tag-color': watchTag('cor') || '#2563eb',
            }}
          >
            {watchTag('nome') || 'Nome da Tag'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default TagPreview
