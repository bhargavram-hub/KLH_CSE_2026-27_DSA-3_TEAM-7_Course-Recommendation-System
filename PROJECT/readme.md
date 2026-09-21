# Course Recommendation System

## Project Title

**Course Recommendation System**

A DSA-3 project developed for **Data Structures and Algorithms - III (25CS2103E)**.

---

## Team Members

| Name          | ID Number  |
| ------------- | ---------- |
| M. Dijendra   | 2520030164 |
| Ch. Nripendra | 2520030280 |
| P. Bhargava   | 2520030303 |

**Team Number:** 7
**Section:** 6

### Supervisor

**Dr. V. Sireesha**
Professor, Department of Computer Science and Engineering

---

## Abstract

The Course Recommendation System is an intelligent platform designed to help students identify and select suitable academic courses based on their interests, prerequisites, academic background, and career goals.

Students often find it difficult to explore a large number of available courses and determine which courses are most relevant to their academic and professional objectives. The proposed system addresses this problem through efficient course searching, prerequisite checking, and personalized course recommendations.

The system incorporates advanced concepts from Data Structures and Algorithms-III, including String Algorithms, Dynamic Programming, Network Flow, Bipartite Matching, Approximation Algorithms, and algorithmic complexity analysis. String matching techniques such as KMP, Z-Function, and Rabin-Karp are used for efficient course searching. Fuzzy matching helps handle approximate or misspelled queries. Dynamic Programming is used for course-selection optimization under a credit constraint, while prerequisite graph traversal is used to determine course eligibility.

Network Flow and Bipartite Matching are used to demonstrate matching and allocation problems. Approximation techniques provide practical solutions for optimization problems where exact solutions may be computationally expensive.

The project also includes an Algorithm Lab for demonstrating the DSA-3 algorithms across CO1–CO6.

---

## Problem Statement

Students have to choose courses based on several factors such as:

* Academic interests
* Career goals
* Previously completed courses
* Course prerequisites
* Credit limitations
* Relevance of course skills

Manually checking all these factors becomes difficult as the number of available courses increases.

The Course Recommendation System provides an algorithm-based solution that searches, filters, checks eligibility, ranks and recommends suitable courses.

---

## Objectives

* Provide efficient course searching.
* Support pattern matching algorithms.
* Handle spelling mistakes and approximate searches.
* Check course prerequisites automatically.
* Recommend courses according to student interests and career goals.
* Optimize course selection within a given credit limit.
* Demonstrate network-flow and matching algorithms.
* Demonstrate approximation algorithms.
* Provide an Algorithm Lab covering the DSA-3 CO1–CO6 requirements.
* Provide a simple and interactive web interface.

---

# DSA Concepts Used

## 1. String Matching Algorithms

### KMP — Knuth-Morris-Pratt

KMP is used for efficient pattern searching in course information.

It can search:

* Course titles
* Course descriptions
* Skills
* Tags
* Interest keywords

Instead of repeatedly comparing characters, KMP uses the LPS (Longest Prefix Suffix) array to avoid unnecessary comparisons.

**Typical complexity:** `O(n + m)`

where:

* `n` = text length
* `m` = pattern length

---

### Z-Function

The Z-Function calculates how many characters from a position match the prefix of a string.

It is used as another pattern-matching technique for searching course information.

**Typical complexity:** `O(n)`

---

### Rabin-Karp

Rabin-Karp uses hashing to search for patterns.

It is useful for comparing course-related keywords using rolling hash values.

**Typical average complexity:** `O(n + m)`

**Worst case:** `O(nm)`

---

## 2. Fuzzy Matching

The system also supports approximate searching.

For example:

```text
User enters:
machne learning

System can find:
Machine Learning
```

This is implemented using edit-distance based similarity.

The system calculates how many insertions, deletions and substitutions are required to transform one string into another.

This makes the course search more user-friendly.

---

# 3. Prerequisite Graph

Courses can have prerequisite relationships.

Example:

```text
Programming Fundamentals
          ↓
     Data Structures
          ↓
     Algorithms
          ↓
  Machine Learning
```

The system represents these relationships as a graph.

Depth First Search (DFS) is used to:

* Check prerequisite requirements.
* Determine whether a student is eligible.
* Find missing prerequisite courses.
* Build prerequisite chains.

