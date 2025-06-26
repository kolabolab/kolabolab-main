import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchService {
  // Mock search keywords for development
  private readonly keywords = [
    '#startup', '#angel', '#funding', '#invest', '#collaborate', 
    '#volunteer', '#opportunity', '#success', '#testimonial',
    '#innovation', '#entrepreneurship', '#mentorship', '#networking',
    '#pitch', '#equity', '#seed', '#series-a', '#accelerator', '#incubator'
  ];

  async search(query: any) {
    const searchQuery = query.q || '';
    const searchType = query.type || 'all';
    const tags = query.tags ? query.tags.split(',') : [];

    // Mock search results for development
    return {
      query: searchQuery,
      type: searchType,
      tags,
      results: {
        startups: [
          {
            id: '1',
            title: 'EcoDelivery - Sustainable Last Mile',
            description: 'Revolutionary eco-friendly delivery solution using electric bikes and AI route optimization.',
            tags: ['#sustainability', '#logistics', '#ai', '#greentech'],
            fundingStage: 'seed',
            relevanceScore: 0.95
          },
          {
            id: '2',
            title: 'AccessibilityFirst - Inclusive Web Platform',
            description: 'AI-powered platform that automatically makes websites accessible for people with disabilities.',
            tags: ['#accessibility', '#ai', '#inclusion', '#saas'],
            fundingStage: 'pre-seed',
            relevanceScore: 0.87
          }
        ],
        users: [
          {
            id: '1',
            name: 'Sarah Johnson',
            role: 'entrepreneur',
            skills: ['React', 'Product Management', 'Accessibility'],
            relevanceScore: 0.92
          }
        ],
        collaborations: [
          {
            id: '1',
            title: 'Looking for Technical Co-founder',
            role: 'co-founder',
            startup: 'VoiceConnect',
            relevanceScore: 0.84
          }
        ]
      },
      totalResults: 4,
      searchTime: 45 // milliseconds
    };
  }

  async getSuggestions(query: string) {
    const suggestions = this.keywords
      .filter(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);

    return {
      query,
      suggestions,
      popular: ['#startup', '#funding', '#collaborate', '#invest', '#opportunity']
    };
  }
}