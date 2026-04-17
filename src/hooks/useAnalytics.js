import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { countComments } from './usePosts';

export function useAnalytics() {
  const [posts] = useLocalStorage('social-dash-posts', []);

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
      const date = new Date(post.timestamp);
      const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      
      const likes = post.likes || 0;
      const comments = countComments(post.comments || []);
      
      totalLikes += likes;
      totalComments += comments;

      if (engagementData[dateStr]) {
        engagementData[dateStr].likes += likes;
        engagementData[dateStr].comments += comments;
      }
    });

    // 2. Followers growth (simulated)
    const followersData = Object.keys(engagementData).map((date, index) => ({
      name: date,
      followers: 1200 + (index * 45) + Math.floor(Math.random() * 20)
    }));

    // 3. Top performing posts
    const topPosts = [...posts]
      .sort((a, b) => {
        const engA = (a.likes || 0) + countComments(a.comments || []);
        const engB = (b.likes || 0) + countComments(b.comments || []);
        return engB - engA;
      })
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        content: p.content,
        likes: p.likes || 0,
        comments: countComments(p.comments || []),
        engagement: (p.likes || 0) + countComments(p.comments || [])
      }));

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
