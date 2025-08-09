
// Re-export interfaces
export type {
  Idea,
  Client,
  Template,
  Agency
} from './interfaces';

// Re-export unified post types
export type {
  Post,
  PostListFields,
  PostDetailFields,
  Draft,
  Hook,
  InitialIdea,
  Profile,
  Poll
} from './post';

export {
  isDetailedPost,
  isSimplePost,
  getProfileName,
  getProfileId,
  getProfileRole,
  getProfileImageUrl,
  postCardToPost,
  postDetailsToPost
} from './post';

// Re-export mock data
export { mockIdeas } from './mockIdeas';
export { mockClients } from './mockClients';
export { mockTemplates } from './mockTemplates';
export { mockAgency } from './mockAgency';