---

# 4. Dynamic Programming

Dynamic Programming is used for course-selection optimization.

Each course can be treated as an item with:

* Credit value
* Recommendation score

The student's maximum available credits act as the capacity.

This is modeled using the **0/1 Knapsack problem**.

Example:

```text
Credit Limit = 12

Machine Learning     4 credits
Statistics           3 credits
Deep Learning        4 credits
Cloud Computing      3 credits
```

The system selects a suitable combination while respecting the credit limit.

This demonstrates how Dynamic Programming can be applied to recommendation optimization.

---

# 5. Bipartite Matching

Bipartite matching is used to demonstrate matching between two sets.

Example:

```text
Student Preferences       Suitable Courses

AI ---------------------> Machine Learning
AI ---------------------> Deep Learning
Web --------------------> Full Stack Development
Data --------------------> Data Science
```

The matching algorithm finds compatible pairings between the two sets.

This is demonstrated in the Algorithm Lab and can be extended to student-course allocation scenarios.

---

# 6. Network Flow

Maximum Flow is used for allocation and capacity-based problems.

A simplified model is:

```text
Student Preferences
        ↓
   Course Groups
        ↓
     Courses
        ↓
 Available Capacity
```

The flow network contains:

* Source
* Intermediate nodes
* Course nodes
* Capacity constraints
* Sink

The implementation demonstrates **Maximum Flow using Edmonds-Karp**.

This is useful for understanding course allocation when course capacity is limited.

---

# 7. Approximation Algorithm

Some optimization problems can become computationally expensive when the input size increases.

The project includes a greedy approximation approach for course selection.

The algorithm attempts to obtain a good practical solution without requiring exhaustive search of every possible combination.

The Algorithm Lab also demonstrates the approximation concept and its performance relative to an optimal solution where applicable.

---

# CO Algorithm Lab

The project contains an **Algorithm Lab** for demonstrating the algorithms required by DSA-3.

## CO1

Demonstrates problem-class algorithms such as:

* Sequence Alignment
* Network Flow
* NP-hard scheduling / Branch and Bound

---

## CO2

Demonstrates advanced string algorithms:

* KMP
* Z-Function
* Rabin-Karp
* Rolling Hash
* Suffix Array
* LCP
* Suffix Automaton

---

## CO3

Demonstrates Dynamic Programming techniques:

* Interval DP
* Bitmask DP
* Tree DP
* Subset DP
* Held-Karp TSP

---

## CO4

Demonstrates:

* Maximum Flow
* Edmonds-Karp
* Bipartite Matching
* Capacity Allocation

---

## CO5

Demonstrates:

* NP-completeness concepts
* 3-SAT to Vertex Cover reduction
* Approximation algorithms
* 2-approximation for Vertex Cover

---

## CO6

Demonstrates:

* Las Vegas randomized algorithms
* Monte Carlo algorithms
* Parallel Reduce
* Parallel Prefix Scan
* Work-Span analysis

---

# Important Project Architecture

```text
                  COURSEMATCH
                       │
          ┌────────────┴────────────┐
          │                         │
     Frontend                   Backend
          │                         │
 HTML/CSS/JavaScript          Node.js/Express
          │                         │
          └────────────┬────────────┘
                       │
                Algorithm Layer
                       │
       ┌───────────────┼────────────────┐
       │               │                │
 String Algorithms    Graph          Dynamic
                      Algorithms      Programming
       │               │                │
       └───────────────┼────────────────┘
                       │
                Recommendation
                    Engine
                       │
                       ↓
              Recommended Courses
```

---

# Application Workflow

```text
Student
   ↓
Selects interests / career goal
   ↓
Searches courses
   ↓
Pattern Matching
   ↓
Fuzzy Matching if required
   ↓
Check Prerequisites
   ↓
Calculate Recommendation Scores
   ↓
Dynamic Programming Optimization
   ↓
Generate Learning Path
   ↓
Display Recommended Courses
```

---

# Technology Stack

## Frontend

* HTML5
* CSS3
* JavaScript

## Backend

* Node.js
* Express.js

## Algorithms

