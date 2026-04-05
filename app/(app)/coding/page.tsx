'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

/* ─── Types ────────────────────────────────────────────────────── */
type Difficulty = 'Easy' | 'Medium' | 'Hard';
type Topic = 'Array' | 'String' | 'Hash Map' | 'Two Pointers' | 'Sliding Window' |
  'Stack' | 'Queue' | 'Linked List' | 'Tree' | 'Graph' | 'Dynamic Programming' |
  'Binary Search' | 'Backtracking' | 'Heap' | 'Math' | 'Design' | 'Greedy';

interface Problem {
  id: number;
  title: string;
  difficulty: Difficulty;
  topic: Topic;
  slug: string;        // LeetCode URL slug
  starterJs: string;   // Starter JavaScript code
  hint: string;
}

/* ─── Problem Bank ─────────────────────────────────────────────── */
const PROBLEMS: Problem[] = [
  // Array
  { id: 1, title: 'Two Sum', difficulty: 'Easy', topic: 'Array', slug: 'two-sum',
    hint: 'Use a HashMap to store value→index pairs. For each element, check if target-element exists in the map.',
    starterJs: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
  return [];
}

// Test
console.log(JSON.stringify(twoSum([2,7,11,15], 9)));  // [0,1]
console.log(JSON.stringify(twoSum([3,2,4], 6)));      // [1,2]` },

  { id: 11, title: 'Container With Most Water', difficulty: 'Medium', topic: 'Array', slug: 'container-with-most-water',
    hint: 'Two pointers from both ends. Move the pointer with the smaller height.',
    starterJs: `function maxArea(height) {
  let left = 0, right = height.length - 1, max = 0;
  while (left < right) {
    max = Math.max(max, Math.min(height[left], height[right]) * (right - left));
    if (height[left] < height[right]) left++;
    else right--;
  }
  return max;
}
console.log(maxArea([1,8,6,2,5,4,8,3,7])); // 49` },

  { id: 15, title: '3Sum', difficulty: 'Medium', topic: 'Array', slug: '3sum',
    hint: 'Sort the array, then for each element use two pointers for the remaining pair.',
    starterJs: `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i-1]) continue;
    let l = i+1, r = nums.length-1;
    while (l < r) {
      const sum = nums[i] + nums[l] + nums[r];
      if (sum === 0) { result.push([nums[i],nums[l],nums[r]]); l++; r--; }
      else if (sum < 0) l++;
      else r--;
    }
  }
  return result;
}
console.log(JSON.stringify(threeSum([-1,0,1,2,-1,-4]))); // [[-1,-1,2],[-1,0,1]]` },

  { id: 53, title: 'Maximum Subarray', difficulty: 'Medium', topic: 'Array', slug: 'maximum-subarray',
    hint: "Kadane's algorithm: track current sum, reset to 0 if negative.",
    starterJs: `function maxSubArray(nums) {
  let maxSum = nums[0], curr = nums[0];
  for (let i = 1; i < nums.length; i++) {
    curr = Math.max(nums[i], curr + nums[i]);
    maxSum = Math.max(maxSum, curr);
  }
  return maxSum;
}
console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4])); // 6` },

  { id: 238, title: 'Product of Array Except Self', difficulty: 'Medium', topic: 'Array', slug: 'product-of-array-except-self',
    hint: 'Use prefix and suffix products. No division needed.',
    starterJs: `function productExceptSelf(nums) {
  const n = nums.length, res = new Array(n).fill(1);
  let prefix = 1;
  for (let i = 0; i < n; i++) { res[i] = prefix; prefix *= nums[i]; }
  let suffix = 1;
  for (let i = n-1; i >= 0; i--) { res[i] *= suffix; suffix *= nums[i]; }
  return res;
}
console.log(JSON.stringify(productExceptSelf([1,2,3,4]))); // [24,12,8,6]` },

  // String
  { id: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'Sliding Window', slug: 'longest-substring-without-repeating-characters',
    hint: 'Sliding window with a Set. Shrink from left when a repeat is found.',
    starterJs: `function lengthOfLongestSubstring(s) {
  const set = new Set();
  let left = 0, max = 0;
  for (let right = 0; right < s.length; right++) {
    while (set.has(s[right])) { set.delete(s[left]); left++; }
    set.add(s[right]);
    max = Math.max(max, right - left + 1);
  }
  return max;
}
console.log(lengthOfLongestSubstring("abcabcbb")); // 3
console.log(lengthOfLongestSubstring("pwwkew"));   // 3` },

  { id: 5, title: 'Longest Palindromic Substring', difficulty: 'Medium', topic: 'String', slug: 'longest-palindromic-substring',
    hint: 'Expand around center for each character. Check both odd and even length palindromes.',
    starterJs: `function longestPalindrome(s) {
  let res = '';
  function expand(l, r) {
    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
    return s.slice(l+1, r);
  }
  for (let i = 0; i < s.length; i++) {
    const odd = expand(i, i), even = expand(i, i+1);
    if (odd.length > res.length) res = odd;
    if (even.length > res.length) res = even;
  }
  return res;
}
console.log(longestPalindrome("babad")); // "bab"` },

  { id: 20, title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stack', slug: 'valid-parentheses',
    hint: 'Use a stack. Push opening brackets, pop when closing bracket matches top.',
    starterJs: `function isValid(s) {
  const stack = [], map = {')':'(', ']':'[', '}':'{'};
  for (const c of s) {
    if ('([{'.includes(c)) stack.push(c);
    else if (stack.pop() !== map[c]) return false;
  }
  return stack.length === 0;
}
console.log(isValid("()[]{}"));  // true
console.log(isValid("(]"));     // false` },

  { id: 49, title: 'Group Anagrams', difficulty: 'Medium', topic: 'Hash Map', slug: 'group-anagrams',
    hint: 'Sort each string to create a common key for anagram groups.',
    starterJs: `function groupAnagrams(strs) {
  const map = new Map();
  for (const s of strs) {
    const key = [...s].sort().join('');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  }
  return [...map.values()];
}
console.log(JSON.stringify(groupAnagrams(["eat","tea","tan","ate","nat","bat"])));` },

  // Linked List
  { id: 206, title: 'Reverse Linked List', difficulty: 'Easy', topic: 'Linked List', slug: 'reverse-linked-list',
    hint: 'Iteratively reverse pointers: keep prev, curr, next. O(n) time, O(1) space.',
    starterJs: `// Simulate with an array for testing
function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}
// Helper: build linked list from array
function build(arr) {
  if (!arr.length) return null;
  const nodes = arr.map(v => ({ val: v, next: null }));
  nodes.forEach((n, i) => { if (i < nodes.length-1) n.next = nodes[i+1]; });
  return nodes[0];
}
function toArr(head) {
  const res = [];
  while (head) { res.push(head.val); head = head.next; }
  return res;
}
const head = build([1,2,3,4,5]);
console.log(JSON.stringify(toArr(reverseList(head)))); // [5,4,3,2,1]` },

  { id: 21, title: 'Merge Two Sorted Lists', difficulty: 'Easy', topic: 'Linked List', slug: 'merge-two-sorted-lists',
    hint: 'Use a dummy head. Compare values and attach the smaller node.',
    starterJs: `function mergeTwoLists(l1, l2) {
  const dummy = { val: 0, next: null };
  let curr = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) { curr.next = l1; l1 = l1.next; }
    else { curr.next = l2; l2 = l2.next; }
    curr = curr.next;
  }
  curr.next = l1 || l2;
  return dummy.next;
}
console.log("Implement and test with linked list nodes!");` },

  // Tree
  { id: 104, title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', topic: 'Tree', slug: 'maximum-depth-of-binary-tree',
    hint: 'Recursive DFS: depth = 1 + max(left depth, right depth).',
    starterJs: `function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
// Build a test tree: [3,9,20,null,null,15,7]
const tree = { val:3, left:{ val:9, left:null, right:null }, right:{ val:20, left:{ val:15, left:null, right:null }, right:{ val:7, left:null, right:null } } };
console.log(maxDepth(tree)); // 3` },

  { id: 102, title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', topic: 'Tree', slug: 'binary-tree-level-order-traversal',
    hint: 'BFS with a queue. Process level by level using queue length as level size.',
    starterJs: `function levelOrder(root) {
  if (!root) return [];
  const result = [], queue = [root];
  while (queue.length) {
    const level = [], size = queue.length;
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}
const tree = { val:3, left:{ val:9, left:null, right:null }, right:{ val:20, left:{ val:15, left:null, right:null }, right:{ val:7, left:null, right:null } } };
console.log(JSON.stringify(levelOrder(tree))); // [[3],[9,20],[15,7]]` },

  { id: 98, title: 'Validate Binary Search Tree', difficulty: 'Medium', topic: 'Tree', slug: 'validate-binary-search-tree',
    hint: 'Pass min and max bounds recursively. Left must be < node, right must be > node.',
    starterJs: `function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true;
  if (root.val <= min || root.val >= max) return false;
  return isValidBST(root.left, min, root.val) && isValidBST(root.right, root.val, max);
}
const valid = { val:2, left:{val:1,left:null,right:null}, right:{val:3,left:null,right:null} };
const invalid = { val:5, left:{val:1,left:null,right:null}, right:{val:4,left:{val:3,left:null,right:null},right:{val:6,left:null,right:null}} };
console.log(isValidBST(valid));   // true
console.log(isValidBST(invalid)); // false` },

  // Dynamic Programming
  { id: 70, title: 'Climbing Stairs', difficulty: 'Easy', topic: 'Dynamic Programming', slug: 'climbing-stairs',
    hint: 'Fibonacci pattern: dp[i] = dp[i-1] + dp[i-2]. Use O(1) space.',
    starterJs: `function climbStairs(n) {
  if (n <= 2) return n;
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) { [a, b] = [b, a + b]; }
  return b;
}
console.log(climbStairs(2));  // 2
console.log(climbStairs(5));  // 8
console.log(climbStairs(10)); // 89` },

  { id: 322, title: 'Coin Change', difficulty: 'Medium', topic: 'Dynamic Programming', slug: 'coin-change',
    hint: 'Bottom-up DP. dp[i] = min coins to make amount i.',
    starterJs: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) dp[i] = Math.min(dp[i], dp[i - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
console.log(coinChange([1,5,11], 15)); // 3 (11+1+1+1... wait: 5+5+5=15, ans=3)
console.log(coinChange([2], 3));       // -1` },

  { id: 198, title: 'House Robber', difficulty: 'Medium', topic: 'Dynamic Programming', slug: 'house-robber',
    hint: 'dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Use two variables for O(1) space.',
    starterJs: `function rob(nums) {
  let prev2 = 0, prev1 = 0;
  for (const num of nums) {
    const curr = Math.max(prev1, prev2 + num);
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
console.log(rob([1,2,3,1])); // 4
console.log(rob([2,7,9,3,1])); // 12` },

  // Binary Search
  { id: 704, title: 'Binary Search', difficulty: 'Easy', topic: 'Binary Search', slug: 'binary-search',
    hint: 'Classic binary search: left + Math.floor((right-left)/2) to avoid overflow.',
    starterJs: `function search(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] === target) return mid;
    else if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}
console.log(search([-1,0,3,5,9,12], 9));  // 4
console.log(search([-1,0,3,5,9,12], 2));  // -1` },

  { id: 33, title: 'Search in Rotated Sorted Array', difficulty: 'Medium', topic: 'Binary Search', slug: 'search-in-rotated-sorted-array',
    hint: 'Binary search but determine which half is sorted, then check if target is in it.',
    starterJs: `function search(nums, target) {
  let l = 0, r = nums.length - 1;
  while (l <= r) {
    const m = Math.floor((l + r) / 2);
    if (nums[m] === target) return m;
    if (nums[l] <= nums[m]) {
      if (target >= nums[l] && target < nums[m]) r = m - 1;
      else l = m + 1;
    } else {
      if (target > nums[m] && target <= nums[r]) l = m + 1;
      else r = m - 1;
    }
  }
  return -1;
}
console.log(search([4,5,6,7,0,1,2], 0)); // 4
console.log(search([4,5,6,7,0,1,2], 3)); // -1` },

  // Graph
  { id: 200, title: 'Number of Islands', difficulty: 'Medium', topic: 'Graph', slug: 'number-of-islands',
    hint: 'DFS/BFS from each unvisited land cell. Mark visited cells to avoid revisiting.',
    starterJs: `function numIslands(grid) {
  let count = 0;
  function dfs(r, c) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] !== '1') return;
    grid[r][c] = '0'; // mark visited
    dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1);
  }
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === '1') { count++; dfs(r, c); }
    }
  }
  return count;
}
const grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]];
console.log(numIslands(grid)); // 3` },

  // Backtracking
  { id: 46, title: 'Permutations', difficulty: 'Medium', topic: 'Backtracking', slug: 'permutations',
    hint: 'Swap elements recursively. Backtrack by swapping back after exploring.',
    starterJs: `function permute(nums) {
  const result = [];
  function backtrack(start) {
    if (start === nums.length) { result.push([...nums]); return; }
    for (let i = start; i < nums.length; i++) {
      [nums[start], nums[i]] = [nums[i], nums[start]];
      backtrack(start + 1);
      [nums[start], nums[i]] = [nums[i], nums[start]];
    }
  }
  backtrack(0);
  return result;
}
console.log(JSON.stringify(permute([1,2,3])));` },

  // Design
  { id: 146, title: 'LRU Cache', difficulty: 'Medium', topic: 'Design', slug: 'lru-cache',
    hint: 'Doubly linked list + HashMap. O(1) get and put.',
    starterJs: `class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map(); // key -> node
    this.head = { key: 0, val: 0, prev: null, next: null }; // dummy
    this.tail = { key: 0, val: 0, prev: null, next: null }; // dummy
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  _remove(node) { node.prev.next = node.next; node.next.prev = node.prev; }
  _insertFront(node) { node.next = this.head.next; node.prev = this.head; this.head.next.prev = node; this.head.next = node; }
  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    this._remove(node); this._insertFront(node);
    return node.val;
  }
  put(key, val) {
    if (this.map.has(key)) this._remove(this.map.get(key));
    const node = { key, val, prev: null, next: null };
    this.map.set(key, node); this._insertFront(node);
    if (this.map.size > this.cap) {
      const lru = this.tail.prev;
      this._remove(lru); this.map.delete(lru.key);
    }
  }
}
const lru = new LRUCache(2);
lru.put(1,1); lru.put(2,2);
console.log(lru.get(1)); // 1
lru.put(3,3);
console.log(lru.get(2)); // -1 (evicted)` },

  // Heap
  { id: 215, title: 'Kth Largest Element in an Array', difficulty: 'Medium', topic: 'Heap', slug: 'kth-largest-element-in-an-array',
    hint: 'Min-heap of size k. Or use QuickSelect for O(n) average.',
    starterJs: `function findKthLargest(nums, k) {
  // Simple sort approach — O(n log n)
  return nums.sort((a, b) => b - a)[k - 1];
  // For O(n avg) solution, use QuickSelect!
}
console.log(findKthLargest([3,2,1,5,6,4], 2)); // 5
console.log(findKthLargest([3,2,3,1,2,4,5,5,6], 4)); // 4` },

  // Two Pointers
  { id: 125, title: 'Valid Palindrome', difficulty: 'Easy', topic: 'Two Pointers', slug: 'valid-palindrome',
    hint: 'Two pointers from both ends. Skip non-alphanumeric characters.',
    starterJs: `function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let l = 0, r = clean.length - 1;
  while (l < r) {
    if (clean[l] !== clean[r]) return false;
    l++; r--;
  }
  return true;
}
console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isPalindrome("race a car"));                     // false` },

  // Greedy
  { id: 55, title: 'Jump Game', difficulty: 'Medium', topic: 'Greedy', slug: 'jump-game',
    hint: 'Track the maximum reachable index. If current index exceeds it, return false.',
    starterJs: `function canJump(nums) {
  let maxReach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false;
    maxReach = Math.max(maxReach, i + nums[i]);
  }
  return true;
}
console.log(canJump([2,3,1,1,4])); // true
console.log(canJump([3,2,1,0,4])); // false` },

  // Math
  { id: 9, title: 'Palindrome Number', difficulty: 'Easy', topic: 'Math', slug: 'palindrome-number',
    hint: 'Reverse only half the number to avoid overflow. Compare with first half.',
    starterJs: `function isPalindrome(x) {
  if (x < 0 || (x % 10 === 0 && x !== 0)) return false;
  let reversed = 0;
  while (x > reversed) {
    reversed = reversed * 10 + x % 10;
    x = Math.floor(x / 10);
  }
  return x === reversed || x === Math.floor(reversed / 10);
}
console.log(isPalindrome(121));  // true
console.log(isPalindrome(-121)); // false
console.log(isPalindrome(10));   // false` },

  { id: 50, title: 'Pow(x, n)', difficulty: 'Medium', topic: 'Math', slug: 'powx-n',
    hint: 'Fast power: x^n = (x^(n/2))^2. Handle negative n.',
    starterJs: `function myPow(x, n) {
  if (n < 0) { x = 1 / x; n = -n; }
  let result = 1;
  while (n > 0) {
    if (n % 2 === 1) result *= x;
    x *= x;
    n = Math.floor(n / 2);
  }
  return result;
}
console.log(myPow(2, 10));   // 1024
console.log(myPow(2.0, -2)); // 0.25` },
];

/* ─── Constants ────────────────────────────────────────────────── */
const ALL_TOPICS: Topic[] = ['Array', 'String', 'Hash Map', 'Two Pointers', 'Sliding Window',
  'Stack', 'Linked List', 'Tree', 'Graph', 'Dynamic Programming',
  'Binary Search', 'Backtracking', 'Heap', 'Math', 'Design', 'Greedy'];

const DIFF_COLORS: Record<Difficulty, string> = {
  Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444',
};

const LANGUAGES = [
  { id: 'javascript', label: 'JS', icon: '🟨', runnable: true },
  { id: 'typescript', label: 'TS', icon: '🔷', runnable: false },
  { id: 'python', label: 'Python', icon: '🐍', runnable: false },
  { id: 'java', label: 'Java', icon: '☕', runnable: false },
  { id: 'cpp', label: 'C++', icon: '⚡', runnable: false },
];

/* ─── Component ────────────────────────────────────────────────── */
export default function CodingPage() {
  const [activeProblem, setActiveProblem] = useState<Problem>(PROBLEMS[0]);
  const [code, setCode] = useState(PROBLEMS[0].starterJs);
  const [language, setLanguage] = useState('javascript');
  const [filterDiff, setFilterDiff] = useState<Difficulty | 'All'>('All');
  const [filterTopic, setFilterTopic] = useState<Topic | 'All'>('All');
  const [searchQ, setSearchQ] = useState('');
  const [output, setOutput] = useState<{ type: 'idle' | 'running' | 'success' | 'error'; lines: string[] }>({ type: 'idle', lines: [] });
  const [showHint, setShowHint] = useState(false);

  const filtered = PROBLEMS.filter(p => {
    const matchDiff = filterDiff === 'All' || p.difficulty === filterDiff;
    const matchTopic = filterTopic === 'All' || p.topic === filterTopic;
    const matchSearch = !searchQ || p.title.toLowerCase().includes(searchQ.toLowerCase()) || String(p.id).includes(searchQ);
    return matchDiff && matchTopic && matchSearch;
  });

  const selectProblem = (p: Problem) => {
    setActiveProblem(p);
    setCode(p.starterJs);
    setOutput({ type: 'idle', lines: [] });
    setShowHint(false);
  };

  const runCode = () => {
    const lang = LANGUAGES.find(l => l.id === language);
    if (!lang?.runnable) {
      setOutput({ type: 'error', lines: [`⚠️  ${lang?.label || 'This language'} requires a server to execute. Switch to JavaScript for in-browser execution.`] });
      return;
    }
    setOutput({ type: 'running', lines: ['⚡ Running...'] });
    const logs: string[] = [];
    const orig = { log: console.log, error: console.error, warn: console.warn };
    console.log = (...a: unknown[]) => logs.push(a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' '));
    console.error = (...a: unknown[]) => logs.push('❌ ' + a.join(' '));
    console.warn = (...a: unknown[]) => logs.push('⚠️  ' + a.join(' '));
    try {
      // eslint-disable-next-line no-new-func
      new Function(code)();
      Object.assign(console, orig);
      setOutput({ type: 'success', lines: logs.length ? logs : ['✅ Ran successfully (no output)'] });
    } catch (e: unknown) {
      Object.assign(console, orig);
      setOutput({ type: 'error', lines: [...logs, `❌ ${e instanceof Error ? e.message : String(e)}`] });
    }
  };

  const openOnLeetCode = (p: Problem) => {
    window.open(`https://leetcode.com/problems/${p.slug}/`, '_blank');
  };

  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>

      {/* ── Left panel: problem list ─────────────────────────── */}
      <div style={{
        width: '300px', flexShrink: 0,
        borderRight: '1px solid var(--bg-border)',
        background: '#09091a',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--bg-border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontWeight: '700', fontSize: '14px' }}>💻 Problems</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{filtered.length} / {PROBLEMS.length}</span>
          </div>
          {/* Search */}
          <input
            className="input"
            placeholder="Search by name or #..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            style={{ fontSize: '12px', padding: '7px 10px', marginBottom: '8px' }}
          />
          {/* Difficulty filter */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
            {(['All', 'Easy', 'Medium', 'Hard'] as const).map(d => (
              <button
                key={d}
                onClick={() => setFilterDiff(d)}
                style={{
                  flex: 1, padding: '4px 2px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600',
                  background: filterDiff === d ? (d === 'All' ? 'rgba(124,58,237,0.25)' : `${DIFF_COLORS[d as Difficulty]}25`) : 'rgba(255,255,255,0.04)',
                  color: filterDiff === d ? (d === 'All' ? '#a78bfa' : DIFF_COLORS[d as Difficulty]) : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}
              >{d}</button>
            ))}
          </div>
          {/* Topic filter */}
          <select
            className="input"
            style={{ fontSize: '11px', padding: '6px 8px' }}
            value={filterTopic}
            onChange={e => setFilterTopic(e.target.value as Topic | 'All')}
          >
            <option value="All">All Topics</option>
            {ALL_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Problem list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No problems found
            </div>
          )}
          {filtered.map(p => (
            <div
              key={p.id}
              onClick={() => selectProblem(p)}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: activeProblem.id === p.id ? 'rgba(124,58,237,0.12)' : 'transparent',
                borderLeft: activeProblem.id === p.id ? '3px solid #7c3aed' : '3px solid transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (activeProblem.id !== p.id) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (activeProblem.id !== p.id) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: activeProblem.id === p.id ? '600' : '400', color: activeProblem.id === p.id ? '#c4b5fd' : 'var(--text-primary)' }}>
                  {p.id}. {p.title}
                </span>
                <span style={{
                  fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '100px',
                  background: `${DIFF_COLORS[p.difficulty]}18`, color: DIFF_COLORS[p.difficulty],
                  flexShrink: 0, marginLeft: '6px',
                }}>
                  {p.difficulty}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: '3px' }}>
                  {p.topic}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: editor + problem info ──────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Toolbar */}
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--bg-border)',
          background: '#09091a',
          display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0,
        }}>
          {/* Problem title + difficulty */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '700', fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeProblem.id}. {activeProblem.title}
              </span>
              <span style={{
                fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '100px', flexShrink: 0,
                background: `${DIFF_COLORS[activeProblem.difficulty]}20`, color: DIFF_COLORS[activeProblem.difficulty],
              }}>
                {activeProblem.difficulty}
              </span>
              <span style={{
                fontSize: '11px', padding: '2px 7px', borderRadius: '4px', flexShrink: 0,
                background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)',
              }}>
                {activeProblem.topic}
              </span>
            </div>
          </div>

          {/* Language picker */}
          <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-base)', borderRadius: '7px', padding: '3px', border: '1px solid var(--bg-border)', flexShrink: 0 }}>
            {LANGUAGES.map(lang => (
              <button key={lang.id} onClick={() => setLanguage(lang.id)} style={{
                padding: '4px 10px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '12px',
                background: language === lang.id ? 'var(--bg-card)' : 'transparent',
                color: language === lang.id ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: language === lang.id ? '600' : '400', transition: 'all 0.15s',
              }}>
                {lang.icon} {lang.label}
              </button>
            ))}
          </div>

          {/* Hint button */}
          <button
            onClick={() => setShowHint(h => !h)}
            style={{
              padding: '7px 12px', borderRadius: '7px', border: '1px solid rgba(245,158,11,0.3)',
              background: showHint ? 'rgba(245,158,11,0.15)' : 'transparent',
              color: '#fcd34d', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
            }}
          >
            💡 {showHint ? 'Hide' : 'Hint'}
          </button>

          {/* Open on LeetCode */}
          <button
            onClick={() => openOnLeetCode(activeProblem)}
            style={{
              padding: '7px 14px', borderRadius: '7px',
              background: 'rgba(255,161,22,0.12)', border: '1px solid rgba(255,161,22,0.3)',
              color: '#ffa116', fontSize: '12px', fontWeight: '700',
              cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,161,22,0.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,161,22,0.12)')}
            title="Open this problem on LeetCode"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffa116">
              <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
            </svg>
            Open on LeetCode ↗
          </button>

          {/* Run */}
          <button className="btn-primary" onClick={runCode} style={{ padding: '7px 16px', fontSize: '13px', flexShrink: 0 }}>
            ▶ Run
          </button>
        </div>

        {/* Hint bar */}
        {showHint && (
          <div style={{
            padding: '10px 16px',
            background: 'rgba(245,158,11,0.08)', borderBottom: '1px solid rgba(245,158,11,0.2)',
            fontSize: '13px', color: '#fcd34d', flexShrink: 0, animation: 'fadeIn 0.2s ease',
          }}>
            💡 <strong>Hint:</strong> {activeProblem.hint}
          </div>
        )}

        {/* Monaco editor */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <MonacoEditor
            height="100%"
            language={language}
            value={code}
            onChange={val => setCode(val || '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: false },
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              padding: { top: 16, bottom: 8 },
              smoothScrolling: true,
              cursorSmoothCaretAnimation: 'on',
              bracketPairColorization: { enabled: true },
            }}
          />
        </div>

        {/* Output panel */}
        <div style={{ height: '140px', borderTop: '1px solid var(--bg-border)', background: '#05050e', flexShrink: 0, overflow: 'auto' }}>
          <div style={{
            padding: '7px 14px', borderBottom: '1px solid var(--bg-border)',
            display: 'flex', alignItems: 'center', gap: '8px', background: '#08080f',
          }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Output</span>
            {output.type === 'success' && <span className="badge badge-green" style={{ fontSize: '10px' }}>✓ OK</span>}
            {output.type === 'error' && <span className="badge badge-red" style={{ fontSize: '10px' }}>✗ Error</span>}
            {output.type === 'running' && <span className="badge badge-violet" style={{ fontSize: '10px' }}>Running…</span>}
            <button onClick={() => setOutput({ type: 'idle', lines: [] })} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}>Clear</button>
          </div>
          <div style={{ padding: '8px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', lineHeight: 1.7 }}>
            {output.type === 'idle'
              ? <span style={{ color: 'var(--text-muted)' }}>Press ▶ Run to execute JavaScript in-browser. Click "Open on LeetCode ↗" to submit your solution.</span>
              : output.lines.map((line, i) => (
                <div key={i} style={{ color: output.type === 'error' && line.startsWith('❌') ? '#fca5a5' : output.type === 'success' ? '#6ee7b7' : 'var(--text-secondary)' }}>
                  {line || '\u00A0'}
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
