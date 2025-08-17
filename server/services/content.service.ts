import type { BlogPost, Testimonial } from '@shared/schema';

const blogPosts: (BlogPost & { id: number; createdAt: string })[] = [];
const testimonials: (Testimonial & { id: number; createdAt: string })[] = [];

export const contentService = {
  getPosts() {
    return blogPosts;
  },
  addPost(data: BlogPost) {
    const post = { id: blogPosts.length + 1, createdAt: new Date().toISOString(), ...data };
    blogPosts.push(post);
    return post;
  },
  getTestimonials() {
    return testimonials;
  },
  addTestimonial(data: Testimonial) {
    const testimonial = { id: testimonials.length + 1, createdAt: new Date().toISOString(), ...data };
    testimonials.push(testimonial);
    return testimonial;
  }
};
