import React from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { EngagementChart } from '../components/analytics/EngagementChart';
import { FollowersChart } from '../components/analytics/FollowersChart';
import { TopPostsTable } from '../components/analytics/TopPostsTable';
import { TrendingUp, Users, Heart, MessageCircle, BarChart2 } from 'lucide-react';
import './Analytics.scss';

export default function Analytics() {
  const { engagementTrend, followersGrowth, topPosts, summary } = useAnalytics();

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h2 className="page-title">Analytics Overview</h2>
        <div className="summary-cards">
          <div className="metric-card">
            <div className="icon-wrapper like"><Heart size={20} /></div>
            <div className="metric-info">
              <span className="label">Total Likes</span>
              <h3 className="value">{summary.totalLikes.toLocaleString()}</h3>
            </div>
          </div>
          <div className="metric-card">
            <div className="icon-wrapper comment"><MessageCircle size={20} /></div>
            <div className="metric-info">
              <span className="label">Total Comments</span>
              <h3 className="value">{summary.totalComments.toLocaleString()}</h3>
            </div>
          </div>
          <div className="metric-card">
            <div className="icon-wrapper follower"><Users size={20} /></div>
            <div className="metric-info">
              <span className="label">Total Followers</span>
              <h3 className="value">{summary.totalFollowers.toLocaleString()}</h3>
            </div>
          </div>
          <div className="metric-card">
            <div className="icon-wrapper engagement"><TrendingUp size={20} /></div>
            <div className="metric-info">
              <span className="label">Eng. Rate (Avg)</span>
              <h3 className="value">{summary.engagementRate}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="card-header">
            <TrendingUp size={18} />
            <h4>Engagement Trend (Last 7 Days)</h4>
          </div>
          <EngagementChart data={engagementTrend} />
        </div>

        <div className="chart-card">
          <div className="card-header">
            <Users size={18} />
            <h4>Follower Growth</h4>
          </div>
          <FollowersChart data={followersGrowth} />
        </div>
      </div>

      <div className="bottom-section">
        <TopPostsTable posts={topPosts} />
      </div>
    </div>
  );
}
