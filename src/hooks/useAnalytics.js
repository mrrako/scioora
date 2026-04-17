import { useMemo } from 'react';
import { usePosts, countComments } from './usePosts';

export function useAnalytics() {
  const { posts } = usePosts();

  const stats = useMemo(() => {
    // 1. Process posts for daily engagement
    const engagementData = {};
    const today = new Date();
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      engagementData[dateStr] = { name: dateStr, likes: 0, comments: 0 };
    }

    let totalLikes = 0;
    let totalComments = 0;

    posts.forEach(post => {
      const date = new Date(post.createdAt || post.timestamp);
      const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      
      const likes = Array.isArray(post.likes) ? post.likes.length : (post.likes || 0);
      const comments = countComments(post.comments || []);
      
      totalLikes += likes;
      totalComments += comments;

      if (engagementData[dateStr]) {
        engagementData[dateStr].likes += likes;
        engagementData[dateStr].comments += comments;
      }
    });

    // 2. Followers growth (mock for now as backend doesn't track history yet)
    const followersData = Object.keys(engagementData).map((date, index) => ({
      name: date,
      followers: index * 2
    }));

    // 3. Top performing posts
    const topPosts = [...posts]
      .sort((a, b) => {
        const likesA = Array.isArray(a.likes) ? a.likes.length : (a.likes || 0);
        const likesB = Array.isArray(b.likes) ? b.likes.length : (b.likes || 0);
        const engA = likesA + countComments(a.comments || []);
        const engB = likesB + countComments(b.comments || []);
        return engB - engA;
      })
      .slice(0, 5)
      .map(p => {
        const likes = Array.isArray(p.likes) ? p.likes.length : (p.likes || 0);
        const comments = countComments(p.comments || []);
        return {
          id: p._id || p.id,
          content: p.content,
          likes,
          comments,
          engagement: likes + comments
        };
      });

    return {
      engagementTrend: Object.values(engagementData),
      followersGrowth: followersData,
      topPosts,
      summary: {
        totalLikes,
        totalComments,
        totalFollowers: followersData[followersData.length - 1].followers,
        engagementRate: posts.length > 0 ? ((totalLikes + totalComments) / posts.length).toFixed(1) : 0
      }
    };
  }, [posts]);

  return stats;
}
