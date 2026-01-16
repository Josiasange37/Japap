import React, { useState } from 'react';
import Layout from '../components/Layout';
import AdUnit from '../components/AdUnit';
import { Calendar, Clock, User, Heart, MessageCircle, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorAvatar?: string;
  publishedAt: number;
  readTime: number;
  category: 'community' | 'safety' | 'features' | 'stories';
  tags: string[];
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  featured: boolean;
}

// Mock blog posts - in real app, this would come from your CMS
const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Building Safe Online Communities: Our Commitment',
    excerpt: 'Learn how we\'re creating a safer space for authentic storytelling and positive community interactions.',
    content: `
      <h2>Our Philosophy</h2>
      <p>At Japap, we believe that everyone deserves a safe space to share their stories and connect with others. Our community guidelines aren't just rules—they're the foundation of everything we do.</p>
      
      <h2>Advanced Moderation</h2>
      <p>We use a multi-layered approach to content moderation:</p>
      <ul>
        <li>AI-powered content filtering that scans all posts before publication</li>
        <li>Community reporting system with rapid response times</li>
        <li>24/7 human moderation team</li>
        <li>Verified user system to build trust</li>
      </ul>
      
      <h2>Looking Forward</h2>
      <p>We're constantly improving our systems to ensure Japap remains a positive, constructive space for meaningful conversations.</p>
    `,
    author: 'Japap Team',
    authorAvatar: '/app-icon.jpg',
    publishedAt: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
    readTime: 5,
    category: 'safety',
    tags: ['safety', 'community', 'moderation'],
    stats: {
      views: 1234,
      likes: 89,
      comments: 12,
      shares: 45
    },
    featured: true
  },
  {
    id: '2',
    title: 'How to Share Stories That Matter',
    excerpt: 'Tips and tricks for creating engaging, authentic content that resonates with your community.',
    content: `
      <h2>Start with Authenticity</h2>
      <p>The most compelling stories come from real experiences and genuine emotions. Don't be afraid to be vulnerable and honest.</p>
      
      <h2>Know Your Audience</h2>
      <p>Understanding who you're talking to helps you tailor your message effectively. Our community values respect, honesty, and positivity.</p>
      
      <h2>Add Value</h2>
      <p>Whether you're sharing a personal experience, asking a question, or offering advice, make sure your content adds value to the conversation.</p>
    `,
    author: 'Community Manager',
    publishedAt: Date.now() - (5 * 24 * 60 * 60 * 1000), // 5 days ago
    readTime: 3,
    category: 'community',
    tags: ['tips', 'storytelling', 'community'],
    stats: {
      views: 892,
      likes: 67,
      comments: 8,
      shares: 23
    },
    featured: false
  },
  {
    id: '3',
    title: 'New Features: Enhanced Verification System',
    excerpt: 'Introducing our new verification levels that help build trust while maintaining privacy.',
    content: `
      <h2>Why Verification Matters</h2>
      <p>In online communities, trust is everything. Our new verification system helps identify genuine community members while respecting privacy choices.</p>
      
      <h2>Verification Levels</h2>
      <ul>
        <li><strong>Basic:</strong> Email verification</li>
        <li><strong>Verified:</strong> Phone or ID verification</li>
        <li><strong>Premium:</strong> Advanced verification with additional features</li>
      </ul>
      
      <h2>Benefits</h2>
      <p>Verified users enjoy enhanced posting capabilities, higher visibility, and access to exclusive features.</p>
    `,
    author: 'Product Team',
    publishedAt: Date.now() - (7 * 24 * 60 * 60 * 1000), // 1 week ago
    readTime: 4,
    category: 'features',
    tags: ['features', 'verification', 'updates'],
    stats: {
      views: 2103,
      likes: 156,
      comments: 34,
      shares: 78
    },
    featured: false
  }
];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Posts', color: 'bg-gray-500' },
    { id: 'community', label: 'Community', color: 'bg-blue-500' },
    { id: 'safety', label: 'Safety', color: 'bg-green-500' },
    { id: 'features', label: 'Features', color: 'bg-purple-500' },
    { id: 'stories', label: 'Stories', color: 'bg-pink-500' }
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || 'bg-gray-500';
  };

  return (
    <Layout>
      <div className="px-4 md:px-0 max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black mb-4">Community Stories</h1>
          <p className="text-[var(--text-muted)] text-lg">
            Insights, updates, and stories from the Japap community
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-black transition-all ${
                selectedCategory === category.id
                  ? 'bg-black text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--border)]'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        {filteredPosts.filter(post => post.featured).map(post => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--card)] border border-[var(--border)] rounded-[32px] p-8 mb-8"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-white text-xs font-black mb-3 ${getCategoryColor(post.category)}`}>
                  {post.category.toUpperCase()}
                </span>
                <h2 className="text-2xl font-black mb-2">{post.title}</h2>
              </div>
              {post.featured && (
                <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black">
                  FEATURED
                </span>
              )}
            </div>

            <p className="text-[var(--text-muted)] mb-6 text-lg leading-relaxed">
              {post.excerpt}
            </p>

            <div className="flex items-center gap-6 text-sm text-[var(--text-muted)] mb-6">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{post.readTime} min read</span>
              </div>
            </div>

            <button
              onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
              className="bg-[var(--brand)] text-white px-6 py-3 rounded-2xl font-black hover:scale-105 transition-transform"
            >
              {expandedPost === post.id ? 'Show Less' : 'Read Full Story'}
            </button>

            {expandedPost === post.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 pt-6 border-t border-[var(--border)]"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            )}

            {/* Post Stats */}
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-[var(--border)]">
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <Heart size={18} />
                <span className="text-sm font-black">{post.stats.likes}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <MessageCircle size={18} />
                <span className="text-sm font-black">{post.stats.comments}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <Share2 size={18} />
                <span className="text-sm font-black">{post.stats.shares}</span>
              </div>
              <div className="ml-auto text-[var(--text-muted)]">
                <span className="text-sm font-black">{post.stats.views.toLocaleString()} views</span>
              </div>
            </div>
          </motion.article>
        ))}

        {/* Regular Posts Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredPosts.filter(post => !post.featured).map(post => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--card)] border border-[var(--border)] rounded-[24px] p-6"
            >
              <span className={`inline-block px-3 py-1 rounded-full text-white text-xs font-black mb-3 ${getCategoryColor(post.category)}`}>
                {post.category.toUpperCase()}
              </span>
              <h3 className="text-lg font-black mb-2">{post.title}</h3>
              <p className="text-[var(--text-muted)] mb-4 text-sm leading-relaxed">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>{formatDate(post.publishedAt)} • {post.readTime} min read</span>
                <span>{post.stats.views} views</span>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Ad Placement */}
        <div className="mt-12">
          <AdUnit slot="BLOG_PAGE_SLOT" />
        </div>
      </div>
    </Layout>
  );
}