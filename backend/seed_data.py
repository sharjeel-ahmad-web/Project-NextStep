#!/usr/bin/env python3
"""
MongoDB Sample Data Generator
Inserts sample courses, lessons, roadmaps, and users for testing
"""

import os
import sys
from datetime import datetime

try:
    from pymongo import MongoClient
    from bson import ObjectId
except ImportError:
    print("❌ PyMongo not installed. Install with: pip install pymongo")
    sys.exit(1)

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/nextstep_db')

def connect_mongodb():
    """Connect to MongoDB"""
    try:
        client = MongoClient(MONGO_URI)
        db = client['nextstep_db']
        print(f"✅ Connected to MongoDB at {MONGO_URI}")
        return db
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        sys.exit(1)

def clear_collections(db):
    """Clear existing data"""
    print("\n🗑️  Clearing existing collections...")
    collections = ['courses', 'lessons', 'users', 'roadmaps', 'enrollments']
    for collection in collections:
        db[collection].delete_many({})
        print(f"   ✓ Cleared {collection}")

def insert_users(db):
    """Insert sample users"""
    print("\n👥 Creating users...")
    users = [
        {
            'name': 'John Developer',
            'email': 'john@example.com',
            'password': 'hashed_password_here',
            'email_verified_at': datetime.now(),
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        },
        {
            'name': 'Sarah Designer',
            'email': 'sarah@example.com',
            'password': 'hashed_password_here',
            'email_verified_at': datetime.now(),
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        },
        {
            'name': 'Mike Backend',
            'email': 'mike@example.com',
            'password': 'hashed_password_here',
            'email_verified_at': datetime.now(),
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
    ]
    result = db.users.insert_many(users)
    print(f"   ✓ Created {len(result.inserted_ids)} users")
    return result.inserted_ids

def insert_courses(db):
    """Insert sample courses"""
    print("\n📚 Creating courses...")
    courses = [
        {
            'title': 'Complete JavaScript Course',
            'description': 'Master JavaScript from beginner to advanced. Learn ES6+, async/await, and modern JavaScript patterns.',
            'instructor_id': '1',
            'category': 'Programming',
            'level': 'beginner',
            'duration_hours': 40,
            'price': 49.99,
            'image_url': 'https://via.placeholder.com/300x200?text=JavaScript',
            'is_published': True,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        },
        {
            'title': 'React: The Complete Guide',
            'description': 'Learn React with hooks, context API, Redux, and build real-world applications.',
            'instructor_id': '1',
            'category': 'Frontend',
            'level': 'intermediate',
            'duration_hours': 50,
            'price': 59.99,
            'image_url': 'https://via.placeholder.com/300x200?text=React',
            'is_published': True,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        },
        {
            'title': 'MongoDB Complete Guide',
            'description': 'Master MongoDB - Design, implement, and manage NoSQL databases.',
            'instructor_id': '2',
            'category': 'Database',
            'level': 'intermediate',
            'duration_hours': 35,
            'price': 44.99,
            'image_url': 'https://via.placeholder.com/300x200?text=MongoDB',
            'is_published': True,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        },
        {
            'title': 'Node.js Backend Development',
            'description': 'Build scalable backend applications with Node.js, Express, and REST APIs.',
            'instructor_id': '2',
            'category': 'Backend',
            'level': 'intermediate',
            'duration_hours': 45,
            'price': 54.99,
            'image_url': 'https://via.placeholder.com/300x200?text=Node.js',
            'is_published': True,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        },
        {
            'title': 'Docker & Containerization',
            'description': 'Learn Docker, Docker Compose, and containerize your applications.',
            'instructor_id': '1',
            'category': 'DevOps',
            'level': 'intermediate',
            'duration_hours': 30,
            'price': 39.99,
            'image_url': 'https://via.placeholder.com/300x200?text=Docker',
            'is_published': True,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
    ]
    result = db.courses.insert_many(courses)
    print(f"   ✓ Created {len(result.inserted_ids)} courses")
    return result.inserted_ids

def insert_lessons(db, course_ids):
    """Insert sample lessons"""
    print("\n📖 Creating lessons...")
    lessons = [
        # JavaScript lessons
        {
            'course_id': course_ids[0],
            'title': 'JavaScript Basics',
            'description': 'Learn variables, data types, and operators',
            'content': 'Introduction to JavaScript fundamentals...',
            'video_url': 'https://example.com/videos/js-basics.mp4',
            'duration_minutes': 45,
            'order': 1,
            'is_published': True,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        },
        {
            'course_id': course_ids[0],
            'title': 'Functions and Scope',
            'description': 'Understanding functions, closures, and variable scope',
            'content': 'Deep dive into JavaScript functions and scope...',
            'video_url': 'https://example.com/videos/functions.mp4',
            'duration_minutes': 55,
            'order': 2,
            'is_published': True,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        },
        # React lessons
        {
            'course_id': course_ids[1],
            'title': 'React Components',
            'description': 'Functional and class components',
            'content': 'React component fundamentals...',
            'video_url': 'https://example.com/videos/react-components.mp4',
            'duration_minutes': 50,
            'order': 1,
            'is_published': True,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        },
        {
            'course_id': course_ids[1],
            'title': 'React Hooks',
            'description': 'useState, useEffect, custom hooks',
            'content': 'React hooks deep dive...',
            'video_url': 'https://example.com/videos/react-hooks.mp4',
            'duration_minutes': 65,
            'order': 2,
            'is_published': True,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        },
        # MongoDB lessons
        {
            'course_id': course_ids[2],
            'title': 'MongoDB Setup & Installation',
            'description': 'Install and configure MongoDB',
            'content': 'Getting started with MongoDB...',
            'video_url': 'https://example.com/videos/mongo-setup.mp4',
            'duration_minutes': 30,
            'order': 1,
            'is_published': True,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
    ]
    result = db.lessons.insert_many(lessons)
    print(f"   ✓ Created {len(result.inserted_ids)} lessons")

def insert_roadmaps(db):
    """Insert sample roadmaps"""
    print("\n🗺️  Creating roadmaps...")
    roadmaps = [
        {
            'target_role': 'Full Stack Developer',
            'description': 'Become a full stack developer with JavaScript, React, and MongoDB',
            'nodes': [
                {
                    'id': '1',
                    'skill_name': 'JavaScript Fundamentals',
                    'level': 'beginner',
                    'duration_hours': 40,
                    'status': 'pending'
                },
                {
                    'id': '2',
                    'skill_name': 'React Development',
                    'level': 'intermediate',
                    'duration_hours': 50,
                    'status': 'pending'
                },
                {
                    'id': '3',
                    'skill_name': 'MongoDB Database',
                    'level': 'intermediate',
                    'duration_hours': 35,
                    'status': 'pending'
                },
                {
                    'id': '4',
                    'skill_name': 'Node.js Backend',
                    'level': 'intermediate',
                    'duration_hours': 45,
                    'status': 'pending'
                }
            ],
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        },
        {
            'target_role': 'Frontend Developer',
            'description': 'Specialize in frontend development with React and modern CSS',
            'nodes': [
                {
                    'id': '1',
                    'skill_name': 'HTML & CSS',
                    'level': 'beginner',
                    'duration_hours': 30,
                    'status': 'pending'
                },
                {
                    'id': '2',
                    'skill_name': 'JavaScript ES6+',
                    'level': 'intermediate',
                    'duration_hours': 40,
                    'status': 'pending'
                },
                {
                    'id': '3',
                    'skill_name': 'React.js',
                    'level': 'intermediate',
                    'duration_hours': 50,
                    'status': 'pending'
                }
            ],
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        },
        {
            'target_role': 'Backend Developer',
            'description': 'Master backend development with Node.js and databases',
            'nodes': [
                {
                    'id': '1',
                    'skill_name': 'JavaScript Node.js',
                    'level': 'intermediate',
                    'duration_hours': 45,
                    'status': 'pending'
                },
                {
                    'id': '2',
                    'skill_name': 'Express.js',
                    'level': 'intermediate',
                    'duration_hours': 35,
                    'status': 'pending'
                },
                {
                    'id': '3',
                    'skill_name': 'MongoDB',
                    'level': 'intermediate',
                    'duration_hours': 35,
                    'status': 'pending'
                }
            ],
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
    ]
    result = db.roadmaps.insert_many(roadmaps)
    print(f"   ✓ Created {len(result.inserted_ids)} roadmaps")
    return result.inserted_ids

def main():
    """Main function"""
    print("=" * 60)
    print("MongoDB Sample Data Generator")
    print("=" * 60)
    
    # Connect to MongoDB
    db = connect_mongodb()
    
    # Clear existing data
    clear_collections(db)
    
    # Insert data
    user_ids = insert_users(db)
    course_ids = insert_courses(db)
    insert_lessons(db, course_ids)
    roadmap_ids = insert_roadmaps(db)
    
    print("\n" + "=" * 60)
    print("✅ Sample data inserted successfully!")
    print("=" * 60)
    print(f"""
📊 Created:
   - {len(user_ids)} Users
   - {len(course_ids)} Courses
   - 5 Lessons
   - {len(roadmap_ids)} Roadmaps

🌐 Access the app at:
   - Frontend: http://localhost:3000
   - API Health: http://localhost:8000/api/health
   - Courses API: http://localhost:8000/api/courses

🔍 View MongoDB data with:
   - MongoDB Compass: mongodb://localhost:27017
   - Or via terminal: docker-compose exec mongodb mongosh

💡 Try these URLs:
   - http://localhost:3000 (Frontend home)
   - http://localhost:3000/roadmaps (View roadmaps)
   - http://localhost:8000/api/courses (API courses)
    """)

if __name__ == '__main__':
    main()
