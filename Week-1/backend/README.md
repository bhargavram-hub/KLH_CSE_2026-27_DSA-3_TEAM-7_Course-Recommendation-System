# CourseMatch Backend

Node.js + Express backend for the Course Recommendation System.

## Run
1. Install Node.js (LTS).
2. Open a terminal in this `backend` folder.
3. Run `npm install`.
4. Run `npm start`.
5. Open http://localhost:5000 in a browser. Keep the frontend folder beside the backend folder.

## API
- GET `/api/health`
- GET `/api/courses`
- GET `/api/categories`
- GET `/api/search?q=machine%20learning`
- GET `/api/prerequisites/CS330?completed=CS101,CS102,CS201,CS202,CS230`
- POST `/api/recommend`

## Algorithms
- KMP string matching: O(n + m)
- Z-Function string matching: O(n + m)
- Rabin-Karp rolling hash: expected O(n + m)
- Wagner-Fischer edit distance: O(nm) time, optimized O(min(n,m)) row storage
- Prerequisite graph traversal
- 0/1 Knapsack Dynamic Programming: O(NC), where C is the credit limit
