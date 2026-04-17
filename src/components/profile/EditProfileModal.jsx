import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import './EditProfileModal.scss';

export function EditProfileModal({ isOpen, onClose, initialData, onSave }) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [previews, setPreviews] = useState({
    avatar: initialData.avatar,
    banner: initialData.banner
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setPreviews({
        avatar: initialData.avatar,
        banner: initialData.banner
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result }));
        setPreviews(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.username?.trim()) newErrors.username = 'Username is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form className="edit-profile-form" onSubmit={handleSubmit}>
        <div className="image-uploads">
          <div className="banner-upload">
            <label>Banner Photo</label>
            <div className="banner-preview" style={{ backgroundImage: `url(${previews.banner})` }}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleImageChange(e, 'banner')} 
              />
              <span className="upload-label">Change Banner</span>
            </div>
          </div>
          
          <div className="avatar-upload">
            <label>Profile Picture</label>
            <div className="avatar-preview">
              <img src={previews.avatar || `https://ui-avatars.com/api/?name=${formData.username}&background=random`} alt="Avatar" />
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleImageChange(e, 'avatar')} 
              />
              <div className="overlay">Change</div>
            </div>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            rows="3"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="website">Website</label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-save">
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
