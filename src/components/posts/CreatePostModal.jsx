import React from 'react';
import { Modal } from '../common/Modal';
import { PostComposer } from './PostComposer';

export function CreatePostModal({ isOpen, onClose, onPost }) {
  const handlePost = (content, image) => {
    onPost(content, image);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Post">
      <PostComposer onPost={handlePost} />
    </Modal>
  );
}
