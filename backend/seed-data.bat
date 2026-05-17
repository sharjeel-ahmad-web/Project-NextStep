@echo off
REM MongoDB Sample Data Script for Windows
REM This script populates the database with sample data for testing

echo Inserting sample data into MongoDB...

docker-compose exec mongodb mongosh mongodb://localhost:27017/nextstep_db ^
  --eval "db.courses.deleteMany({}); db.lessons.deleteMany({}); db.users.deleteMany({}); db.roadmaps.deleteMany({});"

docker-compose exec mongodb mongosh mongodb://localhost:27017/nextstep_db ^
  --eval "db.users.insertMany([{_id: ObjectId(), name: 'John Developer', email: 'john@example.com', password: 'hashed_password_here', email_verified_at: new Date(), created_at: new Date(), updated_at: new Date()}, {_id: ObjectId(), name: 'Sarah Designer', email: 'sarah@example.com', password: 'hashed_password_here', email_verified_at: new Date(), created_at: new Date(), updated_at: new Date()}]);"

docker-compose exec mongodb mongosh mongodb://localhost:27017/nextstep_db ^
  --eval "var c1 = ObjectId(); var c2 = ObjectId(); var c3 = ObjectId(); db.courses.insertMany([{_id: c1, title: 'Complete JavaScript Course', description: 'Master JavaScript from beginner to advanced.', instructor_id: '1', category: 'Programming', level: 'beginner', duration_hours: 40, price: 49.99, image_url: 'https://via.placeholder.com/300x200?text=JavaScript', is_published: true, created_at: new Date(), updated_at: new Date()}, {_id: c2, title: 'React: The Complete Guide', description: 'Learn React with hooks, context API, Redux, and build real-world applications.', instructor_id: '1', category: 'Frontend', level: 'intermediate', duration_hours: 50, price: 59.99, image_url: 'https://via.placeholder.com/300x200?text=React', is_published: true, created_at: new Date(), updated_at: new Date()}, {_id: c3, title: 'MongoDB Complete Guide', description: 'Master MongoDB - Design, implement, and manage NoSQL databases.', instructor_id: '2', category: 'Database', level: 'intermediate', duration_hours: 35, price: 44.99, image_url: 'https://via.placeholder.com/300x200?text=MongoDB', is_published: true, created_at: new Date(), updated_at: new Date()}]); db.roadmaps.insertMany([{_id: ObjectId(), target_role: 'Full Stack Developer', description: 'Become a full stack developer', nodes: [{id: '1', skill_name: 'JavaScript', level: 'beginner'}, {id: '2', skill_name: 'React', level: 'intermediate'}, {id: '3', skill_name: 'MongoDB', level: 'intermediate'}], created_at: new Date(), updated_at: new Date()}]);"

echo.
echo ✅ Sample data inserted successfully!
echo.
echo 📊 Created:
echo    - 2 Users
echo    - 3 Courses
echo    - 1 Roadmap
echo.
echo 🌐 Access the app at:
echo    - Frontend: http://localhost:3000
echo    - API Health: http://localhost:8000/api/health
echo    - Courses API: http://localhost:8000/api/courses
echo.
echo 🗄️  View data in MongoDB:
echo    - docker-compose exec mongodb mongosh
echo    - use nextstep_db
echo    - db.courses.find()
echo    - db.roadmaps.find()
echo.
pause
