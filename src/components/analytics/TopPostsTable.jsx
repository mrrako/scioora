import React from 'react';
import { Heart, MessageCircle, BarChart2 } from 'lucide-react';
import './TopPostsTable.scss';

export function TopPostsTable({ posts }) {
  return (
    <div className="top-posts-card">
      <div className="card-header">
        <BarChart2 size={20} />
        <h4>Top Performing Posts</h4>
      </div>
      <div className="posts-table-wrapper">
        <table className="posts-table">
          <thead>
            <tr>
              <th>Content Preview</th>
              <th>Likes</th>
              <th>Comments</th>
              <th>Total Eng.</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="content-cell">
                  <p>
                    {typeof post.content === 'string' 
                      ? `${post.content.substring(0, 60)}...` 
                      : 'Media/Content unavailable'}
                  </p>
                </td>
                <td>
                  <div className="stat">
                    <Heart size={14} className="icon like" />
                    <span>{post.likes}</span>
                  </div>
                </td>
                <td>
                  <div className="stat">
                    <MessageCircle size={14} className="icon comment" />
                    <span>{post.comments}</span>
                  </div>
                </td>
                <td>
                  <span className="engagement-badge">{post.engagement}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