* KMP
* Z-Function
* Rabin-Karp
* Rolling Hash
* Edit Distance
* DFS
* Dynamic Programming
* Maximum Flow
* Bipartite Matching
* Approximation Algorithms
* Sequence Alignment
* Suffix Structures
* Randomized Algorithms
* Parallel Algorithm demonstrations

## Development Tools

* Visual Studio Code
* Node.js
* npm
* Git
* GitHub

---

# Project Structure

```text
PROJECT/
│
├── backend/
│   ├── algorithms/
│   ├── data/
│   ├── utils/
│   ├── node_modules/
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   └── README.md
│
└── frontend/
    ├── app.js
    ├── index.html
    ├── style.css
    └── README.md
```

---

# Setup and Execution

## Prerequisites

Install:

* Node.js
* npm
* Python 3.x (for serving the frontend)
* Visual Studio Code

---

## 1. Clone the Repository

```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
cd DSA-3/PROJECT
```

---

## 2. Start the Backend

Open a terminal:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the backend:

```bash
npm start
```

The backend uses:

```text
server.js
```

and runs on the configured local port.

Keep this terminal running.

---

## 3. Start the Frontend

Open a second terminal:

```bash
cd frontend
```

The frontend is a plain HTML/CSS/JavaScript application and does not require `npm run dev`.

Start a local HTTP server:

```bash
python -m http.server 5500
```

Open:

```text
http://localhost:5500
```

in a browser.

---

# Testing the Application

After opening the website, test the following:

### Course Search

Search for course names or keywords.

Example:

```text
machine learning
```

---

### Fuzzy Search

Try a misspelled query:

```text
machne learning
```

The system should identify similar courses.

---

### Prerequisite Checking

Select a course that has prerequisites and verify whether the completed-course list satisfies the requirements.

---

### Recommendation

Provide:

* Career goal
* Interests
* Completed courses
* Credit limit

Then generate the recommended learning path.

---

### Algorithm Lab

Open the Algorithm Lab and execute:

```text
CO1
CO2
CO3
CO4
CO5
CO6
```

The algorithms should execute through the backend and return their results to the frontend.

---

# Backend Architecture

The frontend communicates with the backend through API requests.

```text
Browser
   ↓
Frontend JavaScript
   ↓
REST API
   ↓
Express Server
   ↓
Algorithm Module
   ↓
Algorithm Execution
   ↓
JSON Result
   ↓
Frontend
```

This means the algorithms are not merely displayed as documentation. They are implemented as executable backend logic and can be tested using different inputs.

---

# Current Phase Status

**Phase: Implementation, Integration and Testing**

### Completed

* Course Recommendation System structure
* Course catalogue
* Course searching
* Pattern matching
* Fuzzy matching
* Prerequisite checking
* Recommendation logic
* Dynamic Programming based course selection
* Network Flow implementation
* Bipartite Matching implementation
* Approximation algorithm implementation
* CO Algorithm Lab structure
* CO1–CO6 algorithm demonstrations
* Frontend and backend integration

### Current Work

* End-to-end testing
* CO1–CO6 verification
* UI refinement
* API testing
* GitHub documentation
* Review and viva preparation

---

# Expected Outcome

The completed system provides students with an algorithm-based course recommendation platform that can search courses efficiently, handle approximate queries, check prerequisites, optimize course selections, and generate a suitable learning path.

The integrated Algorithm Lab additionally provides executable demonstrations of the DSA-3 concepts covered under CO1–CO6.

---

# Future Scope

Possible future improvements include:

* Larger course catalogue
* Student login and profile management
* Persistent student history
* Advanced personalized recommendation
* Database integration
* Course capacity data
* Semester-wise planning
* Additional optimization techniques
* Visualization of prerequisite graphs
* Deployment as a cloud-based application

---

# Conclusion

The Course Recommendation System applies Data Structures and Algorithms concepts to a practical academic recommendation problem. String algorithms improve course searching, graph algorithms support prerequisite and matching operations, Dynamic Programming supports optimized course selection, and Network Flow and Approximation Algorithms address allocation and optimization scenarios.

The project combines a practical recommendation system with an integrated DSA Algorithm Lab to demonstrate the concepts required across CO1–CO6.

---

## Licence
This project is developed for academic purposes as part of the **Data Structures and Algorithms - III (25CS2103E)** course.

