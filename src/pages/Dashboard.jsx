import { PostComposer } from '../components/posts/PostComposer';
import { PostList } from '../components/posts/PostList';
import { StoryBar } from '../components/stories/StoryBar';
import { TrendingSection } from '../components/search/TrendingSection';
import { usePosts } from '../hooks/usePosts';
import { useStories } from '../hooks/useStories';
import './Dashboard.scss';

export default function Dashboard() {
  const { 
    posts, 
    addPost, 
    deletePost, 
    editPost, 
    toggleLike,
    addComment,
    deleteComment,
    hasMore,
    loadMore,
    loadingMore
  } = usePosts();

  const { stories, addStory, toggleHighlight } = useStories();

  return (
    <div className="dashboard-layout">
      <div className="main-feed">
        <h2 className="page-title">Home</h2>
        <StoryBar 
          stories={stories} 
          onAddStory={addStory} 
          onToggleHighlight={toggleHighlight} 
        />
        <PostComposer onPost={addPost} />
        <PostList 
          posts={posts} 
          onDeletePost={deletePost}
          onEditPost={editPost}
          onLikePost={toggleLike}
          onAddComment={addComment}
          onDeleteComment={deleteComment}
          hasMore={hasMore}
          loadMore={loadMore}
          loadingMore={loadingMore}
        />
      </div>
      
      <aside className="right-sidebar">
        <TrendingSection />
      </aside>
    </div>
  );
}
