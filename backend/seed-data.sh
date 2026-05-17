#!/bin/bash

# MongoDB Sample Data Script
# Run this to populate the database with sample data for testing

mongosh mongodb://localhost:27017/nextstep_db << 'EOF'

// Clear existing data
db.courses.deleteMany({})
db.lessons.deleteMany({})
db.users.deleteMany({})
db.roadmaps.deleteMany({})

// Create sample users
db.users.insertMany([
  {
    _id: ObjectId(),
    name: "John Developer",
    email: "john@example.com",
    password: "hashed_password_here",
    email_verified_at: new Date(),
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: ObjectId(),
    name: "Sarah Designer",
    email: "sarah@example.com",
    password: "hashed_password_here",
    email_verified_at: new Date(),
    created_at: new Date(),
    updated_at: new Date()
  }
])

// Create sample courses
var course1_id = ObjectId()
var course2_id = ObjectId()
var course3_id = ObjectId()

db.courses.insertMany([
  {
    _id: course1_id,
    title: "Complete JavaScript Course",
    description: "Master JavaScript from beginner to advanced. Learn ES6+, async/await, and modern JavaScript patterns.",
    instructor_id: "1",
    category: "Programming",
    level: "beginner",
    duration_hours: 40,
    price: 49.99,
    image_url: "https://via.placeholder.com/300x200?text=JavaScript",
    is_published: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: course2_id,
    title: "React: The Complete Guide",
    description: "Learn React with hooks, context API, Redux, and build real-world applications.",
    instructor_id: "1",
    category: "Frontend",
    level: "intermediate",
    duration_hours: 50,
    price: 59.99,
    image_url: "https://via.placeholder.com/300x200?text=React",
    is_published: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: course3_id,
    title: "MongoDB Complete Guide",
    description: "Master MongoDB - Design, implement, and manage NoSQL databases.",
    instructor_id: "2",
    category: "Database",
    level: "intermediate",
    duration_hours: 35,
    price: 44.99,
    image_url: "https://via.placeholder.com/300x200?text=MongoDB",
    is_published: true,
    created_at: new Date(),
    updated_at: new Date()
  }
])

// Create sample lessons
db.lessons.insertMany([
  {
    _id: ObjectId(),
    course_id: course1_id,
    title: "JavaScript Basics",
    description: "Learn variables, data types, and operators",
    content: "Introduction to JavaScript fundamentals...",
    video_url: "https://example.com/videos/js-basics.mp4",
    duration_minutes: 45,
    order: 1,
    is_published: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: ObjectId(),
    course_id: course1_id,
    title: "Functions and Scope",
    description: "Understanding functions, closures, and variable scope",
    content: "Deep dive into JavaScript functions and scope...",
    video_url: "https://example.com/videos/functions.mp4",
    duration_minutes: 55,
    order: 2,
    is_published: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: ObjectId(),
    course_id: course1_id,
    title: "ES6+ Features",
    description: "Arrow functions, destructuring, spread operator, and more",
    content: "Modern JavaScript ES6 features...",
    video_url: "https://example.com/videos/es6.mp4",
    duration_minutes: 60,
    order: 3,
    is_published: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: ObjectId(),
    course_id: course2_id,
    title: "React Components",
    description: "Functional and class components",
    content: "React component fundamentals...",
    video_url: "https://example.com/videos/react-components.mp4",
    duration_minutes: 50,
    order: 1,
    is_published: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: ObjectId(),
    course_id: course2_id,
    title: "React Hooks",
    description: "useState, useEffect, custom hooks",
    content: "React hooks deep dive...",
    video_url: "https://example.com/videos/react-hooks.mp4",
    duration_minutes: 65,
    order: 2,
    is_published: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: ObjectId(),
    course_id: course3_id,
    title: "MongoDB Setup",
    description: "Install and configure MongoDB",
    content: "Getting started with MongoDB...",
    video_url: "https://example.com/videos/mongo-setup.mp4",
    duration_minutes: 30,
    order: 1,
    is_published: true,
    created_at: new Date(),
    updated_at: new Date()
  }
])

// Create sample roadmaps
db.roadmaps.insertMany([
  {
    _id: ObjectId(),
    target_role: "Full Stack Developer",
    description: "Become a full stack developer with JavaScript, React, and MongoDB",
    nodes: [
      {
        id: "1",
        skill_name: "JavaScript Fundamentals",
        level: "beginner",
        duration_hours: 40,
        status: "pending"
      },
      {
        id: "2",
        skill_name: "React Development",
        level: "intermediate",
        duration_hours: 50,
        status: "pending"
      },
      {
        id: "3",
        skill_name: "MongoDB Database",
        level: "intermediate",
        duration_hours: 35,
        status: "pending"
      },
      {
        id: "4",
        skill_name: "Node.js Backend",
        level: "intermediate",
        duration_hours: 45,
        status: "pending"
      }
    ],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: ObjectId(),
    target_role: "Frontend Developer",
    description: "Specialize in frontend development with React and modern CSS",
    nodes: [
      {
        id: "1",
        skill_name: "HTML & CSS",
        level: "beginner",
        duration_hours: 30,
        status: "pending"
      },
      {
        id: "2",
        skill_name: "JavaScript ES6+",
        level: "intermediate",
        duration_hours: 40,
        status: "pending"
      },
      {
        id: "3",
        skill_name: "React.js",
        level: "intermediate",
        duration_hours: 50,
        status: "pending"
      },
      {
        id: "4",
        skill_name: "State Management (Redux)",
        level: "advanced",
        duration_hours: 35,
        status: "pending"
      }
    ],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: ObjectId(),
    target_role: "Backend Developer",
    description: "Master backend development with Node.js and databases",
    nodes: [
      {
        id: "1",
        skill_name: "JavaScript Node.js",
        level: "intermediate",
        duration_hours: 45,
        status: "pending"
      },
      {
        id: "2",
        skill_name: "Express.js",
        level: "intermediate",
        duration_hours: 35,
        status: "pending"
      },
      {
        id: "3",
        skill_name: "MongoDB",
        level: "intermediate",
        duration_hours: 35,
        status: "pending"
      },
      {
        id: "4",
        skill_name: "REST APIs",
        level: "advanced",
        duration_hours: 40,
        status: "pending"
      }
    ],
    created_at: new Date(),
    updated_at: new Date()
  }
])

console.log("✅ Sample data inserted successfully!")
console.log("📊 Created:")
console.log("   - 3 Users")
console.log("   - 3 Courses")
console.log("   - 6 Lessons")
console.log("   - 3 Roadmaps")
console.log("\n📝 You can now navigate to:")
console.log("   - http://localhost:3000/roadmaps")
console.log("   - http://localhost:8000/api/courses")

EOF
