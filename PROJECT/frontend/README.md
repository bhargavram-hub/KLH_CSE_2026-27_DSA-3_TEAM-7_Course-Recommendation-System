# CourseMatch Frontend

Professional responsive UI for the Course Recommendation System.

The UI is served by the Express backend, so no frontend build step is required.

## Run
Extract both ZIPs into the same parent directory so the structure is:

```text
project/
  backend/
  frontend/
```

Then follow the backend README and open http://localhost:5000.

## Features
- Live debounced course search
- Domain/category filters
- Pattern matching with KMP, Z-Function and Rabin-Karp
- Fuzzy matching for misspellings using edit-distance DP and token similarity
- Prerequisite path modal
- Completed-course tracking with localStorage
- Personalized course planning
- Credit-limited recommendation using 0/1 Knapsack DP
- Responsive professional UI
