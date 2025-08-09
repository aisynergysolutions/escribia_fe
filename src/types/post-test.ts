// Test file to validate null handling in helper functions
import { getProfileId, getProfileName, getProfileRole, getProfileImageUrl, isDetailedPost, isSimplePost } from './post';

// Test null handling
console.log('Testing null/undefined handling:');
console.log('getProfileId(null):', getProfileId(null)); // Should return ''
console.log('getProfileName(undefined):', getProfileName(undefined)); // Should return ''
console.log('getProfileRole(null):', getProfileRole(null)); // Should return ''
console.log('getProfileImageUrl(null):', getProfileImageUrl(null)); // Should return undefined
console.log('isDetailedPost(null):', isDetailedPost(null)); // Should return false
console.log('isSimplePost(null):', isSimplePost(null)); // Should return false

// Test with valid data
const samplePost = {
    id: 'test',
    postId: 'test',
    title: 'Test Post',
    status: 'draft',
    updatedAt: { seconds: Date.now() / 1000 } as any,
    profile: 'John Doe',
    profileId: 'john-doe-id'
};

console.log('\nTesting with valid data:');
console.log('getProfileId(samplePost):', getProfileId(samplePost)); // Should return 'john-doe-id'
console.log('getProfileName(samplePost):', getProfileName(samplePost)); // Should return 'John Doe'
console.log('isSimplePost(samplePost):', isSimplePost(samplePost)); // Should return true
