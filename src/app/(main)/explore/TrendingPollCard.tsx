// 'use client';

// import React, { useCallback, useEffect, useRef, useState } from 'react';

// import Image from 'next/image';
// import { useRouter } from 'next/navigation';

// import { ArrowLeft, MessageCircle, Search, TrendingUp, Users, X } from 'lucide-react';

// import { useKeyopollsCommentsApiSearchComments } from '@/api/comments/comments';
// import { useKeyopollsCommunitiesApiGeneralListCommunities } from '@/api/communities-general/communities-general';
// import { useKeyopollsPollsApiGeneralListPolls } from '@/api/polls/polls';
// import { CommentSearchResultOut, PollDetails } from '@/api/schemas';
// import Poll from '@/components/common/Poll';
// import { useProfileStore } from '@/stores/useProfileStore';
// import { formatDate, formatNumber } from '@/utils';

// type SearchState = 'default' | 'focused' | 'results';
// type SearchTab = 'polls' | 'communities' | 'comments';

// // Dummy trending searches
// const TRENDING_SEARCHES = [
//   'Climate change solutions',
//   'Remote work vs office',
//   'Best programming language 2025',
//   'AI impact on jobs',
//   'Favorite pizza topping',
//   'Morning routine habits',
//   'Social media effects',
//   'Electric vs gas cars',
// ];

// // Display-only poll card component
// const TrendingPollCard = ({ poll }: { poll: PollDetails }) => {
//   const router = useRouter();

//   const handleClick = () => {
//     router.push(`/polls/${poll.id}`);
//   };

//   return (
//     <div
//       onClick={handleClick}
//       className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
//     >
//       {/* Community info */}
//       <div className="mb-3 flex items-center gap-2">
//         <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
//           {poll.community_name.charAt(0).toUpperCase()}
//         </div>
//         <span className="text-sm font-medium text-gray-700">{poll.community_name}</span>
//       </div>

//       {/* Poll title */}
//       <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900">{poll.title}</h3>

//       {/* Description */}
//       {poll.description && (
//         <p className="mb-3 line-clamp-2 text-sm text-gray-600">{poll.description}</p>
//       )}

//       {/* Images if any */}
//       {poll.options.some((option) => option.image_url) && (
//         <div className="mb-3 flex gap-2 overflow-x-auto">
//           {poll.options
//             .filter((option) => option.image_url)
//             .slice(0, 3)
//             .map((option, index) => (
//               <Image
//                 key={index}
//                 src={option.image_url!}
//                 alt={option.text}
//                 className="h-16 w-16 flex-shrink-0 rounded object-cover"
//                 width={64}
//                 height={64}
//               />
//             ))
//         </div>
//       )}

//       {/* Stats */}
//       <div className="flex items-center gap-4 text-sm text-gray-500">
//         <span>{formatNumber(poll.total_votes)} votes</span>
//         <span>{poll.comment_count} comments</span>
//         <span className="text-xs">{formatDate(poll.created_at)}</span>
//       </div>
//     </div>
//   );
// };
